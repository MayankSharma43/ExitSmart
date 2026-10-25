"use client";

import React from "react";
import {
  TrendingDown,
  Zap,
  Sparkles,
  Clock,
  Route,
  Footprints,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Option } from "@/lib/types";

interface ResultCardProps {
  option: Option;
  isSelected?: boolean;
  onSelect?: () => void;
  onViewDetails?: () => void;
  directCabCost?: number;
}

export default function ResultCard({
  option,
  isSelected = false,
  onSelect,
  onViewDetails,
  directCabCost,
}: ResultCardProps) {
  // Normalize category key
  const categoryKey =
    option.label === "Cheapest"
      ? "cheapest"
      : option.label === "Fastest"
      ? "fastest"
      : "reliable";

  const config = {
    cheapest: {
      title: "Cheapest",
      icon: TrendingDown,
      desc: "Lowest estimated fare with Pune Metro & PMPML bus stages",
      tagClass: "category-icon--cheapest",
    },
    fastest: {
      title: "Fastest",
      icon: Zap,
      desc: "Fewest door-to-door minutes with real-time road & transit speed",
      tagClass: "category-icon--fastest",
    },
    reliable: {
      title: "Most Reliable",
      icon: ShieldCheck,
      desc: "Highest punctuality and lowest delay risk with fixed-rail transit",
      tagClass: "category-icon--convenient",
    },
  }[categoryKey];

  const Icon = config.icon;

  // Format fare range
  const fareDisplay =
    option.totalInrMin === option.totalInrMax
      ? `₹${option.totalInrMin}`
      : `₹${option.totalInrMin}–₹${option.totalInrMax}`;

  // Build summary string from segments
  const summaryText = option.segments
    .map((s) => {
      if (s.type === "metro") return "Pune Metro";
      if (s.type === "bus") return s.route ? `Bus ${s.route}` : "PMPML Bus";
      if (s.type === "auto") return "RTO Auto";
      if (s.type === "shared_auto") return "Shared Auto";
      if (s.type === "cab") return "App Cab";
      return "Walk";
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" → ");

  // Savings vs direct cab
  const cabSaving = directCabCost ? Math.max(0, directCabCost - option.totalInrMin) : 0;

  return (
    <article
      className={
        "recommendation-card recommendation-card--" +
        (categoryKey === "reliable" ? "convenient" : categoryKey) +
        (isSelected ? " is-selected" : "")
      }
      onClick={onSelect}
    >
      <div className="recommendation-card__top">
        <span className={"category-icon " + config.tagClass}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <strong>{config.title}</strong>
          {option.tag && <span className="sample-chip text-[9px] py-0.5">{option.tag}</span>}
        </div>
        {cabSaving > 0 && (
          <span className="demo-tag ml-auto">SAVE ₹{cabSaving} VS CAB</span>
        )}
      </div>

      <p className="category-desc">{config.desc}</p>

      <div className="card-main-metrics">
        <div>
          <span>Total time</span>
          <strong>
            {option.totalMin}
            <small> min</small>
          </strong>
        </div>
        <i />
        <div>
          <span>Estimated fare</span>
          <strong>{fareDisplay}</strong>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat">
          <Clock className="h-3.5 w-3.5 text-[#C6A75E]" />
          <span>Wait</span>
          <strong>{option.waitMin} min</strong>
        </div>
        <div className="stat">
          <Route className="h-3.5 w-3.5 text-[#C6A75E]" />
          <span>Transfers</span>
          <strong>{option.transfers}</strong>
        </div>
        <div className="stat">
          <Footprints className="h-3.5 w-3.5 text-[#C6A75E]" />
          <span>Walk</span>
          <strong>{option.walkM} m</strong>
        </div>
      </div>

      {option.reliabilityScore !== undefined && (
        <div className="flex items-center justify-between text-[11px] bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-[rgba(198,167,94,0.15)] mb-3">
          <span className="text-[#1F2A44]/70 dark:text-[#CFC5BC]/70 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Reliability index
          </span>
          <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
            {option.reliabilityScore}% on-time guarantee
          </strong>
        </div>
      )}

      <div className="route-card-summary">
        <span>
          <Route className="h-4 w-4 text-[#C6A75E]" />
        </span>
        <div>
          <small>ROUTE PREVIEW</small>
          <strong>{summaryText}</strong>
        </div>
      </div>

      <div className="card-footer">
        <span className="confidence-label">
          <i />
          Confidence: {option.confidence || "High"}
        </span>
        <button
          type="button"
          className="card-route-action"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails();
          }}
        >
          View route <ChevronRight className="h-3.5 w-3.5 inline" />
        </button>
      </div>
    </article>
  );
}
