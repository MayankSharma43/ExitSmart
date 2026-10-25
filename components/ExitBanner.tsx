"use client";

import React from "react";
import { Sparkles, ChevronRight, Target } from "lucide-react";
import { ExitSmartBannerInfo } from "@/lib/types";
import CountUp from "./react-bits/CountUp.jsx";

interface ExitBannerProps {
  info: ExitSmartBannerInfo;
  onOpenAssumptions?: () => void;
}

export default function ExitBanner({ info, onOpenAssumptions }: ExitBannerProps) {
  const hasSavings = info.savingMin > 0 || info.savingInr > 0;

  if (!hasSavings) {
    return (
      <div className="exit-banner exit-banner--quiet">
        <span className="exit-banner-icon">
          <Target className="h-5 w-5 text-[#1F2A44]" />
        </span>
        <div>
          <strong>The nearest station is the optimal fit for this journey.</strong>
          <p>
            Baseline stops ({info.nearestEntryStopName || "Nearest"} &bull; {info.nearestExitStopName || "Nearest"}) provide the best door-to-door balance.
          </p>
        </div>
        {onOpenAssumptions && (
          <button type="button" className="banner-link" onClick={onOpenAssumptions}>
            See assumptions <ChevronRight className="h-3.5 w-3.5 inline" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="exit-banner">
      <span className="exit-banner-icon">
        <Sparkles className="h-5 w-5 text-[#C6A75E]" />
      </span>

      <div className="exit-banner-copy">
        <span className="eyebrow">EXITSMART TRANSIT INSIGHT</span>
        <strong>{info.summary}</strong>
        <p>
          Suggested Exit: <span className="font-bold text-[#1F2A44]">{info.exitStopName}</span> (vs nearest: {info.nearestExitStopName})
        </p>
      </div>

      {info.savingMin > 0 && (
        <div className="saving-metrics">
          <b>
            <CountUp
              from={0}
              to={info.savingMin}
              duration={1.2}
              trigger="load"
              suffix=" min"
            />
          </b>
          <small>estimated time saved</small>
        </div>
      )}

      {info.savingInr > 0 && (
        <div className="saving-metrics saving-metrics--money">
          <b>
            <CountUp
              from={0}
              to={info.savingInr}
              duration={1.2}
              trigger="load"
              prefix="₹"
            />
          </b>
          <small>estimated fare saved</small>
        </div>
      )}

      {onOpenAssumptions && (
        <button type="button" className="banner-link" onClick={onOpenAssumptions}>
          How we estimate <ChevronRight className="h-3.5 w-3.5 inline" />
        </button>
      )}
    </div>
  );
}
