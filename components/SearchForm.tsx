"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { Place, TravelMode } from "@/lib/types";
import SpecularButton from "./react-bits/SpecularButton.jsx";

// Dynamic import for Leaflet map picker
const MapLocationPicker = dynamic(() => import("./MapLocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full rounded-2xl bg-amber-50/50 flex items-center justify-center text-xs text-amber-900/60 animate-pulse">
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
    id: "rec_viman",
    title: "Viman Nagar (Datta Mandir)",
    subtitle: "Viman Nagar, Pune",
    label: "Viman Nagar, Pune",
    lat: 18.5645,
    lng: 73.9145,
    placeType: "area",
  },
  {
    id: "rec_baner",
    title: "Baner (Balewadi Phata)",
    subtitle: "Baner, Pune",
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
  const [departureTime, setDepartureTime] = useState("Now");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const originContainerRef = useRef<HTMLDivElement>(null);
  const destContainerRef = useRef<HTMLDivElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on click outside
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

  // Fetch Origin Autocomplete
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

  // Fetch Destination Autocomplete
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

  const renderPlaceIcon = (place: Place) => {
    switch (place.placeType) {
      case "metro":
        return <Train className="h-4 w-4 text-sky-600" />;
      case "bus":
        return <Bus className="h-4 w-4 text-orange-600" />;
      case "auto":
        return <Car className="h-4 w-4 text-emerald-600" />;
      default:
        return <MapPin className="h-4 w-4 text-[#C6A75E]" />;
    }
  };

  return (
    <form className="search-card" onSubmit={handleSubmit} noValidate>
      <div className="search-card__top">
        <div>
          <span className="eyebrow">PLAN YOUR JOURNEY</span>
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
              Interactive Point Picker
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
        <div ref={originContainerRef} className="relative z-20">
          <label className="field-row">
            <span className="field-icon field-icon--start">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="field-copy">
              <span className="field-label">From (Origin)</span>
              <input
                required
                aria-label="Starting point"
                value={originQuery}
                placeholder="Add a starting point"
                autoComplete="off"
                onFocus={() => setIsOriginOpen(true)}
                onChange={(e) => {
                  setOriginQuery(e.target.value);
                  setIsOriginOpen(true);
                }}
              />
            </span>
            <button
              type="button"
              className="swap-button"
              aria-label="Swap start and destination"
              onClick={handleSwap}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h15l-3-3M20 16H5l3 3" />
              </svg>
            </button>
          </label>

          {/* Origin Autocomplete Dropdown */}
          {isOriginOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-[rgba(198,167,94,0.25)] bg-[#F3E9D9] p-1.5 shadow-xl z-50">
              {isOriginLoading && (
                <div className="flex items-center gap-2 p-2.5 text-xs text-[#1F2A44]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C6A75E]" />
                  Searching Pune locations...
                </div>
              )}
              {!isOriginLoading && originResults.length === 0 && originQuery.trim() && (
                <div className="p-2.5 text-xs text-[#1F2A44]/70">No matching places found.</div>
              )}
              {originResults.map((place, idx) => (
                <button
                  key={"orig-" + idx}
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-xs text-[#1F2A44] hover:bg-[#E8DCC8] transition-colors"
                  onClick={() => handleSelectOrigin(place)}
                >
                  <span className="shrink-0">{renderPlaceIcon(place)}</span>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate font-semibold">{place.title || place.label}</strong>
                    {place.subtitle && <span className="block truncate text-[10px] text-[#1F2A44]/70">{place.subtitle}</span>}
                  </div>
                </button>
              ))}
              {!originQuery.trim() && (
                <div>
                  <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#C6A75E]">
                    Recent Pune Hubs
                  </div>
                  {recents.map((place, idx) => (
                    <button
                      key={"orig-rec-" + idx}
                      type="button"
                      className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-xs text-[#1F2A44] hover:bg-[#E8DCC8] transition-colors"
                      onClick={() => handleSelectOrigin(place)}
                    >
                      <Clock className="h-3.5 w-3.5 text-[#C6A75E] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate font-semibold">{place.title || place.label}</strong>
                        {place.subtitle && <span className="block truncate text-[10px] text-[#1F2A44]/70">{place.subtitle}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <span className="field-connector">
          <i />
        </span>

        {/* Destination Field */}
        <div ref={destContainerRef} className="relative z-10">
          <label className="field-row">
            <span className="field-icon field-icon--end">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="field-copy">
              <span className="field-label">To (Destination)</span>
              <input
                ref={destInputRef}
                required
                aria-label="Destination"
                value={destQuery}
                placeholder="Search a destination"
                autoComplete="off"
                onFocus={() => setIsDestOpen(true)}
                onChange={(e) => {
                  setDestQuery(e.target.value);
                  setIsDestOpen(true);
                }}
              />
            </span>
          </label>

          {/* Destination Autocomplete Dropdown */}
          {isDestOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-[rgba(198,167,94,0.25)] bg-[#F3E9D9] p-1.5 shadow-xl z-50">
              {isDestLoading && (
                <div className="flex items-center gap-2 p-2.5 text-xs text-[#1F2A44]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C6A75E]" />
                  Searching Pune locations...
                </div>
              )}
              {!isDestLoading && destResults.length === 0 && destQuery.trim() && (
                <div className="p-2.5 text-xs text-[#1F2A44]/70">No matching places found.</div>
              )}
              {destResults.map((place, idx) => (
                <button
                  key={"dest-" + idx}
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-xs text-[#1F2A44] hover:bg-[#E8DCC8] transition-colors"
                  onClick={() => handleSelectDestination(place)}
                >
                  <span className="shrink-0">{renderPlaceIcon(place)}</span>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate font-semibold">{place.title || place.label}</strong>
                    {place.subtitle && <span className="block truncate text-[10px] text-[#1F2A44]/70">{place.subtitle}</span>}
                  </div>
                </button>
              ))}
              {!destQuery.trim() && (
                <div>
                  <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#C6A75E]">
                    Popular Destinations
                  </div>
                  {recents.map((place, idx) => (
                    <button
                      key={"dest-rec-" + idx}
                      type="button"
                      className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-xs text-[#1F2A44] hover:bg-[#E8DCC8] transition-colors"
                      onClick={() => handleSelectDestination(place)}
                    >
                      <Clock className="h-3.5 w-3.5 text-[#C6A75E] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate font-semibold">{place.title || place.label}</strong>
                        {place.subtitle && <span className="block truncate text-[10px] text-[#1F2A44]/70">{place.subtitle}</span>}
                      </div>
                    </button>
                  ))}
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
        {isSubmitting ? "Comparing routes..." : "Find my route"}
        <ArrowRight className="h-4 w-4 ml-1 inline" />
      </SpecularButton>

      <p className="form-footnote">
        <Sparkles className="h-3.5 w-3.5 text-[#C6A75E]" />
        Door-to-door transit intelligence &bull; Whole Pune coverage &bull; Maharashtra RTO Auto Fare
      </p>
    </form>
  );
}
