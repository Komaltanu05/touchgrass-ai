import React from 'react';
import { ActivityOption } from '../types/mission';

export function HeroBotanicalIllustration({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#CFE0D4] bg-gradient-to-br from-[#EAF3EC] via-[#F5F9F5] to-[#DCECE0] p-6 sm:p-8 shadow-sm flex flex-col justify-between ${className}`}
    >
      {/* Subtle Topographic & Herbarium Grid Lines */}
      <svg
        viewBox="0 0 560 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[380px] select-none"
        aria-label="Botanical field guide illustration with fern fronds, oak leaves, and songbird"
        role="img"
      >
        <defs>
          <linearGradient id="canopyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1B4332" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="leafFill1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2D6A4F" />
            <stop offset="100%" stopColor="#1B4332" />
          </linearGradient>
          <linearGradient id="leafFill2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#52B788" />
            <stop offset="100%" stopColor="#2D6A4F" />
          </linearGradient>
        </defs>

        {/* Herbarium Frame Border */}
        <rect
          x="16"
          y="16"
          width="528"
          height="428"
          rx="16"
          stroke="#1B4332"
          strokeOpacity="0.18"
          strokeWidth="1.2"
        />
        <rect
          x="24"
          y="24"
          width="512"
          height="412"
          rx="12"
          stroke="#1B4332"
          strokeOpacity="0.08"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Warm Sun Disc & Topographic Rings */}
        <circle cx="410" cy="120" r="68" fill="url(#sunGrad)" />
        <circle
          cx="410"
          cy="120"
          r="94"
          stroke="#1B4332"
          strokeOpacity="0.1"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        <circle
          cx="410"
          cy="120"
          r="126"
          stroke="#1B4332"
          strokeOpacity="0.07"
          strokeWidth="1"
        />

        {/* Rolling Botanical Hills in Background */}
        <path
          d="M24 350 C140 290, 260 310, 390 270 C450 250, 500 265, 536 255 L536 436 L24 436 Z"
          fill="url(#canopyGrad)"
        />
        <path
          d="M24 385 C180 345, 320 395, 536 330 L536 436 L24 436 Z"
          fill="#1B4332"
          fillOpacity="0.07"
        />

        {/* Left Tall Woodland Fern Frond */}
        <g transform="translate(85, 70)">
          {/* Main stem */}
          <path
            d="M40 340 Q65 200 115 30"
            stroke="#1B4332"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Left & Right Pinnae (Fern Leaflets) */}
          <path
            d="M48 295 C15 280, 5 260, 25 252 C42 246, 52 272, 54 278 Z"
            fill="url(#leafFill1)"
          />
          <path
            d="M54 275 C88 265, 102 248, 84 238 C68 230, 56 255, 54 275 Z"
            fill="url(#leafFill2)"
          />
          <path
            d="M60 242 C24 225, 12 204, 34 196 C52 190, 62 218, 63 228 Z"
            fill="url(#leafFill1)"
          />
          <path
            d="M65 222 C102 210, 118 192, 98 182 C80 173, 68 202, 65 222 Z"
            fill="url(#leafFill2)"
          />
          <path
            d="M74 186 C38 168, 28 148, 48 140 C66 134, 75 162, 77 174 Z"
            fill="url(#leafFill1)"
          />
          <path
            d="M79 168 C114 156, 130 138, 110 128 C94 120, 82 148, 79 168 Z"
            fill="url(#leafFill2)"
          />
          <path
            d="M89 132 C58 116, 50 96, 68 90 C84 85, 91 110, 92 120 Z"
            fill="url(#leafFill1)"
          />
          <path
            d="M94 114 C124 104, 138 88, 122 78 C108 70, 97 95, 94 114 Z"
            fill="url(#leafFill2)"
          />
          <path
            d="M103 80 C82 66, 76 50, 90 44 C102 40, 106 62, 106 72 Z"
            fill="url(#leafFill1)"
          />
          <path
            d="M107 65 C128 56, 138 44, 126 36 C115 30, 109 48, 107 65 Z"
            fill="url(#leafFill2)"
          />
        </g>

        {/* Center-Right Botanical Branch & Perched Songbird */}
        <g transform="translate(220, 115)">
          {/* Branch */}
          <path
            d="M20 265 C90 215, 175 185, 295 160"
            stroke="#1B4332"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M145 198 C175 220, 215 225, 250 215"
            stroke="#1B4332"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Botanical Leaves along Branch */}
          <path
            d="M90 222 C75 190, 95 165, 120 175 C135 182, 115 212, 90 222 Z"
            fill="url(#leafFill2)"
          />
          <path
            d="M90 222 L110 185"
            stroke="#FBF9F5"
            strokeWidth="1"
            strokeLinecap="round"
          />

          <path
            d="M210 220 C225 248, 255 252, 268 232 C275 218, 238 212, 210 220 Z"
            fill="url(#leafFill1)"
          />
          <path
            d="M255 168 C250 135, 275 115, 296 130 C310 140, 280 162, 255 168 Z"
            fill="url(#leafFill2)"
          />

          {/* Minimalist Naturalist Songbird Perched on Branch */}
          <g transform="translate(148, 118)">
            {/* Tail feathers */}
            <path
              d="M8 62 L-22 82 L-14 88 L14 66 Z"
              fill="#1B4332"
            />
            {/* Body */}
            <path
              d="M10 56 C8 30, 32 16, 56 22 C74 26, 84 42, 74 58 C62 74, 24 74, 10 56 Z"
              fill="#1B4332"
            />
            {/* Wing detail */}
            <path
              d="M24 38 C42 32, 60 38, 62 52 C48 58, 30 54, 24 38 Z"
              fill="#52B788"
              fillOpacity="0.85"
            />
            {/* Head */}
            <circle cx="66" cy="20" r="14" fill="#1B4332" />
            {/* Eye */}
            <circle cx="70" cy="18" r="2.5" fill="#FBF9F5" />
            {/* Beak */}
            <path d="M79 17 L92 21 L79 24 Z" fill="#D97706" />
            {/* Legs */}
            <path
              d="M42 68 L38 82 M54 68 L52 80"
              stroke="#1B4332"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Pressed Ginkgo Specimen Sketch (Top Left Corner Detail) */}
        <g transform="translate(48, 46)" opacity="0.75">
          <path
            d="M35 65 L35 95"
            stroke="#1B4332"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M35 65 C10 55, 2 28, 20 15 C28 10, 33 22, 35 28 C37 22, 42 10, 50 15 C68 28, 60 55, 35 65 Z"
            fill="#52B788"
            fillOpacity="0.28"
            stroke="#1B4332"
            strokeWidth="1.5"
          />
        </g>

        {/* Field Specimen Label Stamp inside SVG */}
        <g transform="translate(44, 386)">
          <text
            x="0"
            y="0"
            fill="#1B4332"
            fontSize="11"
            fontFamily="JetBrains Mono, monospace"
            letterSpacing="0.06em"
            opacity="0.75"
          >
            SPECIMEN NO. 2026-HTF · GEMMA-4 FIELD ATLAS
          </text>
          <text
            x="0"
            y="18"
            fill="#475D50"
            fontSize="12"
            fontFamily="Fraunces, serif"
            fontStyle="italic"
          >
            “Step outside. Observe three living textures before checking a screen.”
          </text>
        </g>
      </svg>

      {/* Bottom Caption Bar inside Illustration Card */}
      <div className="mt-4 pt-4 border-t border-[#1B4332]/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#475D50]">
        <span>Botanical Field Companion</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono tabular-nums">10–60 Min Guided Sessions</span>
        <span aria-hidden="true">·</span>
        <span>Zero Location Tracking</span>
      </div>
    </div>
  );
}

export function ActivityBotanicalIcon({
  activity,
  active,
}: {
  activity: ActivityOption;
  active: boolean;
}) {
  const strokeColor = active ? '#FBF9F5' : '#1B4332';
  const accentFill = active ? 'rgba(251, 249, 245, 0.2)' : 'rgba(45, 106, 79, 0.12)';

  switch (activity) {
    case 'Walking':
      return (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path
            d="M4 22C9 19 14 21 24 15"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14 18V7M14 7C10 7 8 10 8 13C11 13 14 11 14 7ZM14 9C18 9 20 11 20 14C17 14 14 12 14 9Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={accentFill}
          />
        </svg>
      );
    case 'Gardening':
      return (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path
            d="M8 23H20M9 15H19L17.5 23H10.5L9 15Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={accentFill}
          />
          <path
            d="M14 15V8M14 11C14 8 17 6 20 6C20 9 18 11 14 11ZM14 12C14 9 11 7 8 7C8 10 10 12 14 12Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'Birdwatching':
      return (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path
            d="M6 19C6 13 11 9 17 9C19.5 9 21.5 10.5 22 12.5L25 13.5L22 15C21 19 17 21 12 21H5L8 18"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={accentFill}
          />
          <circle cx="18.5" cy="12.5" r="1" fill={strokeColor} />
        </svg>
      );
    case 'Nature Exploration':
      return (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle
            cx="14"
            cy="14"
            r="9"
            stroke={strokeColor}
            strokeWidth="1.8"
            fill={accentFill}
          />
          <path
            d="M17.5 10.5L15.5 15.5L10.5 17.5L12.5 12.5L17.5 10.5Z"
            stroke={strokeColor}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
