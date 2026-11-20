'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Crosshair, 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  Star, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Truck,
  Building2,
  Sparkles,
  Phone,
  Layers,
  Compass
} from 'lucide-react';

export interface StreetWorker {
  id: string;
  name: string;
  trade: string;
  tradeSlug: string;
  lat: number;
  lng: number;
  streetName: string;
  distanceKm: number;
  etaMins: number;
  hourlyRate: number;
  rating: number;
  avatarUrl: string;
  verified: boolean;
  status: 'AVAILABLE' | 'ON_WAY';
}

interface OpenStreetTrackerProps {
  initialLat?: number;
  initialLng?: number;
  selectedTrade?: string;
  onTradeSelect?: (tradeSlug: string) => void;
  className?: string;
}

export default function OpenStreetTracker({
  initialLat = 28.5355,
  initialLng = 77.3910,
  selectedTrade = 'all',
  onTradeSelect,
  className = '',
}: OpenStreetTrackerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [streetAddress, setStreetAddress] = useState<string>('Detecting exact street location...');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeRadiusKm, setActiveRadiusKm] = useState<number>(3);
  const [activeWorkerPopup, setActiveWorkerPopup] = useState<StreetWorker | null>(null);

  // Generate deterministic nearby workers on surrounding streets
  const generateStreetWorkers = useCallback((centerLat: number, centerLng: number): StreetWorker[] => {
    const tradeDefs = [
      { name: 'Electrician', slug: 'electrician', rate: 350, iconColor: '#2583D5' },
      { name: 'Plumber', slug: 'plumber', rate: 300, iconColor: '#0284C7' },
      { name: 'Carpenter', slug: 'carpenter', rate: 450, iconColor: '#B45309' },
      { name: 'Painter', slug: 'painter', rate: 400, iconColor: '#7C3AED' },
      { name: 'Delivery', slug: 'delivery', rate: 250, iconColor: '#059669' },
      { name: 'Mason', slug: 'construction', rate: 500, iconColor: '#DC2626' },
      { name: 'Housekeeping', slug: 'housekeeping', rate: 280, iconColor: '#0D9488' },
    ];

    const workerNames = [
      'Rajesh Sharma', 'Amit Kumar', 'Suresh Verma', 'Manoj Singh',
      'Deepak Yadav', 'Vikram Patel', 'Ramesh Chandra', 'Sunil Mistri',
      'Pooja Devi', 'Anil Sahni', 'Govind Prasad', 'Dharmendra Pal'
    ];

    const streetNames = [
      'Main Market Road', 'Service Lane, Sector 62', 'Link Road Junction',
      'Ring Road Outer Bypass', 'Station Road Cross', 'Central Avenue',
      'Commercial Complex Street', 'Pocket B Residential Road'
    ];

    const workers: StreetWorker[] = [];

    // Create 14 realistic workers on nearby streets within 0.3 - 2.5 km
    for (let i = 0; i < 14; i++) {
      const trade = tradeDefs[i % tradeDefs.length];
      const angle = (i * 25.7 * Math.PI) / 180;
      const distance = 0.3 + (i * 0.16) % 2.2; // 0.3 to 2.5 km
      const latOffset = (distance / 111) * Math.cos(angle);
      const lngOffset = (distance / (111 * Math.cos((centerLat * Math.PI) / 180))) * Math.sin(angle);

      workers.push({
        id: `osm-wrk-${i + 1}`,
        name: workerNames[i % workerNames.length],
        trade: trade.name,
        tradeSlug: trade.slug,
        lat: Number((centerLat + latOffset).toFixed(6)),
        lng: Number((centerLng + lngOffset).toFixed(6)),
        streetName: streetNames[i % streetNames.length],
        distanceKm: Number(distance.toFixed(1)),
        etaMins: Math.max(3, Math.round(distance * 3.5)),
        hourlyRate: trade.rate,
        rating: Number((4.6 + (i % 5) * 0.08).toFixed(1)),
        avatarUrl: `https://images.unsplash.com/photo-${1535713875002 + (i * 1234)}?w=150&auto=format&fit=crop&q=80`,
        verified: true,
        status: i % 4 === 0 ? 'ON_WAY' : 'AVAILABLE',
      });
    }

    return workers;
  }, []);

  const [nearbyWorkers, setNearbyWorkers] = useState<StreetWorker[]>(() => generateStreetWorkers(initialLat, initialLng));

  // Reverse Geocode using free OpenStreetMap Nominatim API
  const reverseGeocodeOSM = useCallback(async (lat: number, lon: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
        },
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.street || addr.suburb || addr.neighbourhood || '';
        const city = addr.city || addr.town || addr.state_district || addr.state || '';
        const postcode = addr.postcode ? ` - ${addr.postcode}` : '';
        if (road || city) {
          setStreetAddress(`${[road, city].filter(Boolean).join(', ')}${postcode}`);
          return;
        }
      }
    } catch (e) {
      // ignore network errors
    }
    setStreetAddress(`GPS Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)} (Street View Active)`);
  }, []);

  // Detect Live GPS using browser navigator.geolocation
  const detectLiveGPS = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setNearbyWorkers(generateStreetWorkers(latitude, longitude));
        reverseGeocodeOSM(latitude, longitude);
        setIsLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1.5 });
        }
      },
      (err) => {
        console.warn('[OpenStreetMap Live GPS Error]:', err.message);
        setIsLocating(false);
        // Fallback to default
        reverseGeocodeOSM(userCoords.lat, userCoords.lng);
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 10000 }
    );
  }, [generateStreetWorkers, reverseGeocodeOSM, userCoords.lat, userCoords.lng]);

  // Initialize Leaflet & OpenStreetMap
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet CSS
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

      // Fix default marker icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map with high street-level zoom (16)
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      // FREE OpenStreetMap Standard Street Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('KaamSetu Live GPS • &copy; OpenStreetMap')
        .addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setIsMapReady(true);

      // Perform initial geocode
      reverseGeocodeOSM(userCoords.lat, userCoords.lng);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when location or selectedTrade changes
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !leafletRef.current || !markersLayerRef.current) return;
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    // Clear old markers
    markersLayer.clearLayers();

    // 1. Radius Circle
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
    }
    radiusCircleRef.current = L.circle([userCoords.lat, userCoords.lng], {
      radius: activeRadiusKm * 1000,
      color: '#2583D5',
      fillColor: '#60B5F5',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '5, 6',
    }).addTo(map);

    // 2. Customer Street GPS Marker (Pulsing Radar Aura)
    const customerIconHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(37, 131, 213, 0.28); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: #153451; border: 3px solid #60B5F5; box-shadow: 0 4px 14px rgba(21,52,81,0.45); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60B5F5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div style="margin-top: 3px; background: #153451; color: #FFFFFF; font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);">
          Your Street GPS
        </div>
      </div>
    `;

    const custIcon = L.divIcon({
      html: customerIconHtml,
      className: 'osm-customer-icon',
      iconSize: [44, 54],
      iconAnchor: [22, 27],
    });

    customerMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: custIcon, zIndexOffset: 2000 });
    markersLayer.addLayer(customerMarkerRef.current);

    // 3. Filter Workers by Trade
    const filtered = selectedTrade === 'all'
      ? nearbyWorkers
      : nearbyWorkers.filter((w) => w.tradeSlug === selectedTrade);

    // 4. Render Worker Markers on the Street
    filtered.forEach((worker) => {
      const isSelected = activeWorkerPopup?.id === worker.id;
      const workerIconHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: #FFFFFF; border: 2.5px solid ${isSelected ? '#2583D5' : '#153451'}; box-shadow: 0 3px 12px rgba(21,52,81,0.3); display: flex; align-items: center; justify-content: center; overflow: hidden; transition: transform 0.2s;">
            <img src="${worker.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'" />
          </div>
          <div style="margin-top: 2.5px; background: #FFFFFF; color: #153451; font-size: 9px; font-weight: 800; padding: 1.5px 6px; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.15); border: 1px solid #D1E8F8; white-space: nowrap; display: flex; align-items: center; gap: 3px;">
            <span style="width: 5px; height: 5px; border-radius: 9999px; background: #10B981;"></span>
            <span>${worker.trade}</span>
            <span style="color: #7697B3;">• ${worker.distanceKm}km</span>
          </div>
        </div>
      `;

      const wIcon = L.divIcon({
        html: workerIconHtml,
        className: 'osm-worker-marker',
        iconSize: [40, 52],
        iconAnchor: [20, 26],
      });

      const m = L.marker([worker.lat, worker.lng], { icon: wIcon });
      m.on('click', () => {
        setActiveWorkerPopup(worker);
        map.panTo([worker.lat, worker.lng], { animate: true });
      });
      markersLayer.addLayer(m);
    });

  }, [isMapReady, userCoords, nearbyWorkers, selectedTrade, activeRadiusKm, activeWorkerPopup]);

  // Controls
  const handleZoomIn = () => mapInstanceRef.current && mapInstanceRef.current.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current && mapInstanceRef.current.zoomOut();
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userCoords.lat, userCoords.lng], 16, { duration: 1.2 });
    }
  };

  const toggleFullscreen = () => {
    const el = mapContainerRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const filteredCount = selectedTrade === 'all'
    ? nearbyWorkers.length
    : nearbyWorkers.filter(w => w.tradeSlug === selectedTrade).length;

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-[#D1E8F8] bg-white shadow-xl ${className}`}>
      
      {/* MAP HEADER / LIVE GPS BANNER */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#153451] via-[#1E486D] to-[#153451] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-black tracking-wide uppercase flex items-center gap-1.5 text-white">
              <Compass className="w-4 h-4 text-[#60B5F5]" />
              <span>OpenStreetMap Live GPS Street View</span>
            </h3>
            <span className="text-[10px] bg-[#2583D5] text-white px-2 py-0.5 rounded-md font-bold">
              Street Level
            </span>
          </div>
          <p className="text-xs text-[#EAF6FF] font-medium truncate max-w-xl">
            {streetAddress}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Detect GPS Button */}
          <button
            type="button"
            onClick={detectLiveGPS}
            disabled={isLocating}
            className="px-3.5 py-2 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#2583D5]/30 cursor-pointer disabled:opacity-50"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting Street GPS...' : 'Locate My Street'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAP VIEW CONTAINER */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-[#F5FAFF]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* MAP OVERLAY CONTROLS (Top Right) */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom In"
            className="w-8 h-8 rounded-xl bg-white/95 border border-[#D1E8F8] shadow-md flex items-center justify-center text-[#153451] hover:bg-white active:scale-95 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom Out"
            className="w-8 h-8 rounded-xl bg-white/95 border border-[#D1E8F8] shadow-md flex items-center justify-center text-[#153451] hover:bg-white active:scale-95 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRecenter}
            aria-label="Recenter GPS"
            title="Recenter to my street"
            className="w-8 h-8 rounded-xl bg-white/95 border border-[#D1E8F8] shadow-md flex items-center justify-center text-[#2583D5] hover:bg-white active:scale-95 transition"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* RADIUS BADGE (Top Left) */}
        <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D1E8F8] shadow-md text-xs font-bold text-[#153451] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2583D5]" />
          <span>Radius: {activeRadiusKm} km</span>
          <div className="flex items-center gap-1 border-l border-[#D1E8F8] pl-2 text-[10px]">
            {[2, 3, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRadiusKm(r)}
                className={`px-1.5 py-0.5 rounded ${
                  activeRadiusKm === r
                    ? 'bg-[#2583D5] text-white'
                    : 'text-[#7697B3] hover:text-[#153451]'
                }`}
              >
                {r}k
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVE WORKER POPUP MODAL (Bottom Overlay) */}
        {activeWorkerPopup && (
          <div className="absolute bottom-20 sm:bottom-4 left-3 right-3 sm:left-6 sm:max-w-md z-[500] bg-white rounded-2xl p-4 border border-[#D1E8F8] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={activeWorkerPopup.avatarUrl}
                  alt={activeWorkerPopup.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#D1E8F8]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black text-[#153451]">{activeWorkerPopup.name}</h4>
                    {activeWorkerPopup.verified && (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-[#2583D5] flex items-center gap-2">
                    <span>{activeWorkerPopup.trade}</span>
                    <span className="text-[#7697B3]">•</span>
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {activeWorkerPopup.rating}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveWorkerPopup(null)}
                className="text-[#7697B3] hover:text-[#153451] text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Street & Arrival Details */}
            <div className="mt-3 pt-2.5 border-t border-[#EAF6FF] grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-[#F5FAFF] border border-[#EAF6FF]">
                <span className="text-[10px] uppercase font-bold text-[#7697B3] block">Street Location</span>
                <span className="font-bold text-[#153451] truncate block">{activeWorkerPopup.streetName}</span>
                <span className="text-[11px] text-[#2583D5] font-semibold">{activeWorkerPopup.distanceKm} km away</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F5FAFF] border border-[#EAF6FF]">
                <span className="text-[10px] uppercase font-bold text-[#7697B3] block">Dispatch ETA & Rate</span>
                <span className="font-bold text-emerald-600 block">{activeWorkerPopup.etaMins} mins dispatch</span>
                <span className="text-[11px] text-[#153451] font-bold">₹{activeWorkerPopup.hourlyRate}/hour</span>
              </div>
            </div>

            {/* Book Now Button */}
            <div className="mt-3 flex items-center gap-2">
              <Link
                href={`/hiring/book?workerId=${activeWorkerPopup.id}&trade=${activeWorkerPopup.tradeSlug}`}
                className="flex-1 py-2.5 rounded-xl bg-[#2583D5] hover:bg-[#1E70B8] text-white font-black text-xs uppercase tracking-wider text-center shadow-md shadow-[#2583D5]/25 transition flex items-center justify-center gap-1.5"
              >
                <span>Instant Book Worker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER STATS & RADAR DISCOVERY */}
      <div className="p-3 sm:p-4 bg-[#F5FAFF] border-t border-[#EAF6FF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#4B6F8E]">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>
            Discovered <strong className="text-[#153451]">{filteredCount} verified professionals</strong> active on nearby streets
          </span>
        </div>

        <Link
          href="/hiring/nearby"
          className="font-bold text-[#2583D5] hover:underline flex items-center gap-1"
        >
          <span>Open Full Interactive Radar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
