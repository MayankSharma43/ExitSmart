"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { Option, Place, StopCandidate } from "@/lib/types";
import { getTileLayerConfig, PUNE_CENTER, ROUTE_COLORS } from "@/lib/providers/map-config";
import stationsData from "@/data/stations.json";
import stopsData from "@/data/stops.json";

interface MapViewProps {
  origin: Place;
  destination: Place;
  selectedOption?: Option;
  onOverrideStop?: (stopId: string, type: "entry" | "exit") => void;
  onUpdateEndpoints?: (newOrigin?: Place, newDest?: Place) => void;
  className?: string;
}

export default function MapView({
  origin,
  destination,
  selectedOption,
  onOverrideStop,
  onUpdateEndpoints,
  className = "h-[350px] sm:h-[450px]",
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const stopsLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: origin && origin.lat ? [origin.lat, origin.lng] : PUNE_CENTER,
      zoom: 13,
      zoomControl: true,
    });

    const tileConfig = getTileLayerConfig();
    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
    }).addTo(map);

    const stopsLayer = L.layerGroup().addTo(map);
    const layerGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    stopsLayerRef.current = stopsLayer;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render clickable candidate stops (Metro stations, Bus stops, Auto stands)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const stopsLayer = stopsLayerRef.current;
    if (!map || !stopsLayer) return;

    stopsLayer.clearLayers();

    // 1. Metro stations
    stationsData.forEach((st) => {
      const isAqua = st.line === "Aqua";
      const metroIcon = L.divIcon({
        className: "custom-metro-node",
        html: `<div style="background-color: ${isAqua ? "#0284c7" : "#7e22ce"}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3); cursor: pointer;" title="${st.name} Metro"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([st.lat, st.lng], { icon: metroIcon }).addTo(stopsLayer);

      const popupContent = document.createElement("div");
      popupContent.style.minWidth = "180px";
      popupContent.innerHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">
          ${st.name} Metro
        </div>
        <div style="font-size: 10px; color: ${isAqua ? "#0284c7" : "#7e22ce"}; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
          ${st.line} Line ${st.isInterchange ? "• Interchange" : ""}
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <button id="entry-${st.id}" style="background-color: #0284c7; color: white; border: none; border-radius: 6px; padding: 6px 10px; font-weight: 700; font-size: 11px; cursor: pointer;">
            🔵 Set as Entry Stop
          </button>
          <button id="exit-${st.id}" style="background-color: #9333ea; color: white; border: none; border-radius: 6px; padding: 6px 10px; font-weight: 700; font-size: 11px; cursor: pointer;">
            🟣 Set as Exit Stop
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("popupopen", () => {
        const btnEntry = document.getElementById(`entry-${st.id}`);
        const btnExit = document.getElementById(`exit-${st.id}`);

        if (btnEntry && onOverrideStop) {
          btnEntry.onclick = () => {
            onOverrideStop(st.id, "entry");
            marker.closePopup();
          };
        }
        if (btnExit && onOverrideStop) {
          btnExit.onclick = () => {
            onOverrideStop(st.id, "exit");
            marker.closePopup();
          };
        }
      });
    });

    // 2. Bus stops & Auto stands
    stopsData.forEach((stop) => {
      const isBus = stop.type === "bus_stop";
      const color = isBus ? "#ea580c" : "#16a34a";
      const stopIcon = L.divIcon({
        className: "custom-stop-node",
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 3px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); cursor: pointer;" title="${stop.name}"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(stopsLayer);

      const popupContent = document.createElement("div");
      popupContent.style.minWidth = "180px";
      popupContent.innerHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">
          ${stop.name}
        </div>
        <div style="font-size: 10px; color: ${color}; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
          ${isBus ? "PMPML Bus Stop" : "Auto Rickshaw Stand"}
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <button id="entry-${stop.id}" style="background-color: #0284c7; color: white; border: none; border-radius: 6px; padding: 6px 10px; font-weight: 700; font-size: 11px; cursor: pointer;">
            🔵 Set as Entry Stop
          </button>
          <button id="exit-${stop.id}" style="background-color: #9333ea; color: white; border: none; border-radius: 6px; padding: 6px 10px; font-weight: 700; font-size: 11px; cursor: pointer;">
            🟣 Set as Exit Stop
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("popupopen", () => {
        const btnEntry = document.getElementById(`entry-${stop.id}`);
        const btnExit = document.getElementById(`exit-${stop.id}`);

        if (btnEntry && onOverrideStop) {
          btnEntry.onclick = () => {
            onOverrideStop(stop.id, "entry");
            marker.closePopup();
          };
        }
        if (btnExit && onOverrideStop) {
          btnExit.onclick = () => {
            onOverrideStop(stop.id, "exit");
            marker.closePopup();
          };
        }
      });
    });
  }, [onOverrideStop]);

  // Update Markers & Polylines whenever selectedOption or origin/destination change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Origin Marker (Green - Draggable)
    const originIcon = L.divIcon({
      className: "custom-pin",
      html: `<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; cursor: grab;">A</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const originMarker = L.marker([origin.lat, origin.lng], {
      icon: originIcon,
      draggable: true,
    })
      .bindPopup(`<strong>Origin:</strong> ${origin.label}<br/><span style="font-size:11px; color:#64748b;">Drag pin to change start</span>`)
      .addTo(layerGroup);
    bounds.extend([origin.lat, origin.lng]);

    originMarker.on("dragend", async () => {
      const pos = originMarker.getLatLng();
      if (onUpdateEndpoints) {
        onUpdateEndpoints({ lat: pos.lat, lng: pos.lng, label: `Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})` }, undefined);
      }
    });

    // 2. Destination Marker (Red - Draggable)
    const destIcon = L.divIcon({
      className: "custom-pin",
      html: `<div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; cursor: grab;">B</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const destMarker = L.marker([destination.lat, destination.lng], {
      icon: destIcon,
      draggable: true,
    })
      .bindPopup(`<strong>Destination:</strong> ${destination.label}<br/><span style="font-size:11px; color:#64748b;">Drag pin to change destination</span>`)
      .addTo(layerGroup);
    bounds.extend([destination.lat, destination.lng]);

    destMarker.on("dragend", async () => {
      const pos = destMarker.getLatLng();
      if (onUpdateEndpoints) {
        onUpdateEndpoints(undefined, { lat: pos.lat, lng: pos.lng, label: `Location (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})` });
      }
    });

    // 3. Render Segments & Stops of Selected Option
    if (selectedOption && selectedOption.segments.length > 0) {
      selectedOption.segments.forEach((seg, idx) => {
        // Draw polyline
        const coords = seg.polyline || [
          [seg.fromCoords.lat, seg.fromCoords.lng],
          [seg.toCoords.lat, seg.toCoords.lng],
        ];

        let strokeColor = ROUTE_COLORS.walk;
        let dashArray = undefined;
        let weight = 5;

        if (seg.type === "metro") {
          strokeColor = ROUTE_COLORS.metro_aqua;
          weight = 6;
        } else if (seg.type === "bus") {
          strokeColor = ROUTE_COLORS.bus;
          weight = 5;
        } else if (seg.type === "auto") {
          strokeColor = ROUTE_COLORS.auto;
        } else if (seg.type === "shared_auto") {
          strokeColor = ROUTE_COLORS.shared_auto;
        } else if (seg.type === "cab") {
          strokeColor = ROUTE_COLORS.cab;
        } else if (seg.type === "walk") {
          strokeColor = ROUTE_COLORS.walk;
          dashArray = "6, 8";
          weight = 4;
        }

        L.polyline(coords as L.LatLngExpression[], {
          color: strokeColor,
          weight,
          dashArray,
          opacity: 0.85,
        }).addTo(layerGroup);

        coords.forEach((c) => bounds.extend(c as [number, number]));

        // Add Active Entry Stop Highlight Marker
        if (idx === 0 && selectedOption.entryStopId !== "door_origin") {
          const entryIcon = L.divIcon({
            className: "custom-entry-pin",
            html: `<div style="background-color: #0284c7; width: 28px; height: 28px; border-radius: 8px; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">IN</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          L.marker([seg.toCoords.lat, seg.toCoords.lng], { icon: entryIcon })
            .bindPopup(`
              <div style="font-size: 12px;">
                <div style="font-weight: bold; color: #0284c7;">CURRENT ENTRY STOP</div>
                <div>${selectedOption.entryStopName}</div>
                <div style="margin-top: 4px; font-size: 11px; color: #64748b;">Recommended entry for this route</div>
              </div>
            `)
            .addTo(layerGroup);
          bounds.extend([seg.toCoords.lat, seg.toCoords.lng]);
        }

        // Add Active Exit Stop Highlight Marker
        if (
          idx === selectedOption.segments.length - 1 &&
          selectedOption.exitStopId !== "door_dest"
        ) {
          const exitIcon = L.divIcon({
            className: "custom-exit-pin",
            html: `<div style="background-color: #9333ea; width: 28px; height: 28px; border-radius: 8px; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">OUT</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          L.marker([seg.fromCoords.lat, seg.fromCoords.lng], { icon: exitIcon })
            .bindPopup(`
              <div style="font-size: 12px;">
                <div style="font-weight: bold; color: #9333ea;">CURRENT EXIT STOP</div>
                <div>${selectedOption.exitStopName}</div>
                <div style="margin-top: 4px; font-size: 11px; color: #64748b;">Recommended exit for this route</div>
              </div>
            `)
            .addTo(layerGroup);
          bounds.extend([seg.fromCoords.lat, seg.fromCoords.lng]);
        }
      });
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [selectedOption, origin, destination, onUpdateEndpoints]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Top Banner: Map Tip */}
      <div className="absolute top-2 left-2 right-2 z-20 pointer-events-none">
        <div className="mx-auto max-w-sm rounded-lg bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 text-center text-[11px] text-white shadow pointer-events-auto">
          Tip: Tap any transit stop on map to set as <strong>Entry</strong> or <strong>Exit</strong>
        </div>
      </div>

      {/* Map Legend Floating Pill */}
      <div className="absolute bottom-2 left-2 z-20 flex flex-wrap items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow-md border border-slate-200">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Start
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-sky-600"></span> Entry
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded bg-purple-600"></span> Exit
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span> Dest
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500"></span> Metro
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded bg-orange-500"></span> Bus
        </span>
      </div>
    </div>
  );
}
