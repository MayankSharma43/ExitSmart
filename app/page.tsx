"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  TrendingDown,
  Zap,
  ShieldCheck,
  Layers,
  MapPin,
  Route,
  Shield,
  Info,
  Car,
} from "lucide-react";
import SearchForm from "@/components/SearchForm";
import AssumptionsDrawer from "@/components/AssumptionsDrawer";
import TransitMap from "@/components/TransitMap";
import MaskedHeading from "@/components/react-bits/MaskedHeading.jsx";
import GlowCursor from "@/components/react-bits/GlowCursor.jsx";
import DepthCarousel from "@/components/react-bits/DepthCarousel.jsx";
import SplitFlapText from "@/components/react-bits/SplitFlapText.jsx";

const ROUTE_CARDS = [
  {
    key: "kharadi",
    image: "/route-kharadi.svg",
    alt: "Ramwadi Metro to Kharadi EON route card",
    tag: "EXITSMART INSIGHT",
    label: "Ramwadi Metro → Kharadi EON",
    body: "Shows why exiting at Chandan Nagar / Kharadi Bypass beats taking an auto all the way. Avoids Nagar Road junction bottle-neck and saves ₹50+.",
    origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
    dest: { lat: 18.5516, lng: 73.9515, label: "EON IT Park, Kharadi" },
  },
  {
    key: "viman",
    image: "/route-viman.svg",
    alt: "Ramwadi Metro to Viman Nagar route card",
    tag: "SHORT HOP TRADE-OFF",
    label: "Ramwadi Metro → Viman Nagar",
    body: "Auto vs ₹5 PMPML Bus vs Free Walk for a 1.5 km hop. Reveals the optimal trade-off between walking and transit fees.",
    origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
    dest: { lat: 18.5645, lng: 73.9145, label: "Viman Nagar (Datta Mandir)" },
  },
  {
    key: "baner",
    image: "/route-baner.svg",
    alt: "Ramwadi Metro to Baner route card",
    tag: "LONG CORRIDOR & RAIN MODE",
    label: "Ramwadi Metro → Baner",
    body: "Cross-city transit leg. Demonstrates how Rain mode penalizes exposed walking and prioritizes sheltered door-to-door connections.",
    origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
    dest: { lat: 18.564, lng: 73.774, label: "Baner (Balewadi Phata)" },
  },
  {
    key: "kothrud",
    image: "/route-kharadi.svg",
    alt: "Kothrud Chandani Chowk to Kharadi EON route card",
    tag: "DOOR-TO-DOOR MULTIMODAL",
    label: "Kothrud → Kharadi EON",
    body: "Complete journey: First-mile Auto to Vanaz Metro → Aqua Line to Ramwadi → Last-mile PMPML feeder bus into EON IT Park.",
    origin: { lat: 18.5075, lng: 73.7845, label: "Kothrud (Chandani Chowk)" },
    dest: { lat: 18.5516, lng: 73.9515, label: "EON IT Park, Kharadi" },
  },
];

function PlateRibbon() {
  return (
    <div className="plate-ribbon" aria-hidden="true">
      <svg viewBox="0 0 250 160" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE3CB" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#DEAF82" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#B68052" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="ribbonShine" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M -15 125 C 35 145, 85 65, 145 95 C 195 120, 225 75, 265 65 L 265 175 L -15 175 Z"
          fill="url(#ribbonGrad)"
        />
        <path
          d="M -15 105 C 45 125, 105 45, 165 75 C 215 100, 235 55, 265 45"
          stroke="url(#ribbonShine)"
          strokeWidth="2.5"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const handleOpenAssumptions = () => setIsAssumptionsOpen(true);
    window.addEventListener("open-assumptions", handleOpenAssumptions);
    return () => window.removeEventListener("open-assumptions", handleOpenAssumptions);
  }, []);

  const currentCard = ROUTE_CARDS[activeSlide] || ROUTE_CARDS[0];

  const handleLaunchRoute = (route: typeof ROUTE_CARDS[0]) => {
    const params = new URLSearchParams({
      originLat: route.origin.lat.toString(),
      originLng: route.origin.lng.toString(),
      originLabel: route.origin.label,
      destLat: route.dest.lat.toString(),
      destLng: route.dest.lng.toString(),
      destLabel: route.dest.label,
      mode: "balanced",
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="studio-stage">
      {/* Background Perspective Grid */}
      <div className="studio-grid" aria-hidden="true" />

      {/* Floating 3D Clay Spheres & Ring */}
      <div className="clay-sphere clay-sphere--one" aria-hidden="true" />
      <div className="clay-sphere clay-sphere--two" aria-hidden="true" />
      <div className="clay-sphere clay-sphere--three" aria-hidden="true" />
      <div className="architectural-ring" aria-hidden="true" />

      {/* 3D Hero Scene with Central Card & 4 Tilted Plates */}
      <section className="hero-stage-wrap scene-3d">
        {/* Tilted Plate 1: Metro (Top-Left) */}
        <div
          className="tilted-plate tilted-plate--tl"
          onClick={() => router.push("/corridors")}
          title="Explore Maha Metro Line 1 & Line 2 Corridors"
        >
          <PlateRibbon />
          <div className="plate-header">
            <span className="plate-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="16" height="16" x="4" y="3" rx="2" />
                <path d="M4 11h16" />
                <path d="M12 3v8" />
                <path d="m8 19-2 3" />
                <path d="m18 22-2-3" />
                <circle cx="8" cy="15" r="1" />
                <circle cx="16" cy="15" r="1" />
              </svg>
              Maha Metro
            </span>
            <span className="plate-tag">Aqua & Purple</span>
          </div>
          <div className="plate-content">
            <h4>Aqua &amp; Purple Lines</h4>
            <p>33 km rapid transit network. Bypasses Pune road gridlock entirely.</p>
          </div>
          <div className="plate-footer">
            <span className="plate-stat">₹10 – ₹35 Slabs</span>
            <span className="plate-hint">View Corridors →</span>
          </div>
        </div>

        {/* Tilted Plate 2: PMPML Feeder (Top-Right) */}
        <div
          className="tilted-plate tilted-plate--tr"
          onClick={() => {
            const el = document.getElementById("planner");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          title="Explore PMPML feeder buses"
        >
          <PlateRibbon />
          <div className="plate-header">
            <span className="plate-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6v6" />
                <path d="M15 6v6" />
                <path d="M2 12h19.6" />
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.3-1.1-.8-1.4-.7-.4-2-.6-3.2-.6H5c-1.2 0-2.5.2-3.2.6-.5.3-.8.8-.8 1.4 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
              </svg>
              PMPML Feeder
            </span>
            <span className="plate-tag">Last-Mile</span>
          </div>
          <div className="plate-content">
            <h4>Direct Feeder Buses</h4>
            <p>Synchronized departures from metro station exits straight into IT clusters.</p>
          </div>
          <div className="plate-footer">
            <span className="plate-stat">₹5 – ₹15 Stages</span>
            <span className="plate-hint">Find Routes ↓</span>
          </div>
        </div>

        {/* Central Frosted Hero Card */}
        <div className="hero-stage-center">
          <div className="glass-hero-card">
            {/* Eyebrow & SplitFlap Ticker */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-white/90 dark:border-white/15 text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase shadow-xs">
                DOOR-TO-DOOR TRANSIT INTELLIGENCE
              </span>
              <div className="hidden sm:inline-block">
                <SplitFlapText
                  words={["PUNE METRO", "PMPML BUS", "RTO TARIFF", "SMART EXIT"]}
                  flipDuration={0.1}
                  stagger={0.03}
                  cycleDelay={4500}
                  charset="alpha"
                  flipsPerChar={4}
                  align="center"
                  tileStyle="minimal"
                  tileColor="#FFFFFF"
                  textColor="#D9A441"
                  glare={0}
                  depth={0.2}
                  tileRadius={4}
                  gap={2}
                  fontSize={10}
                  loop
                  padTo={10}
                  intro={false}
                />
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-['Outfit'] font-extrabold text-[42px] sm:text-[54px] leading-[1.08] tracking-tight text-[#1C1A18] dark:text-[#F9F6F0] mb-3">
              Exit<span className="text-[#D9A441]">Smart</span>
            </h1>

            <p className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg text-[#55483F] dark:text-[#CFC5BC] font-medium max-w-[500px] mx-auto leading-relaxed mb-8">
              Enter smarter. Exit smarter. Connect Pune Metro, PMPML feeder buses, and official RTO auto fares to find your optimal door-to-door commute.
            </p>

            {/* Glowing Luminous CTA Button */}
            <div className="mb-8">
              <a
                href="#planner"
                className="luminous-cta text-sm sm:text-base font-bold text-[#1C1A18] dark:text-[#F9F6F0]"
              >
                <span>Plan My Journey</span>
                <span className="text-base">↓</span>
              </a>
            </div>

            {/* Three Proof Badges */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-xs font-semibold text-[#5A4D42] dark:text-[#A89B8F] pt-4 border-t border-white/60 dark:border-white/15">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                Maha Metro Slabs
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                Official RTO Auto Tariff
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                100% Offline Ready
              </span>
            </div>
          </div>
        </div>

        {/* Tilted Plate 3: RTO Auto Fare Meter (Bottom-Left) */}
        <div
          className="tilted-plate tilted-plate--bl"
          onClick={() => router.push("/rto-fare-meter")}
          title="Open official Maharashtra RTO Auto Fare Calculator"
        >
          <PlateRibbon />
          <div className="plate-header">
            <span className="plate-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="18" r="3" />
                <path d="M4 15V9a2 2 0 0 1 2-2h10l3 5v3" />
                <path d="M14 9V6a2 2 0 0 0-2-2H9" />
              </svg>
              RTO Auto Meter
            </span>
            <span className="plate-tag">Zero Surge</span>
          </div>
          <div className="plate-content">
            <h4>Official Pune Auto Tariff</h4>
            <p>₹25 base for first 1.5 km + ₹17/km. Night surcharge and zero surge pricing.</p>
          </div>
          <div className="plate-footer">
            <span className="plate-stat">Govt Formula</span>
            <span className="plate-hint">Calculate Fare →</span>
          </div>
        </div>

        {/* Tilted Plate 4: Smart Exit Advantage (Bottom-Right) */}
        <div
          className="tilted-plate tilted-plate--br"
          onClick={() => router.push("/corridors")}
          title="Explore Smart Exit benchmark corridors"
        >
          <PlateRibbon />
          <div className="plate-header">
            <span className="plate-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
              </svg>
              Smart Exit
            </span>
            <span className="plate-tag">Save ₹50+</span>
          </div>
          <div className="plate-content">
            <h4>Bypass Traffic Jams</h4>
            <p>Exit at the strategic gate or adjacent feeder stop to dodge Nagar Rd choke points.</p>
          </div>
          <div className="plate-footer">
            <span className="plate-stat">Save 15 min &amp; ₹50+</span>
            <span className="plate-hint">See Corridors →</span>
          </div>
        </div>
      </section>

      {/* Transit Search Console Section */}
      <section className="max-w-[1080px] mx-auto px-4 py-12" id="planner">
        <div className="text-center max-w-[620px] mx-auto mb-8">
          <span className="px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-white/80 dark:border-white/15 text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase shadow-xs inline-block mb-3">
            DOOR-TO-DOOR MULTIMODAL PLANNER
          </span>
          <h2 className="font-['Outfit'] font-bold text-3xl sm:text-4xl text-[#1C1A18] dark:text-[#F9F6F0] tracking-tight mb-2">
            Where are you headed today?
          </h2>
          <p className="text-sm sm:text-base text-[#615247] dark:text-[#A89B8F]">
            Enter any origin and destination across Pune, PCMC, and Hinjawadi to compare metro, bus, auto, and walking options.
          </p>
        </div>

        <div className="frosted-search-card">
          <SearchForm />
        </div>
      </section>

      {/* Dedicated Sub-Pages Feature Gateways */}
      <section className="max-w-[1080px] mx-auto px-4 py-14">
        <div className="text-center max-w-[600px] mx-auto mb-10">
          <span className="px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-white/80 dark:border-white/15 text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase shadow-xs inline-block mb-2">
            EXPLORE THE INTELLIGENCE ENGINE
          </span>
          <h2 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-[#1C1A18] dark:text-[#F9F6F0] tracking-tight">
            Specialized Transit Tools
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: RTO Fare Meter */}
          <Link
            href="/rto-fare-meter"
            className="group p-7 rounded-[28px] bg-white/45 dark:bg-[#1C1814]/65 backdrop-blur-xl border border-white/80 dark:border-white/15 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-white/10 border border-white/90 dark:border-white/15 flex items-center justify-center text-[#D9A441] shadow-xs mb-5 group-hover:scale-110 transition-transform">
                <Car className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase block mb-1">
                OFFICIAL GOVERNMENT TARIFF
              </span>
              <h3 className="font-['Outfit'] font-bold text-xl text-[#1C1A18] dark:text-[#F9F6F0] mb-2">
                Pune RTO Auto Fare Meter
              </h3>
              <p className="text-xs sm:text-sm text-[#615247] dark:text-[#A89B8F] leading-relaxed mb-6">
                Interactive legal calculator with ₹25 base, ₹17/km distance tiers, +25% midnight surcharge, and passenger dispute rights.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D9A441] group-hover:translate-x-1 transition-transform">
              Open Auto Meter <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Card 2: Corridors */}
          <Link
            href="/corridors"
            className="group p-7 rounded-[28px] bg-white/45 dark:bg-[#1C1814]/65 backdrop-blur-xl border border-white/80 dark:border-white/15 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-white/10 border border-white/90 dark:border-white/15 flex items-center justify-center text-[#D9A441] shadow-xs mb-5 group-hover:scale-110 transition-transform">
                <Route className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase block mb-1">
                3D ROUTE SHOWCASE
              </span>
              <h3 className="font-['Outfit'] font-bold text-xl text-[#1C1A18] dark:text-[#F9F6F0] mb-2">
                Pune Reference Corridors
              </h3>
              <p className="text-xs sm:text-sm text-[#615247] dark:text-[#A89B8F] leading-relaxed mb-6">
                Explore the 4 hackathon benchmark journeys loaded with instant offline data. Side-by-side time and rupee savings.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D9A441] group-hover:translate-x-1 transition-transform">
              View Corridors <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Card 3: How it Works */}
          <Link
            href="/how-it-works"
            className="group p-7 rounded-[28px] bg-white/45 dark:bg-[#1C1814]/65 backdrop-blur-xl border border-white/80 dark:border-white/15 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-white/10 border border-white/90 dark:border-white/15 flex items-center justify-center text-[#D9A441] shadow-xs mb-5 group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase block mb-1">
                METHODOLOGY &amp; RULES
              </span>
              <h3 className="font-['Outfit'] font-bold text-xl text-[#1C1A18] dark:text-[#F9F6F0] mb-2">
                How ExitSmart Works
              </h3>
              <p className="text-xs sm:text-sm text-[#615247] dark:text-[#A89B8F] leading-relaxed mb-6">
                Understand how our engine scans adjacent stops, scores the Pareto frontier, and applies Rain Mode weather weights.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D9A441] group-hover:translate-x-1 transition-transform">
              Learn Methodology <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Honest by Design Section */}
      <section className="max-w-[1080px] mx-auto px-4 py-8 mb-12" id="estimate-note">
        <div className="p-6 sm:p-8 rounded-[26px] bg-white/50 dark:bg-[#1C1814]/60 backdrop-blur-xl border border-white/85 dark:border-white/15 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-[#FCFAF6] dark:bg-white/10 border border-white/90 dark:border-white/15 flex items-center justify-center text-[#1C1A18] dark:text-[#F9F6F0] shrink-0 shadow-xs">
            <Shield className="h-6 w-6 text-[#D9A441]" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase block mb-1">
              HONEST BY DESIGN
            </span>
            <h2 className="font-['Outfit'] font-bold text-lg text-[#1C1A18] dark:text-[#F9F6F0] mb-1">
              Clear estimates. No commercial pressure.
            </h2>
            <p className="text-xs sm:text-sm text-[#615247] dark:text-[#A89B8F] leading-relaxed m-0 max-w-[650px]">
              Fares, walking distances, and wait times are modeled directly from verified Maha Metro fare slabs, official Maharashtra RTO auto tariff rules, and PMPML bus stages.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAssumptionsOpen(true)}
            className="text-xs font-bold text-[#D9A441] hover:underline shrink-0"
          >
            Assumptions &rarr;
          </button>
        </div>
      </section>

      {/* Assumptions Drawer */}
      <AssumptionsDrawer
        isOpen={isAssumptionsOpen}
        onClose={() => setIsAssumptionsOpen(false)}
      />
    </main>
  );
}

