# TouchGrass AI 🌿

**Less scrolling. More living. 🌿**

Built for the **Hacktoberfest 2026 Open-Source AI Challenge — Week 1**.

TouchGrass AI is an open-source, nature-inspired web application that turns 10 to 60 minutes of screen-free spare time into a personalized outdoor field mission. Powered by the **Google GenAI SDK (`@google/genai`)** and **Gemma 4 (`gemma-4-26b-a4b-it`)** running securely on an Express backend, it crafts practical outdoor steps and mindful nature observation challenges tailored to your time window, mood, and chosen activity—without ever tracking your location or fabricating weather forecasts.

---

## ✨ Features

1. **Nature-Inspired Editorial Interface**: Forest canopy greens (`#1B4332`), herbarium cream (`#FBF9F5`), custom SVG botanical illustrations, and clean `Fraunces` + `Plus Jakarta Sans` + `JetBrains Mono` typography.
2. **Time Window Selector**: Choose **10**, **15**, **30**, or **60** minutes.
3. **Mood Selector**: Choose **Calm**, **Energetic**, **Curious**, or **Creative**.
4. **Activity Selector**: Choose **Walking**, **Gardening**, **Birdwatching**, or **Nature Exploration**.
5. **Server-Side Gemma 4 Mission Synthesis**: Uses `gemma-4-26b-a4b-it` via `/api/generate-mission` to generate:
   - Mission Title & Description
   - Estimated Duration
   - 3–5 Practical, Sequenced Outdoor Steps
   - A Screen-Free **Nature Observation Challenge**
   - Naturalist Field Note & Sensory Focus
6. **Interactive Field Checklist & Completion Tracking**: Check off individual steps, log post-mission field observations, and mark missions as completed.
7. **LocalStorage Persistence**: Automatically saves generated missions, observation logs, and total completion counts in `localStorage` (`touchgrass_missions_v1` and `touchgrass_completed_count_v1`).
8. **Phone Down Mode**: Full-screen distraction-free timer sanctuary with a pocket field card summary and an optional Web Audio API completion chime so you can lock your phone or set it face-down while outdoors.
9. **Resilient Loading & Error Handling**: Includes live loading state indicators, friendly error messages, and a one-click retry button.

---

## 📦 Tech Stack & Dependencies

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express (`server.ts`), Vite middleware in development, static SPA serving in production
- **AI SDK & Model**: `@google/genai` (`^2.4.0`) calling `gemma-4-26b-a4b-it`

---

## 🔑 1. Configuring the API Key

TouchGrass AI never exposes your API key in client-side browser code. All calls to `gemma-4-26b-a4b-it` execute on the server (`server.ts`) using `process.env.GEMINI_API_KEY`.

### Option A: Google AI Studio Build
1. Open the **Settings > Secrets** panel in Google AI Studio.
2. Ensure `GEMINI_API_KEY` is set to a valid Google AI Studio API key.

### Option B: Local Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your API key inside `.env`:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   PORT=3000
   ```
   *(Note: `.env` is ignored by `.gitignore` so your secret key is never committed to Git.)*

---

## 🚀 2. Running Locally & Testing the Real Gemma 4 Call

### Start the Development Server
```bash
npm install
npm run dev
```
The full-stack Express + Vite server will start on `http://localhost:3000`.

### Test the Health Check Endpoint
```bash
curl http://localhost:3000/api/health
```
Expected response:
```json
{
  "status": "ok",
  "model": "gemma-4-26b-a4b-it",
  "apiKeyConfigured": true
}
```

### Test the Live Gemma 4 Mission Generation Endpoint
Run the following `curl` command to verify a real generation request to `gemma-4-26b-a4b-it`:
```bash
curl -X POST http://localhost:3000/api/generate-mission \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 15,
    "mood": "Curious",
    "activity": "Birdwatching",
    "environmentHint": "Neighborhood trees and shrubs"
  }'
```
Expected JSON response structure:
```json
{
  "mission": {
    "title": "...",
    "description": "...",
    "estimatedDuration": "15 minutes",
    "steps": [
      "Step 1...",
      "Step 2...",
      "Step 3...",
      "Step 4..."
    ],
    "observationChallenge": "...",
    "sensoryFocus": "...",
    "botanicalNote": "...",
    "model": "gemma-4-26b-a4b-it"
  }
}
```

---

## 🌐 3. Building & Deploying the Application

### Production Build & Start
```bash
# 1. Build the static frontend assets into /dist
npm run build

# 2. Run the production Express server on port 3000
NODE_ENV=production GEMINI_API_KEY="your_api_key" npm start
```

### Deploying to Google Cloud Run (or Render / Railway / Fly.io)
1. **Google AI Studio**: Click **Deploy / Share** in the AI Studio interface to automatically build and deploy to Google Cloud Run with `GEMINI_API_KEY` injected securely.
2. **Manual Cloud Run / Container Host**:
   - Build command: `npm install && npm run build`
   - Start command: `NODE_ENV=production npm start`
   - Environment Variables: Set `GEMINI_API_KEY` as a secret environment variable and `NODE_ENV=production`.
