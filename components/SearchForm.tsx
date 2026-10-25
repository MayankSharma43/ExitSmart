"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  MapPin,
  Clock,
  CloudRain,
  Moon,
  Shield,
  ArrowRight,
  Train,
  Bus,
  Car,
  Building2,
  X,
  Loader2,
  Map as MapIcon,
  Sparkles,
  Navigation,
  Plane,
  GraduationCap,
  Hospital,
  ShoppingBag,
  Landmark as LandmarkIcon,
  Search,
} from "lucide-react";
import { Place, TravelMode } from "@/lib/types";
import SpecularButton from "./react-bits/SpecularButton.jsx";

// Dynamic import for Leaflet map picker
const MapLocationPicker = dynamic(() => import("./MapLocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full rounded-2xl bg-[#E8DCC8] border border-[rgba(198,167,94,0.2)] flex items-center justify-center text-xs text-[#1F2A44]/60 animate-pulse">
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

const POPULAR_PUNE_HUBS: Place[] = [
  {
    id: "rec_ramwadi",
    title: "Ramwadi Metro Station",
    subtitle: "Aqua Line • Nagar Road, Pune",
    label: "Ramwadi Metro Station, Pune",
    lat: 18.5524,
    lng: 73.9189,
    placeType: "metro",
  },
  {
    id: "rec_eon",
    title: "EON IT Park, Kharadi",
    subtitle: "Kharadi, Pune • Major Tech Park",
    label: "EON IT Park, Kharadi, Pune",
    lat: 18.5516,
    lng: 73.9515,
    placeType: "landmark",
  },
  {
    id: "rec_hinjewadi",
    title: "Hinjewadi Phase 1 (Shivaji Chowk)",
    subtitle: "Hinjewadi, Pune • Tech Hub",
    label: "Hinjewadi Phase 1, Pune",
    lat: 18.5910,
    lng: 73.7380,
    placeType: "landmark",
  },
  {
    id: "rec_airport",
    title: "Pune International Airport (PNQ)",
    subtitle: "Lohegaon, Pune • Terminal 1 & 2",
    label: "Pune International Airport, Pune",
    lat: 18.5822,
    lng: 73.9197,
    placeType: "landmark",
  },
  {
    id: "rec_swargate",
    title: "Swargate Bus Terminal & Metro",
    subtitle: "Swargate, Pune • Central Transit Hub",
    label: "Swargate, Pune",
    lat: 18.5015,
    lng: 73.8580,
    placeType: "metro",
  },
  {
    id: "rec_viman",
    title: "Phoenix Marketcity, Viman Nagar",
    subtitle: "Viman Nagar, Pune • Mall & Entertainment",
    label: "Phoenix Marketcity, Viman Nagar, Pune",
    lat: 18.5601,
    lng: 73.9168,
    placeType: "landmark",
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
      subtitle: "Aqua Line • Pune Metro",
      placeType: "metro",
    }
  );

  const [destination, setDestination] = useState<Place>(
    initialDestination || {
      lat: 18.5516,
      lng: 73.9515,
      label: "EON IT Park, Kharadi",
      title: "EON IT Park, Kharadi",
      subtitle: "Kharadi, Pune • Tech Park",
      placeType: "landmark",
    }
  );

  const [originQuery, setOriginQuery] = useState(origin.title || origin.label);
  const [destQuery, setDestQuery] = useState(destination.title || destination.label);

  const [originResults, setOriginResults] = useState<Place[]>([]);
  const [destResults, setDestResults] = useState<Place[]>([]);

  const [isOriginLoading, setIsOriginLoading] = useState(false);
  const [isDestLoading, setIsDestLoading] = useState(false);

  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);

  // Keyboard navigation focus index (-1 = none)
  const [originActiveIdx, setOriginActiveIdx] = useState(-1);
  const [destActiveIdx, setDestActiveIdx] = useState(-1);

  // Geolocation loading state
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mode, setMode] = useState<TravelMode>(initialMode);
  const [departureTime, setDepartureTime] = useState("Now");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const originContainerRef = useRef<HTMLDivElement>(null);
  const destContainerRef = useRef<HTMLDivElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

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

  // Debounced Origin Autocomplete (220ms)
  useEffect(() => {
    if (!isOriginOpen) return;
    const trimmed = originQuery.trim();
    if (!trimmed) {
      setOriginResults([]);
      setIsOriginLoading(false);
      return;
    }
    setIsOriginLoading(true);
    setOriginActiveIdx(-1);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setOriginResults(data.places || []);
        }
      } catch (err) {
        console.error("Origin autocomplete error:", err);
      } finally {
        setIsOriginLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [originQuery, isOriginOpen]);

  // Debounced Destination Autocomplete (220ms)
  useEffect(() => {
    if (!isDestOpen) return;
    const trimmed = destQuery.trim();
    if (!trimmed) {
      setDestResults([]);
      setIsDestLoading(false);
      return;
    }
    setIsDestLoading(true);
    setDestActiveIdx(-1);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setDestResults(data.places || []);
        }
      } catch (err) {
        console.error("Dest autocomplete error:", err);
      } finally {
        setIsDestLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [destQuery, isDestOpen]);

  // Handle Current Location Geolocation (Uber/Ola style)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
          let label = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          if (res.ok) {
            const data = await res.json();
            if (data.label) label = data.label;
          }
          const currentPlace: Place = {
            id: "current_location",
            lat,
            lng,
            label,
            title: "Current Location",
            subtitle: label,
            placeType: "area",
          };
          setOrigin(currentPlace);
          setOriginQuery("Current Location");
          setIsOriginOpen(false);
          // Focus destination
          destInputRef.current?.focus();
          setIsDestOpen(true);
        } catch {
          const fallbackPlace: Place = {
            id: "current_location",
            lat,
            lng,
            label: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            title: "Current Location",
            subtitle: "Detected GPS coordinates",
            placeType: "area",
          };
          setOrigin(fallbackPlace);
          setOriginQuery("Current Location");
          setIsOriginOpen(false);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError("Unable to retrieve location. Please check browser permissions.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSwap = () => {
    const tempOrigin = origin;
    setOrigin(destination);
    setDestination(tempOrigin);
    setOriginQuery(destination.title || destination.label);
    setDestQuery(tempOrigin.title || tempOrigin.label);
  };

  const handleSelectOrigin = (place: Place) => {
    setOrigin(place);
    setOriginQuery(place.title || place.label);
    setIsOriginOpen(false);
    if (!destQuery || destQuery === "EON IT Park, Kharadi") {
      destInputRef.current?.focus();
      setIsDestOpen(true);
    }
  };

  const handleSelectDestination = (place: Place) => {
    setDestination(place);
    setDestQuery(place.title || place.label);
    setIsDestOpen(false);
  };

  // Keyboard navigation for Origin
  const handleOriginKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = originQuery.trim() ? originResults : POPULAR_PUNE_HUBS;
    if (!isOriginOpen || list.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOriginActiveIdx((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOriginActiveIdx((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    } else if (e.key === "Enter") {
      if (originActiveIdx >= 0 && originActiveIdx < list.length) {
        e.preventDefault();
        handleSelectOrigin(list[originActiveIdx]);
      }
    } else if (e.key === "Escape") {
      setIsOriginOpen(false);
    }
  };

  // Keyboard navigation for Destination
  const handleDestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = destQuery.trim() ? destResults : POPULAR_PUNE_HUBS;
    if (!isDestOpen || list.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setDestActiveIdx((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDestActiveIdx((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    } else if (e.key === "Enter") {
      if (destActiveIdx >= 0 && destActiveIdx < list.length) {
        e.preventDefault();
        handleSelectDestination(list[destActiveIdx]);
      }
    } else if (e.key === "Escape") {
      setIsDestOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    setIsSubmitting(true);

    if (onSearch) {
      onSearch(origin, destination, mode, departureTime);
      setIsSubmitting(false);
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
      time: departureTime === "Now" ? new Date().toISOString() : departureTime,
    });

    router.push(`/results?${params.toString()}`);
  };

  // Helper to render Uber/Rapido-style category badge & icon
  const renderPlaceVisual = (place: Place) => {
    const title = place.title || place.label || "";
    const lower = title.toLowerCase();

    if (place.placeType === "metro" || lower.includes("metro")) {
      return {
        icon: <Train className="h-4 w-4 text-sky-500" />,
        badge: "METRO",
        badgeClass: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
      };
    }
    if (place.placeType === "bus" || lower.includes("bus") || lower.includes("depot")) {
      return {
        icon: <Bus className="h-4 w-4 text-orange-500" />,
        badge: "PMPML",
        badgeClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
      };
    }
    if (lower.includes("airport") || lower.includes("pnq")) {
      return {
        icon: <Plane className="h-4 w-4 text-indigo-500" />,
        badge: "AIRPORT",
        badgeClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
      };
    }
    if (lower.includes("tech park") || lower.includes("eon") || lower.includes("cybercity") || lower.includes("park")) {
      return {
        icon: <Building2 className="h-4 w-4 text-purple-500" />,
        badge: "TECH PARK",
        badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
      };
    }
    if (lower.includes("mall") || lower.includes("marketcity") || lower.includes("seasons")) {
      return {
        icon: <ShoppingBag className="h-4 w-4 text-pink-500" />,
        badge: "MALL",
        badgeClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30",
      };
    }
    if (lower.includes("college") || lower.includes("university") || lower.includes("campus") || lower.includes("coep") || lower.includes("sppu")) {
      return {
        icon: <GraduationCap className="h-4 w-4 text-blue-500" />,
        badge: "CAMPUS",
        badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
      };
    }
    if (lower.includes("hospital") || lower.includes("clinic")) {
      return {
        icon: <Hospital className="h-4 w-4 text-rose-500" />,
        badge: "HOSPITAL",
        badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
      };
    }
    if (place.placeType === "auto") {
      return {
        icon: <Car className="h-4 w-4 text-emerald-500" />,
        badge: "AUTO",
        badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      };
    }
    return {
      icon: <MapPin className="h-4 w-4 text-[#C6A75E]" />,
      badge: "PLACE",
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    };
  };

  // Helper to highlight matching text in title
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const tokens = query.trim().split(/\s+/).filter(Boolean);
    const regex = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="font-extrabold text-[#C6A75E] underline decoration-[#C6A75E]/40">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <form className="search-card" onSubmit={handleSubmit} noValidate>
      <div className="search-card__top">
        <div>
          <span className="eyebrow">PLAN YOUR COMMUTE</span>
          <h2>Where are you headed?</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowMapPicker(!showMapPicker)}
          className="demo-pill hover:border-[#C6A75E] transition-colors"
          title="Pick points on map"
        >
          <MapIcon className="h-3 w-3 text-[#C6A75E]" />
          {showMapPicker ? "Close Map Picker" : "Map Pin Picker"}
        </button>
      </div>

      {/* Map Location Picker Collapsible */}
      {showMapPicker && (
        <div className="mb-4 rounded-xl border border-[rgba(198,167,94,0.2)] bg-[#E8DCC8] p-3 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F2A44]">
              Interactive Map Point Picker
            </span>
            <button
              type="button"
              onClick={() => setShowMapPicker(false)}
              className="text-[#1F2A44] hover:text-[#C6A75E]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <MapLocationPicker
            origin={origin}
            destination={destination}
            onPickOrigin={(p) => {
              setOrigin(p);
              setOriginQuery(p.title || p.label);
            }}
            onPickDestination={(p) => {
              setDestination(p);
              setDestQuery(p.title || p.label);
            }}
            onClose={() => setShowMapPicker(false)}
          />
        </div>
      )}

      {/* Origin & Destination Location Stack */}
      <div className="location-stack">
        {/* Origin Field */}
        <div ref={originContainerRef} className="relative z-30">
          <label className="field-row">
            <span className="field-icon field-icon--start">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="field-copy">
              <span className="field-label">From (Pickup / Starting point)</span>
              <input
                ref={originInputRef}
                required
                aria-label="Starting point"
                value={originQuery}
                placeholder="Search pickup (e.g. Ramwadi Metro, Airport, Kothrud)"
                autoComplete="off"
                onFocus={() => setIsOriginOpen(true)}
                onChange={(e) => {
                  setOriginQuery(e.target.value);
                  setIsOriginOpen(true);
                }}
                onKeyDown={handleOriginKeyDown}
              />
            </span>
            {originQuery && (
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors mr-1"
                onClick={() => {
                  setOriginQuery("");
                  originInputRef.current?.focus();
                  setIsOriginOpen(true);
                }}
                title="Clear starting point"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              className="swap-button"
              aria-label="Swap start and destination"
              onClick={handleSwap}
              title="Swap points"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h15l-3-3M20 16H5l3 3" />
              </svg>
            </button>
          </label>

          {/* Origin Autocomplete Dropdown */}
          {isOriginOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-[rgba(198,167,94,0.25)] bg-[#F3E9D9] dark:bg-[#231F1C] p-1.5 shadow-2xl z-50">
              {/* Uber-style "Use Current Location" Quick Action */}
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg p-2.5 text-left text-xs font-semibold text-sky-700 dark:text-sky-400 bg-sky-50/80 dark:bg-sky-950/40 hover:bg-sky-100/80 transition-colors border-b border-sky-200/50 dark:border-sky-800/50 mb-1"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                ) : (
                  <Navigation className="h-4 w-4 text-sky-600" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="block truncate">
                    {isLocating ? "Detecting current location..." : "Use my current location"}
                  </span>
                  <span className="block truncate text-[10px] text-sky-600/70 font-normal">
                    Auto-detect GPS coordinates
                  </span>
                </div>
              </button>

              {locationError && (
                <div className="p-2 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30 rounded-md mb-1">
                  {locationError}
                </div>
              )}

              {isOriginLoading && (
                <div className="flex items-center gap-2 p-3 text-xs text-[#1F2A44] dark:text-[#F9F6F0]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#C6A75E]" />
                  Searching Pune locations &amp; transit stops...
                </div>
              )}

              {!isOriginLoading && originResults.length === 0 && originQuery.trim() && (
                <div className="p-3 text-xs text-[#1F2A44]/70 dark:text-[#CFC5BC]/70">
                  No matching Pune locations found. Try another landmark or area name.
                </div>
              )}

              {/* Autocomplete Results */}
              {originResults.map((place, idx) => {
                const visual = renderPlaceVisual(place);
                const isFocused = idx === originActiveIdx;
                return (
                  <button
                    key={"orig-" + idx}
                    type="button"
                    className={`flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-xs text-[#1F2A44] dark:text-[#F9F6F0] transition-colors ${
                      isFocused ? "bg-[#E8DCC8] dark:bg-[#332D28] font-semibold" : "hover:bg-[#E8DCC8] dark:hover:bg-[#2C2622]"
                    }`}
                    onClick={() => handleSelectOrigin(place)}
                  >
                    <span className="shrink-0 p-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                      {visual.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="block truncate font-semibold">
                          {highlightMatch(place.title || place.label, originQuery)}
                        </strong>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${visual.badgeClass}`}>
                          {visual.badge}
                        </span>
                      </div>
                      {place.subtitle && (
                        <span className="block truncate text-[10px] text-[#1F2A44]/70 dark:text-[#CFC5BC]/70">
                          {place.subtitle}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Popular Hubs when empty */}
              {!originQuery.trim() && (
                <div>
                  <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#C6A75E]">
                    Popular Pune Hubs
                  </div>
                  {POPULAR_PUNE_HUBS.map((place, idx) => {
                    const visual = renderPlaceVisual(place);
                    const isFocused = idx === originActiveIdx;
                    return (
                      <button
                        key={"orig-pop-" + idx}
                        type="button"
                        className={`flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-xs text-[#1F2A44] dark:text-[#F9F6F0] transition-colors ${
                          isFocused ? "bg-[#E8DCC8] dark:bg-[#332D28]" : "hover:bg-[#E8DCC8] dark:hover:bg-[#2C2622]"
                        }`}
                        onClick={() => handleSelectOrigin(place)}
                      >
                        <span className="shrink-0 p-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                          {visual.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <strong className="block truncate font-semibold">
                              {place.title || place.label}
                            </strong>
                            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${visual.badgeClass}`}>
                              {visual.badge}
                            </span>
                          </div>
                          {place.subtitle && (
                            <span className="block truncate text-[10px] text-[#1F2A44]/70 dark:text-[#CFC5BC]/70">
                              {place.subtitle}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <span className="field-connector">
          <i />
        </span>

        {/* Destination Field */}
        <div ref={destContainerRef} className="relative z-20">
          <label className="field-row">
            <span className="field-icon field-icon--end">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="field-copy">
              <span className="field-label">To (Destination / Drop-off)</span>
              <input
                ref={destInputRef}
                required
                aria-label="Destination"
                value={destQuery}
                placeholder="Search drop-off (e.g. EON Kharadi, Hinjewadi, Swargate)"
                autoComplete="off"
                onFocus={() => setIsDestOpen(true)}
                onChange={(e) => {
                  setDestQuery(e.target.value);
                  setIsDestOpen(true);
                }}
                onKeyDown={handleDestKeyDown}
              />
            </span>
            {destQuery && (
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors mr-1"
                onClick={() => {
                  setDestQuery("");
                  destInputRef.current?.focus();
                  setIsDestOpen(true);
                }}
                title="Clear destination"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          {/* Destination Autocomplete Dropdown */}
          {isDestOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-[rgba(198,167,94,0.25)] bg-[#F3E9D9] dark:bg-[#231F1C] p-1.5 shadow-2xl z-50">
              {isDestLoading && (
                <div className="flex items-center gap-2 p-3 text-xs text-[#1F2A44] dark:text-[#F9F6F0]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#C6A75E]" />
                  Searching Pune locations &amp; transit stops...
                </div>
              )}

              {!isDestLoading && destResults.length === 0 && destQuery.trim() && (
                <div className="p-3 text-xs text-[#1F2A44]/70 dark:text-[#CFC5BC]/70">
                  No matching destinations found. Try another landmark or area name.
                </div>
              )}

              {/* Autocomplete Results */}
              {destResults.map((place, idx) => {
                const visual = renderPlaceVisual(place);
                const isFocused = idx === destActiveIdx;
                return (
                  <button
                    key={"dest-" + idx}
                    type="button"
                    className={`flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-xs text-[#1F2A44] dark:text-[#F9F6F0] transition-colors ${
                      isFocused ? "bg-[#E8DCC8] dark:bg-[#332D28] font-semibold" : "hover:bg-[#E8DCC8] dark:hover:bg-[#2C2622]"
                    }`}
                    onClick={() => handleSelectDestination(place)}
                  >
                    <span className="shrink-0 p-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                      {visual.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="block truncate font-semibold">
                          {highlightMatch(place.title || place.label, destQuery)}
                        </strong>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${visual.badgeClass}`}>
                          {visual.badge}
                        </span>
                      </div>
                      {place.subtitle && (
                        <span className="block truncate text-[10px] text-[#1F2A44]/70 dark:text-[#CFC5BC]/70">
                          {place.subtitle}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Popular Hubs when empty */}
              {!destQuery.trim() && (
                <div>
                  <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#C6A75E]">
                    Popular Destinations
                  </div>
                  {POPULAR_PUNE_HUBS.map((place, idx) => {
                    const visual = renderPlaceVisual(place);
                    const isFocused = idx === destActiveIdx;
                    return (
                      <button
                        key={"dest-pop-" + idx}
                        type="button"
                        className={`flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-xs text-[#1F2A44] dark:text-[#F9F6F0] transition-colors ${
                          isFocused ? "bg-[#E8DCC8] dark:bg-[#332D28]" : "hover:bg-[#E8DCC8] dark:hover:bg-[#2C2622]"
                        }`}
                        onClick={() => handleSelectDestination(place)}
                      >
                        <span className="shrink-0 p-1.5 rounded-lg bg-black/5 dark:bg-white/5">
                          {visual.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <strong className="block truncate font-semibold">
                              {place.title || place.label}
                            </strong>
                            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${visual.badgeClass}`}>
                              {visual.badge}
                            </span>
                          </div>
                          {place.subtitle && (
                            <span className="block truncate text-[10px] text-[#1F2A44]/70 dark:text-[#CFC5BC]/70">
                              {place.subtitle}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls: Departure & Travel Preferences */}
      <div className="search-controls">
        <div className="departure-control">
          <Clock className="h-4 w-4 text-[#C6A75E]" />
          <label className="departure-copy">
            <span className="field-label">Departure</span>
            <input
              type="time"
              aria-label="Departure time"
              value={departureTime === "Now" ? "" : departureTime}
              onChange={(e) => setDepartureTime(e.target.value || "Now")}
            />
          </label>
          <button
            type="button"
            className={"now-chip" + (departureTime === "Now" ? " is-active" : "")}
            onClick={() => setDepartureTime("Now")}
          >
            Now
          </button>
        </div>

        <div className="mode-picker">
          <span className="mode-picker__label">Preference</span>
          <button
            type="button"
            className={"mode-chip" + (mode === "balanced" ? " is-active" : "")}
            onClick={() => setMode("balanced")}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Balanced
          </button>
          <button
            type="button"
            className={"mode-chip" + (mode === "rain" ? " is-active" : "")}
            onClick={() => setMode("rain")}
          >
            <CloudRain className="h-3.5 w-3.5" />
            Rain Mode
          </button>
          <button
            type="button"
            className={"mode-chip" + (mode === "night" ? " is-active" : "")}
            onClick={() => setMode("night")}
          >
            <Moon className="h-3.5 w-3.5" />
            Night Mode
          </button>
          <button
            type="button"
            className={"mode-chip" + (mode === "safety" ? " is-active" : "")}
            onClick={() => setMode("safety")}
          >
            <Shield className="h-3.5 w-3.5" />
            Safety
          </button>
        </div>
      </div>

      {/* Submit Button with Specular Highlights */}
      <SpecularButton
        type="submit"
        size="lg"
        radius={18}
        tint="#C6A75E"
        tintOpacity={0.25}
        textColor="#1F2A44"
        lineColor="#C6A75E"
        baseColor="#C6A75E"
        intensity={0.85}
        idleIntensity={0.22}
        glow={0.8}
        followMouse
        disabled={isSubmitting}
        className="submit-button"
      >
        {isSubmitting ? "Comparing real-time routes..." : "Find my route"}
        <ArrowRight className="h-4 w-4 ml-1 inline" />
      </SpecularButton>

      <p className="form-footnote">
        <Sparkles className="h-3.5 w-3.5 text-[#C6A75E]" />
        Door-to-door transit intelligence &bull; Whole Pune &amp; PCMC &bull; Maharashtra RTO Auto Fare
      </p>
    </form>
  );
}
