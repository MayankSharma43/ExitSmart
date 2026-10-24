"use client";

import React from "react";
import { X, CheckCircle2 } from "lucide-react";
import { AssumptionItem } from "@/lib/types";

interface AssumptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assumptions?: AssumptionItem[];
}

export default function AssumptionsDrawer({
  isOpen,
  onClose,
  assumptions = [],
}: AssumptionsDrawerProps) {
  if (!isOpen) return null;

  const defaultAssumptions: AssumptionItem[] = [
    {
      item: "Pune Metro Timings & Fares",
      formula: "Maha Metro Slabs: ₹10 (0-2 km), ₹15 (2-4 km), ₹20 (4-8 km), ₹25 (8-12 km), ₹30 (12-16 km), ₹35 (>16 km). Avg travel: 2 min/station, 5 min interchange.",
      source: "Maha Metro Official Fare Card & Time Table",
      confidence: "Real",
    },
    {
      item: "PMPML Bus Fares",
      formula: "Official Stages: ₹5 (0-2 km), ₹10 (2-4 km), ₹15 (4-8 km), ₹20 (8-12 km), ₹25 (12-16 km), ₹30 (>16 km). Headways 10-20 min.",
      source: "PMPML Official Tariff (pmpml.org)",
      confidence: "Real",
    },
    {
      item: "Auto Rickshaw Fare Meter",
      formula: "Maharashtra RTO Pune: Base ₹25 (first 1.5 km) + ₹17/km. Night surcharge: +25% (00:00 - 05:00). Negotiate ceiling: +20% buffer.",
      source: "Maharashtra Regional Transport Authority Pune Official Revision",
      confidence: "Formula",
    },
    {
      item: "Transfer Buffer",
      formula: "5 minutes added per modal interchange (station access, ticketing, and platform transfer).",
      source: "ExitSmart Multimodal Transit Buffer Standard",
      confidence: "Formula",
    },
    {
      item: "App Cab Fare Estimate",
      formula: "Industry estimate: Base ₹50 (incl 2 km) + ₹18/km + ₹2/min. Night multiplier: 1.25x. No live aggregator API.",
      source: "Pune App Cab Non-Surge Standard Industry Model",
      confidence: "Estimated",
    },
    {
      item: "Walking Speed",
      formula: "4.5 km/h (75 meters per minute). Detour multiplier: 1.25x straight-line when offline.",
      source: "Standard Pedestrian Speed Heuristic",
      confidence: "Estimated",
    },
  ];

  const displayList = assumptions.length > 0 ? assumptions : defaultAssumptions;

  const confidenceBadge = (confidence: string) => {
    const badgeColors: Record<string, string> = {
      Real: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Formula: "bg-blue-100 text-blue-800 border-blue-200",
      Estimated: "bg-amber-100 text-amber-800 border-amber-200",
      Hardcoded: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return (
      <span
        className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${
          badgeColors[confidence] || badgeColors.Estimated
        }`}
      >
        {confidence}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 p-6 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Transparency & Ground Truth
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              How ExitSmart Estimates
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Confidence System Legend */}
        <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Confidence Labels Explained
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="font-bold text-emerald-700 block">Real</span>
              <span className="text-[11px] text-slate-500">Official schedule or tariff slab.</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="font-bold text-blue-700 block">Formula</span>
              <span className="text-[11px] text-slate-500">Official RTO regulatory rule.</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="font-bold text-amber-700 block">Estimated</span>
              <span className="text-[11px] text-slate-500">Distance or speed model.</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block">Hardcoded</span>
              <span className="text-[11px] text-slate-500">Curated prototype point.</span>
            </div>
          </div>
        </div>

        {/* Formulas & Data Sources Table */}
        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Formulas and Slabs</h3>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {displayList.map((item, idx) => (
              <div key={idx} className="p-3.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{item.item}</span>
                  {confidenceBadge(item.confidence)}
                </div>
                <p className="text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                  {item.formula}
                </p>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  <strong>Source:</strong> {item.source}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reference Route Spot Checks */}
        <div className="mt-5 rounded-2xl bg-blue-50/60 p-4 border border-blue-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            Verified Hackathon Reference Routes
          </h4>
          <p className="text-xs text-blue-900/80 leading-relaxed">
            Spot checks for Ramwadi &rarr; Kharadi EON (PMPML ₹15, Auto ₹85), Ramwadi &rarr; Viman Nagar (Bus ₹5, Auto ₹25), and Ramwadi &rarr; Baner have been validated against official tariffs and cached for 100% offline availability in <code className="font-bold text-blue-900">VALIDATION.md</code>.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
