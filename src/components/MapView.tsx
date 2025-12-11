import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";

mapboxgl.accessToken = "pk.eyJ1IjoidG91c2lmMjUiLCJhIjoiY21peDI1dGpxMDF2aTNkcXN1NzMyajhtOCJ9.GB70BEjjqbc8kXnGMA4uTQ";

export interface TrafficIncident {
  id: string;
  lat: number;
  lng: number;
  type: string;
  severity: "minor" | "moderate" | "severe";
  description: string;
  delay: number;
  from?: string;
  to?: string;
}

interface MapViewProps {
  origin?: { lat: number; lng: number; label?: string };
  destination?: { lat: number; lng: number; label?: string };
  currentLocation?: { lat: number; lng: number };
  incidents?: TrafficIncident[];
  showRoute?: boolean;
  showAlternativeRoute?: boolean;
  alternativeRouteReason?: string;
  interactive?: boolean;
  className?: string;
  onMapLoad?: () => void;
}

const MapView: React.FC<MapViewProps> = ({
  origin,
  destination,
  currentLocation,
  incidents = [],
  showRoute = false,
  showAlternativeRoute = false,
  alternativeRouteReason = "Road Closure Ahead",
  interactive = true,
  className = "",
  onMapLoad,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const incidentMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const alternativeRouteMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  }, []);

  const clearIncidentMarkers = useCallback(() => {
    incidentMarkersRef.current.forEach((marker) => marker.remove());
    incidentMarkersRef.current = [];
  }, []);

  const createMarkerElement = (type: "origin" | "destination" | "current") => {
    const el = document.createElement("div");
    el.className = "flex items-center justify-center";

    if (type === "origin") {
      el.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 bg-success rounded-full flex items-center justify-center shadow-lg">
            <div class="w-2 h-2 bg-foreground rounded-full"></div>
          </div>
          <div class="absolute -inset-2 bg-success/30 rounded-full animate-ping"></div>
        </div>
      `;
    } else if (type === "destination") {
      el.innerHTML = `
        <div class="relative">
          <div class="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/50" style="animation: destination-pulse 2s ease-in-out infinite;">
            <svg class="w-3.5 h-3.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="absolute inset-0 -m-1 rounded-full border-2 border-primary/60" style="animation: destination-ring 2s ease-in-out infinite;"></div>
          <div class="absolute inset-0 -m-2 rounded-full border border-primary/40" style="animation: destination-ring 2s ease-in-out infinite 0.3s;"></div>
          <div class="absolute inset-0 -m-3 rounded-full border border-primary/20" style="animation: destination-ring 2s ease-in-out infinite 0.6s;"></div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="marker-pulse"></div>
      `;
    }

    return el;
  };

  const createIncidentMarkerElement = (incident: TrafficIncident) => {
    const el = document.createElement("div");
    el.className = "flex items-center justify-center cursor-pointer";

    const colorMap = {
      minor: { bg: "#EAB308", border: "#CA8A04", shadow: "rgba(234,179,8,0.4)" },
      moderate: { bg: "#F97316", border: "#EA580C", shadow: "rgba(249,115,22,0.4)" },
      severe: { bg: "#EF4444", border: "#DC2626", shadow: "rgba(239,68,68,0.5)" },
    };

    const colors = colorMap[incident.severity];

    const iconMap: Record<string, string> = {
      accident: "🚗",
      construction: "🚧",
      road_closure: "⛔",
      road_works: "🔨",
      congestion: "🚦",
      hazard: "⚠️",
      flooding: "🌊",
      fog: "🌫️",
      wind: "💨",
      broken_down_vehicle: "🚙",
      lane_closure: "🚧",
      detour: "↪️",
      incident: "⚠️",
    };

    const icon = iconMap[incident.type] || "⚠️";

    el.innerHTML = `
      <div class="relative group">
        <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110" 
             style="background: ${colors.bg}; border: 2px solid ${colors.border}; box-shadow: 0 0 12px ${colors.shadow};">
          <span class="text-xs">${icon}</span>
        </div>
        ${
          incident.severity === "severe"
            ? `
          <div class="absolute -inset-1 rounded-full animate-ping opacity-40" 
               style="background: ${colors.bg};"></div>
        `
            : ""
        }
      </div>
    `;

    return el;
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-98.5795, 39.8283], // Center of US
      zoom: 3.5,
      pitch: 0,
      interactive,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), "top-right");

    map.current.on("load", () => {
      setIsLoaded(true);
      onMapLoad?.();
    });

    return () => {
      clearMarkers();
      clearIncidentMarkers();
      map.current?.remove();
      map.current = null;
    };
  }, [interactive, onMapLoad, clearMarkers, clearIncidentMarkers]);

  useEffect(() => {
    if (!map.current || !isLoaded) return;

    clearMarkers();

    // Add origin marker
    if (origin) {
      const marker = new mapboxgl.Marker({ element: createMarkerElement("origin") })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map.current);

      if (origin.label) {
        marker.setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
            `<div class="font-semibold text-sm">${origin.label}</div>`,
          ),
        );
      }

      markersRef.current.push(marker);
    }

    // Add destination marker
    if (destination) {
      const marker = new mapboxgl.Marker({ element: createMarkerElement("destination") })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map.current);

      if (destination.label) {
        marker.setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
            `<div class="font-semibold text-sm">${destination.label}</div>`,
          ),
        );
      }

      markersRef.current.push(marker);
    }

    // Add current location marker (for tracking)
    if (currentLocation) {
      const marker = new mapboxgl.Marker({ element: createMarkerElement("current") })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .addTo(map.current);
      markersRef.current.push(marker);
    }

    // Fly to origin only
    if (origin && !destination) {
      map.current.flyTo({
        center: [origin.lng, origin.lat],
        zoom: 10,
        duration: 1000,
      });
    }

    // Fly to destination only
    if (destination && !origin) {
      map.current.flyTo({
        center: [destination.lng, destination.lat],
        zoom: 10,
        duration: 1000,
      });
    }

    // Fit bounds to show all markers when both are set
    if (origin && destination) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([origin.lng, origin.lat]);
      bounds.extend([destination.lng, destination.lat]);
      if (currentLocation) {
        bounds.extend([currentLocation.lng, currentLocation.lat]);
      }

      map.current.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        duration: 1000,
      });
    }
  }, [origin, destination, currentLocation, isLoaded, clearMarkers]);

  // Add incident markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    clearIncidentMarkers();

    incidents.forEach((incident) => {
      if (!incident.lat || !incident.lng) return;

      const el = createIncidentMarkerElement(incident);
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([incident.lng, incident.lat]).addTo(map.current!);

      // Add popup with incident details
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "incident-popup",
      }).setHTML(`
        <div class="p-2 max-w-[200px]">
          <div class="font-bold text-sm mb-1 capitalize">${incident.type.replace("_", " ")}</div>
          <div class="text-xs text-gray-300 mb-1">${incident.description}</div>
          ${incident.delay > 0 ? `<div class="text-xs text-amber-400">Delay: ~${Math.round(incident.delay / 60)} min</div>` : ""}
          ${incident.from ? `<div class="text-[10px] text-gray-400 mt-1">${incident.from}${incident.to ? ` → ${incident.to}` : ""}</div>` : ""}
        </div>
      `);

      marker.setPopup(popup);

      // Show popup on hover
      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());

      incidentMarkersRef.current.push(marker);
    });
  }, [incidents, isLoaded, clearIncidentMarkers]);

  // Helper to create alternative route marker element
  const createAlternativeRouteMarker = (reason: string) => {
    const el = document.createElement("div");
    el.className = "flex items-center justify-center";
    el.innerHTML = `
      <div class="relative">
        <div class="bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-red-400/50 transform -translate-y-2">
          <div class="flex items-center gap-2">
            <span class="text-white text-xs">⛔</span>
            <span class="text-white text-xs font-semibold whitespace-nowrap">${reason}</span>
          </div>
        </div>
        <div class="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-red-500/90"></div>
      </div>
    `;
    return el;
  };

  // Draw route
  useEffect(() => {
    if (!map.current || !isLoaded || !showRoute || !origin || !destination) return;

    const sourceId = "route";
    const layerId = "route-line";
    const glowLayerId = "route-glow";
    const altSourceId = "alternative-route";
    const altLayerId = "alternative-route-line";

    // Remove existing route layers
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getLayer(glowLayerId)) {
      map.current.removeLayer(glowLayerId);
    }
    if (map.current.getLayer(altLayerId)) {
      map.current.removeLayer(altLayerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }
    if (map.current.getSource(altSourceId)) {
      map.current.removeSource(altSourceId);
    }

    // Remove alternative route marker
    if (alternativeRouteMarkerRef.current) {
      alternativeRouteMarkerRef.current.remove();
      alternativeRouteMarkerRef.current = null;
    }

    // Fetch route from Mapbox Directions API
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&alternatives=true&access_token=${mapboxgl.accessToken}`,
        );
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const optimalRoute = data.routes[0].geometry;

          // Add alternative route first (so it renders below optimal route)
          if (showAlternativeRoute && data.routes.length > 1) {
            const alternativeRoute = data.routes[1].geometry;

            map.current!.addSource(altSourceId, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: alternativeRoute,
              },
            });

            // Alternative route - dashed, gray, faded
            map.current!.addLayer({
              id: altLayerId,
              type: "line",
              source: altSourceId,
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#9A3412",
                "line-width": 3,
                "line-opacity": 0.4,
                "line-dasharray": [2, 2],
              },
            });

            // Add marker at midpoint of alternative route
            const coords = alternativeRoute.coordinates;
            const midIndex = Math.floor(coords.length / 2);
            const midpoint = coords[midIndex];

            if (midpoint) {
              const markerEl = createAlternativeRouteMarker(alternativeRouteReason);
              alternativeRouteMarkerRef.current = new mapboxgl.Marker({ element: markerEl })
                .setLngLat([midpoint[0], midpoint[1]])
                .addTo(map.current!);
            }
          }

          // Add optimal route source
          map.current!.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: optimalRoute,
            },
          });

          // Glow effect layer for optimal route
          map.current!.addLayer({
            id: glowLayerId,
            type: "line",
            source: sourceId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#FFC72C",
              "line-width": 12,
              "line-opacity": 0.3,
              "line-blur": 8,
            },
          });

          // Main optimal route line
          map.current!.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#FFC72C",
              "line-width": 4,
              "line-opacity": 1,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();
  }, [origin, destination, showRoute, showAlternativeRoute, alternativeRouteReason, isLoaded]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`map-container relative w-full h-full min-h-[300px] ${className}`}
    >
      <div ref={mapContainer} className="absolute inset-0 rounded-xl" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-card rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading map...</span>
          </div>
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-border/50" />
    </motion.div>
  );
};

export default MapView;
