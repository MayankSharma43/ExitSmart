"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  CloudRain,
  Moon,
  Shield,
  Sparkles,
  Info,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
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
    <div className="h-[360px] sm:h-[420px] w-full rounded-2xl bg-[#E8DCC8] border border-[rgba(198,167,94,0.2)] flex items-center justify-center text-xs text-[#1F2A44]/60 animate-pulse">
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
    <main className="results-shell">
      {/* Breadcrumb Navigation */}
      <div className="results-breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight className="h-3 w-3 text-[#C6A75E]" />
        <strong>Journey results</strong>
      </div>

      {/* Results Header */}
      <section className="results-intro">
        <div>
          <div className="results-title-row">
            <span className="eyebrow">YOUR ROUTE COMPARISON</span>
            <span className="sample-chip">
              <i />
              {isOfflineFallback ? "Offline Cache" : "Verified Data"}
            </span>
          </div>
          <h1>
            {origin.label} <span>&rarr;</span> {destination.label}
          </h1>
          <p>
            Door-to-door multimodal transit comparison across Pune Metro, PMPML, and RTO Auto.
          </p>
        </div>

        <button
          type="button"
          className="outline-button"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1 inline" />
          Edit trip
        </button>
      </section>

      {/* Offline Alert Notification */}
      {isOfflineFallback && (
        <div className="demo-warning">
          <Info className="h-4 w-4 shrink-0 text-[#1F2A44]" />
          <span>
            Loaded from precomputed hackathon reference cache with zero network dependency.
          </span>
          <button type="button" onClick={() => setIsAssumptionsOpen(true)}>
            Data details
          </button>
        </div>
      )}

      {/* ExitSmart Banner */}
      {data?.exitSmart && (
        <ExitBanner
          info={data.exitSmart}
          onOpenAssumptions={() => setIsAssumptionsOpen(true)}
        />
      )}

      {/* Three Ways to Go Section Header */}
      <div className="recommendation-heading">
        <div>
          <span className="eyebrow">THREE WAYS TO GO</span>
          <h2>Choose your trade-off.</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className={"mode-result-chip" + (mode === "balanced" ? " is-active font-bold" : "")}
            onClick={() => handleModeChange("balanced")}
          >
            <Sparkles className="h-3 w-3 inline mr-1" />
            Balanced
          </button>
          <button
            type="button"
            className={"mode-result-chip" + (mode === "rain" ? " is-rain font-bold" : "")}
            onClick={() => handleModeChange("rain")}
          >
            <CloudRain className="h-3 w-3 inline mr-1" />
            Rain Mode
          </button>
          <button
            type="button"
            className={"mode-result-chip" + (mode === "night" ? " font-bold" : "")}
            onClick={() => handleModeChange("night")}
          >
            <Moon className="h-3 w-3 inline mr-1" />
            Night Mode
          </button>
          <button
            type="button"
            className={"mode-result-chip" + (mode === "safety" ? " font-bold" : "")}
            onClick={() => handleModeChange("safety")}
          >
            <Shield className="h-3 w-3 inline mr-1" />
            Safety
          </button>
          <button
            type="button"
            className="text-action text-action--small ml-2"
            onClick={() => setIsAssumptionsOpen(true)}
          >
            How we estimate <ChevronRight className="h-3 w-3 inline" />
          </button>
        </div>
      </div>

      {/* Loading Screen */}
      {loading && (
        <div className="loading-screen" aria-live="polite">
          <div className="loading-orbit">
            <i />
            <i />
            <i />
          </div>
          <span className="eyebrow">EXITSMART</span>
          <h1>Comparing exits and last-mile options…</h1>
          <p>Calculating Metro, PMPML, RTO auto meters, and walking transfers.</p>
          <div className="loading-bar">
            <i />
          </div>
        </div>
      )}

      {/* Error View */}
      {!loading && error && (
        <section className="no-results-card">
          <div className="no-results-icon">
            <AlertCircle className="h-6 w-6 text-[#C6A75E]" />
          </div>
          <span className="eyebrow">ROUTING NOTICE</span>
          <h1>Unable to compute route.</h1>
          <p>{error}</p>
          <div className="mt-4">
            <button
              type="button"
              className="outline-button"
              onClick={() => fetchRecommendations(mode)}
            >
              Try again
            </button>
          </div>
        </section>
      )}

      {/* Recommendation Grid: 3 Profile Cards */}
      {!loading && data && data.options && (
        <>
          <div className="recommendation-grid">
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
          </div>

          {/* Interactive Map Section */}
          <section className="map-section">
            <div className="map-section-heading">
              <div>
                <span className="eyebrow">ROUTE PREVIEW & STOPS</span>
                <h2>See the journey on Pune map.</h2>
                <p>
                  Showing route for: <strong>{selectedOption?.label}</strong> &bull; Click stops or use panel to override
                </p>
              </div>
            </div>

            <div className="map-and-controls is-open">
              <div className="results-map">
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
                  className="h-[360px] sm:h-[420px]"
                />
                <div className="map-legend">
                  <span>
                    <i className="legend-line" />
                    Selected transit leg
                  </span>
                  <span>
                    <i className="legend-dot legend-dot--origin" />
                    Start / End
                  </span>
                  <span>
                    <i className="legend-dot legend-dot--exit" />
                    Metro Station / Bus Stop
                  </span>
                </div>
              </div>

              {/* Stop Override Panel */}
              <aside className="override-panel">
                <span className="eyebrow">STOP OVERRIDE</span>
                <h3>Adjust entry and exit.</h3>
                <p>Override the recommended stops and results will recompute instantaneously.</p>

                <label className="override-field">
                  <span>Entry stop</span>
                  <select
                    id="entry-override"
                    value={entryOverride}
                    onChange={(e) => setEntryOverride(e.target.value)}
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
                </label>

                <label className="override-field">
                  <span>Exit stop</span>
                  <select
                    id="exit-override"
                    value={exitOverride}
                    onChange={(e) => setExitOverride(e.target.value)}
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
                </label>

                {(entryOverride || exitOverride) && (
                  <button
                    type="button"
                    className="override-button"
                    onClick={() => {
                      setEntryOverride("");
                      setExitOverride("");
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reset to Auto
                  </button>
                )}
              </aside>
            </div>
          </section>

          {/* Bottom Transparency Note */}
          <section className="results-bottom-note">
            <span>
              <ShieldCheck className="h-5 w-5 text-[#1F2A44]" />
            </span>
            <p>
              <strong>Estimate, not a promise.</strong> Fares follow official Maharashtra RTO meters and Maha Metro slabs. Road travel times include urban traffic multipliers.
            </p>
            <button
              type="button"
              className="text-action text-action--small"
              onClick={() => setIsAssumptionsOpen(true)}
            >
              View assumptions <ChevronRight className="h-3 w-3 inline" />
            </button>
          </section>
        </>
      )}

      {/* Route Detail Sheet Modal */}
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
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#1F2A44]/60">
          Loading ExitSmart Route Explorer...
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
