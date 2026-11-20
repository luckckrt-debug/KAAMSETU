// KAAMSETU - Centralized Data Persistence & Repository Layer
// Supports PostgreSQL via Prisma and provides a robust self-contained transactional store
import fs from 'fs';
import path from 'path';
import {
  User,
  WorkerProfile,
  CustomerProfile,
  ContractorProfile,
  Category,
  Booking,
  BookingLocation,
  Tender,
  TenderApplication,
  TenderTeam,
  Payment,
  WorkerPayout,
  JobReview,
  JobDispute,
  ChatMessage,
  Notification,
  AdminMetrics,
  BookingStatus,
  VerificationStatus,
  UserRole,
  WorkerWallet,
  WalletLedgerEntry,
  Withdrawal,
  PayoutAccount,
  CommissionRule,
  WorkerEarningSummary,
  FinancialAuditLog,
  LedgerTransactionType,
  WithdrawalStatus,
} from './types';
import { calculateDistanceKm, calculateEstimatedEtaMinutes } from './geo';
import { getProfessionBySlug } from './professions';
import { findProfessionByIdOrSlug, searchProfessionsCatalogue } from './professions-master';
import { calculateJobCommission } from './commission';
import { dispatchPayout } from './payout';
import { deleteMongoDocument, upsertMongoDocument } from './mongodb';

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'kaamsetu_store.json');
const BUNDLED_STORE_FILE = path.join(process.cwd(), 'data', 'kaamsetu_store.json');

export interface DatabaseState {
  users: User[];
  workerProfiles: WorkerProfile[];
  customerProfiles: CustomerProfile[];
  contractorProfiles: ContractorProfile[];
  categories: Category[];
  bookings: Booking[];
  bookingLocations: BookingLocation[];
  tenders: Tender[];
  tenderApplications: TenderApplication[];
  tenderTeams: TenderTeam[];
  payments: Payment[];
  payouts: WorkerPayout[];
  reviews: JobReview[];
  disputes: JobDispute[];
  chatMessages: ChatMessage[];
  notifications: Notification[];
  wallets: WorkerWallet[];
  ledgerEntries: WalletLedgerEntry[];
  withdrawals: Withdrawal[];
  payoutAccounts: PayoutAccount[];
  commissionRules: CommissionRule[];
  financialAuditLogs: FinancialAuditLog[];
  auditLogs: Array<{
    id: string;
    adminUserId?: string;
    action: string;
    targetType: string;
    targetId: string;
    details?: string;
    timestamp: string;
  }>;
}

let memoryState: DatabaseState | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Graceful fallback for read-only or restricted environments
  }
}

export function loadStore(): DatabaseState {
  if (memoryState) return memoryState;

  ensureDataDir();
  const seed = getInitialSeedData();

  const fileToRead = fs.existsSync(STORE_FILE)
    ? STORE_FILE
    : fs.existsSync(BUNDLED_STORE_FILE)
    ? BUNDLED_STORE_FILE
    : null;

  if (fileToRead) {
    try {
      const content = fs.readFileSync(fileToRead, 'utf-8');
      memoryState = JSON.parse(content);
      
      // Ensure all expanded categories, wallets, ledger, and payout arrays are initialized
      if (memoryState) {
        if (!memoryState.wallets || memoryState.wallets.length === 0) memoryState.wallets = seed.wallets;
        if (!memoryState.ledgerEntries || memoryState.ledgerEntries.length === 0) memoryState.ledgerEntries = seed.ledgerEntries;
        if (!memoryState.withdrawals) memoryState.withdrawals = seed.withdrawals;
        if (!memoryState.payoutAccounts || memoryState.payoutAccounts.length === 0) memoryState.payoutAccounts = seed.payoutAccounts;
        if (!memoryState.commissionRules || memoryState.commissionRules.length === 0) memoryState.commissionRules = seed.commissionRules;
        if (!memoryState.financialAuditLogs) memoryState.financialAuditLogs = [];

        if (!memoryState.categories || memoryState.categories.length < seed.categories.length) {
          memoryState.categories = seed.categories;
          seed.users.forEach((u) => {
            if (!memoryState!.users.some((mu) => mu.id === u.id)) memoryState!.users.push(u);
          });
          seed.workerProfiles.forEach((wp) => {
            if (!memoryState!.workerProfiles.some((mwp) => mwp.id === wp.id)) memoryState!.workerProfiles.push(wp);
          });
        }
        saveStore();
      }
      return memoryState!;
    } catch (e) {
      console.error('[KAAMSETU DB] Error reading store file, reinitializing default seed:', e);
    }
  }

  memoryState = seed;
  saveStore();
  return memoryState;
}

export function saveStore() {
  if (!memoryState) return;
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryState, null, 2), 'utf-8');
  } catch (e) {
    console.error('[KAAMSETU DB] Error saving store file:', e);
  }
}

// -------------------------------------------------------------
// SEED DATA INITIALIZER
// -------------------------------------------------------------
export function getInitialSeedData(): DatabaseState {
  const categories: Category[] = [
    {
      id: 'cat-electrician',
      name: 'Electrician',
      nameHi: 'बिजली मिस्त्री',
      slug: 'electrician',
      iconName: 'Zap',
      sector: 'Home Repair & Maintenance',
      description: 'Concealed house wiring, switchboards, MCB distribution boards, fans, inverters, and emergency short circuit repair.',
      coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 350,
      baseDailyRate: 1100,
      requiredTools: ['Digital Multimeter', 'Insulated Pliers', 'Conduit Bender', 'Wire Strippers', 'Drill Machine'],
      certifications: ['ITI Electrical Trade Certificate', 'Wireman Licence'],
      featured: true,
      subcategories: [
        { id: 'sub-elec-wiring', categoryId: 'cat-electrician', name: 'House Wiring & Conduit', nameHi: 'वायरिंग व पाइपिंग', slug: 'wiring' },
        { id: 'sub-elec-appliance', categoryId: 'cat-electrician', name: 'Fan & Light Installation', nameHi: 'पंखा व लाइट फिटिंग', slug: 'fans-lights' },
        { id: 'sub-elec-inverter', categoryId: 'cat-electrician', name: 'Inverter & Battery Wiring', nameHi: 'इन्वर्टर और बैटरी', slug: 'inverter-battery' },
        { id: 'sub-elec-mcb', categoryId: 'cat-electrician', name: 'Fuse, MCB & Short Circuit Repair', nameHi: 'शॉर्ट सर्किट और एमसीबी', slug: 'mcb-short-circuit' },
      ],
    },
    {
      id: 'cat-plumber',
      name: 'Plumber & Sanitary Specialist',
      nameHi: 'प्लंबर (नल मिस्त्री)',
      slug: 'plumber',
      iconName: 'Wrench',
      sector: 'Home Repair & Maintenance',
      description: 'CPVC/UPVC concealed pipe fittings, tap leaks, sanitaryware, pump motors, and water tank cleaning.',
      coverImage: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 300,
      baseDailyRate: 950,
      requiredTools: ['Pipe Wrench Set', 'Core Cutter Drill', 'Thread Sealant', 'Pressure Gauge'],
      certifications: ['Govt Vocational Sanitary Plumbing Certificate'],
      featured: true,
      subcategories: [
        { id: 'sub-plumb-leakage', categoryId: 'cat-plumber', name: 'Pipe Leakage & Tap Repair', nameHi: 'पाइप लीकेज व नल रिपेयर', slug: 'pipe-leakage' },
        { id: 'sub-plumb-sanitary', categoryId: 'cat-plumber', name: 'Toilet & Washbasin Fitting', nameHi: 'टॉयलेट व वाशबेसिन फिटिंग', slug: 'sanitary-fitting' },
        { id: 'sub-plumb-motor', categoryId: 'cat-plumber', name: 'Water Motor & Pump Installation', nameHi: 'मोटर पंप फिटिंग', slug: 'water-motor' },
        { id: 'sub-plumb-tank', categoryId: 'cat-plumber', name: 'Overhead Tank Cleaning', nameHi: 'पानी की टंकी सफाई', slug: 'tank-cleaning' },
      ],
    },
    {
      id: 'cat-mason',
      name: 'Mason / Raj Mistri',
      nameHi: 'राज मिस्त्री',
      slug: 'mason',
      iconName: 'Hammer',
      sector: 'Construction & Infrastructure',
      description: 'Brickwork, cement mortar plastering, lintel slab casting, boundary walls, and structural masonry.',
      coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 400,
      baseDailyRate: 1050,
      requiredTools: ['Spirit Level', 'Plumb Bob', 'Trowels', 'Mortar Pan', 'Measuring Tape'],
      certifications: ['Skilled Mason Trade Certification', 'CSDC Verification'],
      featured: true,
      subcategories: [
        { id: 'sub-mason-brick', categoryId: 'cat-mason', name: 'Brickwork & Wall Construction', nameHi: 'ईंट की चिनाई', slug: 'brickwork' },
        { id: 'sub-mason-plaster', categoryId: 'cat-mason', name: 'Cement Plastering', nameHi: 'सीमेंट प्लास्टर', slug: 'plastering' },
        { id: 'sub-mason-tiles', categoryId: 'cat-mason', name: 'Tiles & Marble Laying', nameHi: 'टाइल व मार्बल', slug: 'tiles-marble' },
        { id: 'sub-mason-concrete', categoryId: 'cat-mason', name: 'Roof Slab & Lintel Casting', nameHi: 'छत ढलाई व लेंटर', slug: 'concrete-slab' },
      ],
    },
    {
      id: 'cat-carpenter',
      name: 'Carpenter & Woodworker',
      nameHi: 'बढ़ई',
      slug: 'carpenter',
      iconName: 'Boxes',
      sector: 'Home Repair & Maintenance',
      description: 'Door and window fitting, mortise locks, modular kitchen cabinets, wooden partitions, and custom furniture.',
      coverImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 350,
      baseDailyRate: 1000,
      requiredTools: ['Circular Saw', 'Wood Planer', 'Chisel Set', 'Impact Driver', 'Clamps'],
      certifications: ['Furniture & Fittings Skill Council (FFSC) Card'],
      featured: true,
      subcategories: [
        { id: 'sub-carp-door', categoryId: 'cat-carpenter', name: 'Door & Window Fitting / Lock', nameHi: 'दरवाजे व ताला रिपेयर', slug: 'doors-locks' },
        { id: 'sub-carp-kitchen', categoryId: 'cat-carpenter', name: 'Modular Kitchen Cabinets', nameHi: 'मॉड्यूलर किचन', slug: 'modular-kitchen' },
        { id: 'sub-carp-furniture', categoryId: 'cat-carpenter', name: 'Custom Furniture Making', nameHi: 'फर्नीचर निर्माण', slug: 'furniture' },
      ],
    },
    {
      id: 'cat-painter',
      name: 'Painter & Waterproofing Expert',
      nameHi: 'पेंटर (रंग मिस्त्री)',
      slug: 'painter',
      iconName: 'Paintbrush',
      sector: 'Home Repair & Maintenance',
      description: 'Interior wall putty, damp-proofing, exterior weathercoat, luxury texture art, and wood PU polishing.',
      coverImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 300,
      baseDailyRate: 850,
      requiredTools: ['Airless Paint Sprayer', 'Putty Knives', 'Sanding Machine', 'Roller Kit'],
      certifications: ['Paints and Coatings Skill Council (PCSC) Certified'],
      featured: true,
      subcategories: [
        { id: 'sub-paint-interior', categoryId: 'cat-painter', name: 'Interior Wall Painting & Putty', nameHi: 'अंदरूनी पेंट व पुट्टी', slug: 'interior-putty' },
        { id: 'sub-paint-waterproof', categoryId: 'cat-painter', name: 'Damp Proofing & Waterproofing', nameHi: 'सीलन व वॉटरप्रूफिंग', slug: 'waterproofing' },
        { id: 'sub-paint-texture', categoryId: 'cat-painter', name: 'Exterior Weathercoat & Texture', nameHi: 'एक्सटीरियर वेदरकोट', slug: 'exterior-texture' },
      ],
    },
    {
      id: 'cat-welder',
      name: 'Welder & Metal Fabricator',
      nameHi: 'वेल्डर व फेब्रिकेटर',
      slug: 'welder',
      iconName: 'ShieldAlert',
      sector: 'Construction & Infrastructure',
      description: 'Iron gate, balcony safety grills, tin shed, railing, structural steel welding, and on-site emergency repairs.',
      coverImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 400,
      baseDailyRate: 1150,
      requiredTools: ['Inverter ARC Welding Machine', 'Angle Grinder', 'Welding Shield', 'Chipping Hammer'],
      certifications: ['ITI Welder Trade (NCVT)', 'Boiler Welder 6G Certification'],
      featured: true,
      subcategories: [
        { id: 'sub-weld-gate', categoryId: 'cat-welder', name: 'Iron Gate & Balcony Grill', nameHi: 'गेट व ग्रिल फेब्रिकेशन', slug: 'gate-grill' },
        { id: 'sub-weld-repair', categoryId: 'cat-welder', name: 'Emergency Spot Welding Repair', nameHi: 'स्पॉट वेल्डिंग रिपेयर', slug: 'spot-welding' },
      ],
    },
    {
      id: 'cat-ac-tech',
      name: 'AC & Refrigeration Technician',
      nameHi: 'एसी व उपकरण टेक्नीशियन',
      slug: 'ac-appliance-technician',
      iconName: 'Fan',
      sector: 'Home Repair & Maintenance',
      description: 'Split & window AC power jet cleaning, refrigerant top-up, copper piping, PCB board repair, and compressor overhaul.',
      coverImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 450,
      baseDailyRate: 1200,
      requiredTools: ['Foam Jet Pressure Washer', 'Manifold Gauge Set', 'Flaring Kit', 'Vacuum Pump'],
      certifications: ['RAC ITI Certification', 'Ozone Depleting Substances Handling Licence'],
      featured: true,
      subcategories: [
        { id: 'sub-ac-service', categoryId: 'cat-ac-tech', name: 'AC Foam Jet Service & Gas Topup', nameHi: 'एसी सर्विस व गैस टॉपअप', slug: 'ac-service' },
        { id: 'sub-ac-install', categoryId: 'cat-ac-tech', name: 'AC Installation & Uninstallation', nameHi: 'एसी फिटिंग व डिस्मेंटल', slug: 'ac-installation' },
        { id: 'sub-appliance-wm', categoryId: 'cat-ac-tech', name: 'Washing Machine Repair', nameHi: 'वॉशिंग मशीन रिपेयर', slug: 'washing-machine' },
      ],
    },
    {
      id: 'cat-labour',
      name: 'Construction Labour & Helpers',
      nameHi: 'निर्माण मजदूर (बेलदार)',
      slug: 'construction-labour',
      iconName: 'Users',
      sector: 'Construction & Infrastructure',
      description: 'Daily wage site helpers, loading/unloading, debris removal, trench excavation, and concrete batch mixing.',
      coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 200,
      baseDailyRate: 650,
      requiredTools: ['ISI Hard Hat', 'High-Visibility Jacket', 'Steel Toe Safety Shoes', 'Spade & Pan'],
      certifications: ['BOCW Welfare Card (E-Shram / State Board)'],
      featured: true,
      subcategories: [
        { id: 'sub-labour-daily', categoryId: 'cat-labour', name: 'Daily Site Helper (Beldar)', nameHi: 'बेलदार (दैनिक मजदूरी)', slug: 'site-beldar' },
        { id: 'sub-labour-material', categoryId: 'cat-labour', name: 'Building Material Loading/Shifting', nameHi: 'सामान ढुलाई व लोडिंग', slug: 'material-shifting' },
      ],
    },
    {
      id: 'cat-tiles-stone',
      name: 'Tiles, Marble & Granite Specialist',
      nameHi: 'टाइल, मार्बल व ग्रेनाइट मिस्त्री',
      slug: 'tiles-marble-granite',
      iconName: 'Layers',
      sector: 'Construction & Infrastructure',
      description: 'Vitrified floor tiles, Italian marble flooring, kitchen granite countertops, epoxy grouting, and stone cladding.',
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 400,
      baseDailyRate: 1100,
      requiredTools: ['Diamond Blade Marble Cutter', 'Vibrating Tile Suction Tool', 'Tile Leveling Clips', 'Angle Polisher'],
      certifications: ['CSDC Flooring & Tiling Specialist'],
      featured: true,
      subcategories: [
        { id: 'sub-tiles-floor', categoryId: 'cat-tiles-stone', name: 'Vitrified Floor Tiles', nameHi: 'विट्रिफाइड फ्लोर टाइल्स', slug: 'vitrified-tiles' },
        { id: 'sub-tiles-marble', categoryId: 'cat-tiles-stone', name: 'Italian Marble Laying', nameHi: 'इटैलियन मार्बल', slug: 'italian-marble' },
        { id: 'sub-tiles-granite', categoryId: 'cat-tiles-stone', name: 'Kitchen Granite Countertop', nameHi: 'किचन ग्रेनाइट काउंटर', slug: 'granite-counter' },
      ],
    },
    {
      id: 'cat-solar-tech',
      name: 'Solar & Inverter Engineer',
      nameHi: 'सोलर पैनल व इन्वर्टर इंजीनियर',
      slug: 'solar-inverter-technician',
      iconName: 'Sun',
      sector: 'Engineering & Supervision',
      description: 'Rooftop on-grid/off-grid solar installation, hybrid inverter wiring, net metering setup, and battery bank maintenance.',
      coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 500,
      baseDailyRate: 1400,
      requiredTools: ['DC Clamp Meter', 'Solar Crimping Tool', 'MC4 Connector Spanner', 'Angle Inclinometer'],
      certifications: ['Suryamitra Certified Solar PV Installer (NISE)'],
      featured: true,
      subcategories: [
        { id: 'sub-solar-rooftop', categoryId: 'cat-solar-tech', name: 'Rooftop Solar Installation', nameHi: 'रूफटॉप सोलर पैनल', slug: 'rooftop-solar' },
        { id: 'sub-solar-inverter', categoryId: 'cat-solar-tech', name: 'Hybrid Inverter Setup', nameHi: 'हाइब्रिड इन्वर्टर', slug: 'hybrid-inverter' },
        { id: 'sub-solar-netmeter', categoryId: 'cat-solar-tech', name: 'Net Metering Wiring', nameHi: 'नेट मीटरिंग वायरिंग', slug: 'net-metering' },
      ],
    },
    {
      id: 'cat-cctv-security',
      name: 'CCTV & Smart Security Technician',
      nameHi: 'सीसीटीवी व स्मार्ट सुरक्षा तकनीशियन',
      slug: 'cctv-smart-security',
      iconName: 'ShieldCheck',
      sector: 'Engineering & Supervision',
      description: 'HD/IP camera setup, NVR/DVR remote access, biometric attendance, video door phones, and smart digital door locks.',
      coverImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 400,
      baseDailyRate: 1200,
      requiredTools: ['LAN Cable Tester', 'Crimping Tool RJ45/BNC', 'Punch Down Tool', 'Wire Fish Tape'],
      certifications: ['Certified Electronic Security Systems Specialist'],
      featured: false,
      subcategories: [
        { id: 'sub-cctv-ip', categoryId: 'cat-cctv-security', name: 'IP & HD CCTV Setup', nameHi: 'आईपी व एचडी सीसीटीवी', slug: 'ip-cctv' },
        { id: 'sub-cctv-biometric', categoryId: 'cat-cctv-security', name: 'Biometric Attendance Machine', nameHi: 'बायोमेट्रिक अटेंडेंस', slug: 'biometric-device' },
        { id: 'sub-cctv-smartlock', categoryId: 'cat-cctv-security', name: 'Smart Digital Door Lock', nameHi: 'डिजिटल डोर लॉक', slug: 'smart-door-lock' },
      ],
    },
    {
      id: 'cat-civil-engineer',
      name: 'Civil Site Engineer & Supervisor',
      nameHi: 'सिविल साइट इंजीनियर व सुपरवाइजर',
      slug: 'civil-engineer-supervisor',
      iconName: 'ClipboardCheck',
      sector: 'Engineering & Supervision',
      description: 'Structural drawing execution, site quality inspection, quantity survey, bar bending schedule, and contractor billing.',
      coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 600,
      baseDailyRate: 1800,
      requiredTools: ['Digital Auto Level', 'AutoCAD Plan Viewer', 'Rebound Hammer', 'Concrete Slump Cone'],
      certifications: ['B.Tech / Diploma in Civil Engineering (AICTE)'],
      featured: true,
      subcategories: [
        { id: 'sub-civil-quality', categoryId: 'cat-civil-engineer', name: 'Site Quality Supervision', nameHi: 'साइट क्वालिटी चेकिंग', slug: 'quality-supervision' },
        { id: 'sub-civil-bbs', categoryId: 'cat-civil-engineer', name: 'Bar Bending Schedule (BBS)', nameHi: 'बीबीएस व सरिया शेड्यूल', slug: 'bbs-schedule' },
        { id: 'sub-civil-billing', categoryId: 'cat-civil-engineer', name: 'Quantity Survey & Billing', nameHi: 'क्वांटिटी सर्वे व बिलिंग', slug: 'quantity-billing' },
      ],
    },
    {
      id: 'cat-driver',
      name: 'Commercial Driver & Chauffeur',
      nameHi: 'कमर्शियल ड्राइवर व शॉफर',
      slug: 'commercial-driver',
      iconName: 'Truck',
      sector: 'Logistics, Transport & Heavy Machinery',
      description: 'Verified professional chauffeurs, transit mixer drivers, intra-city goods truck pilots, and commercial cab fleet operators.',
      coverImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 250,
      baseDailyRate: 850,
      requiredTools: ['Commercial Driving Licence (LMV/HMV)', 'GPS Navigation Smartphone', 'Commercial Badge'],
      certifications: ['RTO Commercial Transport Badge', 'Defensive Driving Certificate'],
      featured: true,
      subcategories: [
        { id: 'sub-driver-personal', categoryId: 'cat-driver', name: 'Personal Daily Chauffeur', nameHi: 'पर्सनल शॉफर', slug: 'personal-chauffeur' },
        { id: 'sub-driver-truck', categoryId: 'cat-driver', name: 'Intra-City Goods Truck Driver', nameHi: 'कमर्शियल ट्रक ड्राइवर', slug: 'goods-truck' },
        { id: 'sub-driver-outstation', categoryId: 'cat-driver', name: 'Outstation Commercial Driver', nameHi: 'आउटस्टेशन ड्राइवर', slug: 'outstation-driver' },
      ],
    },
    {
      id: 'cat-housekeeping',
      name: 'Deep Cleaning & Housekeeping',
      nameHi: 'डीप क्लीनिंग व हाउसकीपिंग',
      slug: 'deep-cleaning-housekeeping',
      iconName: 'Sparkles',
      sector: 'Facility Management & Security',
      description: 'Home deep cleaning, sofa and mattress shampoo, commercial office janitorial, kitchen degreasing, and floor scrubbing.',
      coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 250,
      baseDailyRate: 750,
      requiredTools: ['Single Disc Floor Scrubber', 'Wet & Dry Industrial Vacuum', 'Steam Extraction Machine'],
      certifications: ['Hospitality & Janitorial Standards Verification'],
      featured: true,
      subcategories: [
        { id: 'sub-clean-home', categoryId: 'cat-housekeeping', name: 'Full Home Deep Clean', nameHi: 'फुल होम डीप क्लीनिंग', slug: 'full-home-clean' },
        { id: 'sub-clean-sofa', categoryId: 'cat-housekeeping', name: 'Sofa & Carpet Shampoo', nameHi: 'सोफा व कारपेट शैम्पू', slug: 'sofa-shampoo' },
        { id: 'sub-clean-office', categoryId: 'cat-housekeeping', name: 'Corporate Office Janitorial', nameHi: 'ऑफिस हाउसकीपिंग', slug: 'office-janitorial' },
      ],
    },
    {
      id: 'cat-gardener',
      name: 'Gardener / Mali & Landscaper',
      nameHi: 'माली व लैंडस्केप विशेषज्ञ',
      slug: 'gardener-mali-landscaper',
      iconName: 'TreePine',
      sector: 'Agriculture & Landscaping',
      description: 'Lawn mowing, seasonal flower plantation, tree pruning, soil conditioning, organic compost, and drip irrigation setup.',
      coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 200,
      baseDailyRate: 700,
      requiredTools: ['Lawn Mower', 'Hedge Trimmer', 'Pruning Shears', 'Garden Spade', 'Sprinkler Kit'],
      certifications: ['Horticulture & Landscape Maintenance Training'],
      featured: false,
      subcategories: [
        { id: 'sub-mali-lawn', categoryId: 'cat-gardener', name: 'Lawn Mowing & Weeding', nameHi: 'घास कटाई व निराई', slug: 'lawn-mowing' },
        { id: 'sub-mali-tree', categoryId: 'cat-gardener', name: 'Tree Trimming & Pruning', nameHi: 'पेड़ छंटाई', slug: 'tree-pruning' },
        { id: 'sub-mali-drip', categoryId: 'cat-gardener', name: 'Drip Irrigation Setup', nameHi: 'ड्रिप इरिगेशन', slug: 'drip-irrigation' },
      ],
    },
    {
      id: 'cat-security-guard',
      name: 'Security Personnel & Bouncers',
      nameHi: 'सुरक्षा गार्ड व बाउंसर',
      slug: 'security-guard-bouncers',
      iconName: 'Shield',
      sector: 'Facility Management & Security',
      description: 'Uniformed residential society security, corporate guards, armed bank escorts, and personal event bouncers.',
      coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 250,
      baseDailyRate: 850,
      requiredTools: ['Metal Detector Wand', 'Baton & Security Torch', 'Two-Way Radio Walkie-Talkie'],
      certifications: ['PSARA Security Training Certified', 'Police Verification Clearance'],
      featured: true,
      subcategories: [
        { id: 'sub-sec-society', categoryId: 'cat-security-guard', name: 'Residential Society Guard', nameHi: 'सोसायटी सुरक्षा गार्ड', slug: 'society-guard' },
        { id: 'sub-sec-corporate', categoryId: 'cat-security-guard', name: 'Corporate Office Security', nameHi: 'कॉर्पोरेट गार्ड', slug: 'corporate-security' },
        { id: 'sub-sec-bouncer', categoryId: 'cat-security-guard', name: 'Event Crowd Bouncer', nameHi: 'इवेंट बाउंसर', slug: 'event-bouncer' },
      ],
    },
    {
      id: 'cat-pest-control',
      name: 'Pest Control Specialist',
      nameHi: 'पेस्ट कंट्रोल विशेषज्ञ',
      slug: 'pest-control-specialist',
      iconName: 'Bug',
      sector: 'Home Repair & Maintenance',
      description: 'Herbal anti-termite drill and fill, cockroach gel treatment, bed bug elimination, and outdoor thermal mosquito fogging.',
      coverImage: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 350,
      baseDailyRate: 1100,
      requiredTools: ['Termite Hammer Drill', 'Thermal Fogger Machine', 'Compression Chemical Sprayer', 'Respirator Mask'],
      certifications: ['Insecticide & Pest Management Operator Licence (CIBRC Approved)'],
      featured: false,
      subcategories: [
        { id: 'sub-pest-termite', categoryId: 'cat-pest-control', name: 'Termite Drill & Fill Treatment', nameHi: 'दीमक रोकथाम', slug: 'termite-treatment' },
        { id: 'sub-pest-cockroach', categoryId: 'cat-pest-control', name: 'Cockroach Herbal Gel', nameHi: 'कॉकरोच जेल', slug: 'cockroach-gel' },
        { id: 'sub-pest-bedbug', categoryId: 'cat-pest-control', name: 'Bed Bug Removal', nameHi: 'खटमल रोकथाम', slug: 'bedbug-removal' },
      ],
    },
    {
      id: 'cat-ro-appliance',
      name: 'Water Purifier & RO Technician',
      nameHi: 'आरओ व वाटर प्यूरीफायर तकनीशियन',
      slug: 'water-purifier-ro-technician',
      iconName: 'Droplet',
      sector: 'Home Repair & Maintenance',
      description: 'Domestic and commercial RO servicing, RO membrane replacement, TDS adjustment, UV chamber fixing, and water softener installation.',
      coverImage: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 300,
      baseDailyRate: 900,
      requiredTools: ['Digital TDS Meter', 'Spun Filter Spanner', 'Pressure Gauge', 'Membrane Housing Opener'],
      certifications: ['Water Treatment & Purification Technical Certificate'],
      featured: false,
      subcategories: [
        { id: 'sub-ro-service', categoryId: 'cat-ro-appliance', name: 'RO Filter & Carbon Replacement', nameHi: 'फिल्टर व कार्बन सर्विस', slug: 'ro-service' },
        { id: 'sub-ro-membrane', categoryId: 'cat-ro-appliance', name: 'RO Membrane Change', nameHi: 'आरओ मेंब्रेन रिप्लेसमेंट', slug: 'membrane-change' },
        { id: 'sub-ro-commercial', categoryId: 'cat-ro-appliance', name: 'Commercial 50 LPH Plant', nameHi: 'कमर्शियल आरओ प्लांट', slug: 'commercial-ro' },
      ],
    },
    {
      id: 'cat-heavy-machinery',
      name: 'Heavy Machinery & JCB Operator',
      nameHi: 'भारी मशीनरी व जेसीबी ऑपरेटर',
      slug: 'heavy-machinery-jcb-operator',
      iconName: 'Car',
      sector: 'Logistics, Transport & Heavy Machinery',
      description: 'Certified operators for JCB backhoe loaders, tracked excavators, hydra cranes, soil compactors, and road rollers.',
      coverImage: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 500,
      baseDailyRate: 1500,
      requiredTools: ['Heavy Earthmoving Machinery Licence', 'Engine Diagnostic Reader', 'Safety Harness'],
      certifications: ['Heavy Transport & Earthmoving Equipment Operator Licence'],
      featured: true,
      subcategories: [
        { id: 'sub-mach-jcb', categoryId: 'cat-heavy-machinery', name: 'JCB Backhoe Loader Operator', nameHi: 'जेसीबी ऑपरेटर', slug: 'jcb-operator' },
        { id: 'sub-mach-excavator', categoryId: 'cat-heavy-machinery', name: 'Tracked Hydraulic Excavator', nameHi: 'हाइड्रोलिक एक्सकेवेटर', slug: 'excavator-operator' },
        { id: 'sub-mach-crane', categoryId: 'cat-heavy-machinery', name: 'Hydra & Mobile Crane Operator', nameHi: 'हाइड्रा क्रेन ऑपरेटर', slug: 'hydra-crane' },
      ],
    },
    {
      id: 'cat-steel-barbender',
      name: 'Steel Barbender & Saria Mistri',
      nameHi: 'सरिया मिस्त्री (बार बेंडर)',
      slug: 'steel-barbender-rebar',
      iconName: 'HardHat',
      sector: 'Construction & Infrastructure',
      description: 'High-tensile TMT rebar cutting, column ring (stirrup) tying, slab reinforcement mesh, and foundation cage fabrication.',
      coverImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 400,
      baseDailyRate: 1100,
      requiredTools: ['Rebar Bending Key', 'Manual / Power Rebar Cutter', 'Binding Wire Tying Pliers', 'Bar Spacers'],
      certifications: ['CSDC Certified Rebar & Barbending Specialist'],
      featured: true,
      subcategories: [
        { id: 'sub-bar-slab', categoryId: 'cat-steel-barbender', name: 'Slab Rebar Mesh Tying', nameHi: 'छत सरिया जाल', slug: 'slab-rebar' },
        { id: 'sub-bar-column', categoryId: 'cat-steel-barbender', name: 'Column Ring Stirrups', nameHi: 'कॉलम रिंग टाई', slug: 'column-rings' },
        { id: 'sub-bar-beam', categoryId: 'cat-steel-barbender', name: 'Beam & Foundation Cage', nameHi: 'बीम व फाउंडेशन केज', slug: 'beam-foundation' },
      ],
    },
    {
      id: 'cat-packaging-logistics',
      name: 'Warehouse & Packaging Workforce',
      nameHi: 'वेयरहाउस व पैकेजिंग मजदूर',
      slug: 'warehouse-packaging-workforce',
      iconName: 'Package',
      sector: 'Logistics, Transport & Heavy Machinery',
      description: 'E-commerce warehouse sorting, pallet shrink wrapping, carton taping, barcode scanner handling, and container unloading.',
      coverImage: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 200,
      baseDailyRate: 700,
      requiredTools: ['Hand Stretch Film Dispenser', 'Hand Pallet Truck (BOPT)', 'Barcode Handheld Terminal', 'Safety Gloves'],
      certifications: ['Logistics Sector Skill Council (LSSC) Card'],
      featured: false,
      subcategories: [
        { id: 'sub-pack-carton', categoryId: 'cat-packaging-logistics', name: 'Carton Packaging & Labeling', nameHi: 'पैकिंग व लेबलिंग', slug: 'carton-packaging' },
        { id: 'sub-pack-pallet', categoryId: 'cat-packaging-logistics', name: 'Pallet Shrink Wrap & BOPT', nameHi: 'पैलेट रैपिंग', slug: 'pallet-wrap' },
        { id: 'sub-pack-unload', categoryId: 'cat-packaging-logistics', name: 'Container Unloading & Sorting', nameHi: 'कंटेनर अनलोडिंग', slug: 'container-unload' },
      ],
    },
    {
      id: 'cat-event-stewards',
      name: 'Event Setup & Banquet Workforce',
      nameHi: 'इवेंट सेटअप व बैंक्वेट टीम',
      slug: 'event-setup-banquet-workforce',
      iconName: 'PartyPopper',
      sector: 'Events & Hospitality',
      description: 'Wedding and expo stage trussing, carpet laying, banquet hospitality stewards, exhibition stall assembly, and sound helpers.',
      coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
      baseHourlyRate: 250,
      baseDailyRate: 850,
      requiredTools: ['Stage Rigging Clamps', 'Cable Protectors', 'Heavy Stapler Gun', 'Uniform Dress Code'],
      certifications: ['Hospitality & Event Services Protocol Verification'],
      featured: false,
      subcategories: [
        { id: 'sub-event-stage', categoryId: 'cat-event-stewards', name: 'Stage Truss & Tent Assembly', nameHi: 'स्टेज व टेंट सेटअप', slug: 'stage-setup' },
        { id: 'sub-event-banquet', categoryId: 'cat-event-stewards', name: 'Banquet Hospitality Steward', nameHi: 'बैंक्वेट व कैटरिंग स्टीवर्ड', slug: 'banquet-stewards' },
        { id: 'sub-event-av', categoryId: 'cat-event-stewards', name: 'Audio-Visual & Light Helper', nameHi: 'साउंड व लाइट हेल्पर', slug: 'av-helpers' },
      ],
    },
  ];

  // Pre-seeded Users
  const users: User[] = [
    {
      id: 'user-worker-1',
      phoneNumber: '9876543210',
      phoneVerified: true,
      email: 'ramesh.sharma@example.com',
      fullName: 'Ramesh Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-02-01T08:00:00.000Z',
    },
    {
      id: 'user-worker-2',
      phoneNumber: '9812345678',
      phoneVerified: true,
      email: 'murtaza.ali@example.com',
      fullName: 'Murtaza Ali',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-18T09:30:00.000Z',
      updatedAt: '2026-02-05T09:30:00.000Z',
    },
    {
      id: 'user-worker-3',
      phoneNumber: '9899887766',
      phoneVerified: true,
      email: 'satish.kumar@example.com',
      fullName: 'Satish Kumar',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER', 'TEAM_LEADER'],
      createdAt: '2026-01-10T11:00:00.000Z',
      updatedAt: '2026-02-08T11:00:00.000Z',
    },
    {
      id: 'user-worker-4',
      phoneNumber: '9711223344',
      phoneVerified: true,
      email: 'dinesh.yadav@example.com',
      fullName: 'Dinesh Yadav',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-22T08:00:00.000Z',
      updatedAt: '2026-02-10T08:00:00.000Z',
    },
    {
      id: 'user-worker-5',
      phoneNumber: '9871112233',
      phoneVerified: true,
      email: 'arjun.verma@example.com',
      fullName: 'Arjun Verma',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-25T08:00:00.000Z',
      updatedAt: '2026-02-15T08:00:00.000Z',
    },
    {
      id: 'user-worker-6',
      phoneNumber: '9810009988',
      phoneVerified: true,
      email: 'gurpreet.singh@example.com',
      fullName: 'Gurpreet Singh',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-20T08:00:00.000Z',
      updatedAt: '2026-02-10T08:00:00.000Z',
    },
    {
      id: 'user-worker-7',
      phoneNumber: '9818884433',
      phoneVerified: true,
      email: 'deepak.rawat@example.com',
      fullName: 'Deepak Rawat',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      language: 'en',
      roles: ['WORKER', 'TEAM_LEADER'],
      createdAt: '2026-01-12T08:00:00.000Z',
      updatedAt: '2026-02-14T08:00:00.000Z',
    },
    {
      id: 'user-worker-8',
      phoneNumber: '9811122244',
      phoneVerified: true,
      email: 'manish.sahu@example.com',
      fullName: 'Manish Sahu',
      avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-28T08:00:00.000Z',
      updatedAt: '2026-02-12T08:00:00.000Z',
    },
    {
      id: 'user-worker-9',
      phoneNumber: '9872233445',
      phoneVerified: true,
      email: 'satnam.singh@example.com',
      fullName: 'Satnam Singh',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-19T08:00:00.000Z',
      updatedAt: '2026-02-11T08:00:00.000Z',
    },
    {
      id: 'user-worker-10',
      phoneNumber: '9891122334',
      phoneVerified: true,
      email: 'sunita.devi@example.com',
      fullName: 'Sunita Devi',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-24T08:00:00.000Z',
      updatedAt: '2026-02-16T08:00:00.000Z',
    },
    {
      id: 'user-worker-11',
      phoneNumber: '9811223301',
      phoneVerified: true,
      email: 'harish.panchal@example.com',
      fullName: 'Harish Panchal',
      avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-20T08:00:00.000Z',
      updatedAt: '2026-02-10T08:00:00.000Z',
    },
    {
      id: 'user-worker-12',
      phoneNumber: '9811223302',
      phoneVerified: true,
      email: 'bablu.kumar@example.com',
      fullName: 'Bablu Kumar',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-22T08:00:00.000Z',
      updatedAt: '2026-02-12T08:00:00.000Z',
    },
    {
      id: 'user-worker-13',
      phoneNumber: '9811223303',
      phoneVerified: true,
      email: 'aslam.khan@example.com',
      fullName: 'Aslam Khan',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-23T08:00:00.000Z',
      updatedAt: '2026-02-13T08:00:00.000Z',
    },
    {
      id: 'user-worker-14',
      phoneNumber: '9811223304',
      phoneVerified: true,
      email: 'vikram.chauhan@example.com',
      fullName: 'Vikram Chauhan',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-18T08:00:00.000Z',
      updatedAt: '2026-02-14T08:00:00.000Z',
    },
    {
      id: 'user-worker-15',
      phoneNumber: '9811223305',
      phoneVerified: true,
      email: 'mahendra.rawat@example.com',
      fullName: 'Chef Mahendra Rawat',
      avatarUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-19T08:00:00.000Z',
      updatedAt: '2026-02-15T08:00:00.000Z',
    },
    {
      id: 'user-worker-16',
      phoneNumber: '9811223306',
      phoneVerified: true,
      email: 'amit.joshi@example.com',
      fullName: 'Amit Joshi',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      language: 'en',
      roles: ['WORKER'],
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-02-11T08:00:00.000Z',
    },
    {
      id: 'user-worker-17',
      phoneNumber: '9811223307',
      phoneVerified: true,
      email: 'preeti.nair@example.com',
      fullName: 'Sister Preeti Nair',
      avatarUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop&q=80',
      language: 'en',
      roles: ['WORKER'],
      createdAt: '2026-01-16T08:00:00.000Z',
      updatedAt: '2026-02-12T08:00:00.000Z',
    },
    {
      id: 'user-worker-18',
      phoneNumber: '9811223308',
      phoneVerified: true,
      email: 'pooja.sharma@example.com',
      fullName: 'Pooja Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-17T08:00:00.000Z',
      updatedAt: '2026-02-13T08:00:00.000Z',
    },
    {
      id: 'user-worker-19',
      phoneNumber: '9811223309',
      phoneVerified: true,
      email: 'alok.srivastava@example.com',
      fullName: 'Prof. Alok Srivastava',
      avatarUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&auto=format&fit=crop&q=80',
      language: 'en',
      roles: ['WORKER'],
      createdAt: '2026-01-14T08:00:00.000Z',
      updatedAt: '2026-02-10T08:00:00.000Z',
    },
    {
      id: 'user-worker-20',
      phoneNumber: '9811223310',
      phoneVerified: true,
      email: 'sonu.pal@example.com',
      fullName: 'Sonu Pal',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-21T08:00:00.000Z',
      updatedAt: '2026-02-14T08:00:00.000Z',
    },
    {
      id: 'user-worker-21',
      phoneNumber: '9811223311',
      phoneVerified: true,
      email: 'mohammad.tariq@example.com',
      fullName: 'Mohammad Tariq',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-22T08:00:00.000Z',
      updatedAt: '2026-02-15T08:00:00.000Z',
    },
    {
      id: 'user-worker-22',
      phoneNumber: '9811223312',
      phoneVerified: true,
      email: 'geeta.kumari@example.com',
      fullName: 'Geeta Kumari',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-23T08:00:00.000Z',
      updatedAt: '2026-02-16T08:00:00.000Z',
    },
    {
      id: 'user-worker-23',
      phoneNumber: '9811223313',
      phoneVerified: true,
      email: 'rohit.malhotra@example.com',
      fullName: 'Rohit Malhotra',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-24T08:00:00.000Z',
      updatedAt: '2026-02-17T08:00:00.000Z',
    },
    {
      id: 'user-worker-24',
      phoneNumber: '9811223314',
      phoneVerified: true,
      email: 'ramu.mali@example.com',
      fullName: 'Ramu Mali',
      avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-25T08:00:00.000Z',
      updatedAt: '2026-02-18T08:00:00.000Z',
    },
    {
      id: 'user-worker-25',
      phoneNumber: '9811223315',
      phoneVerified: true,
      email: 'ram.prasad@example.com',
      fullName: 'Ram Prasad',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      language: 'hi',
      roles: ['WORKER'],
      createdAt: '2026-01-26T08:00:00.000Z',
      updatedAt: '2026-02-19T08:00:00.000Z',
    },
    {
      id: 'user-customer-1',
      phoneNumber: '9911223344',
      phoneVerified: true,
      email: 'ananya.deshmukh@example.com',
      fullName: 'Ananya Deshmukh',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      language: 'en',
      roles: ['CUSTOMER'],
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-02-01T10:00:00.000Z',
    },
    {
      id: 'user-contractor-1',
      phoneNumber: '9811002233',
      phoneVerified: true,
      email: 'vikram.singh@infraprojects.in',
      fullName: 'Vikram Singh',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
      language: 'en',
      roles: ['CONTRACTOR', 'TENDER_OWNER'],
      createdAt: '2026-01-05T09:00:00.000Z',
      updatedAt: '2026-01-05T09:00:00.000Z',
    },
    {
      id: 'user-admin-1',
      phoneNumber: '9999999999',
      phoneVerified: true,
      email: 'admin@kaamsetu.in',
      fullName: 'KaamSetu Operations Administrator',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      language: 'en',
      roles: ['ADMIN', 'SUPER_ADMIN'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  // Worker Profiles
  const workerProfiles: WorkerProfile[] = [
    {
      id: 'worker-prof-1',
      userId: 'user-worker-1',
      headline: 'Certified ITI Senior Industrial & Domestic Electrician',
      bio: 'Over 8 years experience in commercial complexes, residential 3-phase wiring, inverter installation, and DB dressing in South Delhi & Noida.',
      yearsExperience: 8,
      hourlyRate: 350,
      dailyRate: 900,
      contractRate: 5000,
      toolsAvailable: ['Digital Multimeter', 'Drill Machine', 'Heavy Insulation Pliers', 'Conduit Bender', 'Wire Strippers'],
      qualification: 'ITI Electrical Certificate - Delhi ITI Pusa',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.9,
      ratingCount: 84,
      completedJobsCount: 112,
      state: 'Delhi',
      city: 'Delhi',
      district: 'South Delhi',
      pincode: '110020',
      locality: 'Okhla Phase 3',
      address: 'Plot 42, Pocket B, Okhla Industrial Area',
      latitude: 28.5355,
      longitude: 77.2600,
      preferredRadiusKm: 20,
      upiId: 'ramesh.sharma@okaxis',
      bankAccountNumber: 'XXXXXX4829',
      bankIfsc: 'UTIB0000123',
      bankAccountName: 'Ramesh Sharma',
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-02-15T08:00:00.000Z',
      skills: [
        {
          id: 'ws-1',
          workerProfileId: 'worker-prof-1',
          categoryId: 'cat-electrician',
          categoryName: 'Electrician',
          experienceYears: 8,
          isPrimary: true,
        },
      ],
      documents: [
        {
          id: 'doc-1',
          workerProfileId: 'worker-prof-1',
          docType: 'AADHAAR',
          docNumber: 'XXXX-XXXX-9124',
          fileUrl: '/uploads/documents/aadhaar_verified.jpg',
          status: 'VERIFIED',
          uploadedAt: '2026-01-15T08:30:00.000Z',
          reviewedAt: '2026-01-16T10:00:00.000Z',
        },
      ],
    },
    {
      id: 'worker-prof-2',
      userId: 'user-worker-2',
      headline: 'Master Plumber & Water Pump Specialist',
      bio: 'Expert in CPVC/UPVC concealed pipe fittings, grohe/jaquar bathroom installations, motor repair, and overhead tank pipelines.',
      yearsExperience: 6,
      hourlyRate: 300,
      dailyRate: 850,
      contractRate: 4000,
      toolsAvailable: ['Pipe Threader', 'Plumbing Wrench Set', 'Pressure Testing Pump', 'Core Drill'],
      qualification: 'Govt Technical Training Diploma in Sanitary Works',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.8,
      ratingCount: 62,
      completedJobsCount: 89,
      state: 'Uttar Pradesh',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      pincode: '201301',
      locality: 'Sector 18',
      address: 'Shop 14, Atta Market, Sector 18',
      latitude: 28.5700,
      longitude: 77.3200,
      preferredRadiusKm: 15,
      upiId: 'murtaza.plumber@paytm',
      bankAccountNumber: 'XXXXXX5912',
      bankIfsc: 'PYTM0123456',
      bankAccountName: 'Murtaza Ali',
      createdAt: '2026-01-18T09:30:00.000Z',
      updatedAt: '2026-02-14T09:30:00.000Z',
      skills: [
        {
          id: 'ws-2',
          workerProfileId: 'worker-prof-2',
          categoryId: 'cat-plumber',
          categoryName: 'Plumber',
          experienceYears: 6,
          isPrimary: true,
        },
      ],
    },
    {
      id: 'worker-prof-3',
      userId: 'user-worker-3',
      headline: 'Senior Mason & Construction Team Leader (20+ Labourers)',
      bio: 'Head mason and crew lead. Specializing in high-precision structural masonry, plastering, tile flooring, and boundary wall projects across NCR.',
      yearsExperience: 12,
      hourlyRate: 400,
      dailyRate: 1100,
      contractRate: 12000,
      toolsAvailable: ['Spirit Level', 'Laser Level', 'Tile Cutter', 'Concrete Vibrator', 'Trowels'],
      qualification: 'Senior Mason Trade Certification',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: false,
      emergencyAvailable: false,
      ratingAvg: 4.9,
      ratingCount: 110,
      completedJobsCount: 145,
      state: 'Haryana',
      city: 'Gurugram',
      district: 'Gurugram',
      pincode: '122001',
      locality: 'Sector 14',
      address: 'Old Delhi Gurgaon Road, Near Bus Stand',
      latitude: 28.4700,
      longitude: 77.0300,
      preferredRadiusKm: 30,
      upiId: 'satish.mason@oksbi',
      bankAccountNumber: 'XXXXXX3341',
      bankIfsc: 'SBIN0001234',
      bankAccountName: 'Satish Kumar',
      createdAt: '2026-01-10T11:00:00.000Z',
      updatedAt: '2026-02-12T11:00:00.000Z',
      skills: [
        {
          id: 'ws-3',
          workerProfileId: 'worker-prof-3',
          categoryId: 'cat-mason',
          categoryName: 'Mason',
          experienceYears: 12,
          isPrimary: true,
        },
      ],
    },
    {
      id: 'worker-prof-4',
      userId: 'user-worker-4',
      headline: 'HVAC Split AC Specialist & Appliance Technician',
      bio: 'Trained technician for Daikin, Voltas, LG, and Blue Star ACs. Gas charging (R32/R410), PCB board repair, jet chemical wash.',
      yearsExperience: 5,
      hourlyRate: 350,
      dailyRate: 900,
      contractRate: 3500,
      toolsAvailable: ['Vacuum Pump', 'Manifold Gauge Set', 'Flaring Tool', 'High Pressure Jet Pump'],
      qualification: 'RAC Technician Certificate',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.7,
      ratingCount: 48,
      completedJobsCount: 71,
      state: 'Delhi',
      city: 'Delhi',
      district: 'South West Delhi',
      pincode: '110075',
      locality: 'Dwarka Sector 10',
      address: 'Pocket 2, Dwarka Sector 10',
      latitude: 28.5800,
      longitude: 77.0600,
      preferredRadiusKm: 18,
      upiId: 'dinesh.yadav@ybl',
      bankAccountNumber: 'XXXXXX8812',
      bankIfsc: 'YESB0000045',
      bankAccountName: 'Dinesh Yadav',
      createdAt: '2026-01-22T08:00:00.000Z',
      updatedAt: '2026-02-11T08:00:00.000Z',
      skills: [
        {
          id: 'ws-4',
          workerProfileId: 'worker-prof-4',
          categoryId: 'cat-ac-tech',
          categoryName: 'AC & Appliance Technician',
          experienceYears: 5,
          isPrimary: true,
        },
      ],
    },
    {
      id: 'worker-prof-5',
      userId: 'user-worker-5',
      headline: 'NISE Suryamitra Certified Rooftop Solar & Hybrid Inverter Engineer',
      bio: 'Expert in rooftop solar panel installations (3kW to 50kW), net metering, microinverters, and high-efficiency lithium battery setups across Delhi NCR.',
      yearsExperience: 7,
      hourlyRate: 500,
      dailyRate: 1400,
      contractRate: 15000,
      toolsAvailable: ['DC Clamp Meter', 'Solar Crimping Tool', 'MC4 Connector Spanner', 'Angle Inclinometer'],
      qualification: 'NISE Suryamitra Certified Solar PV Installer',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.9,
      ratingCount: 56,
      completedJobsCount: 78,
      state: 'Uttar Pradesh',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      pincode: '201309',
      locality: 'Sector 62',
      address: 'Institutional Area, Sector 62',
      latitude: 28.6200,
      longitude: 77.3600,
      preferredRadiusKm: 25,
      upiId: 'arjun.solar@oksbi',
      bankAccountNumber: 'XXXXXX9921',
      bankIfsc: 'SBIN0004567',
      bankAccountName: 'Arjun Verma',
      createdAt: '2026-01-25T08:00:00.000Z',
      updatedAt: '2026-02-15T08:00:00.000Z',
      skills: [
        {
          id: 'ws-5',
          workerProfileId: 'worker-prof-5',
          categoryId: 'cat-solar-tech',
          categoryName: 'Solar & Inverter Engineer',
          experienceYears: 7,
          isPrimary: true,
        },
      ],
    },
    {
      id: 'worker-prof-6',
      userId: 'user-worker-6',
      headline: 'Certified Heavy Excavator & JCB 3DX Backhoe Operator',
      bio: 'Over 10 years experience operating JCB 3DX, Tata Hitachi tracked excavators, and hydra cranes on high-rise foundation and trenching projects.',
      yearsExperience: 10,
      hourlyRate: 500,
      dailyRate: 1500,
      contractRate: 25000,
      toolsAvailable: ['Heavy Machine Diagnostic Scanner', 'Laser Level Receiver', 'Hydraulic Pressure Kit'],
      qualification: 'Heavy Commercial & Earthmoving Operator Licence',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      ratingAvg: 4.8,
      ratingCount: 74,
      completedJobsCount: 92,
      state: 'Haryana',
      city: 'Gurugram',
      district: 'Gurugram',
      pincode: '122051',
      locality: 'IMT Manesar',
      address: 'Plot 88, Sector 8, IMT Manesar',
      latitude: 28.3600,
      longitude: 76.9200,
      preferredRadiusKm: 35,
      upiId: 'gurpreet.jcb@okaxis',
      bankAccountNumber: 'XXXXXX3311',
      bankIfsc: 'UTIB0002233',
      bankAccountName: 'Gurpreet Singh',
      createdAt: '2026-01-20T08:00:00.000Z',
      updatedAt: '2026-02-10T08:00:00.000Z',
      skills: [
        {
          id: 'ws-6',
          workerProfileId: 'worker-prof-6',
          categoryId: 'cat-heavy-machinery',
          categoryName: 'Heavy Machinery & JCB Operator',
          experienceYears: 10,
          isPrimary: true,
        },
      ],
    },
    {
      id: 'worker-prof-7',
      userId: 'user-worker-7',
      headline: 'Senior Civil Site Engineer & Structural Quality Supervisor',
      bio: 'B.Tech Civil Engineer with 9 years site experience in structural QA/QC, RCC concrete casting, BBS reinforcement checking, and sub-contractor billing.',
      yearsExperience: 9,
      hourlyRate: 600,
      dailyRate: 1800,
      contractRate: 35000,
      toolsAvailable: ['Auto Level', 'Rebound Concrete Hammer', 'Digital Vernier Caliper', 'Slump Cone'],
      qualification: 'B.Tech Civil Engineering - Jamia Millia Islamia',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: false,
      emergencyAvailable: false,
      ratingAvg: 5.0,
      ratingCount: 42,
      completedJobsCount: 58,
      state: 'Delhi',
      city: 'Delhi',
      district: 'South Delhi',
      pincode: '110024',
      locality: 'Lajpat Nagar',
      address: 'Ring Road, Lajpat Nagar 4',
      latitude: 28.5680,
      longitude: 77.2430,
      preferredRadiusKm: 25,
      upiId: 'deepak.civil@icici',
      bankAccountNumber: 'XXXXXX5522',
      bankIfsc: 'ICIC0000104',
      bankAccountName: 'Deepak Rawat',
      createdAt: '2026-01-12T08:00:00.000Z',
      updatedAt: '2026-02-14T08:00:00.000Z',
      skills: [
        {
          id: 'ws-7',
          workerProfileId: 'worker-prof-7',
          categoryId: 'cat-civil-engineer',
          categoryName: 'Civil Site Engineer & Supervisor',
          experienceYears: 9,
          isPrimary: true,
        },
      ],
    },
    {
      id: 'worker-prof-8',
      userId: 'user-worker-8',
      headline: 'Master Italian Marble & Vitrified Floor Tile Setter',
      bio: 'Specialist in seamless laser-cut tile laying, Italian marble bookmatching, diamond disc polishing, and epoxy stain-resistant grouting.',
      yearsExperience: 8,
      hourlyRate: 400,
      dailyRate: 1100,
      contractRate: 8000,
      toolsAvailable: ['Diamond Marble Cutter', 'Suction Cup Vibrator', 'Tile Leveling Spacers', 'Angle Grinder'],
      qualification: 'CSDC Skilled Tiling Trade Card',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      ratingAvg: 4.9,
      ratingCount: 68,
      completedJobsCount: 88,
      state: 'Uttar Pradesh',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      pincode: '201301',
      locality: 'Sector 76',
      address: 'Amrapali Silicon City, Sector 76',
      latitude: 28.5600,
      longitude: 77.3800,
      preferredRadiusKm: 20,
      upiId: 'manish.tiles@paytm',
      bankAccountNumber: 'XXXXXX7741',
      bankIfsc: 'PYTM0123456',
      bankAccountName: 'Manish Sahu',
      createdAt: '2026-01-28T08:00:00.000Z',
      updatedAt: '2026-02-12T08:00:00.000Z',
      skills: [
        {
          id: 'ws-8',
          workerProfileId: 'worker-prof-8',
          categoryId: 'cat-tiles-stone',
          categoryName: 'Tiles, Marble & Granite Specialist',
          experienceYears: 8,
          isPrimary: true,
        },
      ],
    },
    {
      id: 'worker-prof-9',
      userId: 'user-worker-9',
      headline: 'Verified Commercial Chauffeur & Logistics Fleet Driver',
      bio: 'Clean driving record of 11 years. Verified police clearance, well-versed with Delhi NCR highways, automatic/manual luxury cars, and heavy commercial vehicles.',
      yearsExperience: 11,
      hourlyRate: 250,
      dailyRate: 850,
      contractRate: 18000,
      toolsAvailable: ['Commercial Transport Badge', 'Emergency Puncture Kit', 'Navigation Smartphone'],
      qualification: 'Commercial Transport Driving Licence (RTO Delhi)',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.9,
      ratingCount: 95,
      completedJobsCount: 130,
      state: 'Delhi',
      city: 'Delhi',
      district: 'South West Delhi',
      pincode: '110037',
      locality: 'Mahipalpur',
      address: 'NH-48, Mahipalpur Extension',
      latitude: 28.5400,
      longitude: 77.1200,
      preferredRadiusKm: 30,
      upiId: 'satnam.driver@okhdfcbank',
      bankAccountNumber: 'XXXXXX6621',
      bankIfsc: 'HDFC0000240',
      bankAccountName: 'Satnam Singh',
      createdAt: '2026-01-19T08:00:00.000Z',
      updatedAt: '2026-02-11T08:00:00.000Z',
      skills: [
        {
          id: 'ws-9',
          workerProfileId: 'worker-prof-9',
          categoryId: 'cat-driver',
          categoryName: 'Commercial Driver & Chauffeur',
          experienceYears: 11,
          isPrimary: true,
        },
      ],
    },
    {
      id: 'worker-prof-10',
      userId: 'user-worker-10',
      headline: 'Professional Deep Cleaning & Sanitization Specialist',
      bio: 'Trained professional for home deep scrubbing, sofa foam extraction, modular kitchen grease removal, and corporate office carpet sanitization.',
      yearsExperience: 6,
      hourlyRate: 250,
      dailyRate: 750,
      contractRate: 4500,
      toolsAvailable: ['Industrial Floor Scrubber', 'Wet/Dry Extraction Vacuum', 'Steam Cleaner Machine'],
      qualification: 'Hospitality & Housekeeping Standards Training',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.8,
      ratingCount: 51,
      completedJobsCount: 72,
      state: 'Haryana',
      city: 'Gurugram',
      district: 'Gurugram',
      pincode: '122002',
      locality: 'Sector 43',
      address: 'Golf Course Road, Sector 43',
      latitude: 28.4550,
      longitude: 77.0900,
      preferredRadiusKm: 20,
      upiId: 'sunita.cleaning@oksbi',
      bankAccountNumber: 'XXXXXX4488',
      bankIfsc: 'SBIN0000845',
      bankAccountName: 'Sunita Devi',
      createdAt: '2026-01-24T08:00:00.000Z',
      updatedAt: '2026-02-16T08:00:00.000Z',
      skills: [
        {
          id: 'ws-10',
          workerProfileId: 'worker-prof-10',
          categoryId: 'cat-housekeeping',
          categoryName: 'Deep Cleaning & Housekeeping',
          experienceYears: 6,
          isPrimary: true,
        },
      ],
    },
    {
      id: 'worker-prof-11',
      userId: 'user-worker-11',
      headline: 'Master Modular Furniture & Door Lock Carpenter',
      bio: 'Expert in custom wardrobes, modular kitchen cabinets, godrej door locks, hydraulic double beds, and teak wood restoration.',
      yearsExperience: 8,
      hourlyRate: 350,
      dailyRate: 1000,
      contractRate: 12000,
      toolsAvailable: ['Circular Saw', 'Wood Planer', 'Chisel Set', 'Cordless Impact Driver'],
      qualification: 'FFSC Certified Carpenter',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.9,
      ratingCount: 64,
      completedJobsCount: 88,
      state: 'Uttar Pradesh',
      city: 'Ghaziabad',
      district: 'Ghaziabad',
      pincode: '201014',
      locality: 'Indirapuram',
      address: 'Near Shipra Mall, Indirapuram',
      latitude: 28.6380,
      longitude: 77.3710,
      preferredRadiusKm: 20,
      upiId: 'harish.carpenter@okaxis',
      bankAccountNumber: 'XXXXXX1101',
      bankIfsc: 'UTIB0001101',
      bankAccountName: 'Harish Panchal',
      createdAt: '2026-01-20T08:00:00.000Z',
      updatedAt: '2026-02-10T08:00:00.000Z',
      skills: [{ id: 'ws-11', workerProfileId: 'worker-prof-11', categoryId: 'cat-carpenters', categoryName: 'Carpenters', experienceYears: 8, isPrimary: true }],
    },
    {
      id: 'worker-prof-12',
      userId: 'user-worker-12',
      headline: 'Professional Interior Wall Putty & Texture Painter',
      bio: 'Experienced painter specializing in Asian Paints Royal Luxury emulsion, anti-damp treatment, exterior weathercoat, and living room texture walls.',
      yearsExperience: 6,
      hourlyRate: 300,
      dailyRate: 850,
      contractRate: 8500,
      toolsAvailable: ['Airless Paint Sprayer', 'Putty Knives', 'Sanding Machine', 'Drop Sheets'],
      qualification: 'PCSC Certified Painting Professional',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.8,
      ratingCount: 52,
      completedJobsCount: 76,
      state: 'Uttar Pradesh',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      pincode: '201309',
      locality: 'Sector 62',
      address: 'C-Block, Sector 62',
      latitude: 28.6250,
      longitude: 77.3620,
      preferredRadiusKm: 25,
      upiId: 'bablu.painter@paytm',
      bankAccountNumber: 'XXXXXX1102',
      bankIfsc: 'PYTM0123456',
      bankAccountName: 'Bablu Kumar',
      createdAt: '2026-01-22T08:00:00.000Z',
      updatedAt: '2026-02-12T08:00:00.000Z',
      skills: [{ id: 'ws-12', workerProfileId: 'worker-prof-12', categoryId: 'cat-painters', categoryName: 'Painters', experienceYears: 6, isPrimary: true }],
    },
    {
      id: 'worker-prof-13',
      userId: 'user-worker-13',
      headline: 'Certified ARC & MIG Welder for Gates, Grills & Sheds',
      bio: 'Over 9 years experience in residential main gates, balcony safety grills, tin shed fabrication, staircase railings, and emergency spot repairs.',
      yearsExperience: 9,
      hourlyRate: 400,
      dailyRate: 1150,
      contractRate: 14000,
      toolsAvailable: ['Inverter ARC Welding Machine', 'Angle Grinder', 'Welding Mask', 'Chipping Hammer'],
      qualification: 'ITI Welder Trade (NCVT)',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.9,
      ratingCount: 71,
      completedJobsCount: 94,
      state: 'Delhi',
      city: 'Delhi',
      district: 'South Delhi',
      pincode: '110020',
      locality: 'Okhla Industrial Area',
      address: 'Phase 2, Okhla',
      latitude: 28.5310,
      longitude: 77.2720,
      preferredRadiusKm: 25,
      upiId: 'aslam.welder@oksbi',
      bankAccountNumber: 'XXXXXX1103',
      bankIfsc: 'SBIN0001103',
      bankAccountName: 'Aslam Khan',
      createdAt: '2026-01-23T08:00:00.000Z',
      updatedAt: '2026-02-13T08:00:00.000Z',
      skills: [{ id: 'ws-13', workerProfileId: 'worker-prof-13', categoryId: 'cat-welders', categoryName: 'Welders', experienceYears: 9, isPrimary: true }],
    },
    {
      id: 'worker-prof-14',
      userId: 'user-worker-14',
      headline: 'Automobile Breakdown & Multi-Brand Car Mechanic',
      bio: 'On-site vehicle diagnostics, brake repairs, battery jump-starts, suspension greasing, and periodic engine oil servicing across Delhi NCR.',
      yearsExperience: 10,
      hourlyRate: 350,
      dailyRate: 1100,
      contractRate: 10000,
      toolsAvailable: ['OBD2 Scanner', 'Hydraulic Floor Jack', 'Torque Wrench', 'Jump Cables'],
      qualification: 'ASDC Certified Auto Mechanic',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.8,
      ratingCount: 88,
      completedJobsCount: 115,
      state: 'Delhi',
      city: 'Delhi',
      district: 'West Delhi',
      pincode: '110064',
      locality: 'Mayapuri',
      address: 'Phase 1, Mayapuri Industrial Area',
      latitude: 28.6320,
      longitude: 77.1190,
      preferredRadiusKm: 30,
      upiId: 'vikram.mechanic@ybl',
      bankAccountNumber: 'XXXXXX1104',
      bankIfsc: 'YESB0001104',
      bankAccountName: 'Vikram Chauhan',
      createdAt: '2026-01-18T08:00:00.000Z',
      updatedAt: '2026-02-14T08:00:00.000Z',
      skills: [{ id: 'ws-14', workerProfileId: 'worker-prof-14', categoryId: 'cat-mechanics', categoryName: 'Mechanics', experienceYears: 10, isPrimary: true }],
    },
    {
      id: 'worker-prof-15',
      userId: 'user-worker-15',
      headline: 'Executive Multi-Cuisine Chef for Private Parties & Events',
      bio: 'Master chef with 12 years hotel and private dining experience. Specializing in North Indian, Mughlai, Chinese, and festive wedding catering.',
      yearsExperience: 12,
      hourlyRate: 400,
      dailyRate: 1200,
      contractRate: 15000,
      toolsAvailable: ['Chef Knives Kit', 'Culinary Thermometer', 'Hygiene Kit', 'Chef Uniform'],
      qualification: 'Diploma in Food Production & Culinary Arts',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      ratingAvg: 5.0,
      ratingCount: 65,
      completedJobsCount: 84,
      state: 'Delhi',
      city: 'Delhi',
      district: 'South Delhi',
      pincode: '110048',
      locality: 'Greater Kailash',
      address: 'GK-1 M-Block',
      latitude: 28.5520,
      longitude: 77.2390,
      preferredRadiusKm: 25,
      upiId: 'mahendra.chef@okhdfcbank',
      bankAccountNumber: 'XXXXXX1105',
      bankIfsc: 'HDFC0001105',
      bankAccountName: 'Chef Mahendra Rawat',
      createdAt: '2026-01-19T08:00:00.000Z',
      updatedAt: '2026-02-15T08:00:00.000Z',
      skills: [{ id: 'ws-15', workerProfileId: 'worker-prof-15', categoryId: 'cat-cooks', categoryName: 'Cooks', experienceYears: 12, isPrimary: true }],
    },
    {
      id: 'worker-prof-16',
      userId: 'user-worker-16',
      headline: 'Certified IT Hardware, Laptop & Wi-Fi Network Engineer',
      bio: 'Computer engineer providing on-site laptop/desktop repair, SSD speed upgrades, Wi-Fi mesh routing, Cat6 network cabling, and data recovery.',
      yearsExperience: 6,
      hourlyRate: 500,
      dailyRate: 1500,
      contractRate: 18000,
      toolsAvailable: ['Anti-Static Precision Toolkit', 'RJ45 Crimper & Cable Tester', 'NVMe Enclosure'],
      qualification: 'CompTIA A+ & Cisco CCNA Certified',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.9,
      ratingCount: 58,
      completedJobsCount: 79,
      state: 'Haryana',
      city: 'Gurugram',
      district: 'Gurugram',
      pincode: '122002',
      locality: 'Cyber City',
      address: 'DLF Phase 2, Cyber City',
      latitude: 28.4910,
      longitude: 77.0890,
      preferredRadiusKm: 25,
      upiId: 'amit.it@okicici',
      bankAccountNumber: 'XXXXXX1106',
      bankIfsc: 'ICIC0001106',
      bankAccountName: 'Amit Joshi',
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-02-11T08:00:00.000Z',
      skills: [{ id: 'ws-16', workerProfileId: 'worker-prof-16', categoryId: 'cat-it-professionals', categoryName: 'IT Professionals', experienceYears: 6, isPrimary: true }],
    },
    {
      id: 'worker-prof-17',
      userId: 'user-worker-17',
      headline: 'Certified GDA Nursing Attendant & Home Elder Care Nurse',
      bio: 'Compassionate medical care attendant for post-surgery patients and elderly bedridden individuals. Trained in vitals monitoring, dressings, and IV lines.',
      yearsExperience: 8,
      hourlyRate: 350,
      dailyRate: 1200,
      contractRate: 28000,
      toolsAvailable: ['Digital BP Monitor', 'Pulse Oximeter', 'Glucometer', 'Sterile Dressing Kit'],
      qualification: 'GNM Nursing Diploma & GDA Healthcare Council',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 5.0,
      ratingCount: 78,
      completedJobsCount: 96,
      state: 'Uttar Pradesh',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      pincode: '201301',
      locality: 'Sector 50',
      address: 'Block B, Sector 50',
      latitude: 28.5720,
      longitude: 77.3680,
      preferredRadiusKm: 20,
      upiId: 'preeti.nurse@oksbi',
      bankAccountNumber: 'XXXXXX1107',
      bankIfsc: 'SBIN0001107',
      bankAccountName: 'Sister Preeti Nair',
      createdAt: '2026-01-16T08:00:00.000Z',
      updatedAt: '2026-02-12T08:00:00.000Z',
      skills: [{ id: 'ws-17', workerProfileId: 'worker-prof-17', categoryId: 'cat-healthcare-workers', categoryName: 'Healthcare Workers', experienceYears: 8, isPrimary: true }],
    },
    {
      id: 'worker-prof-18',
      userId: 'user-worker-18',
      headline: 'Salon-at-Home Specialist & Professional Bridal Beautician',
      bio: 'Certified aesthetician using single-use hygiene kits for O3+ diamond facials, Rica waxing, pedicure/manicure, and bridal makeup.',
      yearsExperience: 7,
      hourlyRate: 350,
      dailyRate: 1200,
      contractRate: 15000,
      toolsAvailable: ['Wax Heater Unit', 'Facial High-Frequency Wand', 'Single-Use Disposable Linens'],
      qualification: 'B&WSSC Certified Beauty Professional',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      ratingAvg: 4.9,
      ratingCount: 92,
      completedJobsCount: 120,
      state: 'Delhi',
      city: 'Delhi',
      district: 'South Delhi',
      pincode: '110049',
      locality: 'South Extension',
      address: 'Part 2, South Extension',
      latitude: 28.5700,
      longitude: 77.2200,
      preferredRadiusKm: 20,
      upiId: 'pooja.beauty@okaxis',
      bankAccountNumber: 'XXXXXX1108',
      bankIfsc: 'UTIB0001108',
      bankAccountName: 'Pooja Sharma',
      createdAt: '2026-01-17T08:00:00.000Z',
      updatedAt: '2026-02-13T08:00:00.000Z',
      skills: [{ id: 'ws-18', workerProfileId: 'worker-prof-18', categoryId: 'cat-beauty-professionals', categoryName: 'Beauty Professionals', experienceYears: 7, isPrimary: true }],
    },
    {
      id: 'worker-prof-19',
      userId: 'user-worker-19',
      headline: 'Senior Mathematics & Physics Home Tutor (Class 9-12)',
      bio: 'Postgraduate educator with 10 years experience helping students achieve 95%+ in CBSE/ICSE board examinations through intuitive concept building.',
      yearsExperience: 10,
      hourlyRate: 400,
      dailyRate: 1200,
      contractRate: 16000,
      toolsAvailable: ['Digital Stylus Tablet', 'Exemplar Practice Papers', 'Curated Notes'],
      qualification: 'M.Sc. Mathematics & B.Ed',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      ratingAvg: 5.0,
      ratingCount: 46,
      completedJobsCount: 62,
      state: 'Delhi',
      city: 'Delhi',
      district: 'Central Delhi',
      pincode: '110005',
      locality: 'Karol Bagh',
      address: 'Pusa Road, Karol Bagh',
      latitude: 28.6510,
      longitude: 77.1900,
      preferredRadiusKm: 20,
      upiId: 'alok.tutor@paytm',
      bankAccountNumber: 'XXXXXX1109',
      bankIfsc: 'PYTM0123456',
      bankAccountName: 'Prof. Alok Srivastava',
      createdAt: '2026-01-14T08:00:00.000Z',
      updatedAt: '2026-02-10T08:00:00.000Z',
      skills: [{ id: 'ws-19', workerProfileId: 'worker-prof-19', categoryId: 'cat-tutors', categoryName: 'Tutors', experienceYears: 10, isPrimary: true }],
    },
    {
      id: 'worker-prof-20',
      userId: 'user-worker-20',
      headline: 'Warehouse Logistics Associate & Pallet BOPT Operator',
      bio: 'Skilled in high-speed eCommerce packing, barcode scanner operations, shrink wrapping pallets, and container unloading.',
      yearsExperience: 5,
      hourlyRate: 200,
      dailyRate: 700,
      contractRate: 14000,
      toolsAvailable: ['Hand Stretch Film Dispenser', 'Manual BOPT Truck', 'Barcode Scanner'],
      qualification: 'LSSC Logistics Sector Skill Card',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      ratingAvg: 4.8,
      ratingCount: 38,
      completedJobsCount: 54,
      state: 'Uttar Pradesh',
      city: 'Greater Noida',
      district: 'Gautam Buddha Nagar',
      pincode: '201306',
      locality: 'Dadri Logistics Park',
      address: 'Container Depot, Dadri',
      latitude: 28.5500,
      longitude: 77.5500,
      preferredRadiusKm: 30,
      upiId: 'sonu.warehouse@oksbi',
      bankAccountNumber: 'XXXXXX1110',
      bankIfsc: 'SBIN0001110',
      bankAccountName: 'Sonu Pal',
      createdAt: '2026-01-21T08:00:00.000Z',
      updatedAt: '2026-02-14T08:00:00.000Z',
      skills: [{ id: 'ws-20', workerProfileId: 'worker-prof-20', categoryId: 'cat-warehouse-workers', categoryName: 'Warehouse Workers', experienceYears: 5, isPrimary: true }],
    },
    {
      id: 'worker-prof-21',
      userId: 'user-worker-21',
      headline: 'Hyperlocal Courier & Express 2-Wheeler Delivery Pilot',
      bio: 'Verified on-demand delivery associate with EV two-wheeler, GPS smartphone, and insulated bag for parcels, medicines, and packages.',
      yearsExperience: 4,
      hourlyRate: 200,
      dailyRate: 700,
      contractRate: 14000,
      toolsAvailable: ['Smartphone with GPS', 'Thermal Delivery Bag', 'Power Bank'],
      qualification: 'Commercial Two-Wheeler Licence',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.8,
      ratingCount: 82,
      completedJobsCount: 140,
      state: 'Delhi',
      city: 'Delhi',
      district: 'Central Delhi',
      pincode: '110001',
      locality: 'Connaught Place',
      address: 'Barakhamba Road, CP',
      latitude: 28.6300,
      longitude: 77.2200,
      preferredRadiusKm: 25,
      upiId: 'tariq.delivery@okaxis',
      bankAccountNumber: 'XXXXXX1111',
      bankIfsc: 'UTIB0001111',
      bankAccountName: 'Mohammad Tariq',
      createdAt: '2026-01-22T08:00:00.000Z',
      updatedAt: '2026-02-15T08:00:00.000Z',
      skills: [{ id: 'ws-21', workerProfileId: 'worker-prof-21', categoryId: 'cat-delivery-workers', categoryName: 'Delivery Workers', experienceYears: 4, isPrimary: true }],
    },
    {
      id: 'worker-prof-22',
      userId: 'user-worker-22',
      headline: 'Punctual Domestic Housekeeping & Utensil Cleaning Aide',
      bio: 'Background-verified domestic assistant for daily sweeping, mopping, dusting, utensil washing, and kitchen pantry upkeep.',
      yearsExperience: 6,
      hourlyRate: 200,
      dailyRate: 700,
      contractRate: 6000,
      toolsAvailable: ['Microfiber Flat Mop', 'Surface Disinfectant Kit', 'Color Coded Towels'],
      qualification: 'Housekeeping Standards Certificate & Police Clearance',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.9,
      ratingCount: 73,
      completedJobsCount: 98,
      state: 'Uttar Pradesh',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      pincode: '201305',
      locality: 'Sector 78',
      address: 'Antriksh Golf View, Sector 78',
      latitude: 28.5680,
      longitude: 77.3890,
      preferredRadiusKm: 15,
      upiId: 'geeta.housekeeping@paytm',
      bankAccountNumber: 'XXXXXX1112',
      bankIfsc: 'PYTM0123456',
      bankAccountName: 'Geeta Kumari',
      createdAt: '2026-01-23T08:00:00.000Z',
      updatedAt: '2026-02-16T08:00:00.000Z',
      skills: [{ id: 'ws-22', workerProfileId: 'worker-prof-22', categoryId: 'cat-housekeeping', categoryName: 'Housekeeping', experienceYears: 6, isPrimary: true }],
    },
    {
      id: 'worker-prof-23',
      userId: 'user-worker-23',
      headline: 'Event Stage Trussing & Banquet Hospitality Lead',
      bio: 'Experienced live event crew lead for wedding stage trussing, German tent assembly, sound/light cabling, and banquet guest stewardship.',
      yearsExperience: 8,
      hourlyRate: 250,
      dailyRate: 850,
      contractRate: 15000,
      toolsAvailable: ['Rigging Clamps', 'Cable Protectors', 'High Tension Stapler Gun'],
      qualification: 'Event Management Operations Verification',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: true,
      ratingAvg: 4.9,
      ratingCount: 67,
      completedJobsCount: 89,
      state: 'Delhi',
      city: 'Delhi',
      district: 'South Delhi',
      pincode: '110074',
      locality: 'Chhatarpur Farms',
      address: 'Main Chhatarpur Road',
      latitude: 28.5020,
      longitude: 77.1850,
      preferredRadiusKm: 30,
      upiId: 'rohit.event@ybl',
      bankAccountNumber: 'XXXXXX1113',
      bankIfsc: 'YESB0001113',
      bankAccountName: 'Rohit Malhotra',
      createdAt: '2026-01-24T08:00:00.000Z',
      updatedAt: '2026-02-17T08:00:00.000Z',
      skills: [{ id: 'ws-23', workerProfileId: 'worker-prof-23', categoryId: 'cat-event-workers', categoryName: 'Event Workers', experienceYears: 8, isPrimary: true }],
    },
    {
      id: 'worker-prof-24',
      userId: 'user-worker-24',
      headline: 'Skilled Mali & Landscape Drip Irrigation Expert',
      bio: 'Specialist in lawn mowing, seasonal flower beds, bonsai care, vermicomposting, hedge trimming, and automated drip irrigation pipe layouts.',
      yearsExperience: 7,
      hourlyRate: 200,
      dailyRate: 700,
      contractRate: 8000,
      toolsAvailable: ['Lawn Mower', 'Hedge Trimmer', 'Pruning Shears', 'Garden Spade'],
      qualification: 'Horticulture Training Certificate',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      ratingAvg: 4.8,
      ratingCount: 59,
      completedJobsCount: 81,
      state: 'Delhi',
      city: 'Delhi',
      district: 'South West Delhi',
      pincode: '110057',
      locality: 'Vasant Vihar',
      address: 'Near Priya Cinema, Vasant Vihar',
      latitude: 28.5600,
      longitude: 77.1600,
      preferredRadiusKm: 25,
      upiId: 'ramu.mali@oksbi',
      bankAccountNumber: 'XXXXXX1114',
      bankIfsc: 'SBIN0001114',
      bankAccountName: 'Ramu Mali',
      createdAt: '2026-01-25T08:00:00.000Z',
      updatedAt: '2026-02-18T08:00:00.000Z',
      skills: [{ id: 'ws-24', workerProfileId: 'worker-prof-24', categoryId: 'cat-farm-workers', categoryName: 'Farm Workers', experienceYears: 7, isPrimary: true }],
    },
    {
      id: 'worker-prof-25',
      userId: 'user-worker-25',
      headline: 'Construction Site Helper & Material Shifting Lead',
      bio: 'Reliable and disciplined building site helper with experience in Red brick masonry assistance, cement sand mixing, and building material loading.',
      yearsExperience: 5,
      hourlyRate: 200,
      dailyRate: 650,
      contractRate: 12000,
      toolsAvailable: ['Hard Hat', 'Safety Shoes', 'High-Vis Vest', 'Spade & Pan'],
      qualification: 'BOCW Welfare Registered',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      isAvailableNow: true,
      emergencyAvailable: false,
      ratingAvg: 4.8,
      ratingCount: 55,
      completedJobsCount: 84,
      state: 'Uttar Pradesh',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      pincode: '201310',
      locality: 'Sector 150',
      address: 'Expressway Construction Zone',
      latitude: 28.4600,
      longitude: 77.4700,
      preferredRadiusKm: 25,
      upiId: 'ram.prasad@okaxis',
      bankAccountNumber: 'XXXXXX1115',
      bankIfsc: 'UTIB0001115',
      bankAccountName: 'Ram Prasad',
      createdAt: '2026-01-26T08:00:00.000Z',
      updatedAt: '2026-02-19T08:00:00.000Z',
      skills: [{ id: 'ws-25', workerProfileId: 'worker-prof-25', categoryId: 'cat-construction-workers', categoryName: 'Construction Workers', experienceYears: 5, isPrimary: true }],
    },
  ];

  // Customer Profile
  const customerProfiles: CustomerProfile[] = [
    {
      id: 'cust-prof-1',
      userId: 'user-customer-1',
      addressLine: 'Flat 402, Tower B, Lotus Boulevard, Sector 100',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201304',
      latitude: 28.5355,
      longitude: 77.3910,
      createdAt: '2026-02-01T10:00:00.000Z',
    },
  ];

  // Contractor Profile
  const contractorProfiles: ContractorProfile[] = [
    {
      id: 'cont-prof-1',
      userId: 'user-contractor-1',
      companyName: 'Apex Infra & Builders Pvt Ltd',
      gstin: '07AAACA1234B1Z5',
      panNumber: 'AAACA1234B',
      businessType: 'CIVIL_CONSTRUCTION',
      city: 'Noida',
      state: 'Uttar Pradesh',
      verification: 'VERIFIED',
      createdAt: '2026-01-05T09:00:00.000Z',
    },
  ];

  // Tenders
  const tenders: Tender[] = [
    {
      id: 'tender-1',
      contractorProfileId: 'cont-prof-1',
      categoryId: 'cat-mason',
      categoryName: 'Mason',
      title: 'Structural Masonry & Brickwork for Sector 150 Luxury Towers',
      projectName: 'Godrej Palm Retreat Phase 2',
      description: 'Requirement of 20 skilled masons and 30 construction helpers for brickwork, external cement plastering, and balcony flooring over 45 days.',
      locationAddress: 'Plot GH-01, Sector 150 Expressway',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201310',
      siteLatitude: 28.4500,
      siteLongitude: 77.4800,
      workerCountRequired: 20,
      skillsRequired: ['9-inch Brickwork', 'External Sand Plaster', 'Laser Levelling'],
      experienceRequired: 3,
      startDate: '2026-03-01T08:00:00.000Z',
      endDate: '2026-04-15T18:00:00.000Z',
      workingHours: '8 Hours (08:30 AM to 05:30 PM)',
      shifts: 'Day Shift',
      totalBudget: 990000,
      perWorkerRate: 1100,
      paymentTerms: 'Weekly muster-roll settlement with 10% advance upon site onboarding.',
      accommodationProvided: true,
      foodProvided: false,
      transportProvided: true,
      safetyRequirements: 'ISI Mark Hard Hats, Steel Toe Boots, Safety Harness mandatory on site.',
      applicationDeadline: '2026-02-28T23:59:59.000Z',
      status: 'PUBLISHED',
      applicationsCount: 4,
      createdAt: '2026-02-10T10:00:00.000Z',
    },
    {
      id: 'tender-2',
      contractorProfileId: 'cont-prof-1',
      categoryId: 'cat-electrician',
      categoryName: 'Electrician',
      title: 'Commercial Office Fitout Cable Tray & DB Installation',
      projectName: 'DLF CyberPark Block C Fitout',
      description: 'Requirement of 8 licensed industrial electricians for heavy cable pulling, distribution panel termination, and emergency UPS circuitry.',
      locationAddress: 'DLF CyberPark, 405 NH-8',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      siteLatitude: 28.4900,
      siteLongitude: 77.0900,
      workerCountRequired: 8,
      skillsRequired: ['LT Panel Termination', 'Cable Tray Fixing', 'Concealed Conduit'],
      experienceRequired: 4,
      startDate: '2026-03-05T09:00:00.000Z',
      endDate: '2026-03-25T19:00:00.000Z',
      workingHours: '9 Hours',
      shifts: 'Day Shift',
      totalBudget: 420000,
      perWorkerRate: 1050,
      paymentTerms: 'Bi-weekly direct bank transfer based on signed site engineer measurements.',
      accommodationProvided: false,
      foodProvided: true,
      transportProvided: false,
      safetyRequirements: '1000V rated insulated boots, gloves and electrical safety goggles.',
      applicationDeadline: '2026-03-01T18:00:00.000Z',
      status: 'PUBLISHED',
      applicationsCount: 2,
      createdAt: '2026-02-12T14:30:00.000Z',
    },
  ];

  // Tender Teams
  const tenderTeams: TenderTeam[] = [
    {
      id: 'team-1',
      name: 'Satish Kumar Masonry Brigade',
      leaderWorkerProfileId: 'worker-prof-3',
      leaderName: 'Satish Kumar',
      leaderPhone: '9899887766',
      primaryTrade: 'Masonry & Civil Works',
      description: 'Disciplined crew of 15 veteran masons and 10 helpers with experience on over 20 residential towers.',
      memberCount: 25,
      createdAt: '2026-01-15T12:00:00.000Z',
    },
  ];

  // Active Booking
  const bookings: Booking[] = [
    {
      id: 'book-active-1',
      customerProfileId: 'cust-prof-1',
      serviceCategory: 'Electrician',
      serviceDescription: 'MCB box sparks and main circuit tripping in kitchen and geyser line.',
      isUrgent: true,
      scheduledDate: new Date().toISOString(),
      estimatedHours: 2,
      estimatedAmount: 700,
      addressLine: 'Flat 402, Tower B, Lotus Boulevard, Sector 100',
      locality: 'Sector 100',
      city: 'Noida',
      pincode: '201304',
      customerLatitude: 28.5355,
      customerLongitude: 77.3910,
      status: 'WORKER_ON_THE_WAY',
      assignedWorkerProfileId: 'worker-prof-1',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ];

  // Booking Locations
  const bookingLocations: BookingLocation[] = [
    {
      id: 'loc-1',
      bookingId: 'book-active-1',
      workerProfileId: 'worker-prof-1',
      latitude: 28.5420,
      longitude: 77.3820,
      accuracyMeters: 12,
      heading: 110,
      speed: 28.5,
      recordedAt: new Date(Date.now() - 40 * 1000).toISOString(), // 40 seconds ago
    },
  ];

  // Payments
  const payments: Payment[] = [
    {
      id: 'pay-1',
      bookingId: 'book-active-1',
      provider: 'RAZORPAY',
      providerOrderId: 'order_KaamSetu_9921',
      amount: 700,
      currency: 'INR',
      status: 'AUTHORIZED',
      platformCommission: 70,
      workerPayoutAmount: 630,
      createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    },
  ];

  // Chat Messages
  const chatMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      bookingId: 'book-active-1',
      senderId: 'user-worker-1',
      senderName: 'Ramesh Sharma',
      senderRole: 'WORKER',
      message: 'Namaste ma\'am, I am on my way with the digital meter and replacement MCB. Reaching in ~10 minutes.',
      isRead: true,
      sentAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      bookingId: 'book-active-1',
      senderId: 'user-customer-1',
      senderName: 'Ananya Deshmukh',
      senderRole: 'CUSTOMER',
      message: 'Thank you Ramesh ji. Security will let you up to Tower B directly.',
      isRead: true,
      sentAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'user-customer-1',
      title: 'Worker On The Way',
      body: 'Ramesh Sharma has started route. Track live GPS location.',
      actionUrl: '/track/book-active-1',
      type: 'BOOKING',
      isRead: false,
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'user-worker-1',
      title: 'Booking Accepted',
      body: 'You accepted emergency electrical repair at Lotus Boulevard.',
      actionUrl: '/worker/active-job',
      type: 'BOOKING',
      isRead: true,
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
  ];

  // -------------------------------------------------------------
  // FINANCIAL ENTITIES SEED DATA
  // -------------------------------------------------------------
  const commissionRules: CommissionRule[] = [
    {
      id: 'crule-default',
      name: 'Default Marketplace Commission',
      commissionType: 'PERCENTAGE',
      percentageRate: 10.0,
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'crule-heavy',
      name: 'Heavy Machinery & Cranes Rate',
      professionSlug: 'machine-operators',
      serviceCategory: 'cat-heavy-machinery',
      commissionType: 'PERCENTAGE',
      percentageRate: 8.0,
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'crule-cleaning',
      name: 'Cleaning & Housekeeping Rate',
      professionSlug: 'cleaners',
      serviceCategory: 'cat-housekeeping',
      commissionType: 'PERCENTAGE',
      percentageRate: 12.0,
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const payoutAccounts: PayoutAccount[] = [
    {
      id: 'pacc-1',
      workerProfileId: 'worker-prof-1',
      accountType: 'BANK_ACCOUNT',
      accountHolderName: 'Ramesh Sharma',
      bankName: 'HDFC Bank Ltd',
      accountNumberMasked: '•••• •••• 4821',
      accountNumberHash: 'hash_4821',
      ifscCode: 'HDFC0001234',
      isPrimary: true,
      verificationStatus: 'VERIFIED',
      beneficiaryId: 'ben_rzp_4821',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z',
    },
    {
      id: 'pacc-2',
      workerProfileId: 'worker-prof-1',
      accountType: 'UPI',
      accountHolderName: 'Ramesh Sharma',
      upiId: 'ramesh.sharma@okaxis',
      isPrimary: false,
      verificationStatus: 'VERIFIED',
      createdAt: '2026-01-12T12:00:00.000Z',
      updatedAt: '2026-01-12T12:00:00.000Z',
    },
    {
      id: 'pacc-3',
      workerProfileId: 'worker-prof-2',
      accountType: 'BANK_ACCOUNT',
      accountHolderName: 'Suresh Verma',
      bankName: 'State Bank of India',
      accountNumberMasked: '•••• •••• 9012',
      ifscCode: 'SBIN0004567',
      isPrimary: true,
      verificationStatus: 'VERIFIED',
      createdAt: '2026-01-15T09:00:00.000Z',
      updatedAt: '2026-01-15T09:00:00.000Z',
    },
  ];

  const wallets: WorkerWallet[] = [
    {
      id: 'wallet-worker-1',
      workerProfileId: 'worker-prof-1',
      availableBalance: 2840,
      reservedBalance: 0,
      pendingBalance: 0,
      totalLifetimeEarnings: 38400,
      totalWithdrawn: 35560,
      totalCommissionPaid: 4200,
      totalCompletedJobs: 42,
      commissionPayable: 0,
      currency: 'INR',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'wallet-worker-2',
      workerProfileId: 'worker-prof-2',
      availableBalance: 1450,
      reservedBalance: 0,
      pendingBalance: 0,
      totalLifetimeEarnings: 18500,
      totalWithdrawn: 17050,
      totalCommissionPaid: 1850,
      totalCompletedJobs: 21,
      commissionPayable: 0,
      currency: 'INR',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    },
  ];

  const ledgerEntries: WalletLedgerEntry[] = [
    {
      id: 'led-1',
      walletId: 'wallet-worker-1',
      workerProfileId: 'worker-prof-1',
      bookingId: 'book-seed-1',
      transactionType: 'JOB_EARNING',
      grossAmount: 1500,
      commissionAmount: 150,
      feeAmount: 0,
      netAmount: 1350,
      balanceBefore: 1490,
      balanceAfter: 2840,
      currency: 'INR',
      status: 'COMPLETED',
      description: 'Job earnings for booking #KS-1045 (Emergency Wiring Repair)',
      paymentReference: 'pay_rzp_mock_1045',
      idempotencyKey: 'job_earn_book-seed-1_pay-1',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'led-2',
      walletId: 'wallet-worker-1',
      workerProfileId: 'worker-prof-1',
      bookingId: 'book-seed-1',
      transactionType: 'PLATFORM_COMMISSION',
      grossAmount: 150,
      commissionAmount: 150,
      feeAmount: 0,
      netAmount: -150,
      balanceBefore: 2840,
      balanceAfter: 2840,
      currency: 'INR',
      status: 'COMPLETED',
      description: 'Platform commission deduction (10%) for booking #KS-1045',
      idempotencyKey: 'comm_book-seed-1_pay-1',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'led-3',
      walletId: 'wallet-worker-1',
      workerProfileId: 'worker-prof-1',
      withdrawalId: 'wdr-hist-1',
      transactionType: 'WITHDRAWAL_SUCCESS',
      grossAmount: 2000,
      commissionAmount: 0,
      feeAmount: 0,
      netAmount: -2000,
      balanceBefore: 3490,
      balanceAfter: 1490,
      currency: 'INR',
      status: 'COMPLETED',
      description: 'Bank transfer payout to HDFC Bank (•••• 4821)',
      payoutReference: 'pout_rzp_mock_101',
      idempotencyKey: 'wdr_hist_1',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  const withdrawals: Withdrawal[] = [
    {
      id: 'wdr-hist-1',
      walletId: 'wallet-worker-1',
      workerProfileId: 'worker-prof-1',
      payoutAccountId: 'pacc-1',
      payoutAccountType: 'BANK_ACCOUNT',
      payoutTargetMasked: 'HDFC Bank (•••• 4821)',
      amount: 2000,
      fee: 0,
      netPayout: 2000,
      currency: 'INR',
      status: 'SUCCESS',
      provider: 'RAZORPAYX',
      providerPayoutId: 'pout_rzp_mock_101',
      idempotencyKey: 'wdr_key_101',
      requestedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
    },
  ];

  return {
    users,
    workerProfiles,
    customerProfiles,
    contractorProfiles,
    categories,
    bookings,
    bookingLocations,
    tenders,
    tenderApplications: [],
    tenderTeams,
    payments,
    payouts: [],
    reviews: [],
    disputes: [],
    chatMessages,
    notifications,
    wallets,
    ledgerEntries,
    withdrawals,
    payoutAccounts,
    commissionRules,
    financialAuditLogs: [],
    auditLogs: [
      {
        id: 'audit-1',
        adminUserId: 'user-admin-1',
        action: 'WORKER_VERIFY_APPROVED',
        targetType: 'WorkerProfile',
        targetId: 'worker-prof-1',
        details: 'Approved Ramesh Sharma after manual Aadhaar and ITI certificate inspection.',
        timestamp: '2026-01-16T10:00:00.000Z',
      },
    ],
  };
}

// -------------------------------------------------------------
// REPOSITORY METHODS
// -------------------------------------------------------------

export const dbStore = {
  // Categories
  getCategories(): Category[] {
    const store = loadStore();
    return store.categories;
  },

  getCategoryBySlug(slug: string): Category | undefined {
    const store = loadStore();
    return store.categories.find(c => c.slug === slug);
  },

  // Workers Search with Real Coordinates & Haversine Filter
  getWorkers(params: {
    categorySlug?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    minRating?: number;
    isAvailableNow?: boolean;
    verifiedOnly?: boolean;
    query?: string;
  }): Array<WorkerProfile & { distanceKm?: number; etaMinutes?: number }> {
    const store = loadStore();
    let workers = [...store.workerProfiles];

    // Hydrate User details
    workers = workers.map(w => {
      const u = store.users.find(u => u.id === w.userId);
      return { ...w, user: u };
    });

    if (params.verifiedOnly) {
      workers = workers.filter(w => w.verificationStatus === 'VERIFIED');
    }

    if (params.isAvailableNow) {
      workers = workers.filter(w => w.isAvailableNow && w.isOnline);
    }

    if (params.minRating) {
      workers = workers.filter(w => w.ratingAvg >= params.minRating!);
    }

    if (params.city) {
      const qCity = params.city.trim().toLowerCase();
      workers = workers.filter(w => w.city?.toLowerCase().includes(qCity));
    }

    if (params.categorySlug) {
      const prof = getProfessionBySlug(params.categorySlug);
      const targetCategory = store.categories.find(c => c.slug === params.categorySlug || c.id === params.categorySlug);
      
      workers = workers.filter(w => {
        if (targetCategory && w.skills?.some(s => s.categoryId === targetCategory.id || s.categoryName?.toLowerCase().includes(targetCategory.name.toLowerCase()))) {
          return true;
        }
        if (prof) {
          const matchSkill = w.skills?.some(s => 
            s.categoryId === prof.id || 
            prof.aliases.includes(s.categoryId) || 
            s.categoryName?.toLowerCase().includes(prof.singular.toLowerCase()) ||
            s.categoryName?.toLowerCase().includes(prof.name.toLowerCase())
          );
          if (matchSkill) return true;
          if (
            w.headline?.toLowerCase().includes(prof.singular.toLowerCase()) ||
            w.headline?.toLowerCase().includes(prof.name.toLowerCase()) ||
            w.bio?.toLowerCase().includes(prof.singular.toLowerCase())
          ) {
            return true;
          }
        }
        return false;
      });
    }

    if (params.query) {
      const q = params.query.toLowerCase().trim();
      const matchedProf = findProfessionByIdOrSlug(q);
      const aliasTerms: string[] = matchedProf ? [matchedProf.name.toLowerCase(), matchedProf.singular.toLowerCase(), matchedProf.nameHi, ...matchedProf.aliases] : [q];

      workers = workers.filter(w => {
        // Direct string match on worker fields
        if (
          w.headline?.toLowerCase().includes(q) ||
          w.bio?.toLowerCase().includes(q) ||
          w.user?.fullName.toLowerCase().includes(q) ||
          w.skills?.some(s => s.categoryName?.toLowerCase().includes(q))
        ) {
          return true;
        }

        // Universal Synonym, Hindi and Alias Matching from master catalog
        if (matchedProf) {
          const matchSkill = w.skills?.some(s => 
            s.categoryId === matchedProf.id || 
            s.categoryId === matchedProf.slug ||
            aliasTerms.some(term => 
              s.categoryName?.toLowerCase().includes(term) || 
              (w.headline && w.headline.toLowerCase().includes(term))
            )
          );
          if (matchSkill) return true;
        }

        return false;
      });
    }

    // Distance & ETA calculation if coordinates provided
    if (params.latitude !== undefined && params.longitude !== undefined) {
      const radius = params.radiusKm || 25;
      const calculated = workers.map(w => {
        const dist = calculateDistanceKm(params.latitude!, params.longitude!, w.latitude, w.longitude);
        const eta = calculateEstimatedEtaMinutes(dist);
        return { ...w, distanceKm: dist, etaMinutes: eta };
      });

      // Filter by radius & sort by closest
      return calculated
        .filter(w => w.distanceKm <= radius)
        .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return workers;
  },

  // Geospatial Discovery with Expanding Radius (3km -> 5km -> 10km) & Anti-Busy Filtering
  discoverNearbyWorkers(params: {
    latitude: number;
    longitude: number;
    categorySlug?: string;
    profession?: string;
    service?: string;
    verifiedOnly?: boolean;
    initialRadiusKm?: number;
    maxRadiusKm?: number;
  }): {
    workers: Array<WorkerProfile & { user?: User; distanceKm: number; etaMinutes: number }>;
    searchRadiusKm: number;
    expanded: boolean;
    tiersAttempted: number[];
  } {
    const store = loadStore();
    const activeJobStatuses: BookingStatus[] = ['WORKER_ON_THE_WAY', 'ARRIVED', 'WORK_STARTED'];
    const busyWorkerIds = new Set(
      store.bookings
        .filter(b => activeJobStatuses.includes(b.status))
        .map(b => b.assignedWorkerProfileId)
        .filter(Boolean)
    );

    // Filter eligible, online, available, non-busy workers
    let candidates = store.workerProfiles.filter(w => {
      // Must not be currently engaged in active job
      if (busyWorkerIds.has(w.id)) return false;
      // Must be online and available
      if (!w.isOnline || !w.isAvailableNow) return false;
      // Verification check
      if (params.verifiedOnly && w.verificationStatus !== 'VERIFIED') return false;
      return true;
    });

    // Hydrate User objects
    candidates = candidates.map(w => {
      const u = store.users.find(u => u.id === w.userId);
      return { ...w, user: u };
    });

    // Category / Profession matching
    const slug = params.categorySlug || params.profession;
    if (slug) {
      const prof = getProfessionBySlug(slug);
      const targetCategory = store.categories.find(c => c.slug === slug || c.id === slug);

      candidates = candidates.filter(w => {
        if (targetCategory && w.skills?.some(s => s.categoryId === targetCategory.id || s.categoryName?.toLowerCase().includes(targetCategory.name.toLowerCase()))) {
          return true;
        }
        if (prof) {
          const matchSkill = w.skills?.some(s => 
            s.categoryId === prof.id || 
            prof.aliases.includes(s.categoryId) || 
            s.categoryName?.toLowerCase().includes(prof.singular.toLowerCase()) ||
            s.categoryName?.toLowerCase().includes(prof.name.toLowerCase())
          );
          if (matchSkill) return true;
          if (
            w.headline?.toLowerCase().includes(prof.singular.toLowerCase()) ||
            w.headline?.toLowerCase().includes(prof.name.toLowerCase()) ||
            w.bio?.toLowerCase().includes(prof.singular.toLowerCase())
          ) {
            return true;
          }
        }
        return false;
      });
    }

    // Calculate distance and filter out workers beyond their own preferred radius
    const calculated = candidates.map(w => {
      const dist = calculateDistanceKm(params.latitude, params.longitude, w.latitude, w.longitude);
      const eta = calculateEstimatedEtaMinutes(dist);
      return { ...w, distanceKm: dist, etaMinutes: eta };
    }).filter(w => w.distanceKm <= (w.preferredRadiusKm || 25));

    // Expanding radius search: 3km -> 5km -> 10km -> 25km
    const initialRadius = params.initialRadiusKm || 3;
    const maxRadius = params.maxRadiusKm || 25;
    const expansionTiers = [initialRadius, 5, 10, maxRadius].filter((r, idx, arr) => arr.indexOf(r) === idx && r <= maxRadius);

    let activeRadius = initialRadius;
    const tiersAttempted: number[] = [];
    let matchedWorkers: typeof calculated = [];

    for (const radius of expansionTiers) {
      tiersAttempted.push(radius);
      activeRadius = radius;
      matchedWorkers = calculated
        .filter(w => w.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm || (b.ratingAvg || 0) - (a.ratingAvg || 0));

      if (matchedWorkers.length > 0) {
        break; // Found eligible workers within this tier
      }
    }

    return {
      workers: matchedWorkers,
      searchRadiusKm: activeRadius,
      expanded: activeRadius > initialRadius,
      tiersAttempted,
    };
  },

  getWorkerById(id: string): (WorkerProfile & { user?: User }) | null {
    const store = loadStore();
    const worker = store.workerProfiles.find(w => w.id === id || w.userId === id);
    if (!worker) return null;
    const user = store.users.find(u => u.id === worker.userId);
    return { ...worker, user };
  },

  updateWorkerProfile(id: string, updates: Partial<WorkerProfile>): WorkerProfile | null {
    const store = loadStore();
    const index = store.workerProfiles.findIndex(w => w.id === id || w.userId === id);
    if (index === -1) return null;

    store.workerProfiles[index] = {
      ...store.workerProfiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveStore();
    return store.workerProfiles[index];
  },

  // Users & Auth
  getUserByPhone(phoneNumber: string): User | undefined {
    const store = loadStore();
    const clean = phoneNumber.replace(/\D/g, '');
    return store.users.find(u => u.phoneNumber.replace(/\D/g, '') === clean);
  },

  getUserById(id: string): User | undefined {
    const store = loadStore();
    return store.users.find(u => u.id === id);
  },

  createUser(userData: Partial<User>): User {
    const store = loadStore();
    const newUser: User = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      phoneNumber: userData.phoneNumber || '',
      phoneVerified: userData.phoneVerified || false,
      email: userData.email,
      fullName: userData.fullName || 'User',
      avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      language: userData.language || 'hi',
      roles: userData.roles || ['CUSTOMER'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.users.push(newUser);

    // Auto-create relevant profile
    if (newUser.roles.includes('CUSTOMER')) {
      store.customerProfiles.push({
        id: `cust-${Date.now()}`,
        userId: newUser.id,
        createdAt: new Date().toISOString(),
      });
    }

    if (newUser.roles.includes('WORKER')) {
      store.workerProfiles.push({
        id: `worker-${Date.now()}`,
        userId: newUser.id,
        yearsExperience: 1,
        hourlyRate: 300,
        dailyRate: 800,
        verificationStatus: 'SUBMITTED',
        isOnline: true,
        isAvailableNow: true,
        emergencyAvailable: false,
        ratingAvg: 5.0,
        ratingCount: 0,
        completedJobsCount: 0,
        state: 'Delhi',
        city: 'Delhi',
        pincode: '110001',
        latitude: 28.6139,
        longitude: 77.2090,
        preferredRadiusKm: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (newUser.roles.includes('CONTRACTOR') || newUser.roles.includes('TENDER_OWNER')) {
      store.contractorProfiles.push({
        id: `cont-${Date.now()}`,
        userId: newUser.id,
        companyName: `${newUser.fullName} Enterprises`,
        businessType: 'CIVIL_CONSTRUCTION',
        city: 'Delhi',
        state: 'Delhi',
        verification: 'SUBMITTED',
        createdAt: new Date().toISOString(),
      });
    }

    saveStore();
    return newUser;
  },

  // Bookings
  createBooking(bookingData: Partial<Booking>): Booking {
    const store = loadStore();
    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      customerProfileId: bookingData.customerProfileId || 'cust-prof-1',
      serviceCategory: bookingData.serviceCategory || 'General Service',
      serviceDescription: bookingData.serviceDescription || '',
      isUrgent: bookingData.isUrgent || false,
      scheduledDate: bookingData.scheduledDate || new Date().toISOString(),
      estimatedHours: bookingData.estimatedHours || 2,
      estimatedAmount: bookingData.estimatedAmount || 500,
      addressLine: bookingData.addressLine || 'Address',
      locality: bookingData.locality || '',
      city: bookingData.city || 'Delhi',
      pincode: bookingData.pincode || '110001',
      customerLatitude: bookingData.customerLatitude || 28.6139,
      customerLongitude: bookingData.customerLongitude || 77.2090,
      status: 'REQUESTED',
      assignedWorkerProfileId: bookingData.assignedWorkerProfileId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.bookings.push(newBooking);

    // If assigned immediately, offer it
    if (newBooking.assignedWorkerProfileId) {
      newBooking.status = 'OFFERED';
    }

    saveStore();
    return newBooking;
  },

  getBookingById(id: string): Booking | null {
    const store = loadStore();
    const b = store.bookings.find(b => b.id === id);
    if (!b) return null;

    const cust = store.customerProfiles.find(c => c.id === b.customerProfileId);
    const custUser = cust ? store.users.find(u => u.id === cust.userId) : undefined;
    const worker = b.assignedWorkerProfileId ? this.getWorkerById(b.assignedWorkerProfileId) : undefined;
    const payment = store.payments.find(p => p.bookingId === b.id);
    const review = store.reviews.find(r => r.bookingId === b.id);
    const dispute = store.disputes.find(d => d.bookingId === b.id);

    return {
      ...b,
      customer: custUser,
      assignedWorker: worker || undefined,
      payment,
      review,
      dispute,
    };
  },

  getUserBookings(userId: string): Booking[] {
    const store = loadStore();
    const cust = store.customerProfiles.find(c => c.userId === userId);
    const worker = store.workerProfiles.find(w => w.userId === userId);

    return store.bookings
      .filter(b => (cust && b.customerProfileId === cust.id) || (worker && b.assignedWorkerProfileId === worker.id))
      .map(b => this.getBookingById(b.id)!)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    meta?: {
      cancellationReason?: string;
      cancelledByRole?: UserRole;
      beforeWorkNotes?: string;
      beforeWorkImageUrl?: string;
      afterWorkNotes?: string;
      afterWorkImageUrl?: string;
    }
  ): Booking | null {
    const store = loadStore();
    const booking = store.bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    booking.status = newStatus;
    booking.updatedAt = new Date().toISOString();

    if (meta?.cancellationReason) booking.cancellationReason = meta.cancellationReason;
    if (meta?.cancelledByRole) booking.cancelledByRole = meta.cancelledByRole;
    if (meta?.beforeWorkNotes) booking.beforeWorkNotes = meta.beforeWorkNotes;
    if (meta?.beforeWorkImageUrl) booking.beforeWorkImageUrl = meta.beforeWorkImageUrl;
    if (meta?.afterWorkNotes) booking.afterWorkNotes = meta.afterWorkNotes;
    if (meta?.afterWorkImageUrl) booking.afterWorkImageUrl = meta.afterWorkImageUrl;

    if (newStatus === 'WORK_STARTED') {
      booking.workStartedAt = new Date().toISOString();
    } else if (newStatus === 'WORK_COMPLETED') {
      booking.workCompletedAt = new Date().toISOString();
    } else if (newStatus === 'CUSTOMER_CONFIRMED') {
      booking.confirmedAt = new Date().toISOString();
    }

    saveStore();
    return this.getBookingById(bookingId);
  },

  // Live GPS Tracking
  recordLocationUpdate(data: {
    bookingId: string;
    workerProfileId: string;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    heading?: number;
    speed?: number;
  }): BookingLocation {
    const store = loadStore();
    const record: BookingLocation = {
      id: `loc-${Date.now()}`,
      bookingId: data.bookingId,
      workerProfileId: data.workerProfileId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracyMeters: data.accuracyMeters,
      heading: data.heading,
      speed: data.speed,
      recordedAt: new Date().toISOString(),
    };

    store.bookingLocations.push(record);
    // Keep last 100 points
    if (store.bookingLocations.length > 500) {
      store.bookingLocations = store.bookingLocations.slice(-300);
    }
    saveStore();
    return record;
  },

  getLatestLocation(bookingId: string): BookingLocation | null {
    const store = loadStore();
    const locs = store.bookingLocations
      .filter(l => l.bookingId === bookingId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    return locs.length > 0 ? locs[0] : null;
  },

  // Payments & Ledger
  createPayment(bookingId: string, amount: number): Payment {
    const store = loadStore();
    let payment = store.payments.find(p => p.bookingId === bookingId);
    const commPercent = Number(process.env.PLATFORM_COMMISSION_PERCENTAGE || 10);
    const commAmount = (amount * commPercent) / 100;
    const workerAmount = amount - commAmount;

    if (!payment) {
      payment = {
        id: `pay-${Date.now()}`,
        bookingId,
        provider: 'RAZORPAY',
        providerOrderId: `order_kaamsetu_${Date.now()}`,
        amount,
        currency: 'INR',
        status: 'INITIATED',
        platformCommission: commAmount,
        workerPayoutAmount: workerAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.payments.push(payment);
    } else {
      payment.amount = amount;
      payment.platformCommission = commAmount;
      payment.workerPayoutAmount = workerAmount;
      payment.updatedAt = new Date().toISOString();
    }

    saveStore();
    return payment;
  },

  verifyPayment(paymentId: string, providerPaymentId: string): Payment | null {
    const store = loadStore();
    const payment = store.payments.find(p => p.id === paymentId || p.providerOrderId === paymentId);
    if (!payment) return null;

    payment.status = 'PAID';
    payment.providerPaymentId = providerPaymentId;
    payment.paidAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();

    // Update booking status to PAYMENT_PAID
    const booking = store.bookings.find(b => b.id === payment.bookingId);
    if (booking) {
      booking.status = 'PAYMENT_PAID';
      booking.updatedAt = new Date().toISOString();
    }

    saveStore();

    // Automatically trigger instant wallet credit to the assigned worker
    this.creditJobEarning({
      bookingId: payment.bookingId,
      paymentId: payment.id,
      isCash: false,
    });

    return payment;
  },

  // -------------------------------------------------------------
  // DIGITAL WALLET & TRANSACTION LEDGER REPOSITORY
  // -------------------------------------------------------------

  getOrCreateWorkerWallet(workerProfileId: string): WorkerWallet {
    const store = loadStore();
    if (!store.wallets) store.wallets = [];
    
    let wallet = store.wallets.find(w => w.workerProfileId === workerProfileId);
    if (!wallet) {
      wallet = {
        id: `wallet-${workerProfileId}`,
        workerProfileId,
        availableBalance: 0,
        reservedBalance: 0,
        pendingBalance: 0,
        totalLifetimeEarnings: 0,
        totalWithdrawn: 0,
        totalCommissionPaid: 0,
        totalCompletedJobs: 0,
        commissionPayable: 0,
        currency: 'INR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.wallets.push(wallet);
      saveStore();
    }
    return wallet;
  },

  getWorkerWallet(workerProfileId: string): WorkerWallet {
    return this.getOrCreateWorkerWallet(workerProfileId);
  },

  getWorkerLedger(workerProfileId: string, filter?: string): WalletLedgerEntry[] {
    const store = loadStore();
    if (!store.ledgerEntries) store.ledgerEntries = [];

    let entries = store.ledgerEntries.filter(l => l.workerProfileId === workerProfileId);

    if (filter && filter !== 'ALL') {
      if (filter === 'EARNINGS') {
        entries = entries.filter(e => e.transactionType === 'JOB_EARNING');
      } else if (filter === 'WITHDRAWALS') {
        entries = entries.filter(e => e.transactionType.startsWith('WITHDRAWAL_'));
      } else if (filter === 'PENDING') {
        entries = entries.filter(e => e.status === 'PENDING');
      } else if (filter === 'COMPLETED') {
        entries = entries.filter(e => e.status === 'COMPLETED');
      } else if (filter === 'FAILED') {
        entries = entries.filter(e => e.status === 'FAILED');
      }
    }

    return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getWorkerEarningsSummary(workerProfileId: string): WorkerEarningSummary {
    const store = loadStore();
    const wallet = this.getOrCreateWorkerWallet(workerProfileId);
    if (!store.ledgerEntries) store.ledgerEntries = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = now.getTime() - 7 * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const earningEntries = store.ledgerEntries.filter(
      l => l.workerProfileId === workerProfileId && l.transactionType === 'JOB_EARNING' && l.status === 'COMPLETED'
    );

    const todayEarnings = earningEntries
      .filter(l => new Date(l.createdAt).getTime() >= todayStart)
      .reduce((sum, l) => sum + l.netAmount, 0);

    const thisWeekEarnings = earningEntries
      .filter(l => new Date(l.createdAt).getTime() >= weekStart)
      .reduce((sum, l) => sum + l.netAmount, 0);

    const thisMonthEarnings = earningEntries
      .filter(l => new Date(l.createdAt).getTime() >= monthStart)
      .reduce((sum, l) => sum + l.netAmount, 0);

    const totalJobs = wallet.totalCompletedJobs || 1;
    const avgEarning = Math.round(wallet.totalLifetimeEarnings / totalJobs);

    const refundsAdjustments = store.ledgerEntries
      .filter(l => l.workerProfileId === workerProfileId && (l.transactionType === 'REFUND' || l.transactionType === 'REVERSAL' || l.transactionType === 'ADJUSTMENT'))
      .reduce((sum, l) => sum + l.netAmount, 0);

    return {
      wallet,
      todayEarnings,
      thisWeekEarnings,
      thisMonthEarnings,
      lifetimeEarnings: wallet.totalLifetimeEarnings,
      averageEarningPerJob: avgEarning,
      withdrawableAmount: wallet.availableBalance,
      pendingEarnings: wallet.pendingBalance,
      commissionDeductions: wallet.totalCommissionPaid,
      refundsAdjustments,
      totalWithdrawn: wallet.totalWithdrawn,
      totalCompletedJobs: wallet.totalCompletedJobs,
      commissionPayable: wallet.commissionPayable,
    };
  },

  getPayoutAccounts(workerProfileId: string): PayoutAccount[] {
    const store = loadStore();
    if (!store.payoutAccounts) store.payoutAccounts = [];
    return store.payoutAccounts.filter(p => p.workerProfileId === workerProfileId);
  },

  addPayoutAccount(workerProfileId: string, data: Partial<PayoutAccount>): PayoutAccount {
    const store = loadStore();
    if (!store.payoutAccounts) store.payoutAccounts = [];

    const existing = store.payoutAccounts.filter(p => p.workerProfileId === workerProfileId);
    const isFirst = existing.length === 0;

    let masked = '';
    if (data.accountType === 'BANK_ACCOUNT' && data.accountNumberMasked) {
      masked = data.accountNumberMasked;
    } else if (data.accountType === 'BANK_ACCOUNT') {
      masked = '•••• •••• ' + String(Date.now()).slice(-4);
    } else {
      masked = data.upiId || 'worker@upi';
    }

    const newAccount: PayoutAccount = {
      id: `pacc-${Date.now()}`,
      workerProfileId,
      accountType: data.accountType || 'BANK_ACCOUNT',
      accountHolderName: data.accountHolderName || 'Verified Worker',
      bankName: data.bankName || (data.accountType === 'BANK_ACCOUNT' ? 'HDFC Bank' : undefined),
      accountNumberMasked: masked,
      accountNumberHash: `hash_${Date.now()}`,
      ifscCode: data.ifscCode ? data.ifscCode.toUpperCase() : undefined,
      upiId: data.upiId,
      isPrimary: data.isPrimary !== undefined ? data.isPrimary : isFirst,
      verificationStatus: 'VERIFIED',
      beneficiaryId: `ben_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newAccount.isPrimary) {
      store.payoutAccounts
        .filter(p => p.workerProfileId === workerProfileId)
        .forEach(p => (p.isPrimary = false));
    }

    store.payoutAccounts.push(newAccount);
    saveStore();
    return newAccount;
  },

  deletePayoutAccount(workerProfileId: string, accountId: string): boolean {
    const store = loadStore();
    if (!store.payoutAccounts) return false;

    const idx = store.payoutAccounts.findIndex(p => p.id === accountId && p.workerProfileId === workerProfileId);
    if (idx === -1) return false;

    store.payoutAccounts.splice(idx, 1);
    saveStore();
    return true;
  },

  /**
   * Automatic Instant Wallet Credit after Job Completion and Payment Verification
   * Idempotent: Never credits twice for the same booking + payment
   */
  creditJobEarning(params: {
    bookingId: string;
    paymentId?: string;
    isCash?: boolean;
    customAmount?: number;
  }): {
    success: boolean;
    wallet: WorkerWallet;
    ledgerEntry: WalletLedgerEntry;
    alreadyCredited?: boolean;
    message: string;
  } {
    const store = loadStore();
    const booking = store.bookings.find(b => b.id === params.bookingId);
    if (!booking) {
      throw new Error(`Booking ${params.bookingId} not found`);
    }

    const workerProfileId = booking.assignedWorkerProfileId;
    if (!workerProfileId) {
      throw new Error(`No worker assigned to booking ${params.bookingId}`);
    }

    // 1. Check idempotency: If already credited, return existing state
    const idempotencyKey = `job_earn_${params.bookingId}_${params.paymentId || 'default'}`;
    const existingEntry = store.ledgerEntries?.find(l => l.idempotencyKey === idempotencyKey);
    const wallet = this.getOrCreateWorkerWallet(workerProfileId);

    if (existingEntry) {
      return {
        success: true,
        wallet,
        ledgerEntry: existingEntry,
        alreadyCredited: true,
        message: 'Job earnings already credited previously (Idempotent).',
      };
    }

    // 2. Transparent Commission Calculation
    const jobAmount = params.customAmount || booking.finalAmount || booking.estimatedAmount;
    const commissionRules = store.commissionRules || [];
    const breakdown = calculateJobCommission({
      jobAmount,
      professionSlug: booking.serviceCategory,
      serviceCategory: booking.serviceCategory,
      workerProfileId,
      isCash: params.isCash,
      customRules: commissionRules,
    });

    const nowIso = new Date().toISOString();
    let ledgerEntry: WalletLedgerEntry;

    // 3. Update Wallet Balance atomically
    if (!params.isCash) {
      // ONLINE PAYMENT: Net amount credited directly to digital earning wallet
      const balanceBefore = wallet.availableBalance;
      wallet.availableBalance = Math.round((wallet.availableBalance + breakdown.workerNetEarning) * 100) / 100;
      wallet.totalLifetimeEarnings = Math.round((wallet.totalLifetimeEarnings + breakdown.workerNetEarning) * 100) / 100;
      wallet.totalCommissionPaid = Math.round((wallet.totalCommissionPaid + breakdown.commissionAmount) * 100) / 100;
      wallet.totalCompletedJobs += 1;
      wallet.updatedAt = nowIso;

      // Immutable Credit Ledger Entry
      ledgerEntry = {
        id: `led-${Date.now()}-1`,
        walletId: wallet.id,
        workerProfileId,
        bookingId: booking.id,
        paymentId: params.paymentId,
        transactionType: 'JOB_EARNING',
        grossAmount: breakdown.jobAmount,
        commissionAmount: breakdown.commissionAmount,
        feeAmount: breakdown.additionalFees,
        netAmount: breakdown.workerNetEarning,
        balanceBefore,
        balanceAfter: wallet.availableBalance,
        currency: 'INR',
        status: 'COMPLETED',
        description: `Job earnings for booking #${booking.id.slice(-6)} (${booking.serviceCategory})`,
        paymentReference: params.paymentId || 'online_gateway',
        idempotencyKey,
        metadata: {
          ratePercent: breakdown.commissionRatePercent,
          ruleApplied: breakdown.ruleApplied,
          isExempt: breakdown.isExempt,
        },
        createdAt: nowIso,
      };
      store.ledgerEntries.push(ledgerEntry);

      // Immutable Platform Commission Deduction Record
      const commEntry: WalletLedgerEntry = {
        id: `led-${Date.now()}-2`,
        walletId: wallet.id,
        workerProfileId,
        bookingId: booking.id,
        paymentId: params.paymentId,
        transactionType: 'PLATFORM_COMMISSION',
        grossAmount: breakdown.commissionAmount,
        commissionAmount: breakdown.commissionAmount,
        feeAmount: 0,
        netAmount: -breakdown.commissionAmount,
        balanceBefore: wallet.availableBalance,
        balanceAfter: wallet.availableBalance,
        currency: 'INR',
        status: 'COMPLETED',
        description: `Platform commission (${breakdown.commissionRatePercent}%) for booking #${booking.id.slice(-6)}`,
        idempotencyKey: `comm_${params.bookingId}_${params.paymentId || 'default'}`,
        createdAt: nowIso,
      };
      store.ledgerEntries.push(commEntry);
    } else {
      // CASH PAYMENT: Worker collected full cash at site
      // Platform commission tracked as commissionPayable (do NOT credit cash to digital wallet)
      wallet.commissionPayable = Math.round((wallet.commissionPayable + breakdown.commissionAmount) * 100) / 100;
      wallet.totalCommissionPaid = Math.round((wallet.totalCommissionPaid + breakdown.commissionAmount) * 100) / 100;
      wallet.totalCompletedJobs += 1;
      wallet.updatedAt = nowIso;

      ledgerEntry = {
        id: `led-${Date.now()}-cash`,
        walletId: wallet.id,
        workerProfileId,
        bookingId: booking.id,
        transactionType: 'CASH_COMMISSION_PAYABLE',
        grossAmount: breakdown.jobAmount,
        commissionAmount: breakdown.commissionAmount,
        feeAmount: 0,
        netAmount: 0,
        balanceBefore: wallet.availableBalance,
        balanceAfter: wallet.availableBalance,
        currency: 'INR',
        status: 'COMPLETED',
        description: `Cash job completed #${booking.id.slice(-6)}. Cash collected: ₹${breakdown.jobAmount}. Commission payable: ₹${breakdown.commissionAmount}`,
        idempotencyKey,
        metadata: { isCash: true, commissionAmount: breakdown.commissionAmount },
        createdAt: nowIso,
      };
      store.ledgerEntries.push(ledgerEntry);
    }

    // 4. In-App Notification for Worker
    const workerUser = store.workerProfiles.find(w => w.id === workerProfileId);
    if (workerUser) {
      store.notifications.push({
        id: `notif-earn-${Date.now()}`,
        userId: workerUser.userId,
        title: params.isCash ? 'Cash Job Completed' : `₹${breakdown.workerNetEarning} Credited to Wallet!`,
        body: params.isCash
          ? `Cash collected ₹${breakdown.jobAmount} for booking #${booking.id.slice(-6)}. Commission payable: ₹${breakdown.commissionAmount}.`
          : `₹${breakdown.workerNetEarning} (₹${breakdown.jobAmount} minus ₹${breakdown.commissionAmount} commission) has been credited to your earning wallet.`,
        actionUrl: '/worker/earnings',
        type: 'PAYMENT',
        isRead: false,
        createdAt: nowIso,
      });
    }

    saveStore();

    // 5. Real-Time Socket.IO Broadcast to Worker Dashboard & Booking Room
    if ((global as any).__kaamsetu_io) {
      const io = (global as any).__kaamsetu_io;
      io.to(`worker:${workerProfileId}`).emit('wallet:balance:updated', {
        workerProfileId,
        availableBalance: wallet.availableBalance,
        reservedBalance: wallet.reservedBalance,
        updatedAt: wallet.updatedAt,
      });
      io.to(`worker:${workerProfileId}`).emit('wallet:earning:credited', {
        workerProfileId,
        bookingId: booking.id,
        grossAmount: breakdown.jobAmount,
        commissionAmount: breakdown.commissionAmount,
        netAmount: breakdown.workerNetEarning,
        isCash: Boolean(params.isCash),
        timestamp: nowIso,
      });
      io.to(`booking:${booking.id}`).emit('booking:earning:credited', {
        bookingId: booking.id,
        workerNetEarning: breakdown.workerNetEarning,
      });
      io.to('admin:operations').emit('wallet:transaction:created', ledgerEntry);
    }

    return {
      success: true,
      wallet,
      ledgerEntry,
      alreadyCredited: false,
      message: params.isCash
        ? 'Cash job recorded. Commission payable tracked.'
        : `₹${breakdown.workerNetEarning} successfully credited to digital wallet.`,
    };
  },

  /**
   * Functional Withdrawal Request with Balance Locking & Provider Integration
   */
  async requestWithdrawal(params: {
    workerProfileId: string;
    payoutAccountId: string;
    amount: number;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; withdrawal?: Withdrawal; error?: string }> {
    const store = loadStore();
    const wallet = this.getOrCreateWorkerWallet(params.workerProfileId);
    const amount = Number(params.amount);

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Invalid withdrawal amount' };
    }

    // Minimum / Maximum Limits
    const MIN_WITHDRAWAL = 100;
    const MAX_WITHDRAWAL = 50000;
    if (amount < MIN_WITHDRAWAL) {
      return { success: false, error: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}` };
    }
    if (amount > MAX_WITHDRAWAL) {
      return { success: false, error: `Maximum single withdrawal limit is ₹${MAX_WITHDRAWAL}` };
    }

    // Atomic Balance Check: Prevent overspending
    if (wallet.availableBalance < amount) {
      return {
        success: false,
        error: `Insufficient available balance. You have ₹${wallet.availableBalance} available.`,
      };
    }

    // Validate Payout Account
    const account = store.payoutAccounts?.find(
      p => p.id === params.payoutAccountId && p.workerProfileId === params.workerProfileId
    );
    if (!account) {
      return { success: false, error: 'Payout account not found or does not belong to you' };
    }

    // Transparent Payout Fee (₹0 for UPI, or nominal)
    const payoutFee = 0;
    const netPayout = amount - payoutFee;
    const idempotencyKey = params.idempotencyKey || `wdr_${params.workerProfileId}_${Date.now()}`;

    // Atomic Balance Lock: Move from available to reserved
    const balanceBefore = wallet.availableBalance;
    wallet.availableBalance = Math.round((wallet.availableBalance - amount) * 100) / 100;
    wallet.reservedBalance = Math.round((wallet.reservedBalance + amount) * 100) / 100;
    wallet.updatedAt = new Date().toISOString();

    const withdrawal: Withdrawal = {
      id: `wdr-${Date.now()}`,
      walletId: wallet.id,
      workerProfileId: params.workerProfileId,
      payoutAccountId: account.id,
      payoutAccountType: account.accountType,
      payoutTargetMasked: account.accountType === 'UPI' ? (account.upiId || 'UPI') : `${account.bankName || 'Bank'} (${account.accountNumberMasked})`,
      amount,
      fee: payoutFee,
      netPayout,
      currency: 'INR',
      status: 'PROCESSING',
      provider: 'RAZORPAYX',
      idempotencyKey,
      requestedAt: new Date().toISOString(),
    };

    if (!store.withdrawals) store.withdrawals = [];
    store.withdrawals.push(withdrawal);

    // Record immutable ledger entry for withdrawal request
    store.ledgerEntries.push({
      id: `led-wdr-${Date.now()}`,
      walletId: wallet.id,
      workerProfileId: params.workerProfileId,
      withdrawalId: withdrawal.id,
      transactionType: 'WITHDRAWAL_REQUEST',
      grossAmount: amount,
      commissionAmount: 0,
      feeAmount: payoutFee,
      netAmount: -amount,
      balanceBefore,
      balanceAfter: wallet.availableBalance,
      currency: 'INR',
      status: 'PENDING',
      description: `Withdrawal request #${withdrawal.id.slice(-6)} to ${withdrawal.payoutTargetMasked}`,
      idempotencyKey,
      createdAt: new Date().toISOString(),
    });

    saveStore();

    // Dispatch to Payout Provider
    const worker = this.getWorkerById(params.workerProfileId);
    const workerName = worker?.user?.fullName || 'Worker';
    const dispatchResult = await dispatchPayout({
      withdrawal,
      account,
      workerName,
    });

    if (dispatchResult.status === 'SUCCESS') {
      this.finalizeWithdrawal(withdrawal.id, true, dispatchResult.providerPayoutId);
    } else if (dispatchResult.status === 'FAILED') {
      this.finalizeWithdrawal(withdrawal.id, false, undefined, dispatchResult.message);
    } else {
      // NOT_CONFIGURED or PROCESSING: Keep status in PROCESSING with funds reserved
      withdrawal.providerPayoutId = dispatchResult.providerPayoutId;
      withdrawal.status = 'PROCESSING';
      saveStore();
    }

    // Socket.IO Broadcast
    if ((global as any).__kaamsetu_io) {
      const io = (global as any).__kaamsetu_io;
      io.to(`worker:${params.workerProfileId}`).emit('wallet:balance:updated', {
        workerProfileId: params.workerProfileId,
        availableBalance: wallet.availableBalance,
        reservedBalance: wallet.reservedBalance,
      });
      io.to(`worker:${params.workerProfileId}`).emit('wallet:withdrawal:created', withdrawal);
    }

    return { success: true, withdrawal };
  },

  /**
   * Finalizes Withdrawal: Deducts from reserved if success; Restores balance if failed!
   */
  finalizeWithdrawal(
    withdrawalId: string,
    success: boolean,
    providerRef?: string,
    failureReason?: string
  ): Withdrawal | null {
    const store = loadStore();
    const withdrawal = store.withdrawals?.find(w => w.id === withdrawalId);
    if (!withdrawal) return null;

    const wallet = this.getOrCreateWorkerWallet(withdrawal.workerProfileId);
    const nowIso = new Date().toISOString();

    if (success) {
      wallet.reservedBalance = Math.max(0, Math.round((wallet.reservedBalance - withdrawal.amount) * 100) / 100);
      wallet.totalWithdrawn = Math.round((wallet.totalWithdrawn + withdrawal.netPayout) * 100) / 100;
      wallet.updatedAt = nowIso;

      withdrawal.status = 'SUCCESS';
      withdrawal.providerPayoutId = providerRef || withdrawal.providerPayoutId || `pout_mock_${Date.now()}`;
      withdrawal.completedAt = nowIso;

      // Immutable Success Ledger Entry
      store.ledgerEntries.push({
        id: `led-wsucc-${Date.now()}`,
        walletId: wallet.id,
        workerProfileId: withdrawal.workerProfileId,
        withdrawalId: withdrawal.id,
        transactionType: 'WITHDRAWAL_SUCCESS',
        grossAmount: withdrawal.amount,
        commissionAmount: 0,
        feeAmount: withdrawal.fee,
        netAmount: -withdrawal.netPayout,
        balanceBefore: wallet.availableBalance,
        balanceAfter: wallet.availableBalance,
        currency: 'INR',
        status: 'COMPLETED',
        description: `Settled withdrawal #${withdrawal.id.slice(-6)} to ${withdrawal.payoutTargetMasked}`,
        payoutReference: withdrawal.providerPayoutId,
        idempotencyKey: `wsucc_${withdrawal.id}`,
        createdAt: nowIso,
      });
    } else {
      // Payout Failed -> Restore reserved funds back to available balance!
      wallet.reservedBalance = Math.max(0, Math.round((wallet.reservedBalance - withdrawal.amount) * 100) / 100);
      wallet.availableBalance = Math.round((wallet.availableBalance + withdrawal.amount) * 100) / 100;
      wallet.updatedAt = nowIso;

      withdrawal.status = 'FAILED';
      withdrawal.failureReason = failureReason || 'Payout transaction failed at gateway';

      // Immutable Restoration Ledger Entry
      store.ledgerEntries.push({
        id: `led-wfail-${Date.now()}`,
        walletId: wallet.id,
        workerProfileId: withdrawal.workerProfileId,
        withdrawalId: withdrawal.id,
        transactionType: 'WITHDRAWAL_FAILED',
        grossAmount: withdrawal.amount,
        commissionAmount: 0,
        feeAmount: 0,
        netAmount: withdrawal.amount, // Positive restoration
        balanceBefore: wallet.availableBalance - withdrawal.amount,
        balanceAfter: wallet.availableBalance,
        currency: 'INR',
        status: 'FAILED',
        description: `Restored ₹${withdrawal.amount} to wallet. Reason: ${withdrawal.failureReason}`,
        idempotencyKey: `wfail_${withdrawal.id}`,
        createdAt: nowIso,
      });
    }

    saveStore();

    // Broadcast Real-time Events
    if ((global as any).__kaamsetu_io) {
      const io = (global as any).__kaamsetu_io;
      io.to(`worker:${withdrawal.workerProfileId}`).emit('wallet:balance:updated', {
        workerProfileId: withdrawal.workerProfileId,
        availableBalance: wallet.availableBalance,
        reservedBalance: wallet.reservedBalance,
      });
      io.to(`worker:${withdrawal.workerProfileId}`).emit('wallet:withdrawal:updated', withdrawal);
    }

    return withdrawal;
  },

  // -------------------------------------------------------------
  // ADMIN FINANCIAL REPORTING & COMMISSION REPOSITORY
  // -------------------------------------------------------------

  getAdminFinancialSummary() {
    const store = loadStore();
    if (!store.ledgerEntries) store.ledgerEntries = [];
    if (!store.withdrawals) store.withdrawals = [];
    if (!store.wallets) store.wallets = [];

    const jobEarnings = store.ledgerEntries.filter(l => l.transactionType === 'JOB_EARNING' && l.status === 'COMPLETED');
    const commissions = store.ledgerEntries.filter(l => l.transactionType === 'PLATFORM_COMMISSION' && l.status === 'COMPLETED');
    const cashJobs = store.ledgerEntries.filter(l => l.transactionType === 'CASH_COMMISSION_PAYABLE');
    const withdrawals = store.withdrawals;

    const totalGrossRevenue = jobEarnings.reduce((sum, l) => sum + l.grossAmount, 0) + cashJobs.reduce((sum, l) => sum + l.grossAmount, 0);
    const totalWorkerEarnings = jobEarnings.reduce((sum, l) => sum + l.netAmount, 0);
    const totalPlatformCommissions = commissions.reduce((sum, l) => sum + Math.abs(l.grossAmount), 0);
    const totalCashVolume = cashJobs.reduce((sum, l) => sum + l.grossAmount, 0);
    const totalOutstandingCashCommission = store.wallets.reduce((sum, w) => sum + (w.commissionPayable || 0), 0);

    const successfulWithdrawals = withdrawals.filter(w => w.status === 'SUCCESS');
    const totalWithdrawnAmount = successfulWithdrawals.reduce((sum, w) => sum + w.netPayout, 0);
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'REQUESTED' || w.status === 'PROCESSING' || w.status === 'UNDER_REVIEW');
    const pendingWithdrawalsAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const failedWithdrawals = withdrawals.filter(w => w.status === 'FAILED');

    return {
      totalGrossRevenue,
      totalWorkerEarnings,
      totalPlatformCommissions,
      totalWithdrawnAmount,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingWithdrawalsAmount,
      failedWithdrawalsCount: failedWithdrawals.length,
      totalCashVolume,
      totalOutstandingCashCommission,
      totalWalletsCount: store.wallets.length,
      totalLedgerEntriesCount: store.ledgerEntries.length,
    };
  },

  getAdminFinancialTransactions(filters?: { type?: string; workerId?: string; bookingId?: string }): WalletLedgerEntry[] {
    const store = loadStore();
    if (!store.ledgerEntries) store.ledgerEntries = [];

    let entries = [...store.ledgerEntries];
    if (filters?.type && filters.type !== 'ALL') {
      entries = entries.filter(e => e.transactionType === filters.type);
    }
    if (filters?.workerId) {
      entries = entries.filter(e => e.workerProfileId === filters.workerId);
    }
    if (filters?.bookingId) {
      entries = entries.filter(e => e.bookingId === filters.bookingId);
    }

    return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAdminWithdrawals(filters?: { status?: string }): Withdrawal[] {
    const store = loadStore();
    if (!store.withdrawals) store.withdrawals = [];

    let list = [...store.withdrawals];
    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(w => w.status === filters.status);
    }
    return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  },

  getCommissionRules(): CommissionRule[] {
    const store = loadStore();
    return store.commissionRules || [];
  },

  createOrUpdateCommissionRule(ruleData: Partial<CommissionRule>): CommissionRule {
    const store = loadStore();
    if (!store.commissionRules) store.commissionRules = [];

    let rule: CommissionRule;
    if (ruleData.id) {
      const idx = store.commissionRules.findIndex(r => r.id === ruleData.id);
      if (idx !== -1) {
        store.commissionRules[idx] = { ...store.commissionRules[idx], ...ruleData };
        saveStore();
        return store.commissionRules[idx];
      }
    }

    rule = {
      id: `crule-${Date.now()}`,
      name: ruleData.name || 'Custom Commission Rule',
      professionSlug: ruleData.professionSlug,
      serviceCategory: ruleData.serviceCategory,
      commissionType: ruleData.commissionType || 'PERCENTAGE',
      percentageRate: ruleData.percentageRate !== undefined ? Number(ruleData.percentageRate) : 10,
      fixedAmount: ruleData.fixedAmount ? Number(ruleData.fixedAmount) : undefined,
      effectiveFrom: ruleData.effectiveFrom || new Date().toISOString(),
      isActive: ruleData.isActive !== undefined ? ruleData.isActive : true,
      exemptWorkerProfileIds: ruleData.exemptWorkerProfileIds,
      createdAt: new Date().toISOString(),
    };

    store.commissionRules.push(rule);
    saveStore();
    return rule;
  },

  recordFinancialAudit(actorUserId: string, actorRole: string, action: string, entityType: any, entityId: string, details: string, amount?: number) {
    const store = loadStore();
    if (!store.financialAuditLogs) store.financialAuditLogs = [];

    store.financialAuditLogs.unshift({
      id: `faudit-${Date.now()}`,
      actorUserId,
      actorRole,
      action,
      entityType,
      entityId,
      amount,
      details,
      timestamp: new Date().toISOString(),
    });

    if (store.financialAuditLogs.length > 500) {
      store.financialAuditLogs = store.financialAuditLogs.slice(0, 500);
    }
    saveStore();
  },

  // Tenders
  getTenders(filters?: { city?: string; categoryId?: string; status?: string }): Tender[] {
    const store = loadStore();
    let result = [...store.tenders];
    if (filters?.city) {
      result = result.filter(t => t.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters?.categoryId) {
      result = result.filter(t => t.categoryId === filters.categoryId);
    }
    if (filters?.status) {
      result = result.filter(t => t.status === filters.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getTenderById(id: string): (Tender & { applications?: TenderApplication[] }) | null {
    const store = loadStore();
    const tender = store.tenders.find(t => t.id === id);
    if (!tender) return null;
    const apps = store.tenderApplications.filter(a => a.tenderId === id);
    return { ...tender, applications: apps };
  },

  createTender(data: Partial<Tender>): Tender {
    const store = loadStore();
    const newTender: Tender = {
      id: `tender-${Date.now()}`,
      contractorProfileId: data.contractorProfileId || 'cont-prof-1',
      categoryId: data.categoryId || 'cat-mason',
      categoryName: data.categoryName || 'Mason',
      title: data.title || 'Workforce Tender',
      projectName: data.projectName || 'Project',
      description: data.description || '',
      locationAddress: data.locationAddress || 'Site Address',
      city: data.city || 'Delhi',
      state: data.state || 'Delhi',
      pincode: data.pincode || '110001',
      siteLatitude: data.siteLatitude || 28.6139,
      siteLongitude: data.siteLongitude || 77.2090,
      workerCountRequired: data.workerCountRequired || 5,
      skillsRequired: data.skillsRequired || ['General Work'],
      experienceRequired: data.experienceRequired || 1,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      workingHours: data.workingHours || '8 Hours',
      shifts: data.shifts || 'Day Shift',
      totalBudget: data.totalBudget || 100000,
      perWorkerRate: data.perWorkerRate || 800,
      paymentTerms: data.paymentTerms || 'Weekly milestone payout',
      accommodationProvided: data.accommodationProvided || false,
      foodProvided: data.foodProvided || false,
      transportProvided: data.transportProvided || false,
      safetyRequirements: data.safetyRequirements,
      applicationDeadline: data.applicationDeadline || new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'PUBLISHED',
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
    };

    store.tenders.push(newTender);
    saveStore();
    return newTender;
  },

  applyToTender(data: Partial<TenderApplication>): TenderApplication {
    const store = loadStore();
    const app: TenderApplication = {
      id: `tapp-${Date.now()}`,
      tenderId: data.tenderId!,
      workerProfileId: data.workerProfileId,
      tenderTeamId: data.tenderTeamId,
      proposedRate: data.proposedRate || 800,
      proposedWorkersCount: data.proposedWorkersCount || 1,
      coverNote: data.coverNote || '',
      status: 'APPLIED',
      appliedAt: new Date().toISOString(),
    };

    store.tenderApplications.push(app);
    const tender = store.tenders.find(t => t.id === data.tenderId);
    if (tender) {
      tender.applicationsCount = (tender.applicationsCount || 0) + 1;
    }

    saveStore();
    return app;
  },

  updateTenderApplicationStatus(appId: string, status: any): TenderApplication | null {
    const store = loadStore();
    const app = store.tenderApplications.find(a => a.id === appId);
    if (!app) return null;
    app.status = status;
    app.reviewedAt = new Date().toISOString();
    saveStore();
    return app;
  },

  // Reviews & Disputes
  createReview(data: Partial<JobReview>): JobReview {
    const store = loadStore();
    const review: JobReview = {
      id: `rev-${Date.now()}`,
      bookingId: data.bookingId!,
      customerProfileId: data.customerProfileId!,
      customerName: data.customerName || 'Verified Customer',
      workerProfileId: data.workerProfileId!,
      ratingQuality: data.ratingQuality || 5,
      ratingTimeliness: data.ratingTimeliness || 5,
      ratingBehaviour: data.ratingBehaviour || 5,
      ratingOverall: data.ratingOverall || 5.0,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };

    store.reviews.push(review);

    // Update worker rating average
    const worker = store.workerProfiles.find(w => w.id === data.workerProfileId);
    if (worker) {
      const allWorkerReviews = store.reviews.filter(r => r.workerProfileId === worker.id);
      const total = allWorkerReviews.reduce((sum, r) => sum + r.ratingOverall, 0);
      worker.ratingAvg = Math.round((total / allWorkerReviews.length) * 10) / 10;
      worker.ratingCount = allWorkerReviews.length;
      worker.completedJobsCount += 1;
    }

    saveStore();
    return review;
  },

  createDispute(data: Partial<JobDispute>): JobDispute {
    const store = loadStore();
    const dispute: JobDispute = {
      id: `disp-${Date.now()}`,
      bookingId: data.bookingId!,
      customerProfileId: data.customerProfileId!,
      customerName: data.customerName || 'Customer',
      reason: data.reason || 'OTHER',
      description: data.description || '',
      evidenceImages: data.evidenceImages,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.disputes.push(dispute);
    const booking = store.bookings.find(b => b.id === data.bookingId);
    if (booking) {
      booking.status = 'DISPUTED';
      booking.updatedAt = new Date().toISOString();
    }

    saveStore();
    return dispute;
  },

  resolveDispute(disputeId: string, resolutionNotes: string, adminId: string, status: any): JobDispute | null {
    const store = loadStore();
    const dispute = store.disputes.find(d => d.id === disputeId);
    if (!dispute) return null;

    dispute.status = status;
    dispute.resolutionNotes = resolutionNotes;
    dispute.resolvedByAdminId = adminId;
    dispute.resolvedAt = new Date().toISOString();
    dispute.updatedAt = new Date().toISOString();

    saveStore();
    return dispute;
  },

  // Admin Metrics
  getAdminMetrics(): AdminMetrics {
    const store = loadStore();
    const totalUsers = store.users.length;
    const totalWorkers = store.workerProfiles.length;
    const verifiedWorkers = store.workerProfiles.filter(w => w.verificationStatus === 'VERIFIED').length;
    const pendingVerifications = store.workerProfiles.filter(w => w.verificationStatus === 'SUBMITTED' || w.verificationStatus === 'UNDER_REVIEW').length;
    const activeWorkers = store.workerProfiles.filter(w => w.isAvailableNow).length;
    const workersOnline = store.workerProfiles.filter(w => w.isOnline).length;
    const activeBookings = store.bookings.filter(b => b.status !== 'WORK_COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'PAYMENT_PAID').length;
    const jobsInProgress = store.bookings.filter(b => b.status === 'WORK_STARTED' || b.status === 'WORKER_ON_THE_WAY' || b.status === 'ARRIVED').length;
    const jobsCompleted = store.bookings.filter(b => b.status === 'WORK_COMPLETED' || b.status === 'CUSTOMER_CONFIRMED' || b.status === 'PAYMENT_PAID').length;
    const jobsCancelled = store.bookings.filter(b => b.status === 'CANCELLED').length;
    const activeTenders = store.tenders.filter(t => t.status === 'PUBLISHED').length;
    const tenderApplications = store.tenderApplications.length;

    const paidPayments = store.payments.filter(p => p.status === 'PAID');
    const totalPaymentsAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const platformCommissionTotal = paidPayments.reduce((sum, p) => sum + p.platformCommission, 0);
    const pendingPayouts = store.payouts.filter(p => p.status === 'PENDING');
    const pendingPayoutsAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
    const disputesOpen = store.disputes.filter(d => d.status === 'OPEN' || d.status === 'UNDER_INVESTIGATION').length;

    return {
      totalUsers,
      totalWorkers,
      verifiedWorkers,
      pendingVerifications,
      activeWorkers,
      workersOnline,
      activeBookings,
      jobsInProgress,
      jobsCompleted,
      jobsCancelled,
      activeTenders,
      tenderApplications,
      totalPaymentsAmount,
      platformCommissionTotal,
      pendingPayoutsAmount,
      disputesOpen,
    };
  },

  // Audit Logs
  logAdminAction(adminUserId: string, action: string, targetType: string, targetId: string, details?: string) {
    const store = loadStore();
    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      adminUserId,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    });
    if (store.auditLogs.length > 200) {
      store.auditLogs = store.auditLogs.slice(0, 200);
    }
    saveStore();
  },

  getAuditLogs() {
    const store = loadStore();
    return store.auditLogs;
  },

  // Instant MongoDB Atlas Record Deletions
  async deleteWorker(workerProfileId: string, adminUserId = 'admin') {
    const store = loadStore();
    const worker = store.workerProfiles.find(w => w.id === workerProfileId || w.userId === workerProfileId);
    const targetId = worker ? worker.id : workerProfileId;
    const userId = worker?.userId;

    store.workerProfiles = store.workerProfiles.filter(w => w.id !== targetId && w.userId !== targetId);
    store.bookingLocations = store.bookingLocations.filter(bl => bl.workerProfileId !== targetId);
    store.wallets = store.wallets.filter(wl => wl.workerProfileId !== targetId);
    saveStore();

    const atlasRes = await deleteMongoDocument('workerProfiles', targetId);
    if (userId) {
      store.users = store.users.filter(u => u.id !== userId);
      await deleteMongoDocument('users', userId);
    }
    await deleteMongoDocument('wallets', targetId);

    this.logAdminAction(adminUserId, 'INSTANT_DELETE_WORKER', 'WorkerProfile', targetId, 'Worker deleted permanently from MongoDB Atlas.');
    return { success: true, deletedCount: atlasRes.deletedCount };
  },

  async deleteUser(userId: string, adminUserId = 'admin') {
    const store = loadStore();
    store.users = store.users.filter(u => u.id !== userId);
    store.customerProfiles = store.customerProfiles.filter(c => c.userId !== userId);
    store.workerProfiles = store.workerProfiles.filter(w => w.userId !== userId);
    store.contractorProfiles = store.contractorProfiles.filter(cp => cp.userId !== userId);
    saveStore();

    const atlasRes = await deleteMongoDocument('users', userId);
    await deleteMongoDocument('workerProfiles', userId);
    await deleteMongoDocument('customerProfiles', userId);

    this.logAdminAction(adminUserId, 'INSTANT_DELETE_USER', 'User', userId, 'User deleted permanently from MongoDB Atlas.');
    return { success: true, deletedCount: atlasRes.deletedCount };
  },

  async deleteBooking(bookingId: string, adminUserId = 'admin') {
    const store = loadStore();
    store.bookings = store.bookings.filter(b => b.id !== bookingId);
    store.bookingLocations = store.bookingLocations.filter(bl => bl.bookingId !== bookingId);
    saveStore();

    const atlasRes = await deleteMongoDocument('bookings', bookingId);
    await deleteMongoDocument('bookingLocations', bookingId);

    this.logAdminAction(adminUserId, 'INSTANT_DELETE_BOOKING', 'Booking', bookingId, 'Booking deleted permanently from MongoDB Atlas.');
    return { success: true, deletedCount: atlasRes.deletedCount };
  },

  async deleteTender(tenderId: string, adminUserId = 'admin') {
    const store = loadStore();
    store.tenders = store.tenders.filter(t => t.id !== tenderId);
    store.tenderApplications = store.tenderApplications.filter(ta => ta.tenderId !== tenderId);
    saveStore();

    const atlasRes = await deleteMongoDocument('tenders', tenderId);
    await deleteMongoDocument('tenderApplications', tenderId);

    this.logAdminAction(adminUserId, 'INSTANT_DELETE_TENDER', 'Tender', tenderId, 'Tender deleted permanently from MongoDB Atlas.');
    return { success: true, deletedCount: atlasRes.deletedCount };
  },

  async deleteDispute(disputeId: string, adminUserId = 'admin') {
    const store = loadStore();
    store.disputes = store.disputes.filter(d => d.id !== disputeId);
    saveStore();

    const atlasRes = await deleteMongoDocument('disputes', disputeId);
    this.logAdminAction(adminUserId, 'INSTANT_DELETE_DISPUTE', 'JobDispute', disputeId, 'Dispute deleted permanently from MongoDB Atlas.');
    return { success: true, deletedCount: atlasRes.deletedCount };
  },
};
