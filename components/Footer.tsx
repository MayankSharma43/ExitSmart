import React from "react";
import Link from "next/link";

export function Mark() {
  return (
    <span className="brand-mark">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M7 25 13 7h6l6 18M12 18h8" />
        <circle cx="16" cy="16" r="2.2" />
      </svg>
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="max-w-[1080px] mx-auto px-6 py-10 border-t border-white/60 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-[#7A695C]">
      <div className="flex items-center gap-2.5">
        <Mark />
        <span className="font-['Outfit'] font-bold text-[#221B16] text-sm">
          Exit<span className="text-[#C5A059]">Smart</span>
        </span>
        <span className="text-[11px] text-[#8C7A6D] border-l border-[#DECFC0] pl-2 ml-1">Pune Transit Intelligence</span>
      </div>
      <p className="m-0 text-center text-xs text-[#7A695C]">
        Smarter connections, one journey at a time. Verified Maha Metro &amp; PMPML datasets &bull; RTO Auto Fare Meter.
      </p>
      <div className="flex items-center gap-2 text-[11px]">
        <span>Whole Pune Coverage</span>
        <span>&bull;</span>
        <Link href="/#estimate-note" className="text-[#C5A059] font-semibold hover:underline">
          About estimates
        </Link>
      </div>
    </footer>
  );
}
