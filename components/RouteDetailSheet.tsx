"use client";

import React from "react";
import {
  X,
  Footprints,
  Train,
  Bus,
  Car,
  ExternalLink,
  Info,
  Scale,
} from "lucide-react";
import { Option } from "@/lib/types";

interface RouteDetailSheetProps {
  option: Option | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAssumptions?: () => void;
}

export default function RouteDetailSheet({
  option,
  isOpen,
  onClose,
  onOpenAssumptions,
}: RouteDetailSheetProps) {
  if (!isOpen || !option) return null;

  // Helper for mode icons
  const getSegmentIcon = (type: string) => {
    switch (type) {
      case "metro":
        return <Train className="h-4 w-4 text-sky-600" />;
      case "bus":
        return <Bus className="h-4 w-4 text-orange-600" />;
      case "auto":
      case "shared_auto":
        return <Car className="h-4 w-4 text-emerald-600" />;
      case "cab":
        return <Car className="h-4 w-4 text-slate-800" />;
      default:
        return <Footprints className="h-4 w-4 text-slate-500" />;
    }
  };

  const getConfidenceBadge = (confidence?: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      Real: { bg: "bg-emerald-100 text-emerald-800 border-emerald-200", text: "Real Data" },
      Formula: { bg: "bg-blue-100 text-blue-800 border-blue-200", text: "RTO Formula" },
      Estimated: { bg: "bg-amber-100 text-amber-800 border-amber-200", text: "Estimated" },
      Hardcoded: { bg: "bg-slate-100 text-slate-800 border-slate-200", text: "Benchmark" },
    };
    const c = map[confidence || "Estimated"] || map.Estimated;

    return (
      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${c.bg}`}>
        {c.text}
      </span>
    );
  };

  // Generate deep links for pickup & drop
  const firstSeg = option.segments[0];
  const lastSeg = option.segments[option.segments.length - 1];

  const uberLink = `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${firstSeg.fromCoords.lat}&pickup[longitude]=${firstSeg.fromCoords.lng}&dropoff[latitude]=${lastSeg.toCoords.lat}&dropoff[longitude]=${lastSeg.toCoords.lng}`;
  const olaLink = `https://book.olacabs.com/?lat=${firstSeg.fromCoords.lat}&lng=${firstSeg.fromCoords.lng}&drop_lat=${lastSeg.toCoords.lat}&drop_lng=${lastSeg.toCoords.lng}`;
  const rapidoLink = "https://www.rapido.bike/"; // Rapido landing page as noted in DECISIONS.md

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200 p-4 sm:p-6 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                {option.label}
              </span>
              <span className="text-xs text-slate-400 font-medium">Route Timeline</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {option.totalMin} min &bull; {option.totalInrMin === option.totalInrMax ? `₹${option.totalInrMin}` : `₹${option.totalInrMin} - ₹${option.totalInrMax}`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Multimodal Timeline Segments */}
        <div className="mt-5 space-y-4">
          {option.segments.map((seg, idx) => (
            <div key={idx} className="relative pl-7 pb-4 border-l-2 border-slate-200 last:border-0 last:pb-0">
              {/* Timeline Node Dot */}
              <div className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-blue-500 shadow-sm">
                {getSegmentIcon(seg.type)}
              </div>

              {/* Segment Content */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Leg {idx + 1}: {seg.type.replace("_", " ")}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mt-0.5">
                      {seg.from} <span className="text-slate-400">&rarr;</span> {seg.to}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">
                      {seg.inrMin === seg.inrMax ? `₹${seg.inrMin}` : `₹${seg.inrMin} - ₹${seg.inrMax}`}
                    </span>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {seg.minutes} min ({seg.meters < 1000 ? `${seg.meters}m` : `${(seg.meters / 1000).toFixed(1)} km`})
                    </div>
                  </div>
                </div>

                {/* Details & Confidence */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-600 font-medium text-[11px]">
                    {seg.details || seg.route || "Direct connection"}
                  </span>
                  <div>{getConfidenceBadge(seg.confidence)}</div>
                </div>

                {/* Fair Fare Meter Box (For Auto Legs) */}
                {seg.type === "auto" && (
                  <div className="mt-2.5 rounded-lg bg-emerald-50/80 p-2.5 border border-emerald-200/60 text-xs text-emerald-900">
                    <div className="flex items-center gap-1 font-bold text-emerald-800">
                      <Scale className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Fair Fare Meter (Maharashtra RTO Formula)</span>
                    </div>
                    <div className="mt-1 text-[11px] text-emerald-700">
                      Standard Meter: <span className="font-bold">₹{seg.inrMin}</span> &bull; Negotiate Up To Ceiling:{" "}
                      <span className="font-bold">₹{Math.round(seg.inrMin * 1.2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Transfer Buffer Note */}
        {option.transfers > 0 && (
          <div className="mt-4 rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 flex items-center gap-2 border border-blue-100">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              Includes a <strong className="font-semibold">{option.transfers * 5} minute buffer</strong> (5 min per transfer) for station navigation, ticketing, and platform switching.
            </span>
          </div>
        )}

        {/* Deep Link Booking Buttons (FR-18 P1) */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Book Ride Directly (Pre-filled Coords)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={uberLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 px-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Uber <ExternalLink className="h-3 w-3 opacity-75" />
            </a>

            <a
              href={olaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 px-3 text-xs font-bold text-slate-900 hover:bg-amber-400 transition-colors shadow-sm"
            >
              Ola <ExternalLink className="h-3 w-3 opacity-75" />
            </a>

            <a
              href={rapidoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-yellow-400 py-2.5 px-3 text-xs font-bold text-slate-900 hover:bg-yellow-300 transition-colors shadow-sm"
            >
              Rapido <ExternalLink className="h-3 w-3 opacity-75" />
            </a>
          </div>
        </div>

        {/* Bottom Link to Assumptions Drawer */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenAssumptions) onOpenAssumptions();
            }}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            How each number is calculated &bull; Open Assumptions
          </button>
        </div>
      </div>
    </div>
  );
}
