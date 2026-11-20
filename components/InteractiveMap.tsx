'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Navigation,
  Compass
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const workerMarkerInstanceRef = useRef<any>(null);
  const prevWorkerCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const routeLayerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [internalFollow, setInternalFollow] = useState(followWorker);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync internal follow state with prop
  useEffect(() => {
    setInternalFollow(followWorker);
  }, [followWorker]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Load Leaflet & CSS
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('KaamSetu Live GPS &copy; OpenStreetMap')
        .addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      setIsMapLoaded(true);
    });

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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

    // 1. Search Radius Circle
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }

    if (searchRadiusKm && customerMarker) {
      radiusCircleRef.current = L.circle([customerMarker.lat, customerMarker.lng], {
        radius: searchRadiusKm * 1000,
        color: '#2583D5',
        fillColor: '#60B5F5',
        fillOpacity: 0.1,
        weight: 1.5,
        dashArray: '6, 6',
      }).addTo(map);
    }

    // 2. Customer Destination Marker
    if (customerMarker) {
      const customerHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(37, 131, 213, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 36px; height: 36px; border-radius: 9999px; background: #123B5D; border: 3px solid #60B5F5; box-shadow: 0 4px 14px rgba(18,59,93,0.4); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div style="margin-top: 4px; background: #123B5D; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);">
            ${customerMarker.title || 'Destination Site'}
          </div>
        </div>
      `;
      const custIcon = L.divIcon({
        html: customerHtml,
        className: 'custom-customer-icon',
        iconSize: [44, 56],
        iconAnchor: [22, 28],
      });

      // Clear existing non-worker markers and re-add customer
      const existingLayers = markersGroup.getLayers();
      existingLayers.forEach((l: any) => {
        if (l !== workerMarkerInstanceRef.current) {
          markersGroup.removeLayer(l);
        }
      });

      const m = L.marker([customerMarker.lat, customerMarker.lng], { icon: custIcon });
      m.on('click', () => customerMarker.onClick && customerMarker.onClick());
      markersGroup.addLayer(m);
    }

    // 3. Worker Live Marker with Smooth Animation
    if (workerMarker) {
      const headingDeg = workerMarker.heading || 0;
      const workerHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.4s ease;">
          <!-- Live pulse aura -->
          <div style="position: absolute; width: 52px; height: 52px; border-radius: 9999px; background: rgba(37, 131, 213, 0.3); animation: pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
          <!-- Worker Avatar Container -->
          <div style="position: relative; width: 42px; height: 42px; border-radius: 9999px; background: #2583D5; border: 3px solid #FFFFFF; box-shadow: 0 4px 16px rgba(37,131,213,0.5); display: flex; align-items: center; justify-content: center; font-size: 20px; overflow: hidden;">
            ${workerMarker.avatarUrl ? `<img src="${workerMarker.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />` : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`}
          </div>
          <!-- Directional Heading Arrow -->
          <div style="position: absolute; top: -7px; transform: rotate(${headingDeg}deg); transform-origin: center bottom; transition: transform 0.5s ease;">
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 9px solid #123B5D;"></div>
          </div>
          <!-- Live Status Tag -->
          <div style="margin-top: 4px; background: #123B5D; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2.5px 8px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(0,0,0,0.25); white-space: nowrap; display: flex; align-items: center; gap: 4.5px; border: 1px solid rgba(255,255,255,0.2);">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background: #10B981; animation: ping 1.5s infinite;"></span>
            ${workerMarker.title || 'Worker (Live GPS)'}
          </div>
        </div>
      `;
      const workerIcon = L.divIcon({
        html: workerHtml,
        className: 'custom-worker-icon',
        iconSize: [52, 66],
        iconAnchor: [26, 33],
      });

      // Smooth Animation: Interpolate between previous coordinates and new coordinates
      if (workerMarkerInstanceRef.current) {
        workerMarkerInstanceRef.current.setIcon(workerIcon);

        const startLat = prevWorkerCoordsRef.current?.lat ?? workerMarker.lat;
        const startLng = prevWorkerCoordsRef.current?.lng ?? workerMarker.lng;
        const targetLat = workerMarker.lat;
        const targetLng = workerMarker.lng;

        // Animate marker over 1000ms if position actually changed
        if (Math.abs(startLat - targetLat) > 0.00001 || Math.abs(startLng - targetLng) > 0.00001) {
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          const startTime = performance.now();
          const duration = 1000;

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out quad
            const ease = 1 - (1 - progress) * (1 - progress);

            const curLat = startLat + (targetLat - startLat) * ease;
            const curLng = startLng + (targetLng - startLng) * ease;

            if (workerMarkerInstanceRef.current) {
              workerMarkerInstanceRef.current.setLatLng([curLat, curLng]);
            }

            if (internalFollow && mapInstanceRef.current) {
              mapInstanceRef.current.panTo([curLat, curLng], { animate: false });
            }

            if (progress < 1) {
              animFrameRef.current = requestAnimationFrame(animate);
            } else {
              prevWorkerCoordsRef.current = { lat: targetLat, lng: targetLng };
            }
          };

          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          workerMarkerInstanceRef.current.setLatLng([targetLat, targetLng]);
          prevWorkerCoordsRef.current = { lat: targetLat, lng: targetLng };
        }
      } else {
        // Initial marker creation
        const m = L.marker([workerMarker.lat, workerMarker.lng], { icon: workerIcon, zIndexOffset: 1000 });
        m.on('click', () => workerMarker.onClick && workerMarker.onClick());
        markersGroup.addLayer(m);
        workerMarkerInstanceRef.current = m;
        prevWorkerCoordsRef.current = { lat: workerMarker.lat, lng: workerMarker.lng };

        if (internalFollow) {
          map.panTo([workerMarker.lat, workerMarker.lng], { animate: true });
        }
      }
    } else if (workerMarkerInstanceRef.current) {
      markersGroup.removeLayer(workerMarkerInstanceRef.current);
      workerMarkerInstanceRef.current = null;
      prevWorkerCoordsRef.current = null;
    }

    // 4. Candidate Nearby Workers (if any)
    candidateMarkers.forEach((cm) => {
      const candHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="width: 32px; height: 32px; border-radius: 9999px; background: #FFFFFF; border: 2px solid #2583D5; box-shadow: 0 3px 8px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 15px; overflow: hidden;">
            ${cm.avatarUrl ? `<img src="${cm.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />` : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2583D5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`}
          </div>
          <div style="margin-top: 2px; background: #FFFFFF; color: #153451; border: 1px solid #D1E8F8; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); white-space: nowrap;">
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

    // 5. Road Route Polyline (Vibrant Blue Uber/Rapido Aesthetic)
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routePolyline && routePolyline.length > 1) {
      // Soft background glow/shadow
      const outline = L.polyline(routePolyline, {
        color: '#123B5D',
        weight: 7.5,
        opacity: 0.18,
        lineCap: 'round',
        lineJoin: 'round',
      });
      
      // Main vibrant blue road route
      const mainRoute = L.polyline(routePolyline, {
        color: '#2583D5',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Animated inner dash line
      const innerLine = L.polyline(routePolyline, {
        color: '#EAF6FF',
        weight: 2,
        opacity: 0.85,
        dashArray: '6, 8',
      });

      routeLayerRef.current = L.featureGroup([outline, mainRoute, innerLine]).addTo(map);
    }
  }, [isMapLoaded, customerMarker, workerMarker, candidateMarkers, routePolyline, searchRadiusKm, internalFollow]);

  // Fit bounds to show both customer and worker
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
      map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 16 });
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

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div 
      ref={wrapperRef} 
      className={`relative w-full rounded-2xl overflow-hidden border border-[#D1E8F8] bg-[#EAF6FF]/30 ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none border-none h-screen w-screen' : heightClass} ${className}`}
    >
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Loading Overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
          <div className="w-8 h-8 border-3 border-[#2583D5] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#153451]">Loading Live GPS Map...</span>
        </div>
      )}

      {/* Floating Map Controls */}
      {showControls && isMapLoaded && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            aria-label="Zoom In"
            title="Zoom In"
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-[#D1E8F8] shadow-md flex items-center justify-center text-[#153451] hover:bg-white active:scale-95 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            aria-label="Zoom Out"
            title="Zoom Out"
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-[#D1E8F8] shadow-md flex items-center justify-center text-[#153451] hover:bg-white active:scale-95 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Recenter on Worker */}
          <button
            onClick={handleRecenter}
            aria-label="Recenter on worker location"
            title="Recenter on Worker"
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-[#D1E8F8] shadow-md flex items-center justify-center text-[#2583D5] hover:bg-white active:scale-95 transition"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Fit Route Bounds */}
          <button
            onClick={handleFitBounds}
            aria-label="Fit Full Route"
            title="Fit Full Route"
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-[#D1E8F8] shadow-md flex items-center justify-center text-[#153451] hover:bg-white active:scale-95 transition"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen Map'}
            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md border border-[#D1E8F8] shadow-md flex items-center justify-center text-[#153451] hover:bg-white active:scale-95 transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Follow Worker Camera Mode */}
          {workerMarker && (
            <button
              onClick={toggleFollowMode}
              aria-label="Toggle Auto-Follow Mode"
              title={internalFollow ? 'Auto-Follow: ON' : 'Auto-Follow: OFF'}
              className={`w-9 h-9 rounded-xl border shadow-md flex items-center justify-center transition active:scale-95 ${
                internalFollow 
                  ? 'bg-[#2583D5] text-white border-[#2583D5] ring-2 ring-[#2583D5]/40' 
                  : 'bg-white/90 backdrop-blur-md text-[#153451] border-[#D1E8F8] hover:bg-white'
              }`}
            >
              <Navigation className={`w-4 h-4 ${internalFollow ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>
      )}

      {/* Follow Mode Indicator Badge */}
      {internalFollow && workerMarker && (
        <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md text-[#2583D5] text-[11px] font-bold px-3 py-1.5 rounded-xl border border-[#D1E8F8] shadow-md flex items-center gap-1.5 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span>Auto-Tracking Worker</span>
        </div>
      )}
    </div>
  );
}
