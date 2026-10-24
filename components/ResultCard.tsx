import React from "react";
import {
  Clock,
  IndianRupee,
  Footprints,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Option, Segment } from "@/lib/types";

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
  // Theme styles based on profile label
  const profileConfig = {
    Cheapest: {
      border: isSelected ? "border-emerald-600 ring-2 ring-emerald-500/20" : "border-emerald-200 hover:border-emerald-400",
      badgeBg: "bg-emerald-600 text-white",
      lightBadge: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accentText: "text-emerald-700",
      icon: TrendingDown,
    },
    Fastest: {
      border: isSelected ? "border-blue-600 ring-2 ring-blue-500/20" : "border-blue-200 hover:border-blue-400",
      badgeBg: "bg-blue-600 text-white",
      lightBadge: "bg-blue-50 text-blue-800 border-blue-200",
      accentText: "text-blue-700",
      icon: Zap,
    },
    "Most Convenient": {
      border: isSelected ? "border-purple-600 ring-2 ring-purple-500/20" : "border-purple-200 hover:border-purple-400",
      badgeBg: "bg-purple-600 text-white",
      lightBadge: "bg-purple-50 text-purple-800 border-purple-200",
      accentText: "text-purple-700",
      icon: ShieldCheck,
    },
  }[option.label] || {
    border: "border-slate-200",
    badgeBg: "bg-slate-700 text-white",
    lightBadge: "bg-slate-50 text-slate-800 border-slate-200",
    accentText: "text-slate-700",
    icon: Sparkles,
  };

  const IconComponent = profileConfig.icon;

  // Calculate savings vs direct cab
  const cabSaving = directCabCost ? Math.max(0, directCabCost - option.totalInrMin) : 0;

  // Helper to render mode icons for segment pills
  const renderSegmentBadge = (seg: Segment, idx: number) => {
    const modeBadgeMap = {
      walk: { label: "Walk", color: "bg-slate-100 text-slate-700" },
      metro: { label: "Metro", color: "bg-sky-100 text-sky-800 font-bold" },
      bus: { label: "PMPML", color: "bg-orange-100 text-orange-800 font-semibold" },
      auto: { label: "Auto", color: "bg-emerald-100 text-emerald-800" },
      shared_auto: { label: "Shared Auto", color: "bg-teal-100 text-teal-800" },
      cab: { label: "Cab", color: "bg-slate-200 text-slate-800" },
    }[seg.type];

    return (
      <React.Fragment key={idx}>
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${modeBadgeMap.color}`}
        >
          {modeBadgeMap.label}
          <span className="ml-1 opacity-75 font-normal">
            {seg.minutes}m
          </span>
        </span>
        {idx < option.segments.length - 1 && (
          <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
        )}
      </React.Fragment>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-2xl bg-white p-4 sm:p-5 shadow-sm transition-all border ${profileConfig.border}`}
    >
      {/* Top Header: Label, Tag, and Confidence */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${profileConfig.badgeBg}`}
          >
            <IconComponent className="h-3.5 w-3.5" />
            {option.label}
          </span>

          {option.tag && (
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              {option.tag}
            </span>
          )}
        </div>

        {/* Confidence Badge */}
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            option.confidence === "High"
              ? "bg-emerald-100 text-emerald-800"
              : option.confidence === "Medium"
              ? "bg-blue-100 text-blue-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {option.confidence} Confidence
        </span>
      </div>

      {/* Main Metrics: Time & Cost */}
      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {option.totalMin}
          </span>
          <span className="ml-1 text-sm font-semibold text-slate-500">min</span>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end font-extrabold text-slate-900 text-xl sm:text-2xl">
            <span>
              {option.totalInrMin === option.totalInrMax
                ? `₹${option.totalInrMin}`
                : `₹${option.totalInrMin} - ₹${option.totalInrMax}`}
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Total estimated fare</span>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="mt-3 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 p-2 text-center text-xs">
        <div>
          <span className="block text-[10px] font-semibold uppercase text-slate-400">Wait</span>
          <span className="font-bold text-slate-700">{option.waitMin} min</span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase text-slate-400">Transfers</span>
          <span className="font-bold text-slate-700">
            {option.transfers === 0 ? "Direct" : `${option.transfers} transfer${option.transfers > 1 ? "s" : ""}`}
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase text-slate-400">Walk</span>
          <span className="font-bold text-slate-700">
            {option.walkM < 1000 ? `${option.walkM} m` : `${(option.walkM / 1000).toFixed(1)} km`}
          </span>
        </div>
      </div>

      {/* Multimodal Timeline Pills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
        {option.segments.map(renderSegmentBadge)}
      </div>

      {/* Suggested Entry & Exit Stops */}
      {option.entryStopId !== "door_origin" && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-lg">
          <div className="truncate">
            <span className="text-slate-400">Enter: </span>
            <span className="font-semibold text-slate-800">{option.entryStopName}</span>
          </div>
          <ArrowRight className="h-3 w-3 text-slate-400 shrink-0 mx-1.5" />
          <div className="truncate text-right">
            <span className="text-slate-400">Exit: </span>
            <span className="font-semibold text-slate-800">{option.exitStopName}</span>
          </div>
        </div>
      )}

      {/* Bottom Footer: Cab Savings Counter & View Details */}
      <div className="mt-3 flex items-center justify-between pt-2">
        {cabSaving > 0 ? (
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
            <span>Save ₹{cabSaving} vs cab</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-medium">Fastest door-to-door option</div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails();
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          View Timeline & Details
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
