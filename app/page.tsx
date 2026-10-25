"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
          onClick={() => {
            const el = document.getElementById("popular-routes");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          title="Explore Maha Metro Line 1 & Line 2"
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
            <h4>Aqua & Purple Lines</h4>
            <p>33 km rapid transit network. Bypasses Pune road gridlock entirely.</p>
          </div>
          <div className="plate-footer">
            <span className="plate-stat">₹10 – ₹35 Slabs</span>
            <span className="plate-hint">Zero traffic delay →</span>
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
            <span className="plate-hint">Low cost transit →</span>
          </div>
        </div>

        {/* Central Frosted Hero Card */}
        <div className="hero-stage-center">
          <div className="glass-hero-card">
            {/* Eyebrow & SplitFlap Ticker */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-white/70 border border-white/90 text-[10px] font-extrabold tracking-widest text-[#C5A059] uppercase shadow-xs">
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
                  textColor="#C5A059"
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
            <h1 className="font-['Outfit'] font-extrabold text-[42px] sm:text-[54px] leading-[1.08] tracking-tight text-[#221B16] mb-3">
              Exit<span className="text-[#C5A059]">Smart</span>
            </h1>

            <p className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg text-[#55483F] font-medium max-w-[500px] mx-auto leading-relaxed mb-8">
              Enter smarter. Exit smarter. Connect Pune Metro, PMPML feeder buses, and official RTO auto fares to find your optimal door-to-door commute.
            </p>

            {/* Glowing Luminous CTA Button */}
            <div className="mb-8">
              <a
                href="#planner"
                className="luminous-cta text-sm sm:text-base font-bold text-[#221B16]"
              >
                <span>Plan My Journey</span>
                <span className="text-base">↓</span>
              </a>
            </div>

            {/* Three Proof Badges */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-xs font-semibold text-[#5A4D42] pt-4 border-t border-white/60">
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
          onClick={() => {
            const el = document.getElementById("rto-meter");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          title="View official Maharashtra RTO Auto Fare Meter"
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
            <span className="plate-hint">Inspect meter →</span>
          </div>
        </div>

        {/* Tilted Plate 4: Smart Exit Advantage (Bottom-Right) */}
        <div
          className="tilted-plate tilted-plate--br"
          onClick={() => handleLaunchRoute(ROUTE_CARDS[0])}
          title="Launch Ramwadi to Kharadi Smart Exit route"
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
            <span className="plate-hint">Try benchmark →</span>
          </div>
        </div>
      </section>

      {/* Transit Search Console Section */}
      <section className="max-w-[1080px] mx-auto px-4 py-12" id="planner">
        <div className="text-center max-w-[620px] mx-auto mb-8">
          <span className="px-3 py-1 rounded-full bg-white/70 border border-white/80 text-[10px] font-extrabold tracking-widest text-[#C5A059] uppercase shadow-xs inline-block mb-3">
            DOOR-TO-DOOR MULTIMODAL PLANNER
          </span>
          <h2 className="font-['Outfit'] font-bold text-3xl sm:text-4xl text-[#221B16] tracking-tight mb-2">
            Where are you headed today?
          </h2>
          <p className="text-sm sm:text-base text-[#615247]">
            Enter any origin and destination across Pune, PCMC, and Hinjawadi to compare metro, bus, auto, and walking options.
          </p>
        </div>

        <div className="frosted-search-card">
          <SearchForm />
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-[1080px] mx-auto px-4 py-16" id="how-it-works">
        <div className="text-center max-w-[620px] mx-auto mb-12">
          <span className="px-3 py-1 rounded-full bg-white/70 border border-white/80 text-[10px] font-extrabold tracking-widest text-[#C5A059] uppercase shadow-xs inline-block mb-3">
            A SMARTER CONNECTION
          </span>
          <h2 className="font-['Outfit'] font-bold text-3xl sm:text-4xl text-[#221B16] tracking-tight mb-2">
            More than the nearest station.
          </h2>
          <p className="text-sm sm:text-base text-[#615247]">
            Standard navigation apps blindly direct you to the geographically closest stop. ExitSmart finds adjacent stops with direct feeder buses, active auto stands, or traffic bypasses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: "01",
              title: "Start anywhere in Pune",
              desc: "Add your home, tech park, metro station, or select a precise point with the interactive Leaflet map picker.",
              icon: MapPin,
            },
            {
              num: "02",
              title: "Compare entry & exit stops",
              desc: "Evaluate adjacent metro stations and bus feeder hubs to dodge congested junction bottlenecks.",
              icon: Route,
            },
            {
              num: "03",
              title: "Choose your trade-off",
              desc: "Pick the lowest fare (₹5-15 bus), fewest minutes, or rain-protected walk. Full breakdown with zero booking pressure.",
              icon: Layers,
            },
          ].map((s) => (
            <article
              key={s.num}
              className="relative p-7 rounded-[26px] bg-white/45 backdrop-blur-xl border border-white/80 shadow-[0_15px_35px_-10px_rgba(60,45,30,0.08)] hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="font-['Outfit'] font-extrabold text-2xl text-[#C5A059]">{s.num}</span>
                <span className="w-10 h-10 rounded-2xl bg-white/70 border border-white/90 flex items-center justify-center text-[#221B16] shadow-xs">
                  <s.icon className="h-5 w-5 text-[#C5A059]" />
                </span>
              </div>
              <h3 className="font-['Outfit'] font-bold text-lg text-[#221B16] mb-2">{s.title}</h3>
              <p className="text-xs sm:text-sm text-[#615247] leading-relaxed m-0">{s.desc}</p>
              <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#C5A059] to-transparent mt-5" />
            </article>
          ))}
        </div>
      </section>

      {/* One Journey, Three Ways Strip */}
      <section className="max-w-[1080px] mx-auto px-4 py-6">
        <div className="p-6 sm:p-8 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/85 shadow-[0_20px_45px_-10px_rgba(60,45,30,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-white/70 border border-white/80 text-[10px] font-extrabold tracking-widest text-[#C5A059] uppercase shadow-xs inline-block mb-2">
              ONE JOURNEY, THREE WAYS
            </span>
            <h2 className="font-['Outfit'] font-bold text-2xl text-[#221B16] tracking-tight">
              Choose what matters today.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                <TrendingDown className="h-5 w-5" />
              </span>
              <div>
                <strong className="block text-xs font-bold text-[#221B16]">Cheapest</strong>
                <small className="text-[11px] text-[#7A695C]">Lowest estimated fare</small>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                <Zap className="h-5 w-5" />
              </span>
              <div>
                <strong className="block text-xs font-bold text-[#221B16]">Fastest</strong>
                <small className="text-[11px] text-[#7A695C]">Fewest total minutes</small>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <strong className="block text-xs font-bold text-[#221B16]">Most Convenient</strong>
                <small className="text-[11px] text-[#7A695C]">Fewer steps &amp; less walking</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular / Reference Routes 3D Showcase */}
      <section className="max-w-[1080px] mx-auto px-4 py-16" id="popular-routes">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="px-3 py-1 rounded-full bg-white/70 border border-white/80 text-[10px] font-extrabold tracking-widest text-[#C5A059] uppercase shadow-xs inline-block mb-2">
              PUNE REFERENCE CORRIDORS
            </span>
            <h2 className="font-['Outfit'] font-bold text-3xl sm:text-4xl text-[#221B16] tracking-tight">
              Start with a verified route.
            </h2>
            <p className="text-sm text-[#615247] mt-1">
              Explore the 4 hackathon benchmark journeys loaded with instant offline data.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-white/90 text-xs font-semibold text-[#5A4E45] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            100% Offline Ready
          </div>
        </div>

        <div className="p-8 sm:p-12 rounded-[32px] bg-white/50 backdrop-blur-2xl border border-white/85 shadow-[0_25px_60px_-15px_rgba(60,45,30,0.1)] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex items-center justify-center overflow-visible min-h-[360px]">
            <DepthCarousel
              items={ROUTE_CARDS.map((r) => ({ image: r.image, alt: r.alt }))}
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

          <div className="max-w-[440px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-extrabold tracking-widest text-[#C5A059] uppercase">
                {currentCard.tag}
              </span>
              <span className="text-xs font-bold text-[#8C7A6D]">
                0{activeSlide + 1} / 0{ROUTE_CARDS.length}
              </span>
            </div>
            <h3 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-[#221B16] mb-3">
              {currentCard.label}
            </h3>
            <p className="text-sm text-[#615247] leading-relaxed mb-6">
              {currentCard.body}
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#221B16] text-[#FCFAF6] font-bold text-xs hover:bg-[#3B3026] hover:scale-[1.02] transition-all shadow-md"
              onClick={() => handleLaunchRoute(currentCard)}
            >
              Launch this route <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mt-6 text-xs text-[#8C7A6D]">
              <Info className="h-4 w-4 text-[#C5A059] shrink-0" />
              Precomputed benchmark route from offline cache.
            </div>
          </div>
        </div>
      </section>

      {/* Official RTO Auto Tariff Meter Section */}
      <section className="max-w-[1080px] mx-auto px-4 py-16" id="rto-meter">
        <div className="p-8 sm:p-12 rounded-[32px] bg-white/50 backdrop-blur-2xl border border-white/85 shadow-[0_25px_60px_-15px_rgba(60,45,30,0.1)]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8 pb-8 border-b border-white/70">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/70 border border-white/80 text-[10px] font-extrabold tracking-widest text-[#C5A059] uppercase shadow-xs inline-block mb-2">
                OFFICIAL MAHARASHTRA GOVERNMENT TARIFF
              </span>
              <h2 className="font-['Outfit'] font-bold text-3xl sm:text-4xl text-[#221B16] tracking-tight">
                Pune RTO Auto Fare Meter
              </h2>
              <p className="text-sm text-[#615247] mt-1 max-w-[560px]">
                ExitSmart embeds the official Pune Regional Transport Office tariff formula so commuters never get overcharged at metro gates.
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/70 border border-white/90 text-xs font-bold text-[#221B16] shadow-xs">
              Zero Surge • Zero Dark Patterns
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white/40 border border-white/75">
              <span className="text-[10px] font-bold tracking-wider text-[#8C7A6D] uppercase block mb-1">
                Base Fare (Flag Down)
              </span>
              <strong className="text-2xl font-extrabold text-[#221B16] font-['Outfit'] block">₹25.00</strong>
              <span className="text-xs text-[#615247] mt-1 block">Includes first 1.50 km</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/40 border border-white/75">
              <span className="text-[10px] font-bold tracking-wider text-[#8C7A6D] uppercase block mb-1">
                Subsequent Distance
              </span>
              <strong className="text-2xl font-extrabold text-[#221B16] font-['Outfit'] block">₹17.00</strong>
              <span className="text-xs text-[#615247] mt-1 block">Per kilometer thereafter</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/40 border border-white/75">
              <span className="text-[10px] font-bold tracking-wider text-[#8C7A6D] uppercase block mb-1">
                Night Surcharge (12 AM - 5 AM)
              </span>
              <strong className="text-2xl font-extrabold text-[#221B16] font-['Outfit'] block">+25%</strong>
              <span className="text-xs text-[#615247] mt-1 block">Government mandated midnight tariff</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/40 border border-white/75">
              <span className="text-[10px] font-bold tracking-wider text-[#8C7A6D] uppercase block mb-1">
                Waiting Charges
              </span>
              <strong className="text-2xl font-extrabold text-[#221B16] font-['Outfit'] block">₹1.50</strong>
              <span className="text-xs text-[#615247] mt-1 block">Per 5 minutes in traffic</span>
            </div>
          </div>
        </div>
      </section>

      {/* Honest by Design Section */}
      <section className="max-w-[1080px] mx-auto px-4 py-8 mb-12" id="estimate-note">
        <div className="p-6 sm:p-8 rounded-[26px] bg-white/50 backdrop-blur-xl border border-white/85 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-[#FCFAF6] border border-white/90 flex items-center justify-center text-[#221B16] shrink-0 shadow-xs">
            <Shield className="h-6 w-6 text-[#C5A059]" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-extrabold tracking-widest text-[#C5A059] uppercase block mb-1">
              HONEST BY DESIGN
            </span>
            <h2 className="font-['Outfit'] font-bold text-lg text-[#221B16] mb-1">
              Clear estimates. No commercial pressure.
            </h2>
            <p className="text-xs sm:text-sm text-[#615247] leading-relaxed m-0 max-w-[650px]">
              Fares, walking distances, and wait times are modeled directly from verified Maha Metro fare slabs, official Maharashtra RTO auto tariff rules, and PMPML bus stages.
            </p>
          </div>
          <span className="text-xs font-bold text-[#8C7A6D] tracking-wide uppercase shrink-0">
            PUNE • OPEN TRANSIT
          </span>
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

