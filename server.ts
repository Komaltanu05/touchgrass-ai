import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_NAME = 'gemma-4-26b-a4b-it';

const VALID_DURATIONS = [10, 15, 30, 60];
const VALID_MOODS = ['Calm', 'Energetic', 'Curious', 'Creative'];
const VALID_ACTIVITIES = [
  'Walking',
  'Gardening',
  'Birdwatching',
  'Nature Exploration',
];

function extractJsonObject(rawText: string | undefined): Record<string, unknown> {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Model returned an empty response.');
  }

  // Strip optional thinking blocks if present
  const withoutThought = rawText.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

  // Try direct parse first
  try {
    return JSON.parse(withoutThought);
  } catch {
    // Fallback: extract from markdown code block or first { ... } block
    const codeBlockMatch = withoutThought.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // continue to brace extraction
      }
    }

    const firstBrace = withoutThought.indexOf('{');
    const lastBrace = withoutThought.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = withoutThought.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }

    throw new Error('Could not parse structured mission JSON from model output.');
  }
}

function validateAndNormalizeMission(
  parsed: Record<string, unknown>,
  duration: number,
  mood: string,
  activity: string
) {
  const title =
    typeof parsed.title === 'string' && parsed.title.trim().length > 0
      ? parsed.title.trim()
      : `${mood} ${activity} Field Mission`;

  const description =
    typeof parsed.description === 'string' && parsed.description.trim().length > 0
      ? parsed.description.trim()
      : `Step away from screens for ${duration} minutes of ${mood.toLowerCase()} ${activity.toLowerCase()} outdoors.`;

  const estimatedDuration = `${duration} minutes`;

  let steps: string[] = [];
  if (Array.isArray(parsed.steps)) {
    steps = parsed.steps
      .map((s: unknown) => (typeof s === 'string' ? s.trim() : ''))
      .filter((s: string) => s.length > 0)
      .slice(0, 5);
  }

  if (steps.length < 3) {
    throw new Error('Generated mission did not contain the required 3 to 5 actionable steps.');
  }

  const observationChallenge =
    typeof parsed.observationChallenge === 'string' &&
    parsed.observationChallenge.trim().length > 0
      ? parsed.observationChallenge.trim()
      : 'Find three distinct leaf shapes or natural textures and compare how light hits their surfaces.';

  const sensoryFocus =
    typeof parsed.sensoryFocus === 'string' && parsed.sensoryFocus.trim().length > 0
      ? parsed.sensoryFocus.trim()
      : 'Natural light, ambient soundscapes, and tactile plant surfaces';

  const botanicalNote =
    typeof parsed.botanicalNote === 'string' && parsed.botanicalNote.trim().length > 0
      ? parsed.botanicalNote.trim()
      : 'Plants and trees continuously exchange chemical and acoustic cues with their surrounding micro-ecosystems.';

  return {
    title,
    description,
    estimatedDuration,
    steps,
    observationChallenge,
    sensoryFocus,
    botanicalNote,
    model: MODEL_NAME,
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      model: MODEL_NAME,
      apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.post('/api/generate-mission', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error:
            'Server GEMINI_API_KEY is not configured. Please add your GEMINI_API_KEY in the environment variables or Secrets panel.',
        });
      }

      const rawDuration = Number(req.body?.duration);
      const duration = VALID_DURATIONS.includes(rawDuration) ? rawDuration : 15;
      const mood = VALID_MOODS.includes(req.body?.mood) ? req.body.mood : 'Calm';
      const activity = VALID_ACTIVITIES.includes(req.body?.activity)
        ? req.body.activity
        : 'Walking';
      const environmentHint =
        typeof req.body?.environmentHint === 'string'
          ? req.body.environmentHint.trim().slice(0, 120)
          : '';

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are TouchGrass AI, an expert outdoor naturalist and mindfulness guide built for the Hacktoberfest 2026 Open-Source AI Challenge.
Generate a personalized, practical outdoor mission based on the user's preferences:
- Target Duration: ${duration} minutes
- Current Mood: ${mood}
- Chosen Activity: ${activity}
${environmentHint ? `- Setting Preference: ${environmentHint}` : '- Setting: Adaptable to any local outdoor space (neighborhood street, park, yard, balcony, or trail)'}

STRICT RULES:
1. Make the mission practical, safe, engaging, and specifically tailored to a ${duration}-minute ${mood.toLowerCase()} ${activity.toLowerCase()} session.
2. DO NOT fabricate weather information (do not say it is sunny, rainy, breezy, warm, or cold today, and do not invent temperatures or forecasts).
3. DO NOT claim to know the user's city, neighborhood, GPS coordinates, or geographic location. Keep observations adaptable to wherever the user steps outside.
4. Provide between 3 and 5 clear, sequential steps ("steps" array) that fit naturally into ${duration} minutes. Do not number the strings inside the array (e.g., write "Step outside and pause..." not "1. Step outside...").
5. Include a specific, screen-free "observationChallenge" that encourages close attention to real nature details.
6. Return ONLY a valid JSON object matching this exact structure, with no markdown code fences or extra commentary:

{
  "title": "Evocative, memorable mission title (4-8 words)",
  "description": "Engaging 2-sentence overview of this outdoor mission and how it channels a ${mood.toLowerCase()} mood into ${activity.toLowerCase()}.",
  "estimatedDuration": "${duration} minutes",
  "steps": [
    "First practical step with approximate time pacing...",
    "Second practical step...",
    "Third practical step...",
    "Fourth practical step..."
  ],
  "observationChallenge": "A specific nature observation challenge the user can complete with their eyes, ears, or hands.",
  "sensoryFocus": "Short phrase describing the primary sensory focus (e.g., Canopy acoustics & leaf venation)",
  "botanicalNote": "One concise, fascinating real-world ecological or botanical fact related to ${activity.toLowerCase()}."
}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          temperature: 0.75,
        },
      });

      const rawText = response.text;
      const parsed = extractJsonObject(rawText);
      const mission = validateAndNormalizeMission(parsed, duration, mood, activity);

      return res.json({
        mission,
      });
    } catch (error) {
      console.error('Error generating mission with Gemma 4:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while generating your outdoor mission.';
      return res.status(502).json({
        error: `Unable to generate mission right now: ${message}`,
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TouchGrass AI server listening on http://0.0.0.0:${PORT} (Model: ${MODEL_NAME})`);
  });
}

startServer();
