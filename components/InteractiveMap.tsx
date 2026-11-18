'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Compass, 
  MapPin, 
  Navigation,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type: 'customer' | 'worker' | 'candidate';
  avatarUrl?: string;
  rating?: number;
  heading?: number;
  price?: number;
  distanceKm?: number;
  etaMinutes?: number;
  onClick?: () => void;
}

interface InteractiveMapProps {
  centerLat: number;
  centerLng: number;
  zoom?: number;
  customerMarker?: MapMarker;
  workerMarker?: MapMarker;
  candidateMarkers?: MapMarker[];
  routePolyline?: [number, number][];
  searchRadiusKm?: number;
  followWorker?: boolean;
  onFollowToggle?: (follow: boolean) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
  heightClass?: string;
  showControls?: boolean;
}

export default function InteractiveMap({
  centerLat,
  centerLng,
  zoom = 14,
  customerMarker,
  workerMarker,
  candidateMarkers = [],
  routePolyline,
  searchRadiusKm,
  followWorker = false,
  onFollowToggle,
  onMarkerClick,
  className = '',
  heightClass = 'h-96 sm:h-[450px]',
  showControls = true,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [internalFollow, setInternalFollow] = useState(followWorker);

  // Sync internal follow state with prop
  useEffect(() => {
    setInternalFollow(followWorker);
  }, [followWorker]);

  // Load Leaflet & CSS
  useEffect(() => {
    // 1. Inject Leaflet CSS if not already injected
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let isMounted = true;

    // 2. Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletRef.current = L;

      // Fix default Leaflet icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Avoid re-initializing if already exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: false, // We render custom UI controls
        attributionControl: false,
      });

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('KAAMSETU Maps &copy; OpenStreetMap')
        .addTo(map);

      // Layer groups for markers and polyline
      markersGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      setIsMapLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers, Route Polyline & Search Radius
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    markersGroup.clearLayers();

    // 1. Search Radius Circle
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }

    if (searchRadiusKm && customerMarker) {
      radiusCircleRef.current = L.circle([customerMarker.lat, customerMarker.lng], {
        radius: searchRadiusKm * 1000,
        color: '#173D2B',
        fillColor: '#B7E36A',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '6, 6',
      }).addTo(map);
    }

    // 2. Customer Marker
    if (customerMarker) {
      const customerHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(23, 61, 43, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: #173D2B; border: 3px solid #B7E36A; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div style="margin-top: 4px; background: #173D2B; color: #B7E36A; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap;">
            ${customerMarker.title || 'Your Location'}
          </div>
        </div>
      `;
      const custIcon = L.divIcon({
        html: customerHtml,
        className: 'custom-customer-icon',
        iconSize: [44, 56],
        iconAnchor: [22, 28],
      });
      const m = L.marker([customerMarker.lat, customerMarker.lng], { icon: custIcon });
      m.on('click', () => customerMarker.onClick && customerMarker.onClick());
      markersGroup.addLayer(m);
    }

    // 3. Worker Live Marker (with Heading needle & avatar)
    if (workerMarker) {
      const headingDeg = workerMarker.heading || 0;
      const workerHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.3s ease;">
          <div style="position: absolute; width: 50px; height: 50px; border-radius: 9999px; background: rgba(242, 166, 90, 0.3); animation: pulse 1.5s infinite;"></div>
          <div style="position: relative; width: 40px; height: 40px; border-radius: 9999px; background: #F2A65A; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(242,166,90,0.6); display: flex; align-items: center; justify-content: center; font-size: 20px; overflow: hidden;">
            ${workerMarker.avatarUrl ? `<img src="${workerMarker.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />` : '🛵'}
          </div>
          <!-- Heading Arrow -->
          <div style="position: absolute; top: -6px; transform: rotate(${headingDeg}deg); transform-origin: center bottom;">
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 8px solid #173D2B;"></div>
          </div>
          <div style="margin-top: 4px; background: #173D2B; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background: #B7E36A;"></span>
            ${workerMarker.title || 'Worker (Live)'}
          </div>
        </div>
      `;
      const workerIcon = L.divIcon({
        html: workerHtml,
        className: 'custom-worker-icon',
        iconSize: [50, 62],
        iconAnchor: [25, 31],
      });
      const m = L.marker([workerMarker.lat, workerMarker.lng], { icon: workerIcon, zIndexOffset: 1000 });
      m.on('click', () => workerMarker.onClick && workerMarker.onClick());
      markersGroup.addLayer(m);

      // Follow worker camera if follow mode active
      if (internalFollow) {
        map.panTo([workerMarker.lat, workerMarker.lng], { animate: true, duration: 0.8 });
      }
    }

    // 4. Candidate Nearby Workers (Discovered during dispatch)
    candidateMarkers.forEach((cm) => {
      const candHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="width: 32px; height: 32px; border-radius: 9999px; background: #FFFFFF; border: 2px solid #2D6547; box-shadow: 0 3px 8px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 15px; overflow: hidden;">
            ${cm.avatarUrl ? `<img src="${cm.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />` : '🛠️'}
          </div>
          <div style="margin-top: 2px; background: #FFFFFF; color: #202820; border: 1px solid #D4DED5; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); white-space: nowrap;">
            ${cm.title} ${cm.distanceKm ? `(${cm.distanceKm}km)` : ''}
          </div>
        </div>
      `;
      const candIcon = L.divIcon({
        html: candHtml,
        className: 'custom-cand-icon',
        iconSize: [36, 48],
        iconAnchor: [18, 24],
      });
      const m = L.marker([cm.lat, cm.lng], { icon: candIcon });
      m.on('click', () => {
        if (onMarkerClick) onMarkerClick(cm);
        if (cm.onClick) cm.onClick();
      });
      markersGroup.addLayer(m);
    });

    // 5. Road Route Polyline
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routePolyline && routePolyline.length > 1) {
      // Background glow line
      const outline = L.polyline(routePolyline, {
        color: '#173D2B',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      });
      
      // Animated inner dash line
      const innerLine = L.polyline(routePolyline, {
        color: '#B7E36A',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '8, 8',
      });

      routeLayerRef.current = L.featureGroup([outline, innerLine]).addTo(map);
    }
  }, [isMapLoaded, customerMarker, workerMarker, candidateMarkers, routePolyline, searchRadiusKm, internalFollow]);

  // Fit bounds to show both customer and worker / candidates
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    const points: [number, number][] = [];
    if (customerMarker) points.push([customerMarker.lat, customerMarker.lng]);
    if (workerMarker) points.push([workerMarker.lat, workerMarker.lng]);
    candidateMarkers.forEach(cm => points.push([cm.lat, cm.lng]));
    if (routePolyline) points.push(...routePolyline);

    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 16 });
    }
  };

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const target = workerMarker || customerMarker || { lat: centerLat, lng: centerLng };
    mapInstanceRef.current.setView([target.lat, target.lng], 15, { animate: true });
  };

  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomOut();
  };

  const toggleFollowMode = () => {
    const nextVal = !internalFollow;
    setInternalFollow(nextVal);
    if (onFollowToggle) onFollowToggle(nextVal);
    if (nextVal && workerMarker && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([workerMarker.lat, workerMarker.lng], { animate: true });
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-[#D4DED5] bg-[#E8ECE9] ${heightClass} ${className}`}>
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Loading Overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-[#F7F7F2]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
          <div className="w-8 h-8 border-3 border-[#173D2B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#173D2B]">Loading Satellite Road Grid...</span>
        </div>
      )}

      {/* Floating Map Controls */}
      {showControls && isMapLoaded && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            aria-label="Zoom In"
            className="w-9 h-9 rounded-xl bg-white border border-[#D4DED5] shadow-md flex items-center justify-center text-[#173D2B] hover:bg-[#F7F7F2] active:scale-95 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            aria-label="Zoom Out"
            className="w-9 h-9 rounded-xl bg-white border border-[#D4DED5] shadow-md flex items-center justify-center text-[#173D2B] hover:bg-[#F7F7F2] active:scale-95 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            aria-label="Recenter on location"
            title="Recenter Map"
            className="w-9 h-9 rounded-xl bg-white border border-[#D4DED5] shadow-md flex items-center justify-center text-[#173D2B] hover:bg-[#F7F7F2] active:scale-95 transition"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Fit Route Bounds */}
          <button
            onClick={handleFitBounds}
            aria-label="Fit Route in View"
            title="Fit Route Bounds"
            className="w-9 h-9 rounded-xl bg-white border border-[#D4DED5] shadow-md flex items-center justify-center text-[#173D2B] hover:bg-[#F7F7F2] active:scale-95 transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Follow Worker Camera Mode */}
          {workerMarker && (
            <button
              onClick={toggleFollowMode}
              aria-label="Toggle Follow Mode"
              title={internalFollow ? 'Follow Mode ON' : 'Follow Mode OFF'}
              className={`w-9 h-9 rounded-xl border shadow-md flex items-center justify-center transition active:scale-95 ${
                internalFollow 
                  ? 'bg-[#173D2B] text-[#B7E36A] border-[#173D2B] ring-2 ring-[#B7E36A]/50' 
                  : 'bg-white text-[#202820] border-[#D4DED5] hover:bg-[#F7F7F2]'
              }`}
            >
              <Navigation className={`w-4 h-4 ${internalFollow ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>
      )}

      {/* Follow Mode Indicator Badge */}
      {internalFollow && workerMarker && (
        <div className="absolute top-4 left-4 z-[400] bg-[#173D2B]/90 backdrop-blur-md text-[#B7E36A] text-[11px] font-bold px-3 py-1.5 rounded-xl border border-[#B7E36A]/30 shadow-md flex items-center gap-1.5 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#B7E36A] animate-ping" />
          <span>Follow Mode Locked: Auto-tracking Worker</span>
        </div>
      )}
    </div>
  );
}
