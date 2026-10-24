"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  CloudRain,
  Moon,
  Shield,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { RecommendResponse, Option, Place, TravelMode } from "@/lib/types";
import ResultCard from "@/components/ResultCard";
import ExitBanner from "@/components/ExitBanner";
import RouteDetailSheet from "@/components/RouteDetailSheet";
import AssumptionsDrawer from "@/components/AssumptionsDrawer";
import cachedRefRoutes from "@/data/cache/reference_routes.json";
import stationsData from "@/data/stations.json";
import stopsData from "@/data/stops.json";

// Dynamic import for Leaflet Map to avoid SSR issues
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] sm:h-[450px] w-full rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse">
      Loading Pune Transit Map...
    </div>
  ),
});

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const originLat = parseFloat(searchParams.get("originLat") || "18.5524");
  const originLng = parseFloat(searchParams.get("originLng") || "73.9189");
  const originLabel = searchParams.get("originLabel") || "Ramwadi Metro Station";

  const destLat = parseFloat(searchParams.get("destLat") || "18.5516");
  const destLng = parseFloat(searchParams.get("destLng") || "73.9515");
  const destLabel = searchParams.get("destLabel") || "EON IT Park, Kharadi";

  const initialMode = (searchParams.get("mode") as TravelMode) || "balanced";

  const [origin, setOrigin] = useState<Place>({ lat: originLat, lng: originLng, label: originLabel });
  const [destination, setDestination] = useState<Place>({ lat: destLat, lng: destLng, label: destLabel });
  const [mode, setMode] = useState<TravelMode>(initialMode);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const [entryOverride, setEntryOverride] = useState<string>("");
  const [exitOverride, setExitOverride] = useState<string>("");

  const [detailOption, setDetailOption] = useState<Option | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

  // Fetch or Compute Recommendations
  const fetchRecommendations = async (
    currentMode: TravelMode,
    ovEntry?: string,
    ovExit?: string
  ) => {
    setLoading(true);
    setError(null);
    setIsOfflineFallback(false);

    try {
      const payload: any = {
        origin,
        destination,
        mode: currentMode,
        overrides: {},
      };
      if (ovEntry) payload.overrides.entryStopId = ovEntry;
      if (ovExit) payload.overrides.exitStopId = ovExit;

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json: RecommendResponse = await res.json();
        setData(json);
        if (json.options && json.options.length > 0) {
          setSelectedOption(json.options[0]);
        }
      } else {
        throw new Error("Failed to fetch recommendation from server.");
      }
    } catch (err: any) {
      console.warn("API call failed, checking offline reference route cache:", err);
      // Offline fallback: Check if origin and destination match any precomputed reference routes
      const matchedRefKey = Object.keys(cachedRefRoutes).find((key) => {
        const item = (cachedRefRoutes as any)[key];
        const distO = Math.hypot(item.origin.lat - origin.lat, item.origin.lng - origin.lng);
        const distD = Math.hypot(item.destination.lat - destination.lat, item.destination.lng - destination.lng);
        return distO < 0.01 && distD < 0.01;
      });

      if (matchedRefKey) {
        const cachedItem = (cachedRefRoutes as any)[matchedRefKey];
        const cachedResponse = currentMode === "rain" ? cachedItem.rain : cachedItem.balanced;
        setData(cachedResponse);
        if (cachedResponse.options && cachedResponse.options.length > 0) {
          setSelectedOption(cachedResponse.options[0]);
        }
        setIsOfflineFallback(true);
      } else {
        setError("Unable to calculate route. Please verify locations and network connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(mode, entryOverride, exitOverride);
  }, [mode, entryOverride, exitOverride]);

  const handleModeChange = (newMode: TravelMode) => {
    setMode(newMode);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
      {/* Top Navigation & Route Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full bg-white p-2 text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Pune Multimodal</span>
              <span>&bull;</span>
              <span className="capitalize">{mode} Mode</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {origin.label} &rarr; {destination.label}
            </h1>
          </div>
        </div>

        {/* Quick Mode Switcher in Results Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => handleModeChange("balanced")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
              mode === "balanced"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Balanced
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("rain")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
              mode === "rain"
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <CloudRain className="h-3 w-3" />
            Rain
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("night")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
              mode === "night"
                ? "bg-indigo-900 text-white border-indigo-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Moon className="h-3 w-3" />
            Night
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("safety")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
              mode === "safety"
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Shield className="h-3 w-3" />
            Safety
          </button>
        </div>
      </div>

      {/* Offline Fallback Alert */}
      {isOfflineFallback && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Estimated (offline):</strong> Loaded from precomputed hackathon reference cache with zero network dependency.
            </span>
          </div>
          <span className="rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold">
            Offline Cache
          </span>
        </div>
      )}

      {/* ExitSmart Banner (If Applicable) */}
      {data?.exitSmart && (
        <div className="mt-4">
          <ExitBanner info={data.exitSmart} />
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-6 space-y-4">
          <div className="h-28 rounded-2xl bg-slate-200/70 animate-pulse" />
          <div className="h-36 rounded-2xl bg-slate-200/70 animate-pulse" />
          <div className="h-36 rounded-2xl bg-slate-200/70 animate-pulse" />
        </div>
      )}

      {/* Error View */}
      {!loading && error && (
        <div className="mt-8 rounded-2xl bg-red-50 p-6 text-center border border-red-200">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-red-900">Routing Error</h3>
          <p className="text-xs text-red-700 mt-1">{error}</p>
          <button
            type="button"
            onClick={() => fetchRecommendations(mode)}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Results Layout: Cards + Map */}
      {!loading && data && data.options && (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: 3 Cards */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Top 3 Optimal Door-to-Door Options
              </span>
              <button
                type="button"
                onClick={() => setIsAssumptionsOpen(true)}
                className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                How we estimate
              </button>
            </div>

            {data.options.map((opt) => (
              <ResultCard
                key={opt.id}
                option={opt}
                isSelected={selectedOption?.id === opt.id}
                onSelect={() => setSelectedOption(opt)}
                onViewDetails={() => {
                  setDetailOption(opt);
                  setIsDetailOpen(true);
                }}
                directCabCost={data.cabDirectEstimate?.minInr}
              />
            ))}

            {/* Entry / Exit Override Panel (FR-7 & FR-10) */}
            <div className="mt-6 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Override Entry or Exit Stop
                </span>
                {(entryOverride || exitOverride) && (
                  <button
                    type="button"
                    onClick={() => {
                      setEntryOverride("");
                      setExitOverride("");
                    }}
                    className="text-[11px] text-blue-600 font-semibold hover:underline"
                  >
                    Reset Overrides
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Want to join or leave the transit network at a specific stop? Choose an override and results will instantly recompute.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Entry Stop Override
                  </label>
                  <select
                    value={entryOverride}
                    onChange={(e) => setEntryOverride(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Auto Recommended</option>
                    <optgroup label="Pune Metro Stations">
                      {stationsData.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} Metro ({s.line} Line)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="PMPML Bus Stops & Stands">
                      {stopsData.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Exit Stop Override
                  </label>
                  <select
                    value={exitOverride}
                    onChange={(e) => setExitOverride(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Auto Recommended</option>
                    <optgroup label="Pune Metro Stations">
                      {stationsData.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} Metro ({s.line} Line)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="PMPML Bus Stops & Stands">
                      {stopsData.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Map */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Route Map & Stop Highlights</span>
                <span>Active: <strong className="text-blue-600">{selectedOption?.label}</strong></span>
              </div>

              <MapView
                origin={origin}
                destination={destination}
                selectedOption={selectedOption || undefined}
                onOverrideStop={(stopId, type) => {
                  if (type === "entry") {
                    setEntryOverride(stopId);
                  } else {
                    setExitOverride(stopId);
                  }
                }}
                onUpdateEndpoints={(newO, newD) => {
                  if (newO) setOrigin(newO);
                  if (newD) setDestination(newD);
                }}
                className="h-[360px] sm:h-[480px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Route Detail Sheet */}
      <RouteDetailSheet
        option={detailOption}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenAssumptions={() => setIsAssumptionsOpen(true)}
      />

      {/* Assumptions Drawer */}
      <AssumptionsDrawer
        isOpen={isAssumptionsOpen}
        onClose={() => setIsAssumptionsOpen(false)}
        assumptions={data?.assumptions}
      />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Loading ExitSmart Route Explorer...
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
