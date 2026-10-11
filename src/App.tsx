/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  Eye,
  Leaf,
  Loader2,
  RefreshCw,
  Smartphone,
  Sparkles,
  Trash2,
  ArrowDownRight,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import {
  ActivityOption,
  DurationOption,
  Mission,
  MoodOption,
} from './types/mission';
import {
  ActivityBotanicalIcon,
  HeroBotanicalIllustration,
} from './components/BotanicalIllustrations';
import { PhoneDownModal } from './components/PhoneDownModal';
import { SetupGuideSection } from './components/SetupGuideSection';

const STORAGE_MISSIONS_KEY = 'touchgrass_missions_v1';
const STORAGE_COMPLETED_COUNT_KEY = 'touchgrass_completed_count_v1';

const DURATION_OPTIONS: {
  value: DurationOption;
  label: string;
  subtitle: string;
}[] = [
  { value: 10, label: '10 Minutes', subtitle: 'Quick sensory reset' },
  { value: 15, label: '15 Minutes', subtitle: 'Mindful neighborhood loop' },
  { value: 30, label: '30 Minutes', subtitle: 'Deep nature immersion' },
  { value: 60, label: '60 Minutes', subtitle: 'Full field expedition' },
];

const MOOD_OPTIONS: {
  value: MoodOption;
  description: string;
}[] = [
  { value: 'Calm', description: 'Slow pace, grounding breaths & quiet stillness' },
  { value: 'Energetic', description: 'Brisk movement, uplifting rhythm & fresh air' },
  { value: 'Curious', description: 'Close inspection, pattern spotting & discovery' },
  { value: 'Creative', description: 'Visual textures, natural geometry & inspiration' },
];

const ACTIVITY_OPTIONS: {
  value: ActivityOption;
  subtitle: string;
}[] = [
  { value: 'Walking', subtitle: 'Footpaths, streets & trails' },
  { value: 'Gardening', subtitle: 'Soil, pots, pruning & tending' },
  { value: 'Birdwatching', subtitle: 'Canopy calls, flight & perching' },
  { value: 'Nature Exploration', subtitle: 'Bark, moss, insects & micro-habitats' },
];

const STARTER_MISSION: Mission = {
  id: 'starter-botanical-walk',
  title: 'Canopy Shadows & Leaf Venation Walk',
  description:
    'Step away from your desk for a restorative 15-minute walk focused on how natural light filters through overhead foliage and traces patterns along the ground.',
  estimatedDuration: '15 minutes',
  durationMinutes: 15,
  mood: 'Calm',
  activity: 'Walking',
  steps: [
    'Step outside, pause for 60 seconds before walking, and take five slow breaths while letting your eyes focus on the farthest tree or horizon line.',
    'Walk at an unhurried pace for 5 minutes, paying attention only to the sound of your footsteps and the movement of leaves or grass in the air.',
    'Stop beside two different plants or trees and compare the vein patterns, edges, and surface textures of their leaves without picking them.',
    'Spend the final 4 minutes walking back along a slightly different path, noticing three small details near ground level you would normally walk past.',
  ],
  completedSteps: [false, false, false, false],
  observationChallenge:
    'Find three leaves or blades of grass showing different shades of green—from pale new growth to deep mature chlorophyll—and notice how light reflects off each surface.',
  sensoryFocus: 'Dappled light, leaf geometry, and ambient outdoor acoustics',
  botanicalNote:
    'Leaf venation networks are engineered with redundant loops so that even if an insect damages one vein, water and nutrients continue flowing to the rest of the blade.',
  userFieldNote: '',
  completed: false,
  createdAt: new Date().toISOString(),
  model: 'gemma-4-26b-a4b-it',
};

export default function App() {
  // Preferences state
  const [duration, setDuration] = useState<DurationOption>(15);
  const [mood, setMood] = useState<MoodOption>('Calm');
  const [activity, setActivity] = useState<ActivityOption>('Walking');
  const [environmentHint, setEnvironmentHint] = useState<string>('');

  // Missions & Persistence state
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_MISSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore localStorage read errors
    }
    return [STARTER_MISSION];
  });

  const [completedCount, setCompletedCount] = useState<number>(() => {
    try {
      const savedCount = window.localStorage.getItem(STORAGE_COMPLETED_COUNT_KEY);
      if (savedCount !== null) {
        const num = Number(savedCount);
        if (!Number.isNaN(num) && num >= 0) return num;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [activeMissionId, setActiveMissionId] = useState<string>(() => {
    return missions[0]?.id || STARTER_MISSION.id;
  });

  // Generation API State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [journalFilter, setJournalFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [isPhoneDownOpen, setIsPhoneDownOpen] = useState<boolean>(false);

  const missionSectionRef = useRef<HTMLElement | null>(null);

  // Sync missions to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_MISSIONS_KEY, JSON.stringify(missions));
    } catch {
      // ignore storage quota errors
    }
  }, [missions]);

  // Sync completion count to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_COMPLETED_COUNT_KEY, String(completedCount));
    } catch {
      // ignore
    }
  }, [completedCount]);

  const activeMission =
    missions.find((m) => m.id === activeMissionId) || missions[0] || STARTER_MISSION;

  const totalMinutesCompleted = missions
    .filter((m) => m.completed)
    .reduce((acc, m) => acc + (m.durationMinutes || 15), 0);

  const observationsLoggedCount = missions.filter(
    (m) => m.userFieldNote && m.userFieldNote.trim().length > 0
  ).length;

  const handleGenerateMission = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-mission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration,
          mood,
          activity,
          environmentHint,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.mission) {
        throw new Error(
          data.error ||
            'Gemma 4 could not generate your mission right now. Please check your connection and try again.'
        );
      }

      const generated = data.mission;
      const newMission: Mission = {
        id: `mission-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: generated.title,
        description: generated.description,
        estimatedDuration: generated.estimatedDuration || `${duration} minutes`,
        durationMinutes: duration,
        mood,
        activity,
        steps: Array.isArray(generated.steps) ? generated.steps : [],
        completedSteps: Array.isArray(generated.steps)
          ? generated.steps.map(() => false)
          : [],
        observationChallenge: generated.observationChallenge,
        sensoryFocus: generated.sensoryFocus,
        botanicalNote: generated.botanicalNote,
        userFieldNote: '',
        completed: false,
        createdAt: new Date().toISOString(),
        model: generated.model || 'gemma-4-26b-a4b-it',
      };

      setMissions((prev) => [newMission, ...prev]);
      setActiveMissionId(newMission.id);

      window.setTimeout(() => {
        missionSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'We hit a snag while reaching the Gemma 4 outdoor mission service. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleStep = (missionId: string, stepIndex: number) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id !== missionId) return m;
        const nextSteps = [...(m.completedSteps || m.steps.map(() => false))];
        nextSteps[stepIndex] = !nextSteps[stepIndex];
        return {
          ...m,
          completedSteps: nextSteps,
        };
      })
    );
  };

  const handleToggleMissionComplete = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id !== missionId) return m;
        const nextCompleted = !m.completed;
        setCompletedCount((prevCount) =>
          nextCompleted ? prevCount + 1 : Math.max(0, prevCount - 1)
        );
        return {
          ...m,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
          completedSteps: nextCompleted
            ? m.steps.map(() => true)
            : m.completedSteps,
        };
      })
    );
  };

  const handleUpdateFieldNote = (missionId: string, note: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, userFieldNote: note } : m))
    );
  };

  const handleDeleteMission = (missionId: string) => {
    setMissions((prev) => {
      const remaining = prev.filter((m) => m.id !== missionId);
      if (remaining.length === 0) {
        return [STARTER_MISSION];
      }
      if (activeMissionId === missionId) {
        setActiveMissionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const filteredMissions = missions.filter((m) => {
    if (journalFilter === 'completed') return m.completed;
    if (journalFilter === 'pending') return !m.completed;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#14261C]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-sm border-b border-[#DCE5DC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="font-serif text-xl font-semibold tracking-tight text-[#14261C] whitespace-nowrap shrink-0"
          >
            TouchGrass AI
          </a>

          {/* Zone 2: 4 clean single-line navigation links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#475D50]"
            aria-label="Primary Navigation"
          >
            <a
              href="#builder"
              className="hover:text-[#14261C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Mission Builder
            </a>
            <a
              href="#mission"
              className="hover:text-[#14261C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Active Mission
            </a>
            <a
              href="#journal"
              className="hover:text-[#14261C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Field Journal
            </a>
            <a
              href="#guide"
              className="hover:text-[#14261C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Setup &amp; API
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsPhoneDownOpen(true)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-[#FBF9F5] bg-[#1B4332] hover:bg-[#133224] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Phone Down Mode
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 1. HERO / LANDING SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#F2F7F3] via-[#FBF9F5] to-[#FBF9F5] pt-10 pb-14 sm:pt-16 sm:pb-20 border-b border-[#DCE5DC]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              {/* Left Column: Brand Proposition & Primary CTA */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  {/* Unboxed quiet metadata kicker */}
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#2D6A4F] font-medium">
                    <span>Hacktoberfest 2026 Open-Source AI Challenge</span>
                    <span aria-hidden="true">·</span>
                    <span>Week 1</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">gemma-4-26b-a4b-it</span>
                  </div>

                  <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold tracking-tight text-[#14261C] leading-[1.12]">
                    Less scrolling. More living. 🌿
                  </h1>

                  <p className="mt-5 text-base sm:text-lg text-[#475D50] leading-relaxed max-w-2xl">
                    TouchGrass AI transforms your spare 10 to 60 minutes into a personalized, screen-free outdoor field mission. Choose your time window, current mood, and favorite way to connect with nature—then put your phone away and step outside.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#DCE5DC]/80">
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href="#builder"
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#133224] text-[#FBF9F5] font-semibold text-sm sm:text-base shadow-sm transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Create My Outdoor Mission</span>
                      <ArrowDownRight className="w-4 h-4" />
                    </a>

                    <a
                      href="#journal"
                      className="inline-flex items-center gap-2 px-4 py-3.5 text-sm font-medium text-[#1B4332] hover:text-[#14261C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>View Saved Field Journal</span>
                    </a>
                  </div>

                  {/* Privacy & Grounding Assurance */}
                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#475D50]">
                    <span>100% Server-Side Gemma 4 API</span>
                    <span aria-hidden="true">·</span>
                    <span>No GPS or Location Tracking</span>
                    <span aria-hidden="true">·</span>
                    <span>No Fabricated Weather</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Bespoke Botanical Field Illustration */}
              <div className="lg:col-span-5 flex">
                <HeroBotanicalIllustration className="w-full" />
              </div>
            </div>

            {/* Full-Width 4-Column Outdoor Impact Strip */}
            <div className="mt-12 pt-8 border-t border-[#DCE5DC] grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-[#475D50]">Missions Completed</div>
                <div className="mt-1 font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[#14261C]">
                  {completedCount}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#475D50]">Minutes Spent Outdoors</div>
                <div className="mt-1 font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[#1B4332]">
                  {totalMinutesCompleted}m
                </div>
              </div>
              <div>
                <div className="text-xs text-[#475D50]">Saved Field Missions</div>
                <div className="mt-1 font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[#14261C]">
                  {missions.length}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#475D50]">Observations Logged</div>
                <div className="mt-1 font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-[#14261C]">
                  {observationsLoggedCount}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. MISSION BUILDER SECTION */}
        <section
          id="builder"
          className="py-14 sm:py-20 border-b border-[#DCE5DC]"
          aria-labelledby="builder-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#2D6A4F] font-medium">
                <span>01. Personalize Your Parameters</span>
                <span aria-hidden="true">·</span>
                <span>Tailored by Gemma 4</span>
              </div>
              <h2
                id="builder-heading"
                className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#14261C] tracking-tight"
              >
                Configure Your Outdoor Mission
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#475D50]">
                Select how much time you have, how you feel right now, and the type of outdoor activity you want to do.
              </p>
            </div>

            <div className="mt-10 space-y-10">
              {/* Selector 1: Time Duration (10, 15, 30, 60 minutes) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <label className="text-sm font-semibold text-[#14261C] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2D6A4F]" />
                    <span>1. Choose Your Time Window</span>
                  </label>
                  <span className="text-xs font-mono tabular-nums text-[#475D50]">
                    Selected: {duration} minutes
                  </span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {DURATION_OPTIONS.map((opt) => {
                    const isSelected = duration === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDuration(opt.value)}
                        aria-pressed={isSelected}
                        className={`text-left rounded-xl p-4 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B4332] border-[#1B4332] text-[#FBF9F5] shadow-sm'
                            : 'bg-white border-[#DCE5DC] text-[#14261C] hover:border-[#2D6A4F]/60 hover:bg-[#F3F8F4]'
                        }`}
                      >
                        <div className="font-mono text-xl sm:text-2xl font-semibold tabular-nums whitespace-nowrap">
                          {opt.label}
                        </div>
                        <div
                          className={`mt-1 text-xs ${
                            isSelected ? 'text-[#D8F3DC]' : 'text-[#475D50]'
                          }`}
                        >
                          {opt.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selector 2: Mood (Calm, Energetic, Curious, Creative) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <label className="text-sm font-semibold text-[#14261C] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                    <span>2. Select Your Current Mood</span>
                  </label>
                  <span className="text-xs text-[#475D50]">
                    Selected: {mood}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {MOOD_OPTIONS.map((opt) => {
                    const isSelected = mood === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMood(opt.value)}
                        aria-pressed={isSelected}
                        className={`text-left rounded-xl p-4 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B4332] border-[#1B4332] text-[#FBF9F5] shadow-sm'
                            : 'bg-white border-[#DCE5DC] text-[#14261C] hover:border-[#2D6A4F]/60 hover:bg-[#F3F8F4]'
                        }`}
                      >
                        <div className="font-serif text-lg font-semibold whitespace-nowrap">
                          {opt.value}
                        </div>
                        <div
                          className={`mt-1 text-xs leading-relaxed ${
                            isSelected ? 'text-[#D8F3DC]' : 'text-[#475D50]'
                          }`}
                        >
                          {opt.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selector 3: Activity (Walking, Gardening, Birdwatching, Nature Exploration) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <label className="text-sm font-semibold text-[#14261C] flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#2D6A4F]" />
                    <span>3. Pick Your Outdoor Activity</span>
                  </label>
                  <span className="text-xs text-[#475D50]">
                    Selected: {activity}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {ACTIVITY_OPTIONS.map((opt) => {
                    const isSelected = activity === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setActivity(opt.value)}
                        aria-pressed={isSelected}
                        className={`text-left rounded-xl p-4 border transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B4332] border-[#1B4332] text-[#FBF9F5] shadow-sm'
                            : 'bg-white border-[#DCE5DC] text-[#14261C] hover:border-[#2D6A4F]/60 hover:bg-[#F3F8F4]'
                        }`}
                      >
                        <ActivityBotanicalIcon
                          activity={opt.value}
                          active={isSelected}
                        />
                        <div className="min-w-0">
                          <div className="font-serif text-base sm:text-lg font-semibold whitespace-nowrap truncate">
                            {opt.value}
                          </div>
                          <div
                            className={`mt-0.5 text-xs leading-relaxed ${
                              isSelected ? 'text-[#D8F3DC]' : 'text-[#475D50]'
                            }`}
                          >
                            {opt.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Environment Hint + Generate CTA Bar */}
              <div className="rounded-2xl border border-[#CFE0D4] bg-gradient-to-r from-[#F2F7F3] via-white to-[#EAF3EC] p-6 sm:p-8 flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-6">
                <div className="flex-1">
                  <label
                    htmlFor="environment-hint"
                    className="block text-xs font-semibold text-[#14261C]"
                  >
                    Optional Setting Note (No location or weather data required)
                  </label>
                  <p className="mt-0.5 text-xs text-[#475D50]">
                    Describe the kind of space outside your door if you like (e.g., &ldquo;city sidewalk with street trees&rdquo;, &ldquo;patio planters&rdquo;, &ldquo;quiet park trail&rdquo;).
                  </p>
                  <input
                    id="environment-hint"
                    type="text"
                    value={environmentHint}
                    onChange={(e) => setEnvironmentHint(e.target.value)}
                    placeholder="e.g., Neighborhood street trees, apartment balcony pots, or local park..."
                    maxLength={120}
                    className="mt-2.5 w-full rounded-xl border border-[#CFE0D4] bg-white px-4 py-2.5 text-sm text-[#14261C] placeholder:text-[#475D50]/60 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleGenerateMission}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#1B4332] hover:bg-[#133224] disabled:opacity-60 text-[#FBF9F5] font-semibold text-base shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Mission...</span>
                      </>
                    ) : (
                      <>
                        <Leaf className="w-5 h-5" />
                        <span>Generate My Mission</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading Indicator Card */}
              {isGenerating && (
                <div
                  className="rounded-2xl border border-[#CFE0D4] bg-[#F2F7F3] p-6 sm:p-8 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="w-8 h-8 text-[#1B4332] animate-spin mx-auto" />
                  <h3 className="mt-3 font-serif text-lg font-semibold text-[#14261C]">
                    Gemma 4 is crafting your {duration}-minute {mood.toLowerCase()} {activity.toLowerCase()} mission...
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#475D50] max-w-md mx-auto">
                    Designing 3–5 practical outdoor steps and a custom nature observation challenge tailored to your preferences.
                  </p>
                </div>
              )}

              {/* Friendly Error State with Retry Button */}
              {errorMessage && !isGenerating && (
                <div
                  className="rounded-2xl border border-[#DC2626]/30 bg-[#FEF2F2] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  role="alert"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-[#7F1D1D]">
                        Could Not Generate Your Outdoor Mission
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-[#991B1B]">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateMission}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Mission Generation</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. ACTIVE OUTDOOR MISSION DISPLAY */}
        <section
          id="mission"
          ref={missionSectionRef}
          className="py-14 sm:py-20 border-b border-[#DCE5DC] bg-gradient-to-b from-[#FBF9F5] to-[#F3F8F4]"
          aria-labelledby="active-mission-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#2D6A4F] font-medium">
                  <span>02. Your Field Card</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {activeMission.estimatedDuration}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeMission.mood}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeMission.activity}</span>
                </div>
                <h2
                  id="active-mission-heading"
                  className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#14261C] tracking-tight"
                >
                  Active Outdoor Mission
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPhoneDownOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-[#FBF9F5] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Start Phone Down Timer ({activeMission.durationMinutes}m)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleMissionComplete(activeMission.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeMission.completed
                      ? 'bg-[#16A34A] text-white hover:bg-[#15803D]'
                      : 'bg-[#1B4332] text-[#FBF9F5] hover:bg-[#133224]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeMission.completed
                      ? 'Mission Completed ✓'
                      : 'Mark Mission as Completed'}
                  </span>
                </button>
              </div>
            </div>

            {/* Main Field Card Container */}
            <div className="rounded-2xl border border-[#CFE0D4] bg-white p-6 sm:p-10 shadow-sm">
              {/* Top Metadata Line (Zero-Pill Unboxed Text) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-6 border-b border-[#DCE5DC] text-xs text-[#475D50]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono tabular-nums font-medium text-[#1B4332]">
                    Estimated Duration: {activeMission.estimatedDuration}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Mood: {activeMission.mood}</span>
                  <span aria-hidden="true">·</span>
                  <span>Activity: {activeMission.activity}</span>
                  {activeMission.sensoryFocus && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Focus: {activeMission.sensoryFocus}</span>
                    </>
                  )}
                </div>
                <div className="font-mono text-xs text-[#475D50]">
                  {activeMission.completed ? 'Status: Completed Outdoors' : 'Status: Ready for Field'}
                </div>
              </div>

              {/* Mission Title & Description */}
              <div className="mt-6">
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#14261C]">
                  {activeMission.title}
                </h3>
                <p className="mt-3 text-base sm:text-lg text-[#475D50] leading-relaxed max-w-3xl">
                  {activeMission.description}
                </p>
              </div>

              {/* 3–5 Actionable Steps + Nature Observation Challenge Grid */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left 7 Columns: 3–5 Field Steps */}
                <div className="lg:col-span-7">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-[#14261C]">
                      Field Steps ({activeMission.steps.length} Steps · Check off as you go or when you return)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {activeMission.steps.map((stepText, index) => {
                      const isStepDone = Boolean(activeMission.completedSteps?.[index]);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleToggleStep(activeMission.id, index)}
                          className={`w-full text-left rounded-xl p-4 border transition-colors flex items-start gap-3.5 cursor-pointer ${
                            isStepDone
                              ? 'bg-[#F2F7F3] border-[#B7D5C4] text-[#475D50]'
                              : 'bg-[#FBF9F5] border-[#DCE5DC] text-[#14261C] hover:border-[#2D6A4F]/60'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isStepDone ? (
                              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#2D6A4F]" />
                            )}
                          </div>
                          <div className="flex-1 text-sm sm:text-base leading-relaxed">
                            <span className="font-mono tabular-nums font-semibold text-[#2D6A4F] mr-2">
                              0{index + 1}.
                            </span>
                            <span className={isStepDone ? 'line-through opacity-80' : ''}>
                              {stepText}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right 5 Columns: Nature Observation Challenge & Field Notes */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Nature Observation Challenge Card */}
                  <div className="rounded-xl border border-[#B7D5C4] bg-[#EFF6F1] p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4332]">
                      <Eye className="w-4 h-4 text-[#2D6A4F]" />
                      <span>Nature Observation Challenge</span>
                    </div>
                    <p className="mt-2.5 font-serif text-base sm:text-lg text-[#14261C] leading-relaxed">
                      {activeMission.observationChallenge}
                    </p>

                    {/* Optional Field Note Log */}
                    <div className="mt-5 pt-4 border-t border-[#CFE0D4]">
                      <label
                        htmlFor="user-field-note"
                        className="block text-xs font-semibold text-[#14261C]"
                      >
                        Your Post-Mission Observation Log (Saved Locally)
                      </label>
                      <textarea
                        id="user-field-note"
                        rows={3}
                        value={activeMission.userFieldNote || ''}
                        onChange={(e) =>
                          handleUpdateFieldNote(activeMission.id, e.target.value)
                        }
                        placeholder="When you return, jot down what you noticed outdoors..."
                        className="mt-2 w-full rounded-lg border border-[#CFE0D4] bg-white p-3 text-xs sm:text-sm text-[#14261C] placeholder:text-[#475D50]/60 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                      />
                    </div>
                  </div>

                  {/* Botanical / Ecological Fact Box */}
                  {activeMission.botanicalNote && (
                    <div className="rounded-xl border border-[#DCE5DC] bg-[#FBF9F5] p-5">
                      <div className="text-xs font-semibold text-[#2D6A4F]">
                        Naturalist Field Note
                      </div>
                      <p className="mt-1.5 text-xs sm:text-sm text-[#475D50] leading-relaxed">
                        {activeMission.botanicalNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FIELD JOURNAL / SAVED MISSIONS IN LOCALSTORAGE */}
        <section
          id="journal"
          className="py-14 sm:py-20"
          aria-labelledby="journal-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#2D6A4F] font-medium">
                  <span>03. LocalStorage Field Log</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {completedCount} Total Completed
                  </span>
                </div>
                <h2
                  id="journal-heading"
                  className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#14261C] tracking-tight"
                >
                  Saved Outdoor Missions
                </h2>
              </div>

              {/* Interactive Filter Controls */}
              <div className="inline-flex items-center gap-1 p-1 bg-[#EAEFE9] rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setJournalFilter('all')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    journalFilter === 'all'
                      ? 'bg-white text-[#14261C] shadow-xs'
                      : 'text-[#475D50] hover:text-[#14261C]'
                  }`}
                >
                  All ({missions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setJournalFilter('completed')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    journalFilter === 'completed'
                      ? 'bg-white text-[#14261C] shadow-xs'
                      : 'text-[#475D50] hover:text-[#14261C]'
                  }`}
                >
                  Completed ({missions.filter((m) => m.completed).length})
                </button>
                <button
                  type="button"
                  onClick={() => setJournalFilter('pending')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    journalFilter === 'pending'
                      ? 'bg-white text-[#14261C] shadow-xs'
                      : 'text-[#475D50] hover:text-[#14261C]'
                  }`}
                >
                  In Progress ({missions.filter((m) => !m.completed).length})
                </button>
              </div>
            </div>

            {filteredMissions.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-[#DCE5DC] bg-white p-10 text-center">
                <p className="font-serif text-lg text-[#14261C]">
                  No missions match this filter yet.
                </p>
                <p className="mt-1 text-sm text-[#475D50]">
                  Use the Mission Builder above to generate a fresh outdoor mission with Gemma 4.
                </p>
                <a
                  href="#builder"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B4332] text-[#FBF9F5] text-xs font-semibold whitespace-nowrap shrink-0"
                >
                  Generate a Mission
                </a>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMissions.map((item) => {
                  const isCurrent = item.id === activeMission.id;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-6 flex flex-col justify-between transition-colors ${
                        isCurrent
                          ? 'border-[#1B4332] bg-[#F4F9F5]'
                          : 'border-[#DCE5DC] bg-white'
                      }`}
                    >
                      <div>
                        {/* Quiet Unboxed Metadata Line */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#475D50]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono tabular-nums font-medium text-[#1B4332]">
                              {item.estimatedDuration}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{item.mood}</span>
                            <span aria-hidden="true">·</span>
                            <span>{item.activity}</span>
                          </div>
                          <span className="font-mono tabular-nums">
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <h3 className="mt-2 font-serif text-xl font-semibold text-[#14261C]">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-xs sm:text-sm text-[#475D50] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="mt-3 text-xs text-[#2D6A4F]">
                          <strong className="font-semibold">Observation:</strong>{' '}
                          {item.observationChallenge}
                        </div>

                        {item.userFieldNote && (
                          <div className="mt-2.5 text-xs italic text-[#475D50]">
                            Field log: &ldquo;{item.userFieldNote}&rdquo;
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#DCE5DC] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMissionId(item.id);
                              missionSectionRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg border border-[#DCE5DC] bg-white hover:bg-[#F2F7F3] text-xs font-medium text-[#14261C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {isCurrent ? 'Viewing Now' : 'View Mission'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleMissionComplete(item.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              item.completed
                                ? 'bg-[#16A34A]/15 text-[#15803D]'
                                : 'bg-[#1B4332] text-[#FBF9F5] hover:bg-[#133224]'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{item.completed ? 'Completed' : 'Mark Done'}</span>
                          </button>
                        </div>

                        {missions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMission(item.id)}
                            className="p-1.5 rounded-lg text-[#475D50] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                            title="Delete saved mission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 5. SETUP, REAL GEMMA TEST & DEPLOYMENT GUIDE */}
        <SetupGuideSection />
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#DCE5DC] bg-[#FBF9F5] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#475D50]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif font-semibold text-[#14261C]">TouchGrass AI</span>
            <span aria-hidden="true">·</span>
            <span>Less scrolling. More living. 🌿</span>
            <span aria-hidden="true">·</span>
            <span>Hacktoberfest 2026 Open-Source AI Challenge Week 1</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#builder" className="hover:text-[#14261C] transition-colors">
              Mission Builder
            </a>
            <a href="#journal" className="hover:text-[#14261C] transition-colors">
              Field Journal
            </a>
            <button
              type="button"
              onClick={() => setIsPhoneDownOpen(true)}
              className="hover:text-[#14261C] transition-colors cursor-pointer"
            >
              Phone Down Mode
            </button>
          </div>
        </div>
      </footer>

      {/* Phone Down Mode Sanctuary Modal */}
      <PhoneDownModal
        isOpen={isPhoneDownOpen}
        onClose={() => setIsPhoneDownOpen(false)}
        mission={activeMission}
        defaultDuration={duration}
        onCompleteMission={(id) => handleToggleMissionComplete(id)}
      />
    </div>
  );
}
