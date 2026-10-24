"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  Clock,
  CloudRain,
  Moon,
  Shield,
  SlidersHorizontal,
  Sparkles,
  ArrowRightLeft,
  Map as MapIcon,
  Train,
  Bus,
  Car,
  Building2,
  X,
  Loader2,
  History,
} from "lucide-react";
import { Place, TravelMode } from "@/lib/types";

// Dynamic import for Leaflet map picker
const MapLocationPicker = dynamic(() => import("./MapLocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 animate-pulse">
      Loading interactive map picker...
    </div>
  ),
});

interface SearchFormProps {
  initialOrigin?: Place;
  initialDestination?: Place;
  initialMode?: TravelMode;
  onSearch?: (origin: Place, dest: Place, mode: TravelMode, time: string) => void;
  compact?: boolean;
}

const DEFAULT_RECENTS: Place[] = [
  {
    id: "rec_pimpri",
    title: "Pimpri-Chinchwad",
    subtitle: "Pimpri Colony, Pune, Maharashtra",
    label: "Pimpri-Chinchwad, Pune",
    lat: 18.6279,
    lng: 73.8009,
    placeType: "area",
  },
  {
    id: "rec_ramwadi",
    title: "Ramwadi Metro Station",
    subtitle: "Aqua Line, Pune",
    label: "Ramwadi Metro Station, Pune",
    lat: 18.5524,
    lng: 73.9189,
    placeType: "metro",
  },
  {
    id: "rec_eon",
    title: "EON IT Park, Kharadi",
    subtitle: "Kharadi, Pune • Tech Park",
    label: "EON IT Park, Kharadi, Pune",
    lat: 18.5516,
    lng: 73.9515,
    placeType: "landmark",
  },
  {
    id: "rec_phoenix",
    title: "Phoenix Marketcity",
    subtitle: "Viman Nagar, Pune",
    label: "Phoenix Marketcity, Viman Nagar, Pune",
    lat: 18.5601,
    lng: 73.9168,
    placeType: "landmark",
  },
  {
    id: "rec_pune_station",
    title: "Pune Railway Station",
    subtitle: "Central Railway Terminal, Pune",
    label: "Pune Railway Station, Pune",
    lat: 18.5284,
    lng: 73.8742,
    placeType: "area",
  },
  {
    id: "rec_baner",
    title: "Baner",
    subtitle: "Balewadi Phata, Pune",
    label: "Baner, Pune",
    lat: 18.564,
    lng: 73.774,
    placeType: "area",
  },
];

export default function SearchForm({
  initialOrigin,
  initialDestination,
  initialMode = "balanced",
  onSearch,
  compact = false,
}: SearchFormProps) {
  const router = useRouter();

  const [origin, setOrigin] = useState<Place>(
    initialOrigin || {
      lat: 18.5524,
      lng: 73.9189,
      label: "Ramwadi Metro Station",
      title: "Ramwadi Metro Station",
      subtitle: "Aqua Line, Pune",
      placeType: "metro",
    }
  );

  const [destination, setDestination] = useState<Place>(
    initialDestination || {
      lat: 18.5516,
      lng: 73.9515,
      label: "EON IT Park, Kharadi",
      title: "EON IT Park",
      subtitle: "Kharadi, Pune • Tech Park",
      placeType: "landmark",
    }
  );

  const [originQuery, setOriginQuery] = useState(origin.title || origin.label);
  const [destQuery, setDestQuery] = useState(destination.title || destination.label);

  const [recents, setRecents] = useState<Place[]>(DEFAULT_RECENTS);

  const [originResults, setOriginResults] = useState<Place[]>([]);
  const [destResults, setDestResults] = useState<Place[]>([]);

  const [isOriginLoading, setIsOriginLoading] = useState(false);
  const [isDestLoading, setIsDestLoading] = useState(false);

  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);

  const [showMapPicker, setShowMapPicker] = useState(false);

  const [mode, setMode] = useState<TravelMode>(initialMode);
  const [departureTime, setDepartureTime] = useState("");
  const [isCustomTime, setIsCustomTime] = useState(false);

  const originContainerRef = useRef<HTMLDivElement>(null);
  const destContainerRef = useRef<HTMLDivElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  // Load Recents from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("exitsmart_recents");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecents(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveRecent = (place: Place) => {
    setRecents((prev) => {
      const filtered = prev.filter(
        (p) =>
          p.title?.toLowerCase() !== (place.title || place.label).toLowerCase() &&
          p.label.toLowerCase() !== place.label.toLowerCase()
      );
      const updated = [place, ...filtered].slice(0, 8);
      try {
        localStorage.setItem("exitsmart_recents", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecents = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecents([]);
    try {
      localStorage.removeItem("exitsmart_recents");
    } catch {}
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        originContainerRef.current &&
        !originContainerRef.current.contains(e.target as Node)
      ) {
        setIsOriginOpen(false);
      }
      if (
        destContainerRef.current &&
        !destContainerRef.current.contains(e.target as Node)
      ) {
        setIsDestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Origin Autocomplete Suggestions
  useEffect(() => {
    if (!isOriginOpen) return;

    const trimmed = originQuery.trim();
    if (!trimmed) {
      setOriginResults([]);
      setIsOriginLoading(false);
      return;
    }

    setIsOriginLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setOriginResults(data.places || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsOriginLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [originQuery, isOriginOpen]);

  // Fetch Destination Autocomplete Suggestions
  useEffect(() => {
    if (!isDestOpen) return;

    const trimmed = destQuery.trim();
    if (!trimmed) {
      setDestResults([]);
      setIsDestLoading(false);
      return;
    }

    setIsDestLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setDestResults(data.places || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsDestLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [destQuery, isDestOpen]);

  const handleSwap = () => {
    const tempOrigin = origin;
    setOrigin(destination);
    setDestination(tempOrigin);
    setOriginQuery(destination.title || destination.label);
    setDestQuery(tempOrigin.title || tempOrigin.label);
  };

  const handlePickOrigin = (place: Place) => {
    setOrigin(place);
    setOriginQuery(place.title || place.label);
    saveRecent(place);
  };

  const handlePickDestination = (place: Place) => {
    setDestination(place);
    setDestQuery(place.title || place.label);
    saveRecent(place);
  };

  const handleSelectOrigin = (place: Place) => {
    setOrigin(place);
    setOriginQuery(place.title || place.label);
    saveRecent(place);
    setIsOriginOpen(false);

    // Auto-advance: focus destination input if it hasn't been set
    if (!destQuery || destQuery === "EON IT Park, Kharadi") {
      destInputRef.current?.focus();
      setIsDestOpen(true);
    }
  };

  const handleSelectDestination = (place: Place) => {
    setDestination(place);
    setDestQuery(place.title || place.label);
    saveRecent(place);
    setIsDestOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    if (onSearch) {
      onSearch(origin, destination, mode, departureTime);
      return;
    }

    const params = new URLSearchParams({
      originLat: origin.lat.toString(),
      originLng: origin.lng.toString(),
      originLabel: origin.label,
      destLat: destination.lat.toString(),
      destLng: destination.lng.toString(),
      destLabel: destination.label,
      mode,
      time: departureTime || new Date().toISOString(),
    });

    router.push(`/results?${params.toString()}`);
  };

  const renderIcon = (place: Place, isRecentItem = false) => {
    if (isRecentItem) {
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Clock className="h-4 w-4" />
        </div>
      );
    }

    switch (place.placeType) {
      case "metro":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <Train className="h-4 w-4" />
          </div>
        );
      case "bus":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <Bus className="h-4 w-4" />
          </div>
        );
      case "auto":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Car className="h-4 w-4" />
          </div>
        );
      case "landmark":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <Building2 className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <MapPin className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 transition-all ${
        compact ? "p-3" : "p-4 sm:p-6"
      }`}
    >
      {/* Header bar with Map Toggle */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Plan Your Commute
        </span>
        <button
          type="button"
          onClick={() => setShowMapPicker(!showMapPicker)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
            showMapPicker
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" />
          {showMapPicker ? "Close Map Picker" : "Choose on Map"}
        </button>
      </div>

      {/* Interactive Map Picker (when toggled open) */}
      {showMapPicker && (
        <div className="mb-4">
          <MapLocationPicker
            origin={origin}
            destination={destination}
            onPickOrigin={handlePickOrigin}
            onPickDestination={handlePickDestination}
            onClose={() => setShowMapPicker(false)}
          />
        </div>
      )}

      {/* Route Inputs Container */}
      <div className="relative space-y-2.5">
        {/* Origin Input (Google Maps / Uber style) */}
        <div ref={originContainerRef} className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Starting Point
            </label>
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <MapPin className="h-3 w-3" />
              Pin on map
            </button>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-emerald-600">
              <Navigation className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={originQuery}
              onChange={(e) => {
                setOriginQuery(e.target.value);
                setIsOriginOpen(true);
              }}
              onFocus={() => setIsOriginOpen(true)}
              placeholder="Search pickup (e.g. Pimpri, Kharadi, Phoenix Mall...)"
              className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-8 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
            {originQuery && (
              <button
                type="button"
                onClick={() => {
                  setOriginQuery("");
                  setIsOriginOpen(true);
                }}
                className="absolute right-2.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown: Recents or Live Map Search */}
          {isOriginOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in duration-150">
              {/* If no query or matches previous label, show RECENTS */}
              {!originQuery.trim() || originQuery.trim() === (origin.title || origin.label).trim() ? (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <History className="h-3 w-3" />
                      Recent Searches
                    </span>
                    {recents.length > 0 && (
                      <button
                        type="button"
                        onClick={clearRecents}
                        className="text-[10px] text-slate-400 hover:text-slate-600 normal-case font-medium hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {recents.map((place, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleSelectOrigin(place)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors group border-b border-slate-50 last:border-0"
                    >
                      {renderIcon(place, true)}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {place.title || place.label}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {place.subtitle || place.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                /* Live Search Matches across entire map */
                <>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Locations on Map</span>
                    {isOriginLoading && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                  </div>

                  {originResults.length > 0 ? (
                    originResults.map((place, idx) => {
                      const isRecentMatch = recents.some(
                        (r) =>
                          r.title?.toLowerCase() === (place.title || place.label).toLowerCase() ||
                          r.label.toLowerCase() === place.label.toLowerCase()
                      );

                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleSelectOrigin(place)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors group border-b border-slate-50 last:border-0"
                        >
                          {renderIcon(place, isRecentMatch)}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {place.title || place.label}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {place.subtitle || place.label}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : !isOriginLoading ? (
                    <div className="px-3 py-4 text-xs text-slate-400 text-center">
                      No matching locations found for "{originQuery}".
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOriginOpen(false);
                            setShowMapPicker(true);
                          }}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Choose location on map &rarr;
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-end -my-1.5 pr-2">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin & Destination"
            className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-2xs"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 rotate-90 sm:rotate-0" />
          </button>
        </div>

        {/* Destination Input (Google Maps / Uber style) */}
        <div ref={destContainerRef} className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Destination
            </label>
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <MapPin className="h-3 w-3" />
              Pin on map
            </button>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-rose-500">
              <MapPin className="h-4 w-4" />
            </span>
            <input
              ref={destInputRef}
              type="text"
              value={destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                setIsDestOpen(true);
              }}
              onFocus={() => setIsDestOpen(true)}
              placeholder="Where to? (e.g. EON Kharadi, Pimpri, Baner, Airport...)"
              className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-8 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
            {destQuery && (
              <button
                type="button"
                onClick={() => {
                  setDestQuery("");
                  setIsDestOpen(true);
                }}
                className="absolute right-2.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown: Recents or Live Map Search */}
          {isDestOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in duration-150">
              {/* If no query or matches previous label, show RECENTS */}
              {!destQuery.trim() || destQuery.trim() === (destination.title || destination.label).trim() ? (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <History className="h-3 w-3" />
                      Recent Searches
                    </span>
                    {recents.length > 0 && (
                      <button
                        type="button"
                        onClick={clearRecents}
                        className="text-[10px] text-slate-400 hover:text-slate-600 normal-case font-medium hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {recents.map((place, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleSelectDestination(place)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors group border-b border-slate-50 last:border-0"
                    >
                      {renderIcon(place, true)}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {place.title || place.label}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {place.subtitle || place.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                /* Live Search Matches across entire map */
                <>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Locations on Map</span>
                    {isDestLoading && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                  </div>

                  {destResults.length > 0 ? (
                    destResults.map((place, idx) => {
                      const isRecentMatch = recents.some(
                        (r) =>
                          r.title?.toLowerCase() === (place.title || place.label).toLowerCase() ||
                          r.label.toLowerCase() === place.label.toLowerCase()
                      );

                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleSelectDestination(place)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors group border-b border-slate-50 last:border-0"
                        >
                          {renderIcon(place, isRecentMatch)}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {place.title || place.label}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {place.subtitle || place.label}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : !isDestLoading ? (
                    <div className="px-3 py-4 text-xs text-slate-400 text-center">
                      No matching locations found for "{destQuery}".
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDestOpen(false);
                            setShowMapPicker(true);
                          }}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Choose location on map &rarr;
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mode Chips (P1 Context Features) */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Commute Mode
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setMode("balanced")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
              mode === "balanced"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Balanced
          </button>

          <button
            type="button"
            onClick={() => setMode("rain")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
              mode === "rain"
                ? "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-200"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <CloudRain className="h-3.5 w-3.5" />
            Rain Mode
          </button>

          <button
            type="button"
            onClick={() => setMode("night")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
              mode === "night"
                ? "bg-indigo-900 text-white border-indigo-900 shadow-sm shadow-indigo-300"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            Night Mode
          </button>

          <button
            type="button"
            onClick={() => setMode("safety")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
              mode === "safety"
                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm shadow-emerald-200"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Safety-First
          </button>
        </div>

        {mode === "rain" && (
          <p className="mt-1.5 text-[11px] text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <CloudRain className="h-3.5 w-3.5 shrink-0" />
            <span>Rain mode active: penalizes open-air walking and prioritizes door-to-door transit legs.</span>
          </p>
        )}

        {mode === "night" && (
          <p className="mt-1.5 text-[11px] text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Moon className="h-3.5 w-3.5 shrink-0" />
            <span>Night mode active: includes 25% RTO night surcharge (00-05h) and flags low-frequency buses.</span>
          </p>
        )}
      </div>

      {/* Departure Time */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Departure:</span>
          {!isCustomTime ? (
            <span className="font-semibold text-slate-800">Leave Now</span>
          ) : (
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-700"
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsCustomTime(!isCustomTime)}
          className="text-blue-600 hover:underline font-medium"
        >
          {isCustomTime ? "Set to Now" : "Change time"}
        </button>
      </div>

      {/* Submit Button */}
      <div className="mt-5">
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all"
        >
          <Sparkles className="h-4 w-4" />
          Find Smartest Exit & Route
        </button>
      </div>
    </form>
  );
}
