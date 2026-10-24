"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Place } from "@/lib/types";
import { getTileLayerConfig, PUNE_CENTER } from "@/lib/providers/map-config";
import landmarksData from "@/data/landmarks.json";
import { Navigation, MapPin, Check, Crosshair } from "lucide-react";

interface MapLocationPickerProps {
  origin: Place;
  destination: Place;
  onPickOrigin: (place: Place) => void;
  onPickDestination: (place: Place) => void;
  onClose?: () => void;
}

export default function MapLocationPicker({
  origin,
  destination,
  onPickOrigin,
  onPickDestination,
  onClose,
}: MapLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);

  const [activeTarget, setActiveTarget] = useState<"origin" | "destination">("origin");
  const [isResolving, setIsResolving] = useState(false);
  const activeTargetRef = useRef<"origin" | "destination">("origin");

  useEffect(() => {
    activeTargetRef.current = activeTarget;
  }, [activeTarget]);

  const resolveLocationName = async (lat: number, lng: number): Promise<string> => {
    setIsResolving(true);
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        return data.label || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }
    } catch {
      // Fallback
    } finally {
      setIsResolving(false);
    }
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: origin?.lat ? [origin.lat, origin.lng] : PUNE_CENTER,
      zoom: 13,
      zoomControl: true,
    });

    const tileConfig = getTileLayerConfig();
    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
    }).addTo(map);

    // Custom Icons
    const originIcon = L.divIcon({
      className: "custom-picker-origin",
      html: `<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; cursor: grab;">A</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const destIcon = L.divIcon({
      className: "custom-picker-dest",
      html: `<div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; cursor: grab;">B</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    // Add Origin Marker (Draggable)
    const originMarker = L.marker([origin.lat, origin.lng], {
      icon: originIcon,
      draggable: true,
    }).addTo(map);
    originMarkerRef.current = originMarker;

    originMarker.on("dragend", async () => {
      const pos = originMarker.getLatLng();
      const label = await resolveLocationName(pos.lat, pos.lng);
      onPickOrigin({ lat: pos.lat, lng: pos.lng, label });
    });

    // Add Destination Marker (Draggable)
    const destMarker = L.marker([destination.lat, destination.lng], {
      icon: destIcon,
      draggable: true,
    }).addTo(map);
    destMarkerRef.current = destMarker;

    destMarker.on("dragend", async () => {
      const pos = destMarker.getLatLng();
      const label = await resolveLocationName(pos.lat, pos.lng);
      onPickDestination({ lat: pos.lat, lng: pos.lng, label });
    });

    // Render Curated Landmark Icons for fast 1-tap picking
    landmarksData.slice(0, 10).forEach((lm) => {
      const lmIcon = L.divIcon({
        className: "custom-picker-lm",
        html: `<div style="background-color: #3b82f6; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.25);"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      L.marker([lm.lat, lm.lng], { icon: lmIcon })
        .bindTooltip(lm.name, { permanent: false, direction: "top", offset: [0, -6] })
        .on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          const current = activeTargetRef.current;
          if (current === "origin") {
            originMarker.setLatLng([lm.lat, lm.lng]);
            onPickOrigin({ lat: lm.lat, lng: lm.lng, label: `${lm.name} (${lm.area})` });
          } else {
            destMarker.setLatLng([lm.lat, lm.lng]);
            onPickDestination({ lat: lm.lat, lng: lm.lng, label: `${lm.name} (${lm.area})` });
          }
        })
        .addTo(map);
    });

    // Click anywhere on map to drop / move currently selected target pin
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const current = activeTargetRef.current;

      if (current === "origin") {
        originMarker.setLatLng([lat, lng]);
        const label = await resolveLocationName(lat, lng);
        onPickOrigin({ lat, lng, label });
      } else {
        destMarker.setLatLng([lat, lng]);
        const label = await resolveLocationName(lat, lng);
        onPickDestination({ lat, lng, label });
      }
    });

    // Initial bounds
    const bounds = L.latLngBounds([
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md">
      {/* Top Controls: Switch whether clicking sets Start or Destination */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-md p-1 shadow-md border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTarget("origin")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all ${
              activeTarget === "origin"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
            <Navigation className="h-3.5 w-3.5" />
            Set Start (A)
          </button>

          <button
            type="button"
            onClick={() => setActiveTarget("destination")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all ${
              activeTarget === "destination"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
            <MapPin className="h-3.5 w-3.5" />
            Set Destination (B)
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white px-3 py-1.5 text-xs font-bold shadow-md transition-all"
          >
            <Check className="h-3.5 w-3.5" />
            Done
          </button>
        )}
      </div>

      {/* Map Element */}
      <div ref={mapContainerRef} className="h-[320px] sm:h-[400px] w-full" />

      {/* Floating Bottom Instruction Banner */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
        <div className="mx-auto max-w-sm rounded-xl bg-slate-900/80 backdrop-blur-md px-3 py-2 text-center text-xs text-white shadow-lg pointer-events-auto">
          {isResolving ? (
            <span className="animate-pulse">Resolving location name...</span>
          ) : (
            <span>
              Tap anywhere on the map to set{" "}
              <strong className={activeTarget === "origin" ? "text-emerald-400" : "text-rose-400"}>
                {activeTarget === "origin" ? "Start Point (A)" : "Destination (B)"}
              </strong>
              , or drag the pins.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
