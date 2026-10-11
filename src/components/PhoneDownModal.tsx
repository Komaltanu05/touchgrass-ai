import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  X,
  Eye,
  Smartphone,
} from 'lucide-react';
import { Mission, DurationOption } from '../types/mission';

interface PhoneDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission | null;
  defaultDuration: DurationOption;
  onCompleteMission?: (missionId: string) => void;
}

function playGentleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const frequencies = [528, 660, 792];
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.25);

      gain.gain.setValueAtTime(0.001, now + idx * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.25 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.25 + 2.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.25);
      osc.stop(now + idx * 0.25 + 2.5);
    });
  } catch {
    // Ignore audio context restrictions if blocked
  }
}

export function PhoneDownModal({
  isOpen,
  onClose,
  mission,
  defaultDuration,
  onCompleteMission,
}: PhoneDownModalProps) {
  const initialMinutes = mission ? mission.durationMinutes : defaultDuration;
  const [selectedMinutes, setSelectedMinutes] = useState<DurationOption>(initialMinutes);
  const [secondsLeft, setSecondsLeft] = useState<number>(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const mins = mission ? mission.durationMinutes : defaultDuration;
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsRunning(false);
    setSessionFinished(false);
  }, [mission?.id, defaultDuration, isOpen]);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setSessionFinished(true);
          if (soundEnabled) {
            playGentleChime();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled]);

  if (!isOpen) return null;

  const totalSeconds = selectedMinutes * 60;
  const progressPercent =
    totalSeconds > 0 ? Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100)) : 0;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const handleSelectDuration = (minsOption: DurationOption) => {
    setSelectedMinutes(minsOption);
    setSecondsLeft(minsOption * 60);
    setIsRunning(false);
    setSessionFinished(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSessionFinished(false);
    setSecondsLeft(selectedMinutes * 60);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2218]/95 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-down-title"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-[#2D6A4F]/40 bg-[#142B1F] text-[#FBF9F5] p-6 sm:p-10 shadow-xl my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#2D6A4F]/30">
          <div className="flex items-center gap-2.5 text-xs text-[#A3C4B1]">
            <Smartphone className="w-4 h-4 text-[#74C69D]" />
            <span>Phone Down Sanctuary</span>
            <span aria-hidden="true">·</span>
            <span>Screen-Free Outdoor Timer</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#D8F3DC] hover:bg-[#1B4332] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title={soundEnabled ? 'Completion chime enabled' : 'Completion chime muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Chime On' : 'Muted'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#D8F3DC] hover:bg-[#1B4332] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Main Sanctuary Body */}
        <div className="py-8 text-center">
          <h2
            id="phone-down-title"
            className="font-serif text-2xl sm:text-3xl font-semibold text-[#FBF9F5] tracking-tight"
          >
            Read your mission once. Then put your phone away.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#B7D5C4] max-w-lg mx-auto">
            Start the timer below, slip your phone into your pocket or place it face-down, and let your senses adjust to the living world outside.
          </p>

          {/* Duration Selector Tabs inside Phone Down Mode */}
          <div className="mt-6 inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0F2218] border border-[#2D6A4F]/40">
            {([10, 15, 30, 60] as DurationOption[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleSelectDuration(d)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tabular-nums font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedMinutes === d
                    ? 'bg-[#2D6A4F] text-[#FBF9F5]'
                    : 'text-[#A3C4B1] hover:text-[#FBF9F5]'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>

          {/* Large Tabular Countdown Display */}
          <div className="mt-8">
            <div className="font-mono text-6xl sm:text-7xl font-semibold tracking-tight tabular-nums text-[#FBF9F5]">
              {formattedTime}
            </div>
            <div className="mt-2 text-xs text-[#95B8A6] font-mono tabular-nums">
              {sessionFinished
                ? 'Outdoor timer complete — welcome back!'
                : isRunning
                  ? `Phone Down Mode active · ${progressPercent}% elapsed`
                  : 'Ready to begin screen-free session'}
            </div>
          </div>

          {/* Timer Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsRunning((r) => !r)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#52B788] hover:bg-[#40916C] text-[#0F2218] font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{secondsLeft < totalSeconds && secondsLeft > 0 ? 'Resume Timer' : 'Start Phone Down Timer'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#2D6A4F] text-[#D8F3DC] hover:bg-[#1B4332] text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Pocket Field Card Summary */}
        {mission ? (
          <div className="rounded-xl border border-[#2D6A4F]/50 bg-[#0F2218]/90 p-5 text-left">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#95B8A6]">
              <span>Active Pocket Field Card</span>
              <span aria-hidden="true">·</span>
              <span>{mission.mood}</span>
              <span aria-hidden="true">·</span>
              <span>{mission.activity}</span>
            </div>
            <h3 className="mt-1.5 font-serif text-lg font-semibold text-[#FBF9F5]">
              {mission.title}
            </h3>
            <div className="mt-3 space-y-1.5 text-xs sm:text-sm text-[#CBE2D4]">
              {mission.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="font-mono tabular-nums text-[#74C69D] shrink-0">
                    0{i + 1}.
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[#2D6A4F]/30 flex items-start gap-2.5 text-xs sm:text-sm text-[#D8F3DC]">
              <Eye className="w-4 h-4 text-[#74C69D] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#74C69D]">Observation Challenge: </span>
                <span>{mission.observationChallenge}</span>
              </div>
            </div>

            {onCompleteMission && !mission.completed && (
              <div className="mt-5 pt-4 border-t border-[#2D6A4F]/30 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onCompleteMission(mission.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2D6A4F] hover:bg-[#40916C] text-[#FBF9F5] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Mission Completed & Return</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-[#2D6A4F]/40 bg-[#0F2218]/80 p-5 text-center text-sm text-[#B7D5C4]">
            Step outside, observe three living plants or natural textures, and take ten slow breaths away from your screen.
          </div>
        )}
      </div>
    </div>
  );
}
