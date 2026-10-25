"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Route,
  Layers,
  CloudRain,
  ShieldCheck,
  TrendingDown,
  Zap,
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock,
  Compass,
} from "lucide-react";
import AssumptionsDrawer from "@/components/AssumptionsDrawer";

export default function HowItWorksPage() {
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);

  useEffect(() => {
    const handleOpenAssumptions = () => setIsAssumptionsOpen(true);
    window.addEventListener("open-assumptions", handleOpenAssumptions);
    return () => window.removeEventListener("open-assumptions", handleOpenAssumptions);
  }, []);

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1080px] mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-[720px] mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/15 text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase shadow-xs mb-3">
          <Compass className="h-3 w-3" /> TRANSIT INTELLIGENCE METHODOLOGY
        </div>
        <h1 className="font-['Outfit'] font-extrabold text-3xl sm:text-5xl text-[#1C1A18] dark:text-[#F9F6F0] tracking-tight mb-3">
          How ExitSmart Works
        </h1>
        <p className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base text-[#615247] dark:text-[#A89B8F] leading-relaxed">
          Standard navigation apps blindly calculate routes to the geographically nearest metro station. ExitSmart evaluates multimodal entry and exit trade-offs to bypass traffic choke points and save money.
        </p>
      </div>

      {/* 4 Pillars of Multimodal Intelligence */}
      <div className="space-y-12 mb-16">
        {/* Pillar 1 */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-white/55 dark:bg-[#1C1814]/75 backdrop-blur-2xl border border-white/85 dark:border-white/15 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-3 text-center md:text-left">
            <span className="font-['Outfit'] font-extrabold text-5xl text-[#D9A441] block mb-2">01</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A6D] dark:text-[#A89B8F]">
              Beyond Nearest Stop
            </span>
          </div>
          <div className="md:col-span-9">
            <h2 className="font-['Outfit'] font-bold text-2xl text-[#1C1A18] dark:text-[#F9F6F0] mb-2">
              Strategic Entry &amp; Exit Stop Discovery
            </h2>
            <p className="text-sm text-[#615247] dark:text-[#A89B8F] leading-relaxed m-0">
              In Pune, the nearest metro station or bus stop is often trapped behind severe traffic bottlenecks (e.g. Nagar Road junction or Pune University flyover). ExitSmart scans a 3.5 km radius to identify alternative entry points with direct feeder buses or active auto stands that save 15+ minutes in real travel time.
            </p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-white/55 dark:bg-[#1C1814]/75 backdrop-blur-2xl border border-white/85 dark:border-white/15 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-3 text-center md:text-left">
            <span className="font-['Outfit'] font-extrabold text-5xl text-[#D9A441] block mb-2">02</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A6D] dark:text-[#A89B8F]">
              Pareto Optimization
            </span>
          </div>
          <div className="md:col-span-9">
            <h2 className="font-['Outfit'] font-bold text-2xl text-[#1C1A18] dark:text-[#F9F6F0] mb-2">
              Three Non-Dominated Commute Choices
            </h2>
            <p className="text-sm text-[#615247] dark:text-[#A89B8F] leading-relaxed mb-4">
              Instead of forcing a single opaque &quot;best route&quot;, ExitSmart computes the mathematical Pareto frontier across three distinct objectives:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Cheapest</span>
                <span className="text-xs text-[#615247] dark:text-[#A89B8F]">Prioritizes ₹5-₹15 PMPML feeder buses over autos.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-1">Fastest</span>
                <span className="text-xs text-[#615247] dark:text-[#A89B8F]">Minimizes total duration including realistic transfer delays.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block mb-1">Most Reliable</span>
                <span className="text-xs text-[#615247] dark:text-[#A89B8F]">Fixed-rail Metro punctuality, immune to traffic jams and road delays.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-white/55 dark:bg-[#1C1814]/75 backdrop-blur-2xl border border-white/85 dark:border-white/15 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-3 text-center md:text-left">
            <span className="font-['Outfit'] font-extrabold text-5xl text-[#D9A441] block mb-2">03</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A6D] dark:text-[#A89B8F]">
              Weather Adaptation
            </span>
          </div>
          <div className="md:col-span-9">
            <h2 className="font-['Outfit'] font-bold text-2xl text-[#1C1A18] dark:text-[#F9F6F0] mb-2 flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-sky-500" /> Rain Mode &amp; Safety Penalties
            </h2>
            <p className="text-sm text-[#615247] dark:text-[#A89B8F] leading-relaxed m-0">
              When monsoon showers strike Pune, exposed walking segments become hazardous and slow. Activating Rain Mode applies a 3× impedance penalty on uncovered walking steps, steering recommendations toward sheltered metro skywalks, covered bus stops, and door-to-door auto connections.
            </p>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-white/55 dark:bg-[#1C1814]/75 backdrop-blur-2xl border border-white/85 dark:border-white/15 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-3 text-center md:text-left">
            <span className="font-['Outfit'] font-extrabold text-5xl text-[#D9A441] block mb-2">04</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7A6D] dark:text-[#A89B8F]">
              Official Tariffs
            </span>
          </div>
          <div className="md:col-span-9">
            <h2 className="font-['Outfit'] font-bold text-2xl text-[#1C1A18] dark:text-[#F9F6F0] mb-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Zero Commercial Bias &bull; Real RTO Rates
            </h2>
            <p className="text-sm text-[#615247] dark:text-[#A89B8F] leading-relaxed mb-4">
              All auto calculations strictly follow the official Maharashtra RTO Pune formula (₹25 base for first 1.5 km + ₹17/km + 25% midnight surcharge). Metro fares use the Maha Metro distance slabs (₹10–₹35) and PMPML fares use the official stage matrix. No surge pricing, no booking commissions, and zero dark patterns.
            </p>
            <button
              type="button"
              onClick={() => setIsAssumptionsOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#D9A441] hover:underline"
            >
              Inspect Regulatory Model Assumptions &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="text-center p-10 rounded-[32px] bg-white/40 dark:bg-white/5 border border-white/70 dark:border-white/10 mb-16">
        <h2 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-[#1C1A18] dark:text-[#F9F6F0] mb-3">
          Ready to test your Pune journey?
        </h2>
        <p className="text-sm text-[#615247] dark:text-[#A89B8F] max-w-[500px] mx-auto mb-6">
          Compare the entire door-to-door trip across Metro, Bus, Auto, and Walking in seconds.
        </p>
        <Link
          href="/#planner"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#1C1A18] dark:bg-[#D9A441] text-[#F9F6F0] dark:text-[#1A1511] font-bold text-sm hover:scale-[1.02] transition-all shadow-md"
        >
          Open Transit Planner <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Assumptions Drawer */}
      <AssumptionsDrawer
        isOpen={isAssumptionsOpen}
        onClose={() => setIsAssumptionsOpen(false)}
      />
    </main>
  );
}
