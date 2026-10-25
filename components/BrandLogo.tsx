"use client";

import React from "react";

interface BrandMarkProps {
  className?: string;
  size?: number;
  variant?: "light" | "dark" | "auto";
}

/**
 * Authentic ExitSmart Train & 'E' Speed Monogram
 * Faithful vector rendering of the official brand guidelines:
 * - 3 horizontal speed streaks on the left
 * - Aerodynamic 'E' carriage silhouette
 * - Warm gold train engine cabin with windshield and dual headlights
 */
export function BrandMark({ className = "", size = 36 }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform hover:scale-105 ${className}`}
      aria-label="ExitSmart Logo"
    >
      <defs>
        {/* Warm Transit Gold Gradient */}
        <linearGradient id="brandGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ECCB8D" />
          <stop offset="45%" stopColor="#D9A441" />
          <stop offset="100%" stopColor="#B37C22" />
        </linearGradient>

        {/* Specular Highlight on Train Nose */}
        <linearGradient id="trainShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 3 Horizontal Speed Motion Lines on Left */}
      <rect x="8" y="44" width="16" height="4.5" rx="2.25" className="fill-[#D9A441]" />
      <rect x="4" y="58" width="20" height="5" rx="2.5" className="fill-[#D9A441]" />
      <rect x="10" y="72" width="14" height="4.5" rx="2.25" className="fill-[#D9A441]" />

      {/* Outer 'E' Aerodynamic Carriage Shell */}
      <path
        d="M98 22H42C30 22 22 31 22 43V77C22 89 30 98 42 98H86C90 98 94 94 91 90L85 82C83 79 80 77 76 77H46C41 77 38 73 38 68V52C38 47 41 43 46 43H92C97 43 100 37 98 32L95 25C94 23 96 22 98 22Z"
        className="fill-[#1C1A18] dark:fill-[#F9F6F0] transition-colors duration-300"
      />

      {/* Bottom Right Track Angle Runner */}
      <path
        d="M84 94L96 79C98 76 102 76 104 79L108 85C110 88 108 92 104 94L88 98C85 99 83 96 84 94Z"
        className="fill-[#1C1A18] dark:fill-[#F9F6F0] transition-colors duration-300"
      />

      {/* Golden Train Front Cabin */}
      <path
        d="M48 42H74C86 42 94 51 96 63L98 74C98.5 77 96 79 93 79H46C41 79 38 75 38 70V52C38 46 42 42 48 42Z"
        fill="url(#brandGold)"
      />

      {/* Specular Top Shine on Golden Cabin */}
      <path
        d="M48 42H74C86 42 94 51 96 63L98 74C98.5 77 96 79 93 79H46C41 79 38 75 38 70V52C38 46 42 42 48 42Z"
        fill="url(#trainShine)"
      />

      {/* Slanted Windshield Window */}
      <path
        d="M74 48H60C58 48 56 50 56 52V62H80C82 62 84 60 84 58L81 51C80 49 77 48 74 48Z"
        className="fill-[#1C1A18] dark:fill-[#141210] transition-colors duration-300"
      />

      {/* Front Dual Headlights */}
      <circle cx="56" cy="71" r="2.5" className="fill-[#FFFFFF]" />
      <circle cx="84" cy="71" r="2.5" className="fill-[#FFFFFF]" />
    </svg>
  );
}

interface BrandLogoProps {
  size?: number;
  showTagline?: boolean;
  className?: string;
}

/**
 * Full ExitSmart Brand Lockup
 * - Monogram mark
 * - "ExitSmart" wordmark with bold geometric typography
 * - "PLAN > CONNECT > COMMUTE" tagline
 */
export default function BrandLogo({
  size = 36,
  showTagline = true,
  className = "",
}: BrandLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <BrandMark size={size} />
      <div className="flex flex-col">
        <div className="font-['Outfit'] font-extrabold text-[20px] leading-tight tracking-tight text-[#1C1A18] dark:text-[#F9F6F0] transition-colors duration-300">
          Exit<span className="text-[#D9A441]">Smart</span>
        </div>
        {showTagline && (
          <div className="font-['Plus_Jakarta_Sans'] text-[8.5px] font-bold tracking-[0.24em] text-[#7C6E63] dark:text-[#A89B8F] uppercase transition-colors duration-300">
            PLAN &bull; CONNECT &bull; COMMUTE
          </div>
        )}
      </div>
    </div>
  );
}
