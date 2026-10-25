"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Car,
  Clock,
  Moon,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Info,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function RTOAutoMeterPage() {
  const [distanceKm, setDistanceKm] = useState<number>(5.0);
  const [isNight, setIsNight] = useState<boolean>(false);
  const [waitingMinutes, setWaitingMinutes] = useState<number>(0);
  const [luggageCount, setLuggageCount] = useState<number>(0);

  // Official Maharashtra RTO Pune Auto Tariff Formula
  // Base: ₹25.00 for first 1.50 km
  // Subsequent: ₹17.00 per km
  // Waiting: ₹1.50 per 5 minutes
  // Night: +25% between 12:00 AM and 5:00 AM
  // Luggage: ₹3.00 per bulky package
  const baseFare = 25.0;
  const subsequentDistance = Math.max(0, distanceKm - 1.5);
  const distanceFare = subsequentDistance * 17.0;
  const waitingCharge = Math.floor(waitingMinutes / 5) * 1.5;
  const luggageCharge = luggageCount * 3.0;

  const daytimeSubtotal = baseFare + distanceFare + waitingCharge;
  const nightSurchargeAmount = isNight ? daytimeSubtotal * 0.25 : 0;
  const totalFare = Math.round(daytimeSubtotal + nightSurchargeAmount + luggageCharge);

  const presets = [
    { label: "1.5 km (Base)", km: 1.5 },
    { label: "3.5 km (Station Feeder)", km: 3.5 },
    { label: "6.0 km (City Leg)", km: 6.0 },
    { label: "10.0 km (Cross-Hub)", km: 10.0 },
    { label: "16.0 km (Airport)", km: 16.0 },
  ];

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1080px] mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-[680px] mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/15 text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase shadow-xs mb-3">
          <Car className="h-3 w-3" /> OFFICIAL MAHARASHTRA GOVERNMENT TARIFF
        </div>
        <h1 className="font-['Outfit'] font-extrabold text-3xl sm:text-5xl text-[#1C1A18] dark:text-[#F9F6F0] tracking-tight mb-3">
          Pune RTO Auto Fare Meter
        </h1>
        <p className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base text-[#615247] dark:text-[#A89B8F] leading-relaxed">
          The verified digital fare calculator based on the official Pune Regional Transport Office tariff structure. Calculate the exact legal fare before boarding at any metro gate or auto stand.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Left Column: Interactive Calculator Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-[32px] bg-white/55 dark:bg-[#1C1814]/75 backdrop-blur-2xl border border-white/85 dark:border-white/15 shadow-[0_25px_60px_-15px_rgba(50,40,25,0.1)]">
          <h2 className="font-['Outfit'] font-bold text-xl sm:text-2xl text-[#1C1A18] dark:text-[#F9F6F0] mb-6 flex items-center justify-between">
            <span>Trip Parameters</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Zero Surge
            </span>
          </h2>

          {/* Preset Buttons */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-[#8C7A6D] dark:text-[#A89B8F] uppercase tracking-wider mb-2">
              Quick Distance Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setDistanceKm(p.km)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    distanceKm === p.km
                      ? "bg-[#1C1A18] dark:bg-[#D9A441] text-[#F9F6F0] dark:text-[#1A1511] shadow-xs"
                      : "bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 text-[#55483F] dark:text-[#A89B8F] hover:bg-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Input & Slider */}
          <div className="mb-6 p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/70 dark:border-white/10">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="distance-input" className="text-xs font-bold text-[#1C1A18] dark:text-[#F9F6F0]">
                Journey Distance (km)
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="distance-input"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="60"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Math.max(0.5, parseFloat(e.target.value) || 0))}
                  className="w-16 px-2 py-1 text-right font-extrabold text-lg rounded-lg bg-white dark:bg-[#12100E] border border-white/80 dark:border-white/15 text-[#1C1A18] dark:text-[#F9F6F0]"
                />
                <span className="text-xs font-semibold text-[#8C7A6D]">km</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
              className="w-full accent-[#D9A441] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C7A6D] mt-1 font-medium">
              <span>1 km</span>
              <span>10 km</span>
              <span>20 km</span>
              <span>30 km</span>
            </div>
          </div>

          {/* Night Surcharge & Waiting Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Night Surcharge */}
            <div
              onClick={() => setIsNight(!isNight)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isNight
                  ? "bg-amber-500/10 border-amber-500/30 text-[#1C1A18] dark:text-[#F9F6F0]"
                  : "bg-white/40 dark:bg-white/5 border-white/70 dark:border-white/10 text-[#55483F] dark:text-[#A89B8F]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-[#D9A441]" />
                  <span className="text-xs font-bold">Midnight Rate</span>
                </div>
                <input
                  type="checkbox"
                  checked={isNight}
                  onChange={() => {}}
                  className="accent-[#D9A441]"
                />
              </div>
              <p className="text-[11px] leading-snug opacity-80 m-0">
                12:00 AM – 5:00 AM (+25% surcharge)
              </p>
            </div>

            {/* Luggage Counter */}
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/70 dark:border-white/10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#D9A441]" />
                  <span className="text-xs font-bold text-[#1C1A18] dark:text-[#F9F6F0]">Bulky Luggage</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                    className="w-6 h-6 rounded-md bg-white dark:bg-white/10 flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-[#1C1A18] dark:text-[#F9F6F0] w-3 text-center">
                    {luggageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLuggageCount(luggageCount + 1)}
                    className="w-6 h-6 rounded-md bg-white dark:bg-white/10 flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-[#8C7A6D] dark:text-[#A89B8F] leading-snug m-0">
                ₹3.00 per baggage exceeding 60×40 cm
              </p>
            </div>
          </div>

          {/* Traffic Waiting Time */}
          <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/70 dark:border-white/10 mb-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#D9A441]" />
                <span className="text-xs font-bold text-[#1C1A18] dark:text-[#F9F6F0]">
                  Traffic Waiting Time (minutes)
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#1C1A18] dark:text-[#F9F6F0]">
                {waitingMinutes} min
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={waitingMinutes}
              onChange={(e) => setWaitingMinutes(parseInt(e.target.value) || 0)}
              className="w-full accent-[#D9A441] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C7A6D] mt-1 font-medium">
              <span>0 min</span>
              <span>15 min</span>
              <span>30 min</span>
              <span>60 min</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Fare Receipt & Legal Rules */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Receipt Card */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-white/70 to-white/45 dark:from-[#221D17]/85 dark:to-[#171411]/80 backdrop-blur-2xl border border-white/90 dark:border-white/15 shadow-[0_25px_60px_-15px_rgba(50,40,25,0.12)]">
            <span className="text-[10px] font-extrabold tracking-widest text-[#D9A441] uppercase block mb-1">
              ESTIMATED LEGAL FARE
            </span>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-['Outfit'] font-extrabold text-4xl sm:text-5xl text-[#1C1A18] dark:text-[#F9F6F0]">
                ₹{totalFare}
              </span>
              <span className="text-xs text-[#8C7A6D] font-medium">inclusive of all tariffs</span>
            </div>

            <div className="border-t border-b border-white/60 dark:border-white/10 py-4 space-y-2.5 text-xs text-[#55483F] dark:text-[#CFC5BC]">
              <div className="flex justify-between">
                <span>Base Fare (First 1.50 km)</span>
                <strong className="font-semibold text-[#1C1A18] dark:text-[#F9F6F0]">₹25.00</strong>
              </div>
              <div className="flex justify-between">
                <span>
                  Additional Distance ({subsequentDistance.toFixed(1)} km × ₹17/km)
                </span>
                <strong className="font-semibold text-[#1C1A18] dark:text-[#F9F6F0]">
                  ₹{distanceFare.toFixed(2)}
                </strong>
              </div>
              {waitingMinutes > 0 && (
                <div className="flex justify-between">
                  <span>Waiting Charge ({waitingMinutes} min)</span>
                  <strong className="font-semibold text-[#1C1A18] dark:text-[#F9F6F0]">
                    ₹{waitingCharge.toFixed(2)}
                  </strong>
                </div>
              )}
              {isNight && (
                <div className="flex justify-between text-[#D9A441]">
                  <span>Midnight Surcharge (+25%)</span>
                  <strong className="font-semibold">₹{nightSurchargeAmount.toFixed(2)}</strong>
                </div>
              )}
              {luggageCharge > 0 && (
                <div className="flex justify-between">
                  <span>Luggage Surcharge ({luggageCount} pkgs)</span>
                  <strong className="font-semibold text-[#1C1A18] dark:text-[#F9F6F0]">
                    ₹{luggageCharge.toFixed(2)}
                  </strong>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Link
                href="/#planner"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#1C1A18] dark:bg-[#D9A441] text-[#F9F6F0] dark:text-[#1A1511] font-bold text-xs hover:scale-[1.02] transition-all shadow-md"
              >
                Plan a Complete Journey <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Passenger Rights & Legal Card */}
          <div className="p-6 rounded-[28px] bg-white/40 dark:bg-white/5 border border-white/70 dark:border-white/10 text-xs text-[#615247] dark:text-[#A89B8F] space-y-3">
            <h3 className="font-['Outfit'] font-bold text-sm text-[#1C1A18] dark:text-[#F9F6F0] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Passenger Protection Guide
            </h3>
            <p className="leading-relaxed m-0">
              In Pune, autorickshaws are legally required to run strictly on meter for all trips starting within PMC and PCMC municipal limits. Refusal to ply or demanding inflated fixed fares is punishable under Section 178 of the Motor Vehicles Act.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[#D9A441] font-bold">
              <PhoneCall className="h-3.5 w-3.5" /> Pune RTO Grievance Helpline: 1800-233-0444 / 020-26058080
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
