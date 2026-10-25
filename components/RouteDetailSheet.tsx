"use client";

import React, { useEffect } from "react";
import {
  X,
  Footprints,
  Train,
  Bus,
  Car,
  ExternalLink,
  Info,
  Scale,
  Clock,
  IndianRupee,
  ShieldCheck,
  Zap,
  TrendingDown,
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
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !option) return null;

  const categoryKey =
    option.label === "Cheapest" ? "cheapest" : option.label === "Fastest" ? "fastest" : "convenient";

  const getSegmentIcon = (type: string) => {
    switch (type) {
      case "metro":
        return <Train className="h-4 w-4 text-[#C6A75E]" />;
      case "bus":
        return <Bus className="h-4 w-4 text-[#C6A75E]" />;
      case "auto":
      case "shared_auto":
        return <Car className="h-4 w-4 text-[#C6A75E]" />;
      case "cab":
        return <Car className="h-4 w-4 text-[#C6A75E]" />;
      default:
        return <Footprints className="h-4 w-4 text-[#1F2A44]" />;
    }
  };

  const firstSeg = option.segments[0];
  const lastSeg = option.segments[option.segments.length - 1];

  const uberLink = `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${firstSeg.fromCoords.lat}&pickup[longitude]=${firstSeg.fromCoords.lng}&dropoff[latitude]=${lastSeg.toCoords.lat}&dropoff[longitude]=${lastSeg.toCoords.lng}`;
  const olaLink = `https://book.olacabs.com/?lat=${firstSeg.fromCoords.lat}&lng=${firstSeg.fromCoords.lng}&drop_lat=${lastSeg.toCoords.lat}&drop_lng=${lastSeg.toCoords.lng}`;
  const rapidoLink = "https://www.rapido.bike/";

  const fareDisplay =
    option.totalInrMin === option.totalInrMax
      ? `₹${option.totalInrMin}`
      : `₹${option.totalInrMin}–₹${option.totalInrMax}`;

  return (
    <div
      className="drawer-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#F3E9D9] p-5 sm:p-7 shadow-2xl border border-[rgba(198,167,94,0.3)] text-[#1F2A44] my-auto mx-4 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[rgba(198,167,94,0.18)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={"category-label category-label--" + categoryKey}>
                {option.label}
              </span>
              <span className="sample-chip">Door-to-door</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Manrope',sans-serif] tracking-tight">
              {option.totalMin} min &bull; {fareDisplay}
            </h2>
            <p className="text-xs text-[#1F2A44]/75 mt-0.5">
              {firstSeg.from} &rarr; {lastSeg.to}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="icon-button"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metric summary boxes */}
        <div className="grid grid-cols-4 gap-2 py-4 border-b border-[rgba(198,167,94,0.15)] text-center">
          <div className="rounded-xl bg-[#E8DCC8] p-2">
            <span className="block text-[9px] uppercase font-bold text-[#1F2A44]/60">Total Time</span>
            <strong className="text-sm font-bold text-[#1F2A44]">{option.totalMin} min</strong>
          </div>
          <div className="rounded-xl bg-[#E8DCC8] p-2">
            <span className="block text-[9px] uppercase font-bold text-[#1F2A44]/60">Est. Fare</span>
            <strong className="text-sm font-bold text-[#1F2A44]">{fareDisplay}</strong>
          </div>
          <div className="rounded-xl bg-[#E8DCC8] p-2">
            <span className="block text-[9px] uppercase font-bold text-[#1F2A44]/60">Walking</span>
            <strong className="text-sm font-bold text-[#1F2A44]">{option.walkM} m</strong>
          </div>
          <div className="rounded-xl bg-[#E8DCC8] p-2">
            <span className="block text-[9px] uppercase font-bold text-[#1F2A44]/60">Transfers</span>
            <strong className="text-sm font-bold text-[#1F2A44]">{option.transfers}</strong>
          </div>
        </div>

        {/* Timeline breakdown */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow">DOOR-TO-DOOR BREAKDOWN</span>
            <span className="text-[10px] text-[#1F2A44]/70">Verified Route Polyline</span>
          </div>

          <div className="timeline-endpoint">
            <i />
            <div>
              <small>START</small>
              <strong>{firstSeg.from}</strong>
            </div>
          </div>

          <div className="segment-timeline">
            {option.segments.map((seg, idx) => (
              <article className="timeline-item" key={idx}>
                <div className="timeline-rail">
                  <span>{getSegmentIcon(seg.type)}</span>
                  {idx < option.segments.length - 1 && <i />}
                </div>

                <div className="timeline-content">
                  <div className="timeline-head">
                    <div>
                      <span>Leg {idx + 1}: {seg.type.replace("_", " ")}</span>
                      <h3>{seg.from} &rarr; {seg.to}</h3>
                    </div>
                    <strong>{seg.minutes} min</strong>
                  </div>

                  <p>{seg.details || seg.route || "Direct connection"}</p>

                  <div className="segment-meta">
                    <span>
                      <IndianRupee className="h-3.5 w-3.5 inline mr-0.5" />
                      {seg.inrMin === seg.inrMax ? `₹${seg.inrMin}` : `₹${seg.inrMin}–₹${seg.inrMax}`}
                    </span>
                    <span>
                      <Footprints className="h-3.5 w-3.5 inline mr-0.5" />
                      {seg.meters < 1000 ? `${seg.meters} m` : `${(seg.meters / 1000).toFixed(1)} km`}
                    </span>
                    <span className="confidence-label">
                      <i />
                      {seg.confidence}
                    </span>
                  </div>

                  {/* Fair Fare Meter details for Auto segments */}
                  {seg.type === "auto" && (
                    <div className="mt-2 rounded-xl bg-[rgba(198,167,94,0.18)] p-2.5 border border-[rgba(198,167,94,0.3)] text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#1F2A44]">
                        <Scale className="h-3.5 w-3.5 text-[#1F2A44]" />
                        <span>Fair Fare Meter (Maharashtra RTO Formula)</span>
                      </div>
                      <div className="mt-1 text-[11px] text-[#1F2A44]/80">
                        Official Meter Fare: <strong className="text-[#1F2A44]">₹{seg.inrMin}</strong> &bull; Negotiation Ceiling (Max):{" "}
                        <strong className="text-[#1F2A44]">₹{Math.round(seg.inrMin * 1.2)}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="timeline-endpoint timeline-endpoint--last">
            <i />
            <div>
              <small>ARRIVE</small>
              <strong>{lastSeg.to}</strong>
            </div>
          </div>
        </div>

        {/* Transfer Buffer notice */}
        {option.transfers > 0 && (
          <div className="mt-4 rounded-xl bg-[rgba(198,167,94,0.12)] p-3 text-xs text-[#1F2A44] flex items-center gap-2 border border-[rgba(198,167,94,0.2)]">
            <Info className="h-4 w-4 text-[#1F2A44] shrink-0" />
            <span>
              Includes a <strong>{option.transfers * 5} minute buffer</strong> (5 min per transfer) for platform transitions and ticketing.
            </span>
          </div>
        )}

        {/* Deep Link Booking Buttons */}
        <div className="mt-5 pt-4 border-t border-[rgba(198,167,94,0.18)]">
          <span className="eyebrow mb-2 block">Direct Ride Booking (Pre-filled Coordinates)</span>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={uberLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1F2A44] py-2.5 px-3 text-xs font-bold text-[#E8DCC8] hover:brightness-110 transition-all shadow-sm"
            >
              Uber <ExternalLink className="h-3 w-3 opacity-75" />
            </a>

            <a
              href={olaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#C6A75E] py-2.5 px-3 text-xs font-bold text-[#1F2A44] hover:brightness-110 transition-all shadow-sm"
            >
              Ola <ExternalLink className="h-3 w-3 opacity-75" />
            </a>

            <a
              href={rapidoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#E8DCC8] py-2.5 px-3 text-xs font-bold text-[#1F2A44] border border-[rgba(198,167,94,0.3)] hover:brightness-95 transition-all shadow-sm"
            >
              Rapido <ExternalLink className="h-3 w-3 opacity-75" />
            </a>
          </div>
        </div>

        {/* Footer trigger for Assumptions */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenAssumptions) onOpenAssumptions();
            }}
            className="text-xs text-[#1F2A44] hover:underline font-semibold"
          >
            How each number is estimated &bull; Open Assumptions
          </button>
        </div>
      </div>
    </div>
  );
}
