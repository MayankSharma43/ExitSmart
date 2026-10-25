"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Route,
  ArrowRight,
  TrendingDown,
  Clock,
  Layers,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import DepthCarousel from "@/components/react-bits/DepthCarousel.jsx";

const BENCHMARK_CORRIDORS = [
  {
    key: "kharadi",
    image: "/route-kharadi.svg",
    alt: "Ramwadi Metro to Kharadi EON route card",
    tag: "SMART EXIT STRATEGY",
    label: "Ramwadi Metro → Kharadi EON IT Park",
    savings: "Save ₹50+ and 18 mins",
    body: "Demonstrates why exiting at Chandan Nagar / Kharadi Bypass beats taking an auto all the way. Avoids the infamous Nagar Road junction bottle-neck and connects with direct PMPML feeder buses.",
    origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
    dest: { lat: 18.5516, lng: 73.9515, label: "EON IT Park, Kharadi" },
    metroLeg: "Aqua Line (Ramwadi)",
    feederLeg: "PMPML AC Feeder / Auto Hop",
    normalAutoFare: "₹140 - ₹170",
    exitSmartFare: "₹25 - ₹45",
  },
  {
    key: "viman",
    image: "/route-viman.svg",
    alt: "Ramwadi Metro to Viman Nagar route card",
    tag: "SHORT HOP TRADE-OFF",
    label: "Ramwadi Metro → Viman Nagar (Datta Mandir)",
    savings: "₹5 Bus vs ₹35 Auto vs Free Walk",
    body: "A classic 1.5 km short hop dilemma. Reveals the optimal trade-off between walking under shaded footpaths vs boarding a ₹5 PMPML stage bus vs taking a metered auto.",
    origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
    dest: { lat: 18.5645, lng: 73.9145, label: "Viman Nagar (Datta Mandir)" },
    metroLeg: "Aqua Line (Ramwadi Terminal)",
    feederLeg: "PMPML Stage 1 / Pedestrian Walk",
    normalAutoFare: "₹35 - ₹50",
    exitSmartFare: "₹5 (Bus) / ₹0 (Walk)",
  },
  {
    key: "baner",
    image: "/route-baner.svg",
    alt: "Ramwadi Metro to Baner route card",
    tag: "CROSS-CITY TRANSIT",
    label: "Ramwadi Metro → Baner (Balewadi Phata)",
    savings: "Bypasses Pune University Jam",
    body: "East-to-West cross-city corridor. Demonstrates how Rain Mode penalizes exposed walking and prioritizes sheltered door-to-door connections with Aqua & Purple line transfers.",
    origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
    dest: { lat: 18.564, lng: 73.774, label: "Baner (Balewadi Phata)" },
    metroLeg: "Aqua Line → Civil Court Interchange",
    feederLeg: "Feeder Bus via Pashan Highway",
    normalAutoFare: "₹280 - ₹340",
    exitSmartFare: "₹45 - ₹65",
  },
  {
    key: "kothrud",
    image: "/route-kharadi.svg",
    alt: "Kothrud Chandani Chowk to Kharadi EON route card",
    tag: "DOOR-TO-DOOR MULTIMODAL",
    label: "Kothrud (Chandani Chowk) → Kharadi EON IT Park",
    savings: "Full Cross-Pune Multimodal Trip",
    body: "Complete journey: First-mile Auto to Vanaz Metro → Full Aqua Line transit across Pune → Strategic exit and last-mile feeder bus into EON IT Park.",
    origin: { lat: 18.5075, lng: 73.7845, label: "Kothrud (Chandani Chowk)" },
    dest: { lat: 18.5516, lng: 73.9515, label: "EON IT Park, Kharadi" },
    metroLeg: "Aqua Line (Vanaz to Ramwadi)",
    feederLeg: "Dual Feeders (First-Mile & Last-Mile)",
    normalAutoFare: "₹380 - ₹460",
    exitSmartFare: "₹65 - ₹85",
  },
];

export default function CorridorsPage() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  const currentCorridor = BENCHMARK_CORRIDORS[activeSlide] || BENCHMARK_CORRIDORS[0];

  const handleLaunch = (corridor: typeof BENCHMARK_CORRIDORS[0]) => {
    const params = new URLSearchParams({
      originLat: corridor.origin.lat.toString(),
      originLng: corridor.origin.lng.toString(),
      originLabel: corridor.origin.label,
      destLat: corridor.dest.lat.toString(),
      destLng: corridor.dest.lng.toString(),
      destLabel: corridor.dest.label,
      mode: "balanced",
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1080px] mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-[680px] mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/15 text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase shadow-xs mb-3">
          <Route className="h-3 w-3" /> VERIFIED BENCHMARK DATASETS
        </div>
        <h1 className="font-['Outfit'] font-extrabold text-3xl sm:text-5xl text-[#1C1A18] dark:text-[#F9F6F0] tracking-tight mb-3">
          Pune Reference Corridors
        </h1>
        <p className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base text-[#615247] dark:text-[#A89B8F] leading-relaxed">
          Precomputed, offline-ready reference journeys across Pune&apos;s most congested transit arteries. Tested against real traffic conditions and verified fare slabs.
        </p>
      </div>

      {/* 3D Depth Carousel Showcase */}
      <div className="p-8 sm:p-12 rounded-[32px] bg-white/55 dark:bg-[#1C1814]/75 backdrop-blur-2xl border border-white/85 dark:border-white/15 shadow-[0_25px_60px_-15px_rgba(50,40,25,0.1)] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
        <div className="flex items-center justify-center overflow-visible min-h-[360px]">
          <DepthCarousel
            items={BENCHMARK_CORRIDORS.map((r) => ({ image: r.image, alt: r.alt }))}
            cardWidth={260}
            cardHeight={320}
            radius={22}
            tint="#FCFAF6"
            depth={165}
            spread={72}
            tilt={18}
            tiltDirection="right"
            perspective={1300}
            visibleCards={3}
            falloff={0.16}
            blur={4}
            duration={650}
            autoplay={false}
            loop
            showControls
            showIndicators
            onChange={(i: number) => setActiveSlide(i)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase">
              {currentCorridor.tag}
            </span>
            <span className="text-xs font-bold text-[#8C7A6D] dark:text-[#A89B8F]">
              0{activeSlide + 1} / 0{BENCHMARK_CORRIDORS.length}
            </span>
          </div>

          <h2 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-[#1C1A18] dark:text-[#F9F6F0] mb-2">
            {currentCorridor.label}
          </h2>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            {currentCorridor.savings}
          </div>

          <p className="text-sm text-[#615247] dark:text-[#A89B8F] leading-relaxed mb-6">
            {currentCorridor.body}
          </p>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/70 dark:border-white/10 mb-6 text-xs">
            <div>
              <span className="text-[10px] text-[#8C7A6D] dark:text-[#A89B8F] block">Direct Auto Fare</span>
              <strong className="text-[#1C1A18] dark:text-[#F9F6F0] text-sm">{currentCorridor.normalAutoFare}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#D9A441] block font-bold">ExitSmart Fare</span>
              <strong className="text-[#D9A441] text-sm font-extrabold">{currentCorridor.exitSmartFare}</strong>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1C1A18] dark:bg-[#D9A441] text-[#F9F6F0] dark:text-[#1A1511] font-bold text-xs hover:scale-[1.02] transition-all shadow-md"
            onClick={() => handleLaunch(currentCorridor)}
          >
            Launch This Benchmark Route <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Corridor Comparison Cards */}
      <h2 className="font-['Outfit'] font-bold text-2xl text-[#1C1A18] dark:text-[#F9F6F0] mb-6">
        All 4 Benchmark Corridors
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {BENCHMARK_CORRIDORS.map((c, idx) => (
          <div
            key={c.key}
            className="p-6 rounded-[28px] bg-white/45 dark:bg-[#1C1814]/65 backdrop-blur-xl border border-white/80 dark:border-white/15 shadow-sm hover:-translate-y-1 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-extrabold text-[#D9A441] uppercase tracking-wider">
                  CORRIDOR 0{idx + 1}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {c.savings}
                </span>
              </div>
              <h3 className="font-['Outfit'] font-bold text-lg text-[#1C1A18] dark:text-[#F9F6F0] mb-2">
                {c.label}
              </h3>
              <p className="text-xs text-[#615247] dark:text-[#A89B8F] leading-relaxed mb-4">
                {c.body}
              </p>
            </div>

            <div className="pt-4 border-t border-white/60 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8C7A6D] block">Fare comparison</span>
                <span className="text-xs font-bold text-[#1C1A18] dark:text-[#F9F6F0]">
                  <span className="line-through text-red-400 mr-1.5">{c.normalAutoFare}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{c.exitSmartFare}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleLaunch(c)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/70 dark:bg-white/10 border border-white/90 dark:border-white/15 text-xs font-bold text-[#1C1A18] dark:text-[#F9F6F0] hover:bg-white dark:hover:bg-white/20 transition-all"
              >
                Inspect <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
