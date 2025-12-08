import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';

mapboxgl.accessToken = 'pk.eyJ1IjoidG91c2lmMjUiLCJhIjoiY21peDI1dGpxMDF2aTNkcXN1NzMyajhtOCJ9.GB70BEjjqbc8kXnGMA4uTQ';

interface MapViewProps {
  origin?: { lat: number; lng: number; label?: string };
  destination?: { lat: number; lng: number; label?: string };
  currentLocation?: { lat: number; lng: number };
  showRoute?: boolean;
  interactive?: boolean;
  className?: string;
  onMapLoad?: () => void;
}

const MapView: React.FC<MapViewProps> = ({
  origin,
  destination,
  currentLocation,
  showRoute = false,
  interactive = true,
  className = '',
  onMapLoad,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }, []);

  const createMarkerElement = (type: 'origin' | 'destination' | 'current') => {
    const el = document.createElement('div');
    el.className = 'flex items-center justify-center';
    
    if (type === 'origin') {
      el.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 bg-success rounded-full flex items-center justify-center shadow-lg">
            <div class="w-2 h-2 bg-foreground rounded-full"></div>
          </div>
          <div class="absolute -inset-2 bg-success/30 rounded-full animate-ping"></div>
        </div>
      `;
    } else if (type === 'destination') {
      el.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <svg class="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="marker-pulse"></div>
      `;
    }
    
    return el;
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 3.5,
      pitch: 0,
      interactive,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: false }),
      'top-right'
    );

    map.current.on('load', () => {
      setIsLoaded(true);
      onMapLoad?.();
    });

    return () => {
      clearMarkers();
      map.current?.remove();
      map.current = null;
    };
  }, [interactive, onMapLoad, clearMarkers]);

  useEffect(() => {
    if (!map.current || !isLoaded) return;

    clearMarkers();

    // Add origin marker
    if (origin) {
      const marker = new mapboxgl.Marker({ element: createMarkerElement('origin') })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map.current);
      
      if (origin.label) {
        marker.setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(`<div class="font-semibold text-sm">${origin.label}</div>`)
        );
      }
      
      markersRef.current.push(marker);
    }

    // Add destination marker
    if (destination) {
      const marker = new mapboxgl.Marker({ element: createMarkerElement('destination') })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map.current);
      
      if (destination.label) {
        marker.setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(`<div class="font-semibold text-sm">${destination.label}</div>`)
        );
      }
      
      markersRef.current.push(marker);
    }

    // Add current location marker (for tracking)
    if (currentLocation) {
      const marker = new mapboxgl.Marker({ element: createMarkerElement('current') })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .addTo(map.current);
      markersRef.current.push(marker);
    }

    // Fit bounds to show all markers
    if (origin && destination) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([origin.lng, origin.lat]);
      bounds.extend([destination.lng, destination.lat]);
      if (currentLocation) {
        bounds.extend([currentLocation.lng, currentLocation.lat]);
      }
      
      map.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 80, right: 80 },
        duration: 1000,
      });
    }
  }, [origin, destination, currentLocation, isLoaded, clearMarkers]);

  // Draw route
  useEffect(() => {
    if (!map.current || !isLoaded || !showRoute || !origin || !destination) return;

    const sourceId = 'route';
    const layerId = 'route-line';
    const glowLayerId = 'route-glow';

    // Remove existing route layers
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getLayer(glowLayerId)) {
      map.current.removeLayer(glowLayerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Fetch route from Mapbox Directions API
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        
        if (data.routes && data.routes[0]) {
          const route = data.routes[0].geometry;

          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route,
            },
          });

          // Glow effect layer
          map.current!.addLayer({
            id: glowLayerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#FFC72C',
              'line-width': 12,
              'line-opacity': 0.3,
              'line-blur': 8,
            },
          });

          // Main route line
          map.current!.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#FFC72C',
              'line-width': 4,
              'line-opacity': 1,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [origin, destination, showRoute, isLoaded]);

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
