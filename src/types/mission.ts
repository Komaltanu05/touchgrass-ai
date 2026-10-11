export type DurationOption = 10 | 15 | 30 | 60;

export type MoodOption = 'Calm' | 'Energetic' | 'Curious' | 'Creative';

export type ActivityOption =
  | 'Walking'
  | 'Gardening'
  | 'Birdwatching'
  | 'Nature Exploration';

export interface Mission {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  durationMinutes: DurationOption;
  mood: MoodOption;
  activity: ActivityOption;
  steps: string[];
  completedSteps: boolean[];
  observationChallenge: string;
  sensoryFocus?: string;
  botanicalNote?: string;
  userFieldNote?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  model?: string;
}

export interface MissionPreferences {
  duration: DurationOption;
  mood: MoodOption;
  activity: ActivityOption;
  environmentHint: string;
}
