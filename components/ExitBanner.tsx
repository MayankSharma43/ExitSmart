import React from "react";
import { Sparkles, TrendingUp, Clock, IndianRupee, ArrowRight } from "lucide-react";
import { ExitSmartBannerInfo } from "@/lib/types";

interface ExitBannerProps {
  info: ExitSmartBannerInfo;
  onApply?: () => void;
}

export default function ExitBanner({ info, onApply }: ExitBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white shadow-lg shadow-orange-500/15">
      {/* Decorative background glow */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-amber-400/20 blur-xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white font-bold">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-amber-100">
            ExitSmart Recommendation
          </span>
        </div>

        <h3 className="mt-2 text-base sm:text-lg font-extrabold tracking-tight text-white leading-snug">
          {info.summary}
        </h3>

        {/* Savings Pill Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {info.savingInr > 0 && (
            <div className="inline-flex items-center gap-1 rounded-lg bg-white/20 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
              <IndianRupee className="h-3.5 w-3.5" />
              <span>Save ₹{info.savingInr}</span>
            </div>
          )}

          {info.savingMin > 0 && (
            <div className="inline-flex items-center gap-1 rounded-lg bg-white/20 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
              <Clock className="h-3.5 w-3.5" />
              <span>Save {info.savingMin} min</span>
            </div>
          )}

          <div className="text-[11px] text-amber-100 font-medium">
            vs nearest stops ({info.nearestEntryStopName} &bull; {info.nearestExitStopName})
          </div>
        </div>

        {/* Comparison Details */}
        <div className="mt-3.5 pt-3 border-t border-white/20 text-xs text-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Suggested Exit:</span>
            <span className="rounded bg-black/20 px-2 py-0.5 font-bold text-white">
              {info.exitStopName}
            </span>
          </div>
          <span className="text-[11px] underline opacity-90 cursor-default">
            Avoids Nagar Rd bottle-neck
          </span>
        </div>
      </div>
    </div>
  );
}
