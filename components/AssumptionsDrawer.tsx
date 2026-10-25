"use client";

import React, { useEffect } from "react";
import {
  X,
  Clock,
  IndianRupee,
  Calendar,
  Layers,
  Scale,
  Footprints,
  Shield,
  Train,
  Bus,
} from "lucide-react";
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
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultAssumptions: AssumptionItem[] = [
    {
      item: "Pune Metro Timings & Fare Slabs",
      formula:
        "Maha Metro Slabs: ₹10 (0-2 km), ₹15 (2-4 km), ₹20 (4-8 km), ₹25 (8-12 km), ₹30 (12-16 km), ₹35 (>16 km). Operational hours 06:00 - 22:00, 7-10 min headway, 2 min per station, 5 min interchange.",
      source: "Maha Metro Rail Corporation Official Fare Matrix & Timetable",
      confidence: "Real",
    },
    {
      item: "PMPML Bus Stages & Fares",
      formula:
        "Official Stages: ₹5 (0-2 km), ₹10 (2-4 km), ₹15 (4-8 km), ₹20 (8-12 km), ₹25 (12-16 km), ₹30 (>16 km). Headways 10-20 min depending on feeder corridor.",
      source: "PMPML Official Tariff Schedule (pmpml.org)",
      confidence: "Real",
    },
    {
      item: "Auto Rickshaw Fare Meter & Ceilings",
      formula:
        "Maharashtra RTO Pune: Base ₹25 (first 1.5 km) + ₹17/km. Night surcharge: +25% (00:00 - 05:00). Negotiation ceiling: +20% buffer above official meter.",
      source: "Maharashtra Regional Transport Authority Pune Official Fare Notification",
      confidence: "Formula",
    },
    {
      item: "Transfer Buffers & Station Access",
      formula:
        "5 minutes buffer per modal interchange for station concourse traversal, security check, ticketing, and platform descent.",
      source: "ExitSmart Multimodal Transit Standard Buffer",
      confidence: "Formula",
    },
    {
      item: "App Cab Fare Benchmark",
      formula:
        "Base ₹50 (incl. 2 km) + ₹18/km + ₹2/min. Night multiplier 1.25x. Detour factor 1.2x. Non-surge model baseline.",
      source: "Pune Cab Industry Benchmark Model",
      confidence: "Estimated",
    },
    {
      item: "Walking Speed & Rain Mode Heuristic",
      formula:
        "4.5 km/h (75 m/min). Detour multiplier 1.25x. In Rain Mode, walking time is penalized by 2.2x to prioritize covered connections.",
      source: "Standard Pedestrian Heuristic & Weather Weighting",
      confidence: "Estimated",
    },
  ];

  const displayList = assumptions.length > 0 ? assumptions : defaultAssumptions;

  const getItemIcon = (name: string) => {
    if (name.includes("Metro")) return <Train className="h-4 w-4" />;
    if (name.includes("Bus") || name.includes("PMPML")) return <Bus className="h-4 w-4" />;
    if (name.includes("Auto")) return <Scale className="h-4 w-4" />;
    if (name.includes("Cab")) return <IndianRupee className="h-4 w-4" />;
    if (name.includes("Walking")) return <Footprints className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="estimate-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="estimate-title"
      >
        <div className="drawer-handle" />

        <div className="drawer-header">
          <div>
            <span className="eyebrow">TRANSPARENCY & DATA SOURCES</span>
            <h2 id="estimate-title">How we estimate</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="drawer-lede">
          ExitSmart is built on honest, transparent calculations. We distinguish verified government tariffs from empirical formulas and heuristics.
        </p>

        <div className="estimate-source-banner">
          <i />
          <div>
            <strong>Verified Transit Intelligence</strong>
            <small>Pune Metro &bull; PMPML &bull; Maharashtra RTO Pune</small>
          </div>
        </div>

        <div className="assumption-list">
          {displayList.map((a, idx) => (
            <article key={idx}>
              <span>{getItemIcon(a.item)}</span>
              <div>
                <strong>{a.item}</strong>
                <p>{a.formula}</p>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-[9px] text-[#1F2A44]/70">Source: {a.source}</span>
                  <b>{a.confidence}</b>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="confidence-key">
          <span className="eyebrow">SOURCE CONFIDENCE LABELS</span>
          <div>
            <span>Real Data (Maha Metro & PMPML)</span>
            <span>Formula (Maharashtra RTO Auto)</span>
            <span>Estimated (Cab Baseline)</span>
            <span>Hardcoded (Offline Benchmark)</span>
          </div>
          <p>Every number displays its provenance. Never guessing or hiding assumptions.</p>
        </div>

        <button type="button" className="drawer-done" onClick={onClose}>
          Got it
        </button>
      </section>
    </div>
  );
}
