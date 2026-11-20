'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Crosshair, 
  Zap, 
  Wrench, 
  Hammer, 
  Boxes, 
  Paintbrush, 
  Fan, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Sparkles,
  Sun,
  Truck,
  Car,
  Layers,
  HardHat,
  Shield,
  ChevronRight
} from 'lucide-react';

interface CategoryOption {
  slug: string;
  name: string;
  nameHi: string;
  icon: any;
  sector: string;
}

const HERO_CATEGORIES: CategoryOption[] = [
  { slug: 'electrician', name: 'Electrician', nameHi: 'बिजली मिस्त्री', icon: Zap, sector: 'Home' },
  { slug: 'plumber', name: 'Plumber', nameHi: 'नल मिस्त्री', icon: Wrench, sector: 'Home' },
  { slug: 'mason', name: 'Mason', nameHi: 'राज मिस्त्री', icon: Hammer, sector: 'Construction' },
  { slug: 'solar-inverter-technician', name: 'Solar Engineer', nameHi: 'सोलर पैनल', icon: Sun, sector: 'Engineering' },
  { slug: 'commercial-driver', name: 'Driver & Chauffeur', nameHi: 'कमर्शियल ड्राइवर', icon: Truck, sector: 'Transport' },
  { slug: 'carpenter', name: 'Carpenter', nameHi: 'बढ़ई', icon: Boxes, sector: 'Home' },
  { slug: 'ac-appliance-technician', name: 'AC & Appliance', nameHi: 'एसी रिपेयर', icon: Fan, sector: 'Home' },
  { slug: 'heavy-machinery-jcb-operator', name: 'JCB & Machinery', nameHi: 'जेसीबी ऑपरेटर', icon: Car, sector: 'Machinery' },
  { slug: 'tiles-marble-granite', name: 'Tiles & Marble', nameHi: 'टाइल मिस्त्री', icon: Layers, sector: 'Construction' },
  { slug: 'painter', name: 'Painter', nameHi: 'रंग मिस्त्री', icon: Paintbrush, sector: 'Home' },
  { slug: 'steel-barbender-rebar', name: 'Steel Barbender', nameHi: 'सरिया मिस्त्री', icon: HardHat, sector: 'Construction' },
  { slug: 'construction-labour', name: 'Labour / Beldar', nameHi: 'मजदूर', icon: Users, sector: 'Construction' },
  { slug: 'deep-cleaning-housekeeping', name: 'Deep Cleaning', nameHi: 'हाउसकीपिंग', icon: Sparkles, sector: 'Facility' },
  { slug: 'security-guard-bouncers', name: 'Security Guard', nameHi: 'सुरक्षा गार्ड', icon: Shield, sector: 'Security' },
];

export default function HeroSearch() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('electrician');
  const [locationName, setLocationName] = useState<string>('Noida, Uttar Pradesh');
  const [latitude, setLatitude] = useState<number>(28.5355);
  const [longitude, setLongitude] = useState<number>(77.3910);
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [locating, setLocating] = useState<boolean>(false);

  // Auto detect user location via browser GPS if available
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocationName(`Current GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        setLocating(false);
      },
      (err) => {
        console.warn('GPS permission denied or unavailable:', err.message);
        setLocating(false);
        alert('Could not retrieve location. Using default selected city area.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (selectedCategory) queryParams.set('category', selectedCategory);
    if (latitude && longitude) {
      queryParams.set('lat', latitude.toString());
      queryParams.set('lng', longitude.toString());
      queryParams.set('radius', radiusKm.toString());
    }
    if (locationName) queryParams.set('location', locationName);
    router.push(`/workers?${queryParams.toString()}`);
  };

  return (
    <div className="relative pt-6 pb-16 lg:pt-12 lg:pb-24 overflow-hidden bg-bg">
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sage-soft rounded-full filter blur-3xl opacity-70 -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-lime-light rounded-full filter blur-3xl opacity-80 -z-10 -translate-x-1/4 translate-y-1/4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/5 border border-forest/10 text-forest text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cta" />
              <span>India&apos;s Digital Workforce Bridge • कामसेतु</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-forest tracking-tight leading-[1.12]">
              Find the right worker.<br />
              <span className="text-cta">Get the work done.</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto lg:mx-0 font-medium">
              Trusted local professionals for every job, right in your neighbourhood. 100% Aadhaar-verified, real GPS dispatch, fair rates.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary bg-white px-3.5 py-2 rounded-xl shadow-xs border border-border">
                <ShieldCheck className="w-5 h-5 text-status-success" /> Verified Aadhaar & Trade KYC
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary bg-white px-3.5 py-2 rounded-xl shadow-xs border border-border">
                <Clock className="w-5 h-5 text-cta" /> Average ETA: 25 Minutes
              </div>
            </div>

            {/* Popular Quick Search Pills */}
            <div className="pt-2 text-left">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                Popular Searches:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Emergency Electrician', cat: 'electrician' },
                  { label: 'Water Leak Plumber', cat: 'plumber' },
                  { label: 'Solar Rooftop Tech', cat: 'solar-inverter-technician' },
                  { label: 'JCB Machine Operator', cat: 'heavy-machinery-jcb-operator' },
                  { label: 'Brickwork Mason', cat: 'mason' },
                  { label: 'Daily Chauffeur', cat: 'commercial-driver' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(item.cat);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-forest hover:text-lime text-text-primary border border-border transition-colors shadow-2xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: High-conversion Search Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-elevated border border-border p-6 sm:p-8 relative">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
                <div>
                  <h2 className="text-lg font-black text-forest">Find Nearby Workers</h2>
                  <p className="text-xs text-text-muted">पास के कुशल कारीगर खोजें</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-successSoft text-status-success text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-status-success animate-ping"></span>
                  Online Now
                </span>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                
                {/* Category Selector Grid */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      1. Choose Trade / Profession (काम चुनें)
                    </label>
                    <a href="/services" className="text-[11px] font-bold text-sage hover:text-forest">
                      View all 22+ &rarr;
                    </a>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                    {HERO_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.slug;
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => setSelectedCategory(cat.slug)}
                          className={`flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all text-xs font-semibold ${
                            isSelected
                              ? 'border-forest bg-forest text-lime shadow-xs'
                              : 'border-border bg-bg hover:border-forest/40 text-text-primary'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-forest-light text-lime' : 'bg-white text-forest shadow-2xs'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="leading-tight font-bold truncate">{cat.name}</div>
                            <div className="text-[10px] opacity-75 truncate">{cat.nameHi}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location Input with GPS Detection */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      2. Enter Location (स्थान)
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={locating}
                      className="text-xs font-bold text-sage hover:text-forest flex items-center gap-1 transition-colors"
                    >
                      <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-cta' : ''}`} />
                      {locating ? 'Detecting GPS...' : 'Use My GPS'}
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Sector 18, Noida or PIN 201301"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm text-text-primary font-medium focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Radius Filter */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-text-primary mb-1">
                    <span>Search Radius: <strong className="text-forest">{radiusKm} km</strong></span>
                    <span className="text-text-muted">तय दूरी</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="40"
                    step="1"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full accent-forest cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>3 km (Locality)</span>
                    <span>15 km (Standard)</span>
                    <span>40 km (Wider City)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-forest hover:bg-forest-light text-lime font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>FIND WORKERS NOW (कारीगर खोजें)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="text-center">
                    <span className="text-xs text-text-muted">Are you looking for work? </span>
                    <a href="/register/worker" className="text-xs font-bold text-cta hover:underline">
                      Join as a Worker (श्रमिक पंजीकरण)
                    </a>
                  </div>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
