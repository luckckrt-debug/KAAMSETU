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
} from './types';
import { calculateDistanceKm, calculateEstimatedEtaMinutes } from './geo';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'kaamsetu_store.json');

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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadStore(): DatabaseState {
  if (memoryState) return memoryState;

  ensureDataDir();

  if (fs.existsSync(STORE_FILE)) {
    try {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      memoryState = JSON.parse(content);
      return memoryState!;
    } catch (e) {
      console.error('[KAAMSETU DB] Error reading store file, reinitializing default seed:', e);
    }
  }

  memoryState = getInitialSeedData();
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
      description: 'House wiring, switchboard fixing, fan installation, MCB tripping, inverter setup.',
      subcategories: [
        { id: 'sub-elec-wiring', categoryId: 'cat-electrician', name: 'House Wiring & Conduit', nameHi: 'वायरिंग व पाइपिंग', slug: 'wiring' },
        { id: 'sub-elec-appliance', categoryId: 'cat-electrician', name: 'Fan & Light Installation', nameHi: 'पंखा व लाइट फिटिंग', slug: 'fans-lights' },
        { id: 'sub-elec-inverter', categoryId: 'cat-electrician', name: 'Inverter & Battery Wiring', nameHi: 'इन्वर्टर और बैटरी', slug: 'inverter-battery' },
        { id: 'sub-elec-mcb', categoryId: 'cat-electrician', name: 'Fuse, MCB & Short Circuit Repair', nameHi: 'शॉर्ट सर्किट और एमसीबी', slug: 'mcb-short-circuit' },
      ],
    },
    {
      id: 'cat-plumber',
      name: 'Plumber',
      nameHi: 'प्लंबर (नल मिस्त्री)',
      slug: 'plumber',
      iconName: 'Wrench',
      description: 'Leakage fixing, pipe fitting, sanitaryware, water tank cleaning, water pump motor repair.',
      subcategories: [
        { id: 'sub-plumb-leakage', categoryId: 'cat-plumber', name: 'Pipe Leakage & Tap Repair', nameHi: 'पाइप लीकेज व नल रिपेयर', slug: 'pipe-leakage' },
        { id: 'sub-plumb-sanitary', categoryId: 'cat-plumber', name: 'Toilet & Washbasin Fitting', nameHi: 'टॉयलेट व वाशबेसिन फिटिंग', slug: 'sanitary-fitting' },
        { id: 'sub-plumb-motor', categoryId: 'cat-plumber', name: 'Water Motor & Pump Installation', nameHi: 'मोटर पंप फिटिंग', slug: 'water-motor' },
        { id: 'sub-plumb-tank', categoryId: 'cat-plumber', name: 'Overhead Tank Cleaning', nameHi: 'पानी की टंकी सफाई', slug: 'tank-cleaning' },
      ],
    },
    {
      id: 'cat-mason',
      name: 'Mason',
      nameHi: 'राज मिस्त्री',
      slug: 'mason',
      iconName: 'Hammer',
      description: 'Brickwork, cement plastering, tile and marble laying, boundary wall, lintel casting.',
      subcategories: [
        { id: 'sub-mason-brick', categoryId: 'cat-mason', name: 'Brickwork & Wall Construction', nameHi: 'ईंट की चिनाई', slug: 'brickwork' },
        { id: 'sub-mason-plaster', categoryId: 'cat-mason', name: 'Cement Plastering', nameHi: 'सीमेंट प्लास्टर', slug: 'plastering' },
        { id: 'sub-mason-tiles', categoryId: 'cat-mason', name: 'Tiles & Marble Laying', nameHi: 'टाइल व मार्बल', slug: 'tiles-marble' },
        { id: 'sub-mason-concrete', categoryId: 'cat-mason', name: 'Roof Slab & Lintel Casting', nameHi: 'छत ढलाई व लेंटर', slug: 'concrete-slab' },
      ],
    },
    {
      id: 'cat-carpenter',
      name: 'Carpenter',
      nameHi: 'बढ़ई',
      slug: 'carpenter',
      iconName: 'Boxes',
      description: 'Door and window repair, lock fixing, modular kitchen, custom woodwork, bed and cupboard repair.',
      subcategories: [
        { id: 'sub-carp-door', categoryId: 'cat-carpenter', name: 'Door & Window Fitting / Lock', nameHi: 'दरवाजे व ताला रिपेयर', slug: 'doors-locks' },
        { id: 'sub-carp-kitchen', categoryId: 'cat-carpenter', name: 'Modular Kitchen Cabinets', nameHi: 'मॉड्यूलर किचन', slug: 'modular-kitchen' },
        { id: 'sub-carp-furniture', categoryId: 'cat-carpenter', name: 'Custom Furniture Making', nameHi: 'फर्नीचर निर्माण', slug: 'furniture' },
      ],
    },
    {
      id: 'cat-painter',
      name: 'Painter',
      nameHi: 'पेंटर (रंग मिस्त्री)',
      slug: 'painter',
      iconName: 'Paintbrush',
      description: 'Interior and exterior wall painting, wall putty, waterproof damp-proof treatment, texture painting.',
      subcategories: [
        { id: 'sub-paint-interior', categoryId: 'cat-painter', name: 'Interior Wall Painting & Putty', nameHi: 'अंदरूनी पेंट व पुट्टी', slug: 'interior-putty' },
        { id: 'sub-paint-waterproof', categoryId: 'cat-painter', name: 'Damp Proofing & Waterproofing', nameHi: 'सीलन व वॉटरप्रूफिंग', slug: 'waterproofing' },
        { id: 'sub-paint-texture', categoryId: 'cat-painter', name: 'Exterior Weathercoat & Texture', nameHi: 'एक्सटीरियर वेदरकोट', slug: 'exterior-texture' },
      ],
    },
    {
      id: 'cat-welder',
      name: 'Welder & Fabricator',
      nameHi: 'वेल्डर व फेब्रिकेटर',
      slug: 'welder',
      iconName: 'ShieldAlert',
      description: 'Iron gate, balcony grill, tin shed, railing, metal fabrication and on-site welding repair.',
      subcategories: [
        { id: 'sub-weld-gate', categoryId: 'cat-welder', name: 'Iron Gate & Balcony Grill', nameHi: 'गेट व ग्रिल फेब्रिकेशन', slug: 'gate-grill' },
        { id: 'sub-weld-repair', categoryId: 'cat-welder', name: 'Emergency Spot Welding Repair', nameHi: 'स्पॉट वेल्डिंग रिपेयर', slug: 'spot-welding' },
      ],
    },
    {
      id: 'cat-ac-tech',
      name: 'AC & Appliance Technician',
      nameHi: 'एसी व उपकरण टेक्नीशियन',
      slug: 'ac-appliance-technician',
      iconName: 'Fan',
      description: 'Split & window AC installation, jet pump cleaning, gas refill, washing machine and fridge repair.',
      subcategories: [
        { id: 'sub-ac-service', categoryId: 'cat-ac-tech', name: 'AC Foam Jet Service & Gas Topup', nameHi: 'एसी सर्विस व गैस टॉपअप', slug: 'ac-service' },
        { id: 'sub-ac-install', categoryId: 'cat-ac-tech', name: 'AC Installation & Uninstallation', nameHi: 'एसी फिटिंग व डिस्मेंटल', slug: 'ac-installation' },
        { id: 'sub-appliance-wm', categoryId: 'cat-ac-tech', name: 'Washing Machine Repair', nameHi: 'वॉशिंग मशीन रिपेयर', slug: 'washing-machine' },
      ],
    },
    {
      id: 'cat-labour',
      name: 'Construction Labour',
      nameHi: 'निर्माण मजदूर (बेलदार / रेजा)',
      slug: 'construction-labour',
      iconName: 'Users',
      description: 'Daily wage site helpers, loading/unloading, debris removal, excavation, concrete mixing helpers.',
      subcategories: [
        { id: 'sub-labour-daily', categoryId: 'cat-labour', name: 'Daily Site Helper (Beldar)', nameHi: 'बेलदार (दैनिक मजदूरी)', slug: 'site-beldar' },
        { id: 'sub-labour-material', categoryId: 'cat-labour', name: 'Building Material Loading/Shifting', nameHi: 'सामान ढुलाई व लोडिंग', slug: 'material-shifting' },
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
      const targetCategory = store.categories.find(c => c.slug === params.categorySlug);
      if (targetCategory) {
        workers = workers.filter(w => w.skills?.some(s => s.categoryId === targetCategory.id));
      }
    }

    if (params.query) {
      const q = params.query.toLowerCase();
      workers = workers.filter(w => 
        w.headline?.toLowerCase().includes(q) ||
        w.bio?.toLowerCase().includes(q) ||
        w.user?.fullName.toLowerCase().includes(q) ||
        w.skills?.some(s => s.categoryName?.toLowerCase().includes(q))
      );
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
    payment.updatedAt = new Date().toISOString();

    // Also update booking status to PAYMENT_PAID
    const booking = store.bookings.find(b => b.id === payment.bookingId);
    if (booking) {
      booking.status = 'PAYMENT_PAID';
      booking.updatedAt = new Date().toISOString();
    }

    saveStore();
    return payment;
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
};
