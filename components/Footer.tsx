import React from "react";
import Link from "next/link";

import { BrandMark } from "./BrandLogo";

export function Mark() {
  return <BrandMark size={28} />;
}

export default function Footer() {
  return (
    <footer className="max-w-[1080px] mx-auto px-6 py-10 border-t border-white/60 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-[#7A695C] dark:text-[#A89B8F] transition-colors">
      <div className="flex items-center gap-2.5">
        <BrandMark size={28} />
        <span className="font-['Outfit'] font-bold text-[#1C1A18] dark:text-[#F9F6F0] text-sm">
          Exit<span className="text-[#D9A441]">Smart</span>
        </span>
        <span className="text-[11px] text-[#8C7A6D] dark:text-[#A89B8F] border-l border-[#DECFC0] dark:border-white/15 pl-2 ml-1">
          Pune Transit Intelligence
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium">
        <Link href="/how-it-works" className="hover:text-[#D9A441] transition-colors">
          How it works
        </Link>
        <Link href="/corridors" className="hover:text-[#D9A441] transition-colors">
          Corridors
        </Link>
        <Link href="/rto-fare-meter" className="hover:text-[#D9A441] transition-colors">
          RTO Fare Meter
        </Link>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#8C7A6D] dark:text-[#A89B8F]">
        <span>Whole Pune Coverage</span>
        <span>&bull;</span>
        <span>Verified Tariffs</span>
      </div>
    </footer>
  );
}
