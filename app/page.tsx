"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
} from "lucide-react";
import SearchForm from "@/components/SearchForm";
import AssumptionsDrawer from "@/components/AssumptionsDrawer";

export default function HomePage() {
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);

  useEffect(() => {
    const handleOpenAssumptions = () => setIsAssumptionsOpen(true);
    window.addEventListener("open-assumptions", handleOpenAssumptions);
    return () => window.removeEventListener("open-assumptions", handleOpenAssumptions);
  }, []);

  const referenceRoutes = [
    {
      id: "ref_1",
      title: "Ramwadi Metro → Kharadi (EON)",
      badge: "ExitSmart Insight",
      badgeColor: "bg-amber-100 text-amber-800",
      description: "Shows why exiting at Chandan Nagar / Kharadi Bypass beats taking an auto all the way.",
      origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
      dest: { lat: 18.5516, lng: 73.9515, label: "EON IT Park, Kharadi" },
    },
    {
      id: "ref_2",
      title: "Ramwadi Metro → Viman Nagar",
      badge: "Short Hop Trade-off",
      badgeColor: "bg-blue-100 text-blue-800",
      description: "Auto vs ₹5 Bus vs Walk for a 1.5 km hop.",
      origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
      dest: { lat: 18.5645, lng: 73.9145, label: "Viman Nagar (Datta Mandir)" },
    },
    {
      id: "ref_3",
      title: "Ramwadi Metro → Baner",
      badge: "Long Last-Mile & Rain Mode",
      badgeColor: "bg-sky-100 text-sky-800",
      description: "Cross-city transit leg. Rain mode measurably shifts rankings away from open walks.",
      origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
      dest: { lat: 18.5640, lng: 73.7740, label: "Baner (Balewadi Phata)" },
    },
    {
      id: "ref_4",
      title: "Kothrud (Chandani Chowk) → Kharadi",
      badge: "Door-to-Door Multimodal",
      badgeColor: "bg-emerald-100 text-emerald-800",
      description: "Complete journey: First-mile Auto + Vanaz-Ramwadi Metro + Last-mile Bus.",
      origin: { lat: 18.5075, lng: 73.7845, label: "Kothrud (Chandani Chowk)" },
      dest: { lat: 18.5516, lng: 73.9515, label: "EON IT Park, Kharadi" },
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3 py-1 text-xs font-bold text-blue-700 mb-3 shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
          Smart Last-Mile & Transit Optimizer &bull; Pune
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Enter Smarter. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Exit Smarter.
          </span>
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          The nearest stop is not always the best. ExitSmart calculates door-to-door options across <strong>Metro, PMPML buses, metered autos, and cabs</strong>, recommending optimal entry and exit points to save you time and money.
        </p>
      </div>

      {/* Main Search Form */}
      <div className="max-w-xl mx-auto">
        <SearchForm />
      </div>

      {/* Value Proposition Highlights */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 shrink-0">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Cheapest Fare</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare ₹5-15 PMPML buses and Metro slabs vs expensive direct cabs.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Fastest Transfer</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes 5 min transfer buffers and peak-hour traffic multipliers.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="rounded-xl bg-purple-50 p-2 text-purple-600 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Fair Fare Meter</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Maharashtra RTO formula auto meters with negotiation ceilings.
            </p>
          </div>
        </div>
      </div>

      {/* Reference Routes Quick Launcher */}
      <div className="mt-12 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Reference Corridors (Hackathon Benchmark)
            </h3>
            <p className="text-xs text-slate-500">
              One-tap tests loaded directly from offline cache
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            100% Offline Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {referenceRoutes.map((ref) => {
            const queryParams = new URLSearchParams({
              originLat: ref.origin.lat.toString(),
              originLng: ref.origin.lng.toString(),
              originLabel: ref.origin.label,
              destLat: ref.dest.lat.toString(),
              destLng: ref.dest.lng.toString(),
              destLabel: ref.dest.label,
              mode: "balanced",
            });

            return (
              <Link
                key={ref.id}
                href={`/results?${queryParams.toString()}`}
                className="group rounded-2xl bg-white p-4 border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${ref.badgeColor}`}>
                      {ref.badge}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {ref.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {ref.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Assumptions Drawer */}
      <AssumptionsDrawer
        isOpen={isAssumptionsOpen}
        onClose={() => setIsAssumptionsOpen(false)}
      />
    </div>
  );
}
