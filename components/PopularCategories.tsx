'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Wrench, 
  Hammer, 
  Boxes, 
  Paintbrush, 
  Fan, 
  ShieldAlert, 
  Users, 
  Layers,
  Sun,
  ShieldCheck,
  ClipboardCheck,
  Truck,
  Sparkles,
  TreePine,
  Shield,
  Bug,
  Droplet,
  Car,
  HardHat,
  Package,
  PartyPopper,
  ArrowRight,
  Search,
  CheckCircle2,
  Filter
} from 'lucide-react';

export interface CategoryCardData {
  id: string;
  slug: string;
  name: string;
  nameHi: string;
  desc: string;
  sector: 'Home & Domestic' | 'Construction' | 'Engineering & Solar' | 'Transport & Machinery' | 'Facility & Security' | 'Agri & Events';
  icon: any;
  color: string;
  coverImage?: string;
  workerCount: string;
  avgRate: string;
  dailyRate: string;
  popularSkills: string[];
}

export const CATEGORIES_DATA: CategoryCardData[] = [
  {
    id: 'cat-electrician',
    slug: 'electrician',
    name: 'Electrician',
    nameHi: 'बिजली मिस्त्री',
    sector: 'Home & Domestic',
    desc: 'Concealed wiring, switchboards, MCB distribution boards, fans, and emergency short circuits.',
    icon: Zap,
    color: 'text-amber-500 bg-amber-50 border-amber-200',
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
    workerCount: '1,420+ Verified',
    avgRate: '₹350/hr',
    dailyRate: '₹1,100/day',
    popularSkills: ['House Wiring', 'MCB Tripping', 'Inverter Setup'],
  },
  {
    id: 'cat-plumber',
    slug: 'plumber',
    name: 'Plumber & Sanitary Specialist',
    nameHi: 'नल मिस्त्री',
    sector: 'Home & Domestic',
    desc: 'CPVC/UPVC pipe leaks, bathroom fittings, water pump motor repair, and overhead tank sanitation.',
    icon: Wrench,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    coverImage: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&auto=format&fit=crop&q=80',
    workerCount: '980+ Verified',
    avgRate: '₹300/hr',
    dailyRate: '₹950/day',
    popularSkills: ['Pipe Leakage', 'Water Motor', 'Sanitaryware'],
  },
  {
    id: 'cat-mason',
    slug: 'mason',
    name: 'Mason / Raj Mistri',
    nameHi: 'राज मिस्त्री',
    sector: 'Construction',
    desc: 'Precision brickwork, cement mortar plastering, lintel casting, boundary walls, and structural masonry.',
    icon: Hammer,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=500&auto=format&fit=crop&q=80',
    workerCount: '2,150+ Verified',
    avgRate: '₹400/hr',
    dailyRate: '₹1,050/day',
    popularSkills: ['Brickwork', 'Plastering', 'Slab Casting'],
  },
  {
    id: 'cat-carpenter',
    slug: 'carpenter',
    name: 'Carpenter & Woodworker',
    nameHi: 'बढ़ई',
    sector: 'Home & Domestic',
    desc: 'Door locks, modular kitchen cabinets, wooden partitions, beds, and custom wardrobe fabrication.',
    icon: Boxes,
    color: 'text-amber-800 bg-amber-50/80 border-amber-200',
    coverImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&auto=format&fit=crop&q=80',
    workerCount: '840+ Verified',
    avgRate: '₹350/hr',
    dailyRate: '₹1,000/day',
    popularSkills: ['Modular Kitchen', 'Door Locks', 'Wood Polish'],
  },
  {
    id: 'cat-painter',
    slug: 'painter',
    name: 'Painter & Waterproofing',
    nameHi: 'रंग मिस्त्री',
    sector: 'Home & Domestic',
    desc: 'Interior wall putty, damp-proofing, exterior weathercoat, luxury texture art, and wood PU polish.',
    icon: Paintbrush,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    coverImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80',
    workerCount: '1,120+ Verified',
    avgRate: '₹300/hr',
    dailyRate: '₹850/day',
    popularSkills: ['Wall Putty', 'Damp Proofing', 'Texture Paint'],
  },
  {
    id: 'cat-ac-tech',
    slug: 'ac-appliance-technician',
    name: 'AC & Refrigeration Tech',
    nameHi: 'एसी व उपकरण',
    sector: 'Home & Domestic',
    desc: 'Split & window AC power jet cleaning, gas refill, installation, PCB repair, and deep service.',
    icon: Fan,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    coverImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop&q=80',
    workerCount: '760+ Verified',
    avgRate: '₹450/visit',
    dailyRate: '₹1,200/day',
    popularSkills: ['Foam Jet Service', 'Gas Top-up', 'AC Installation'],
  },
  {
    id: 'cat-welder',
    slug: 'welder',
    name: 'Welder & Metal Fabricator',
    nameHi: 'वेल्डर व फेब्रिकेटर',
    sector: 'Construction',
    desc: 'Iron gates, balcony safety grills, railings, tin sheds, and on-site emergency structural repairs.',
    icon: ShieldAlert,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    coverImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80',
    workerCount: '630+ Verified',
    avgRate: '₹400/hr',
    dailyRate: '₹1,150/day',
    popularSkills: ['Main Gates', 'Balcony Grills', 'Tin Sheds'],
  },
  {
    id: 'cat-labour',
    slug: 'construction-labour',
    name: 'Construction Labour & Helpers',
    nameHi: 'निर्माण मजदूर (बेलदार)',
    sector: 'Construction',
    desc: 'Daily wage site helpers, loading/unloading, debris removal, excavation, and batch mixing.',
    icon: Users,
    color: 'text-slate-700 bg-slate-100 border-slate-200',
    coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=80',
    workerCount: '4,500+ Verified',
    avgRate: '₹200/hr',
    dailyRate: '₹650/day',
    popularSkills: ['Beldar Helper', 'Material Loading', 'Debris Clearing'],
  },
  {
    id: 'cat-tiles-stone',
    slug: 'tiles-marble-granite',
    name: 'Tiles, Marble & Granite Setter',
    nameHi: 'टाइल व मार्बल मिस्त्री',
    sector: 'Construction',
    desc: 'Vitrified floor tiles, Italian marble laying, kitchen granite counters, and epoxy grouting.',
    icon: Layers,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80',
    workerCount: '890+ Verified',
    avgRate: '₹400/hr',
    dailyRate: '₹1,100/day',
    popularSkills: ['Vitrified Tiles', 'Italian Marble', 'Granite Counters'],
  },
  {
    id: 'cat-solar-tech',
    slug: 'solar-inverter-technician',
    name: 'Solar & Inverter Engineer',
    nameHi: 'सोलर पैनल इंजीनियर',
    sector: 'Engineering & Solar',
    desc: 'Rooftop on-grid/off-grid solar installation, hybrid inverter wiring, net metering, and battery banks.',
    icon: Sun,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80',
    workerCount: '520+ Verified',
    avgRate: '₹500/hr',
    dailyRate: '₹1,400/day',
    popularSkills: ['Rooftop Solar PV', 'Net Metering', 'Hybrid Inverters'],
  },
  {
    id: 'cat-cctv-security',
    slug: 'cctv-smart-security',
    name: 'CCTV & Smart Security Tech',
    nameHi: 'सीसीटीवी व सुरक्षा',
    sector: 'Engineering & Solar',
    desc: 'HD/IP camera setup, NVR/DVR configuration, biometric attendance, and smart digital locks.',
    icon: ShieldCheck,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
    coverImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&auto=format&fit=crop&q=80',
    workerCount: '410+ Verified',
    avgRate: '₹400/hr',
    dailyRate: '₹1,200/day',
    popularSkills: ['IP Cameras', 'Biometrics', 'Smart Door Locks'],
  },
  {
    id: 'cat-civil-engineer',
    slug: 'civil-engineer-supervisor',
    name: 'Civil Site Engineer & Lead',
    nameHi: 'सिविल इंजीनियर',
    sector: 'Engineering & Solar',
    desc: 'Structural drawing execution, site quality QA/QC, bar bending schedule, and contractor supervision.',
    icon: ClipboardCheck,
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format&fit=crop&q=80',
    workerCount: '340+ Verified',
    avgRate: '₹600/hr',
    dailyRate: '₹1,800/day',
    popularSkills: ['Quality Inspection', 'BBS Schedule', 'Survey & Billing'],
  },
  {
    id: 'cat-driver',
    slug: 'commercial-driver',
    name: 'Commercial Driver & Chauffeur',
    nameHi: 'कमर्शियल ड्राइवर',
    sector: 'Transport & Machinery',
    desc: 'Verified commercial chauffeurs, intra-city transit drivers, goods truck pilots, and fleet operators.',
    icon: Truck,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    coverImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&auto=format&fit=crop&q=80',
    workerCount: '1,850+ Verified',
    avgRate: '₹250/hr',
    dailyRate: '₹850/day',
    popularSkills: ['Commercial Badge', 'Goods Truck', 'Personal Chauffeur'],
  },
  {
    id: 'cat-heavy-machinery',
    slug: 'heavy-machinery-jcb-operator',
    name: 'Heavy Machinery & JCB Operator',
    nameHi: 'जेसीबी व क्रेन ऑपरेटर',
    sector: 'Transport & Machinery',
    desc: 'Certified operators for JCB 3DX, tracked excavators, hydra cranes, and soil compactors.',
    icon: Car,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    coverImage: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500&auto=format&fit=crop&q=80',
    workerCount: '480+ Verified',
    avgRate: '₹500/hr',
    dailyRate: '₹1,500/day',
    popularSkills: ['JCB 3DX Loader', 'Hydraulic Excavator', 'Hydra Crane'],
  },
  {
    id: 'cat-packaging-logistics',
    slug: 'warehouse-packaging-workforce',
    name: 'Warehouse & Packaging Staff',
    nameHi: 'वेयरहाउस मजदूर',
    sector: 'Transport & Machinery',
    desc: 'E-commerce sorting, pallet shrink wrapping, carton taping, barcode scanner, and container unloading.',
    icon: Package,
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    coverImage: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=500&auto=format&fit=crop&q=80',
    workerCount: '2,200+ Verified',
    avgRate: '₹200/hr',
    dailyRate: '₹700/day',
    popularSkills: ['Carton Taping', 'BOPT Pallet Truck', 'Container Unload'],
  },
  {
    id: 'cat-housekeeping',
    slug: 'deep-cleaning-housekeeping',
    name: 'Deep Cleaning & Housekeeping',
    nameHi: 'डीप क्लीनिंग',
    sector: 'Facility & Security',
    desc: 'Home deep cleaning, sofa/mattress foam extraction, commercial janitorial, and kitchen degreasing.',
    icon: Sparkles,
    color: 'text-pink-600 bg-pink-50 border-pink-200',
    coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80',
    workerCount: '1,650+ Verified',
    avgRate: '₹250/hr',
    dailyRate: '₹750/day',
    popularSkills: ['Full Home Clean', 'Sofa Shampoo', 'Floor Scrubbing'],
  },
  {
    id: 'cat-security-guard',
    slug: 'security-guard-bouncers',
    name: 'Security Personnel & Guards',
    nameHi: 'सुरक्षा गार्ड व बाउंसर',
    sector: 'Facility & Security',
    desc: 'Uniformed residential society security, corporate guards, armed bank escorts, and event bouncers.',
    icon: Shield,
    color: 'text-blue-900 bg-blue-50 border-blue-200',
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=500&auto=format&fit=crop&q=80',
    workerCount: '1,950+ Verified',
    avgRate: '₹250/hr',
    dailyRate: '₹850/day',
    popularSkills: ['PSARA Certified', 'Society Gatekeeper', 'Event Bouncer'],
  },
  {
    id: 'cat-steel-barbender',
    slug: 'steel-barbender-rebar',
    name: 'Steel Barbender & Saria Mistri',
    nameHi: 'सरिया मिस्त्री',
    sector: 'Construction',
    desc: 'TMT rebar cutting, column ring stirrup tying, slab reinforcement mesh, and foundation cages.',
    icon: HardHat,
    color: 'text-stone-700 bg-stone-100 border-stone-300',
    coverImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=500&auto=format&fit=crop&q=80',
    workerCount: '780+ Verified',
    avgRate: '₹400/hr',
    dailyRate: '₹1,100/day',
    popularSkills: ['Column Rings', 'Slab Reinforcement', 'Bending Key'],
  },
  {
    id: 'cat-pest-control',
    slug: 'pest-control-specialist',
    name: 'Pest Control Specialist',
    nameHi: 'पेस्ट कंट्रोल',
    sector: 'Home & Domestic',
    desc: 'Anti-termite drill and fill, cockroach gel treatment, bed bug removal, and outdoor mosquito fogging.',
    icon: Bug,
    color: 'text-green-700 bg-green-50 border-green-200',
    coverImage: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=500&auto=format&fit=crop&q=80',
    workerCount: '450+ Verified',
    avgRate: '₹350/hr',
    dailyRate: '₹1,100/day',
    popularSkills: ['Termite Drill & Fill', 'Cockroach Gel', 'Mosquito Fogging'],
  },
  {
    id: 'cat-ro-appliance',
    slug: 'water-purifier-ro-technician',
    name: 'Water Purifier & RO Tech',
    nameHi: 'आरओ तकनीशियन',
    sector: 'Home & Domestic',
    desc: 'Domestic and commercial RO service, membrane replacement, TDS adjustment, and water softeners.',
    icon: Droplet,
    color: 'text-sky-600 bg-sky-50 border-sky-200',
    coverImage: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=500&auto=format&fit=crop&q=80',
    workerCount: '580+ Verified',
    avgRate: '₹300/hr',
    dailyRate: '₹900/day',
    popularSkills: ['Filter & Carbon', 'RO Membrane', 'TDS Calibration'],
  },
  {
    id: 'cat-gardener',
    slug: 'gardener-mali-landscaper',
    name: 'Gardener / Mali & Landscaper',
    nameHi: 'माली व लैंडस्केप',
    sector: 'Agri & Events',
    desc: 'Lawn mowing, seasonal flower plantation, tree pruning, soil conditioning, and drip irrigation layout.',
    icon: TreePine,
    color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=80',
    workerCount: '640+ Verified',
    avgRate: '₹200/hr',
    dailyRate: '₹700/day',
    popularSkills: ['Lawn Mowing', 'Tree Pruning', 'Drip Irrigation'],
  },
  {
    id: 'cat-event-stewards',
    slug: 'event-setup-banquet-workforce',
    name: 'Event Setup & Banquet Staff',
    nameHi: 'इवेंट सेटअप टीम',
    sector: 'Agri & Events',
    desc: 'Wedding and expo stage trussing, carpet laying, banquet hospitality stewards, and sound helpers.',
    icon: PartyPopper,
    color: 'text-violet-600 bg-violet-50 border-violet-200',
    coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=80',
    workerCount: '1,100+ Verified',
    avgRate: '₹250/hr',
    dailyRate: '₹850/day',
    popularSkills: ['Stage Rigging', 'Banquet Stewards', 'AV Lighting Helpers'],
  },
];

const SECTOR_TABS = [
  'All Sectors',
  'Home & Domestic',
  'Construction',
  'Engineering & Solar',
  'Transport & Machinery',
  'Facility & Security',
  'Agri & Events',
] as const;

export default function PopularCategories() {
  const [activeSector, setActiveSector] = useState<string>('All Sectors');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCategories = useMemo(() => {
    return CATEGORIES_DATA.filter((cat) => {
      const matchesSector = activeSector === 'All Sectors' || cat.sector === activeSector;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        cat.name.toLowerCase().includes(q) ||
        cat.nameHi.includes(q) ||
        cat.desc.toLowerCase().includes(q) ||
        cat.popularSkills.some(s => s.toLowerCase().includes(q));
      return matchesSector && matchesSearch;
    });
  }, [activeSector, searchQuery]);

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest/5 text-forest text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-cta" />
              <span>Multi-Sector Workforce • 22+ कार्य श्रेणियां</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-forest tracking-tight">
              Explore All Workforce Categories
            </h2>
            <p className="text-base text-text-secondary mt-2">
              From residential repairs and civil construction to solar engineering and heavy machinery, discover certified Indian tradesmen ready for dispatch.
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trade, skill (e.g. Solar, JCB)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-bg text-sm font-medium focus:outline-none focus:border-forest"
            />
          </div>
        </div>

        {/* Sector Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {SECTOR_TABS.map((tab) => {
            const count = tab === 'All Sectors' 
              ? CATEGORIES_DATA.length 
              : CATEGORIES_DATA.filter(c => c.sector === tab).length;
            const active = activeSector === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSector(tab)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  active 
                    ? 'bg-forest text-lime shadow-sm' 
                    : 'bg-bg hover:bg-forest/5 text-text-secondary border border-border'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-forest-light text-lime' : 'bg-white text-text-muted'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-bg rounded-3xl border border-border">
            <Filter className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
            <p className="text-base font-bold text-forest">No categories matched your search</p>
            <p className="text-xs text-text-secondary mt-1">Try searching for other trades like &quot;Plumber&quot;, &quot;Electrician&quot;, or &quot;Mason&quot;</p>
            <button
              onClick={() => { setActiveSector('All Sectors'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-forest text-lime text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="group rounded-3xl bg-white border border-border hover:border-forest/40 hover:shadow-card transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Cover Image with Overlay */}
                  <div className="relative h-36 bg-forest/5 overflow-hidden">
                    {cat.coverImage ? (
                      <img 
                        src={cat.coverImage} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full bg-forest/10 flex items-center justify-center">
                        <Icon className="w-12 h-12 text-forest/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {/* Sector pill badge */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-forest shadow-xs">
                        {cat.sector}
                      </span>
                    </div>

                    {/* Category Title on Image */}
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="text-base font-black leading-tight drop-shadow-sm">
                        {cat.name}
                      </h3>
                      <span className="text-xs text-lime font-bold">({cat.nameHi})</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                        {cat.desc}
                      </p>

                      {/* Skill tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {cat.popularSkills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-bg text-text-secondary border border-border"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-text-muted uppercase font-bold block">Fair Wages</span>
                        <span className="text-xs font-black text-forest">
                          {cat.avgRate} <span className="text-text-muted font-normal">• {cat.dailyRate}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/workers?category=${cat.slug}`}
                          className="px-3 py-1.5 rounded-xl bg-bg hover:bg-forest hover:text-lime text-forest text-xs font-bold transition-all border border-border"
                          title="View Verified Workers"
                        >
                          Find
                        </Link>
                        <Link
                          href={`/booking/new?category=${cat.id}`}
                          className="px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-lime text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                        >
                          <span>Book</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-forest text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-xl sm:text-2xl font-black text-white">
              Are you a skilled tradesperson or labour contractor?
            </h4>
            <p className="text-sm text-lime-light/80">
              Join KaamSetu today. Direct customer bookings, weekly payouts, and zero middlemen commissions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/register/worker"
              className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-black text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              Register as Worker (कारीगर जुड़ें)
            </Link>
            <Link
              href="/contractor"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
            >
              Contractor Onboarding
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
