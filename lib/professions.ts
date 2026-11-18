// KAAMSETU - Dynamic Profession-Wise Marketplace Architecture
// Complete metadata registry for all 25 workforce professions

export interface ProfessionSubcategory {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  description: string;
  avgPrice: string;
}

export interface ProfessionPricingItem {
  service: string;
  serviceHi?: string;
  rate: string;
  timeEst: string;
  description: string;
}

export interface ProfessionFAQ {
  question: string;
  answer: string;
}

export interface ProfessionData {
  id: string;
  slug: string;
  aliases: string[];
  name: string;
  nameHi: string;
  singular: string;
  sector: 'Home & Domestic' | 'Construction & Civil' | 'Engineering & IT' | 'Transport & Logistics' | 'Facility & Security' | 'Care & Education' | 'Hospitality & Events';
  iconName: string;
  coverImage: string;
  intro: string;
  detailedBio: string;
  baseHourlyRate: number;
  baseDailyRate: number;
  workerCountEstimate: string;
  popularSkills: string[];
  subcategories: ProfessionSubcategory[];
  pricingGuide: ProfessionPricingItem[];
  requiredTools: string[];
  certifications: string[];
  faqs: ProfessionFAQ[];
}

export const PROFESSIONS_LIST: ProfessionData[] = [
  {
    id: 'cat-electricians',
    slug: 'electricians',
    aliases: ['electrician', 'cat-electrician', 'electrical'],
    name: 'Electricians',
    nameHi: 'बिजली मिस्त्री',
    singular: 'Electrician',
    sector: 'Home & Domestic',
    iconName: 'Zap',
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
    intro: 'Certified electricians for concealed residential wiring, MCB tripping repair, inverter-battery installation, switchboards, and emergency short circuits.',
    detailedBio: 'KaamSetu verified electricians hold government wireman licences or ITI certificates. They carry professional multi-meters, heavy-duty insulated hand tools, and core drilling gear for clean installations.',
    baseHourlyRate: 350,
    baseDailyRate: 1100,
    workerCountEstimate: '1,420+ Available',
    popularSkills: ['House Wiring', 'MCB Box Repair', 'Inverter Battery', 'Ceiling Fan Installation', 'Conduit Piping', 'Short Circuit Detection'],
    subcategories: [
      { id: 'sub-elec-1', name: 'House Wiring & Conduit', nameHi: 'वायरिंग व पाइपिंग', slug: 'wiring', description: 'Complete 1BHK/2BHK/3BHK concealed conduit wiring and cable pulling.', avgPrice: '₹15–22 / running ft' },
      { id: 'sub-elec-2', name: 'MCB & Short Circuit Repair', nameHi: 'शॉर्ट सर्किट और एमसीबी', slug: 'mcb', description: 'Immediate diagnosis of tripping MCBs, load balancing, and burnt neutral wire repair.', avgPrice: '₹350 / callout' },
      { id: 'sub-elec-3', name: 'Inverter & Battery Wiring', nameHi: 'इन्वर्टर और बैटरी', slug: 'inverter', description: 'Dual battery and solar hybrid inverter installation with bypass switch.', avgPrice: '₹450 / setup' },
      { id: 'sub-elec-4', name: 'Fan & Light Fitting', nameHi: 'पंखा व लाइट फिटिंग', slug: 'fans-lights', description: 'Exhaust fan, decorative chandeliers, LED profile lights, and modular switches.', avgPrice: '₹150 / point' },
    ],
    pricingGuide: [
      { service: 'Switchboard Inspection & Repair', rate: '₹199', timeEst: '30 mins', description: 'Fault diagnosis, loose contact tightening, burnt socket replacement.' },
      { service: 'Ceiling Fan Installation / Uninstallation', rate: '₹199', timeEst: '45 mins', description: 'Hook balancing, rod assembly, regulator connection, and safety check.' },
      { service: 'MCB / Distribution Board Replacement', rate: '₹499', timeEst: '1.5 hrs', description: 'Isolator and circuit breaker replacement with load testing.' },
      { service: 'Inverter Wiring & Setup', rate: '₹449', timeEst: '1 hr', description: 'Input/output line separation, heavy-duty battery terminal connections.' },
      { service: 'Emergency Short Circuit Diagnostics', rate: '₹399', timeEst: '1 hr', description: 'Megger insulation testing, underground cable fault isolation.' },
    ],
    requiredTools: ['Digital Multimeter', 'Insulated Pliers Set (1000V rated)', 'Heavy Rotary Hammer Drill', 'Conduit Pipe Bender', 'Wire Strippers', 'Phase Tester'],
    certifications: ['ITI Electrical Trade Certificate (NCVT/SCVT)', 'State Licensing Board Wireman Permit', 'Aadhaar Identity Verification'],
    faqs: [
      { question: 'How quickly can an electrician arrive in an emergency?', answer: 'Our emergency dispatch algorithm connects you with workers within 2–5 km who can reach your location in an average of 25–30 minutes.' },
      { question: 'Are replacement electrical parts included in the hourly rate?', answer: 'No. Labour charges cover diagnosis and fitting. Replacement switches, MCBs, or wires can be provided at actual retail MRP or supplied by you directly.' },
      { question: 'Do electricians carry insurance or safety gear?', answer: 'Yes, all KaamSetu verified electricians are trained in 1000V electrical safety and equipped with insulated protective tools.' },
    ],
  },
  {
    id: 'cat-plumbers',
    slug: 'plumbers',
    aliases: ['plumber', 'cat-plumber', 'plumbing'],
    name: 'Plumbers',
    nameHi: 'नल मिस्त्री',
    singular: 'Plumber',
    sector: 'Home & Domestic',
    iconName: 'Wrench',
    coverImage: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1200&auto=format&fit=crop&q=80',
    intro: 'Expert sanitary plumbers for CPVC/UPVC concealed pipe fittings, tap leaks, bathroom fixtures, pump motors, and water tank cleaning.',
    detailedBio: 'Master plumbers trained in residential pressure systems, diverters, Jaquar/Kohler sanitaryware, overhead tank pipelines, and water leakage waterproofing.',
    baseHourlyRate: 300,
    baseDailyRate: 950,
    workerCountEstimate: '980+ Available',
    popularSkills: ['Pipe Leakage', 'Diverter Repair', 'Water Motor Pump', 'Overhead Tank Cleaning', 'Drainage Unclogging', 'Toilet Commode Fitting'],
    subcategories: [
      { id: 'sub-plumb-1', name: 'Pipe Leakage & Tap Repair', nameHi: 'पाइप लीकेज व नल रिपेयर', slug: 'leaks', description: 'Concealed wall dampness detection, thread sealant, cartridge replacement.', avgPrice: '₹199 / fixture' },
      { id: 'sub-plumb-2', name: 'Bathroom & Sanitaryware', nameHi: 'टॉयलेट व वाशबेसिन फिटिंग', slug: 'sanitary', description: 'Wall-hung commode, concealed cistern, washbasin, and shower diverter installation.', avgPrice: '₹450 / item' },
      { id: 'sub-plumb-3', name: 'Water Motor & Pump Service', nameHi: 'मोटर पंप फिटिंग', slug: 'motor', description: 'Submersible and 1HP monobloc pump installation, capacitor check, and foot-valve repair.', avgPrice: '₹350 / pump' },
      { id: 'sub-plumb-4', name: 'Overhead Tank Cleaning', nameHi: 'पानी की टंकी सफाई', slug: 'tank', description: '500L–2000L water tank pressure jet washing, sludge vacuuming, and UV sanitation.', avgPrice: '₹499 / tank' },
    ],
    pricingGuide: [
      { service: 'Tap / Spout Repair or Replacement', rate: '₹149', timeEst: '20 mins', description: 'Spindle washer change, thread sealing, leak stoppage.' },
      { service: 'Water Motor Installation', rate: '₹399', timeEst: '1 hr', description: 'Inlet/outlet union fitting, foot-valve priming, electrical switch connection.' },
      { service: 'Concealed Shower Diverter Repair', rate: '₹499', timeEst: '1.5 hrs', description: 'Cartridge change, O-ring sealing, hot/cold balancing without tile breaking.' },
      { service: 'Drain Blockage Removal (Sink/Toilet)', rate: '₹349', timeEst: '45 mins', description: 'Mechanical drain auger clearing, trap cleaning, non-acidic solvent flush.' },
    ],
    requiredTools: ['Heavy Pipe Wrench (14" and 18")', 'Core Cutter Drill', 'Pressure Testing Pump', 'Drain Auger Cable', 'Thread Seal Tape & Teflon'],
    certifications: ['Govt Technical Plumbing Vocational Certificate', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Do plumbers help find concealed pipe leaks behind tiles?', answer: 'Yes, our plumbers perform pressure line testing to pinpoint the exact leak location, minimizing damage to tiles.' },
      { question: 'Can they clean overhead Sintex water tanks?', answer: 'Yes, our plumbers are equipped with pressure jet cleaners and slurry pumps for deep tank decontamination.' },
    ],
  },
  {
    id: 'cat-masons',
    slug: 'masons',
    aliases: ['mason', 'cat-mason', 'masonry'],
    name: 'Masons',
    nameHi: 'राज मिस्त्री',
    singular: 'Mason',
    sector: 'Construction & Civil',
    iconName: 'Hammer',
    coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=1200&auto=format&fit=crop&q=80',
    intro: 'Experienced raj mistris for brick masonry, cement plastering, lintel casting, boundary walls, foundation footings, and structural repairs.',
    detailedBio: 'Senior masons with decades of bricklaying and RCC expertise. Skilled in laser-level alignment, external waterproof sand plaster, and tile base preparation.',
    baseHourlyRate: 400,
    baseDailyRate: 1050,
    workerCountEstimate: '2,150+ Available',
    popularSkills: ['Brickwork', 'Cement Plaster', 'Lintel Slab Casting', 'Boundary Wall', 'Foundation Footing', 'Crack Filling'],
    subcategories: [
      { id: 'sub-mason-1', name: 'Brickwork & Wall Construction', nameHi: 'ईंट की चिनाई', slug: 'brickwork', description: '4.5-inch and 9-inch fly ash and red clay brick masonry with plumb-line precision.', avgPrice: '₹12–18 / sq ft' },
      { id: 'sub-mason-2', name: 'Cement Mortar Plastering', nameHi: 'सीमेंट प्लास्टर', slug: 'plaster', description: 'Smooth internal and rough sponge-finished external waterproof cement plaster.', avgPrice: '₹14–20 / sq ft' },
      { id: 'sub-mason-3', name: 'Lintel & Concrete Casting', nameHi: 'छत ढलाई व लेंटर', slug: 'concrete', description: 'Door lintels, chhajja sunshades, RCC beams, and slab vibrator finishing.', avgPrice: '₹25 / sq ft' },
    ],
    pricingGuide: [
      { service: 'Daily Skilled Mason Wage', rate: '₹1,050', timeEst: '8 hrs shift', description: 'Full day masonry work (08:30 AM to 05:30 PM) adhering to ISI brick standards.' },
      { service: 'Boundary Wall Construction (per running ft)', rate: '₹85', timeEst: 'Variable', description: 'Foundation trench, PCC, 9-inch brickwork, and coping beam.' },
      { service: 'Wall Plastering (Labour Rate per sq ft)', rate: '₹15', timeEst: '100 sq ft / day', description: '1:4 cement sand ratio mortar, bull mark leveling, sponge finish.' },
    ],
    requiredTools: ['Spirit Level (24" and 48")', 'Plumb Bob (Sahul)', 'Brick Trowel (Karni)', 'Mortar Pan (Tasla)', 'Measuring Tape (5m/30m)'],
    certifications: ['Construction Skill Development Council (CSDC) Certificate', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Can I hire a mason with helper labourers together?', answer: 'Yes, you can book an individual raj mistri or a full gang (1 mason + 2 beldars) directly on the platform.' },
    ],
  },
  {
    id: 'cat-carpenters',
    slug: 'carpenters',
    aliases: ['carpenter', 'cat-carpenter', 'carpentry', 'woodwork'],
    name: 'Carpenters',
    nameHi: 'बढ़ई (लकड़ी का काम)',
    singular: 'Carpenter',
    sector: 'Home & Domestic',
    iconName: 'Boxes',
    coverImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&auto=format&fit=crop&q=80',
    intro: 'Master woodworkers for door and window repair, mortise locks, modular kitchen cabinets, wooden partitions, beds, and custom wardrobe fabrication.',
    detailedBio: 'Skilled in engineered wood, HDMR, teak, plywood, and laminate pressing. Equipped with power planers, circular saws, and precision edge-banding tools.',
    baseHourlyRate: 350,
    baseDailyRate: 1000,
    workerCountEstimate: '840+ Available',
    popularSkills: ['Modular Kitchen', 'Door Locks', 'Wardrobe Making', 'Bed Repair', 'Laminate Pressing', 'Wood Polishing'],
    subcategories: [
      { id: 'sub-carp-1', name: 'Door & Window Fitting / Lock', nameHi: 'दरवाजे व ताला रिपेयर', slug: 'doors-locks', description: 'Door planing, godrej mortise locks, hinges, magnetic stoppers, and latches.', avgPrice: '₹249 / door' },
      { id: 'sub-carp-2', name: 'Modular Kitchen Cabinets', nameHi: 'मॉड्यूलर किचन', slug: 'modular-kitchen', description: 'Soft-close tandem box hinges, cutlery trays, corner carousels, and marine ply cabinets.', avgPrice: '₹1,200 / sq ft' },
      { id: 'sub-carp-3', name: 'Custom Wardrobes & Beds', nameHi: 'फर्नीचर निर्माण', slug: 'furniture', description: 'Sliding wardrobe systems, hydraulic storage double beds, and study desks.', avgPrice: '₹950 / sq ft' },
    ],
    pricingGuide: [
      { service: 'Godrej / Yale Mortise Lock Installation', rate: '₹299', timeEst: '45 mins', description: 'Wood chiseling, lock body fitting, handle alignment, and smooth deadbolt testing.' },
      { service: 'Door Alignment & Jam Removal', rate: '₹199', timeEst: '30 mins', description: 'Planing swollen wooden edges, tightening hinge screws, frame clearance.' },
      { service: 'Full Day Carpenter Wage', rate: '₹1,000', timeEst: '8 hrs shift', description: 'Dedicated on-site fabrication, laminate pasting, and woodwork alterations.' },
    ],
    requiredTools: ['Electric Circular Saw', 'Power Wood Planer', 'Chisel Set (Teekha)', 'Cordless Impact Driver', 'Corner Clamps'],
    certifications: ['Furniture & Fittings Skill Council (FFSC) Card', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Do carpenters handle modern hydraulic furniture?', answer: 'Yes, our carpenters are certified in fitting hydraulic pump beds, tandem drawers, and soft-close channel systems.' },
    ],
  },
  {
    id: 'cat-painters',
    slug: 'painters',
    aliases: ['painter', 'cat-painter', 'painting'],
    name: 'Painters',
    nameHi: 'रंग मिस्त्री',
    singular: 'Painter',
    sector: 'Home & Domestic',
    iconName: 'Paintbrush',
    coverImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=80',
    intro: 'Professional interior and exterior painters for wall putty, damp-proofing, exterior weathercoat, luxury texture art, and wood PU polish.',
    detailedBio: 'Experienced with Asian Paints, Berger, and Nerolac products. Masters of water-based primers, acrylic emulsion, enamel door paint, and damp-proof treatments.',
    baseHourlyRate: 300,
    baseDailyRate: 850,
    workerCountEstimate: '1,120+ Available',
    popularSkills: ['Wall Putty', 'Damp Proofing', 'Royal Luxury Emulsion', 'Texture Art', 'Door Polish', 'Exterior Weathercoat'],
    subcategories: [
      { id: 'sub-paint-1', name: 'Interior Wall Painting & Putty', nameHi: 'अंदरूनी पेंट व पुट्टी', slug: 'interior', description: '2 coats of Birla White putty, sanding, primer, and washable premium emulsion.', avgPrice: '₹12–18 / sq ft' },
      { id: 'sub-paint-2', name: 'Waterproofing & Damp Repair', nameHi: 'सीलन व वॉटरप्रूफिंग', slug: 'waterproofing', description: 'Chemical injection, Dr. Fixit damp-proof coating, and anti-efflorescence treatment.', avgPrice: '₹25 / sq ft' },
      { id: 'sub-paint-3', name: 'Wood PU & Melamine Polish', nameHi: 'लकड़ी की पॉलिश', slug: 'polish', description: 'Hand and spray PU polish for main doors, dining tables, and teak wood furniture.', avgPrice: '₹40 / sq ft' },
    ],
    pricingGuide: [
      { service: 'Single Room Fresh Repaint (Labour)', rate: '₹2,499', timeEst: '1.5 days', description: 'Wall preparation, minor crack putty, 2 coats of premium plastic emulsion.' },
      { service: 'Daily Painter Wage', rate: '₹850', timeEst: '8 hrs shift', description: 'Standard day shift for scraping, masking, priming, and painting.' },
      { service: 'Accent Feature Wall Texture Art', rate: '₹1,200', timeEst: '3 hrs', description: 'Designer metallic, stucco, or spatula texture finish on living room wall.' },
    ],
    requiredTools: ['Airless Paint Sprayer', 'Putty Knives (Patra)', 'Orbital Sanding Machine', 'Microfiber Rollers', 'Floor Protection Masking Film'],
    certifications: ['Paints and Coatings Skill Council (PCSC) Certified', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Will painters protect floors and furniture from paint drops?', answer: 'Yes, KaamSetu painters lay plastic masking sheets on all furniture and floors prior to beginning work.' },
    ],
  },
  {
    id: 'cat-welders',
    slug: 'welders',
    aliases: ['welder', 'cat-welder', 'welding', 'fabrication'],
    name: 'Welders & Fabricators',
    nameHi: 'वेल्डर व फेब्रिकेटर',
    singular: 'Welder',
    sector: 'Construction & Civil',
    iconName: 'ShieldAlert',
    coverImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80',
    intro: 'Certified welders for iron main gates, balcony safety grills, tin sheds, staircase railings, and on-site emergency structural repairs.',
    detailedBio: 'Equipped with portable inverter ARC and MIG welding plants. Specialized in MS pipe frames, stainless steel railings, safety gates, and industrial sheds.',
    baseHourlyRate: 400,
    baseDailyRate: 1150,
    workerCountEstimate: '630+ Available',
    popularSkills: ['ARC Welding', 'Main Gates', 'Balcony Grills', 'Tin Sheds', 'Staircase Railings', 'Spot Repair'],
    subcategories: [
      { id: 'sub-weld-1', name: 'Main Gates & Balcony Grills', nameHi: 'गेट व ग्रिल फेब्रिकेशन', slug: 'gates-grills', description: 'Custom MS and designer laser-cut decorative safety grills and sliding gates.', avgPrice: '₹110 / kg' },
      { id: 'sub-weld-2', name: 'Tin Shed & Truss Fabrication', nameHi: 'टिन शेड निर्माण', slug: 'sheds', description: 'Rooftop rainwater sheds with color-coated Tata BlueScope profile sheets.', avgPrice: '₹85 / sq ft' },
      { id: 'sub-weld-3', name: 'On-Site Emergency Spot Repair', nameHi: 'स्पॉट वेल्डिंग रिपेयर', slug: 'spot-repair', description: 'Broken gate hinges, railing reattachment, and shutter lock lugs.', avgPrice: '₹399 / spot' },
    ],
    pricingGuide: [
      { service: 'Gate Hinge / Latch Welding Repair', rate: '₹399', timeEst: '45 mins', description: 'Heavy-duty pin welding, anti-rust red oxide primer coat.' },
      { service: 'Daily Welder + Equipment Wage', rate: '₹1,450', timeEst: '8 hrs shift', description: 'Includes inverter welding machine, electrode rods, and angle grinder.' },
    ],
    requiredTools: ['Inverter ARC Welding Machine', 'Heavy 4-inch Angle Grinder', 'Auto-Darkening Welding Helmet', 'Chipping Hammer & Wire Brush'],
    certifications: ['ITI Welder Trade (NCVT)', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Do welders bring their own welding machine and electrodes?', answer: 'Yes, welders arrive with portable inverter machines that operate on standard household power points.' },
    ],
  },
  {
    id: 'cat-ac-technicians',
    slug: 'ac-technicians',
    aliases: ['ac-technician', 'cat-ac-tech', 'ac-appliance-technician', 'hvac'],
    name: 'AC & Refrigeration Technicians',
    nameHi: 'एसी व उपकरण टेक्नीशियन',
    singular: 'AC Technician',
    sector: 'Home & Domestic',
    iconName: 'Fan',
    coverImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&auto=format&fit=crop&q=80',
    intro: 'HVAC technicians for split and window AC power jet servicing, copper piping, refrigerant top-up, compressor replacement, and deep repairs.',
    detailedBio: 'Certified technicians for Daikin, Voltas, LG, Blue Star, and Mitsubishi. Experts in R32/R410A gas leak detection, inverter PCB repair, and foam jet cleaning.',
    baseHourlyRate: 450,
    baseDailyRate: 1200,
    workerCountEstimate: '760+ Available',
    popularSkills: ['Foam Jet Service', 'Gas Leakage Refill', 'Split AC Installation', 'Inverter PCB Repair', 'Copper Piping', 'Compressor Change'],
    subcategories: [
      { id: 'sub-ac-1', name: 'Power Jet Foam Service', nameHi: 'एसी सर्विस व फोम जेट', slug: 'jet-service', description: 'High-pressure water jet washing with AC cover jacket to avoid wall stains.', avgPrice: '₹449 / unit' },
      { id: 'sub-ac-2', name: 'AC Installation & Uninstallation', nameHi: 'एसी फिटिंग व डिस्मेंटल', slug: 'installation', description: 'Bracket mounting, core wall hole, copper flaring, vacuuming, and testing.', avgPrice: '₹999 / install' },
      { id: 'sub-ac-3', name: 'Gas Refill & Leak Testing', nameHi: 'गैस टॉपअप व लीकेज', slug: 'gas-refill', description: 'Nitrogen pressure testing, soap bubble check, brazing, and complete gas charging.', avgPrice: '₹1,800–2,400' },
    ],
    pricingGuide: [
      { service: 'Split AC Power Jet Foam Service', rate: '₹449', timeEst: '45 mins', description: 'Indoor cooling coil cleaning, outdoor unit condenser jet wash, drain pipe flush.' },
      { service: 'Split AC Complete Installation', rate: '₹999', timeEst: '1.5 hrs', description: 'Standard installation with vacuum pump line evacuation.' },
      { service: 'Full Refrigerant Gas Charging (R32 / R410A)', rate: '₹1,999', timeEst: '1 hr', description: 'Pressure leak test, vacuuming, and 100% manufacturer specified gas charge.' },
    ],
    requiredTools: ['High Pressure Foam Jet Washer', 'Digital Manifold Gauge Set', 'Eccentric Flaring Tool Kit', 'Rotary Vacuum Pump', 'Nitrogen Cylinder'],
    certifications: ['ITI Refrigeration & Air Conditioning (RAC)', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Why is vacuuming necessary before AC gas charging?', answer: 'Vacuuming removes atmospheric moisture and non-condensable air, preventing compressor breakdown and ensuring maximum cooling.' },
    ],
  },
  {
    id: 'cat-mechanics',
    slug: 'mechanics',
    aliases: ['mechanic', 'auto-mechanic', 'appliance-repair'],
    name: 'Mechanics',
    nameHi: 'मैकेनिक (ऑटो व मशीन)',
    singular: 'Mechanic',
    sector: 'Transport & Logistics',
    iconName: 'Wrench',
    coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&auto=format&fit=crop&q=80',
    intro: 'Automobile and machinery mechanics for on-site vehicle breakdown, battery jump-start, brake repairs, oil servicing, and engine diagnostics.',
    detailedBio: 'Trained mechanics for 2-wheelers, passenger cars, commercial light vehicles, and generators. Equipped with OBD2 diagnostic scanners, torque wrenches, and hydraulic jacks.',
    baseHourlyRate: 350,
    baseDailyRate: 1100,
    workerCountEstimate: '590+ Available',
    popularSkills: ['Emergency Breakdown', 'Battery Jump-Start', 'Brake Pad Replacement', 'OBD2 Diagnostics', 'Suspension Service', 'Generator Repair'],
    subcategories: [
      { id: 'sub-mech-1', name: 'Emergency Highway Breakdown', nameHi: 'ऑन-रोड ब्रेकडाउन', slug: 'breakdown', description: 'On-site puncture assistance, jump start, clutch cable repair, and coolant top-up.', avgPrice: '₹349 / call' },
      { id: 'sub-mech-2', name: 'Periodic Car Maintenance', nameHi: 'कार सर्विस', slug: 'car-service', description: 'Engine oil flush, synthetic oil change, air/oil filter replacement, and brake bleeding.', avgPrice: '₹799 / service' },
    ],
    pricingGuide: [
      { service: 'Car Battery Jump-Start (On-site)', rate: '₹299', timeEst: '20 mins', description: 'Heavy jumper cable starter boost and alternator voltage diagnostic.' },
      { service: 'Brake Pad Replacement (Front Pair)', rate: '₹449', timeEst: '45 mins', description: 'Caliper pin greasing, rotor inspection, and new pad alignment.' },
    ],
    requiredTools: ['Hydraulic Floor Jack', 'OBD2 Diagnostic Scanner Tool', 'Torque Wrench Set', 'Heavy-Duty Jump Cables'],
    certifications: ['Automotive Skills Development Council (ASDC) Certified', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Can a mechanic reach my broken down car on the expressway?', answer: 'Yes, our mobile roadside assistance mechanics travel on 2-wheelers with diagnostic gear for rapid arrival.' },
    ],
  },
  {
    id: 'cat-drivers',
    slug: 'drivers',
    aliases: ['driver', 'cat-driver', 'commercial-driver', 'chauffeur'],
    name: 'Drivers & Chauffeurs',
    nameHi: 'कमर्शियल ड्राइवर व शॉफर',
    singular: 'Driver',
    sector: 'Transport & Logistics',
    iconName: 'Truck',
    coverImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop&q=80',
    intro: 'Police-verified commercial chauffeurs, intra-city goods truck pilots, outstation tour drivers, and corporate executive fleet drivers.',
    detailedBio: 'Experienced drivers with valid commercial transport licences (LMV / HMV) and clean driving records. Well-versed with GPS navigation, expressway protocols, and defensive driving.',
    baseHourlyRate: 250,
    baseDailyRate: 850,
    workerCountEstimate: '1,850+ Available',
    popularSkills: ['Personal Chauffeur', 'Commercial Goods Truck', 'Outstation Driving', 'Automatic Cars', 'Night Driving', 'Fastag Protocols'],
    subcategories: [
      { id: 'sub-driv-1', name: 'Personal Daily Chauffeur', nameHi: 'पर्सनल शॉफर', slug: 'chauffeur', description: '8 to 12 hour dedicated driver for your private car.', avgPrice: '₹750–950 / day' },
      { id: 'sub-driv-2', name: 'Outstation Highway Driver', nameHi: 'आउटस्टेशन ड्राइवर', slug: 'outstation', description: 'Experienced long-distance driver for hill stations and interstate routes.', avgPrice: '₹1,200 / day' },
    ],
    pricingGuide: [
      { service: 'Daily Personal Chauffeur (8 Hours)', rate: '₹850', timeEst: '8 hrs', description: 'Professional driving for city commute, meetings, and family transit.' },
      { service: 'Single One-Way City Trip', rate: '₹399', timeEst: '2 hrs', description: 'Drive your vehicle to airport, hospital, or event venue.' },
    ],
    requiredTools: ['Commercial Driving Licence (LMV/HMV)', 'GPS Navigation Smartphone', 'Fastag Pass Access'],
    certifications: ['RTO Commercial Transport Badge', 'Police Verification Certificate', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Are drivers background checked and verified?', answer: 'Yes, every driver profile on KaamSetu requires police verification clearance, commercial licence verification, and Aadhaar validation.' },
    ],
  },
  {
    id: 'cat-construction-workers',
    slug: 'construction-workers',
    aliases: ['construction-worker', 'construction-labour', 'cat-labour', 'beldar'],
    name: 'Construction Workers & Labourers',
    nameHi: 'निर्माण मजदूर (बेलदार / रेजा)',
    singular: 'Construction Worker',
    sector: 'Construction & Civil',
    iconName: 'Users',
    coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80',
    intro: 'Daily wage building site helpers, material loading and unloading workers, excavation helpers, and concrete batch mixers.',
    detailedBio: 'Fit, disciplined workforce for residential and commercial construction sites. Skilled in building material shifting, shuttering assistance, and debris clearing.',
    baseHourlyRate: 200,
    baseDailyRate: 650,
    workerCountEstimate: '4,500+ Available',
    popularSkills: ['Material Shifting', 'Site Helper (Beldar)', 'Debris Clearing', 'Concrete Mixing', 'Trench Excavation', 'Demolition Help'],
    subcategories: [
      { id: 'sub-lab-1', name: 'Daily Site Helper (Beldar)', nameHi: 'दैनिक मजदूर', slug: 'helper', description: 'Mason assistance, mortar mixing, brick carrying, and scaffolding handling.', avgPrice: '₹650 / day' },
      { id: 'sub-lab-2', name: 'Material Loading & Unloading', nameHi: 'सामान ढुलाई व लोडिंग', slug: 'loading', description: 'Cement bags, steel saria, sand, aggregate, and floor tile shifting.', avgPrice: '₹700 / day' },
    ],
    pricingGuide: [
      { service: 'Daily Construction Helper Wage', rate: '₹650', timeEst: '8 hrs shift', description: '08:30 AM to 05:30 PM site helper shift with 1 hour lunch break.' },
      { service: 'Debris / Malba Clearing Team (per truck)', rate: '₹1,499', timeEst: '2 hrs', description: 'Loading construction debris onto commercial tipper trucks.' },
    ],
    requiredTools: ['ISI Mark Safety Hard Hat', 'High-Visibility Safety Vest', 'Steel-Toe Boots', 'Spade & Pan (Fawda & Tasla)'],
    certifications: ['BOCW Welfare Card (E-Shram / State Board)', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Can I hire 20+ labourers for tomorrow morning?', answer: 'Yes, use our Bulk Hiring portal or select multiple workers to deploy a full team with digital attendance.' },
    ],
  },
  {
    id: 'cat-civil-engineers',
    slug: 'civil-engineers',
    aliases: ['civil-engineer', 'civil-engineer-supervisor', 'site-engineer'],
    name: 'Civil Engineers & Supervisors',
    nameHi: 'सिविल साइट इंजीनियर व सुपरवाइजर',
    singular: 'Civil Engineer',
    sector: 'Engineering & IT',
    iconName: 'ClipboardCheck',
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop&q=80',
    intro: 'Qualified civil engineers and site supervisors for architectural drawing execution, structural QA/QC, bar bending schedules, and contractor oversight.',
    detailedBio: 'B.Tech and Diploma civil engineers with experience in residential high-rises and commercial complexes. Experts in concrete slump testing, BBS verification, and stage-wise billing.',
    baseHourlyRate: 600,
    baseDailyRate: 1800,
    workerCountEstimate: '340+ Available',
    popularSkills: ['Structural QA/QC', 'BBS Schedule', 'Site Supervision', 'Quantity Survey', 'AutoCAD Drawing Reading', 'Contractor Billing'],
    subcategories: [
      { id: 'sub-civ-1', name: 'Site Quality Supervision', nameHi: 'क्वालिटी चेकिंग', slug: 'quality', description: 'Concrete cube testing, shuttering alignment check, and reinforcement audit.', avgPrice: '₹1,800 / day' },
      { id: 'sub-civ-2', name: 'Bar Bending Schedule (BBS)', nameHi: 'बीबीएस शेड्यूल', slug: 'bbs', description: 'Accurate steel optimization to reduce site scrap wastage below 2%.', avgPrice: '₹3,500 / project' },
    ],
    pricingGuide: [
      { service: 'Daily Civil Site Engineer Audit', rate: '₹1,800', timeEst: '8 hrs shift', description: 'Full day technical supervision of ongoing structural casting and masonry.' },
      { service: 'Pre-Pour Slab Reinforcement Inspection', rate: '₹1,199', timeEst: '2 hrs', description: 'Comprehensive check of cover blocks, electrical conduit layout, and rebar lap lengths.' },
    ],
    requiredTools: ['Digital Auto Level Instrument', 'Rebound Concrete Hammer (Schmidt)', 'Digital Vernier Caliper', 'Concrete Slump Cone'],
    certifications: ['B.Tech / Diploma in Civil Engineering (AICTE Recognized)', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Why should I hire a civil engineer before casting a roof slab?', answer: 'An independent engineer checks column rebar lap lengths, cover blocks, and concrete grade to prevent costly structural failures.' },
    ],
  },
  {
    id: 'cat-cleaners',
    slug: 'cleaners',
    aliases: ['cleaner', 'deep-cleaning-housekeeping', 'janitor', 'cleaning'],
    name: 'Cleaners & Sanitization Specialists',
    nameHi: 'डीप क्लीनिंग व सफाई विशेषज्ञ',
    singular: 'Cleaner',
    sector: 'Facility & Security',
    iconName: 'Sparkles',
    coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80',
    intro: 'Deep cleaning professionals for homes, sofa and mattress shampooing, kitchen degreasing, bathroom descaling, and corporate janitorial services.',
    detailedBio: 'Trained in hospital-grade chemical sanitization, single-disc floor scrubbers, and industrial extraction vacuums. Leaves homes sparkling and allergen-free.',
    baseHourlyRate: 250,
    baseDailyRate: 750,
    workerCountEstimate: '1,650+ Available',
    popularSkills: ['Full Home Deep Clean', 'Sofa Shampoo', 'Kitchen Degreasing', 'Bathroom Descaling', 'Floor Scrubbing', 'Post-Construction Clean'],
    subcategories: [
      { id: 'sub-clean-1', name: 'Full Home Deep Clean', nameHi: 'फुल होम डीप क्लीनिंग', slug: 'home-clean', description: 'Ceiling to floor intensive cleaning for empty or occupied 1/2/3/4 BHK flats.', avgPrice: '₹2,499–4,999' },
      { id: 'sub-clean-2', name: 'Sofa & Mattress Shampoo', nameHi: 'सोफा व कारपेट शैम्पू', slug: 'sofa', description: 'Wet extraction injection vacuum cleaning to remove dust mites and deep stains.', avgPrice: '₹799 / 5-seater' },
    ],
    pricingGuide: [
      { service: '2 BHK Complete Home Deep Clean', rate: '₹3,499', timeEst: '5 hrs', description: 'Includes 2 cleaners with single-disc floor scrubbing machine and Taski chemicals.' },
      { service: '5-Seater Fabric Sofa Deep Shampoo', rate: '₹799', timeEst: '1.5 hrs', description: 'Foam application, deep extraction vacuuming, and fabric conditioning.' },
    ],
    requiredTools: ['Single-Disc Floor Scrubber Machine', 'Industrial Wet & Dry Extraction Vacuum', 'Steam Cleaner', 'Taski Pro Cleaning Chemicals'],
    certifications: ['Hospitality & Facility Janitorial Standards Training', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'What chemicals are used for kitchen and bathroom deep cleaning?', answer: 'We use professional, eco-friendly Taski R-series formulations that effectively remove grime without damaging marble or fixtures.' },
    ],
  },
  {
    id: 'cat-cooks',
    slug: 'cooks',
    aliases: ['cook', 'chef', 'catering'],
    name: 'Cooks & Catering Chefs',
    nameHi: 'रसोइया व कैटरिंग शेफ',
    singular: 'Cook',
    sector: 'Care & Education',
    iconName: 'PartyPopper',
    coverImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&auto=format&fit=crop&q=80',
    intro: 'Experienced domestic cooks, multi-cuisine party chefs, and halwai masters for daily household meals, small get-togethers, and festive banquets.',
    detailedBio: 'Skilled in North Indian, South Indian, Mughlai, Chinese, and Jain cuisine. Hygiene-conscious, punctual, and well-versed with specialized dietary requirements.',
    baseHourlyRate: 350,
    baseDailyRate: 1000,
    workerCountEstimate: '720+ Available',
    popularSkills: ['North Indian', 'South Indian', 'Mughlai Cuisine', 'Party Catering', 'Halwai Desserts', 'Jain Food'],
    subcategories: [
      { id: 'sub-cook-1', name: 'House Party Cook (Up to 25 Guests)', nameHi: 'पार्टी कुक', slug: 'party-cook', description: '3 course gourmet meal preparation at your home kitchen.', avgPrice: '₹1,799 / event' },
      { id: 'sub-cook-2', name: 'Daily Home Cook Monthly Plan', nameHi: 'मासिक रसोइया', slug: 'monthly-cook', description: 'Breakfast, lunch, or dinner cooking on monthly retainer.', avgPrice: '₹4,500 / month' },
    ],
    pricingGuide: [
      { service: 'Dinner Party Cook (Up to 15 Guests)', rate: '₹1,499', timeEst: '3.5 hrs', description: 'Preparation of 2 starters, 3 main course dishes, breads, and dessert.' },
      { service: 'Full Day Festival / Pooja Cook', rate: '₹1,200', timeEst: '7 hrs', description: 'Satvik/pure vegetarian festive feast preparation.' },
    ],
    requiredTools: ['Chef Knife Set', 'Culinary Thermometer', 'Apron & Chef Cap Uniform', 'Hygiene Kit'],
    certifications: ['Food Safety & Hygiene Standards (FSSAI Awareness)', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Do cooks bring grocery ingredients?', answer: 'No. The host provides raw ingredients and spices, and our chefs prepare fresh dishes in your kitchen.' },
    ],
  },
  {
    id: 'cat-security-guards',
    slug: 'security-guards',
    aliases: ['security-guard', 'security-guard-bouncers', 'guard', 'bouncer'],
    name: 'Security Guards & Bouncers',
    nameHi: 'सुरक्षा गार्ड व बाउंसर',
    singular: 'Security Guard',
    sector: 'Facility & Security',
    iconName: 'Shield',
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    intro: 'PSARA-certified uniformed security guards, gated community watchmen, armed bank escorts, and personal event bouncers.',
    detailedBio: 'Ex-servicemen and certified security personnel trained in access control, visitor management, fire safety, CCTV monitoring, and crisis crowd control.',
    baseHourlyRate: 250,
    baseDailyRate: 850,
    workerCountEstimate: '1,950+ Available',
    popularSkills: ['PSARA Certified', 'Gate Access Control', 'Fire Safety Protocol', 'CCTV Monitoring', 'Event Bouncer', 'Visitor Logging'],
    subcategories: [
      { id: 'sub-sec-1', name: 'Residential Society Security', nameHi: 'सोसायटी सुरक्षा गार्ड', slug: 'residential', description: '12-hour day/night shifts with digital MyGate/visitor register management.', avgPrice: '₹850 / 12-hr shift' },
      { id: 'sub-sec-2', name: 'VIP & Event Bouncers', nameHi: 'इवेंट बाउंसर', slug: 'bouncers', description: 'Well-built, disciplined crowd control personnel for weddings and concerts.', avgPrice: '₹1,800 / event' },
    ],
    pricingGuide: [
      { service: 'Uniformed Security Guard (12-Hour Shift)', rate: '₹850', timeEst: '12 hrs', description: 'Visitor screening, perimeter patrolling, and gate register maintenance.' },
      { service: 'Event Safety Bouncer (6-Hour Shift)', rate: '₹1,499', timeEst: '6 hrs', description: 'VIP protection, queue management, and entrance crowd regulation.' },
    ],
    requiredTools: ['Handheld Metal Detector Wand', 'Baton & Heavy Security Torch', 'Two-Way Radio Walkie-Talkie', 'Formal Uniform & Badge'],
    certifications: ['PSARA Security Training Certification', 'Police Clearance Certificate', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Are guards trained in emergency fire fighting?', answer: 'Yes, PSARA-certified personnel undergo mandatory basic fire extinguisher operation and building evacuation drill training.' },
    ],
  },
  {
    id: 'cat-farm-workers',
    slug: 'farm-workers',
    aliases: ['farm-worker', 'gardener-mali-landscaper', 'mali', 'agriculture'],
    name: 'Farm Workers & Gardeners',
    nameHi: 'कृषि मजदूर व माली',
    singular: 'Farm Worker',
    sector: 'Care & Education',
    iconName: 'TreePine',
    coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&auto=format&fit=crop&q=80',
    intro: 'Skilled agricultural labourers, farm hands, and experienced malis for lawn maintenance, organic farming, tree pruning, and irrigation.',
    detailedBio: 'Experienced in nursery maintenance, seasonal flower beds, bonsai care, vermicompost application, drip irrigation pipe setup, and orchard harvesting.',
    baseHourlyRate: 200,
    baseDailyRate: 700,
    workerCountEstimate: '640+ Available',
    popularSkills: ['Lawn Mowing', 'Organic Composting', 'Tree Pruning', 'Drip Irrigation', 'Crop Harvesting', 'Pest Spraying'],
    subcategories: [
      { id: 'sub-farm-1', name: 'Residential Garden Maintenance', nameHi: 'माली सेवा', slug: 'gardening', description: 'Lawn trimming, weeding, fertilizer application, and plant potting.', avgPrice: '₹399 / visit' },
      { id: 'sub-farm-2', name: 'Agricultural Daily Labour', nameHi: 'कृषि मजदूर', slug: 'farm-labour', description: 'Plowing, sowing, weeding, and crop harvesting assistance.', avgPrice: '₹650 / day' },
    ],
    pricingGuide: [
      { service: 'Complete Lawn & Garden Makeover', rate: '₹699', timeEst: '3 hrs', description: 'Lawn mowing, hedge shaping, dead leaf clearing, and soil aeration.' },
      { service: 'Daily Farm Labour Shift', rate: '₹700', timeEst: '8 hrs shift', description: 'Dedicated agricultural work for farms and polyhouses.' },
    ],
    requiredTools: ['Electric/Petrol Lawn Mower', 'Hedge Trimming Shears', 'Garden Spade & Pruners', 'Chemical Spray Canister'],
    certifications: ['Agricultural Skill Council of India (ASCI) Certified', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Can gardeners bring organic fertilizer and new flower saplings?', answer: 'Yes, malis can source seasonal saplings and vermicompost on request at wholesale nursery prices.' },
    ],
  },
  {
    id: 'cat-it-professionals',
    slug: 'it-professionals',
    aliases: ['it-professional', 'computer-repair', 'network-engineer'],
    name: 'IT Technicians & Hardware Specialists',
    nameHi: 'आईटी तकनीशियन',
    singular: 'IT Professional',
    sector: 'Engineering & IT',
    iconName: 'ClipboardCheck',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
    intro: 'Computer hardware engineers, Wi-Fi mesh network specialists, printer repair technicians, and remote IT support professionals.',
    detailedBio: 'Certified hardware and networking engineers for desktop/laptop repair, OS installation, SSD upgrades, thermal paste renewal, LAN cabling, and enterprise router configs.',
    baseHourlyRate: 500,
    baseDailyRate: 1500,
    workerCountEstimate: '480+ Available',
    popularSkills: ['Laptop Repair', 'Wi-Fi Mesh Setup', 'LAN Cabling', 'SSD Upgrade', 'Data Recovery', 'OS & Antivirus'],
    subcategories: [
      { id: 'sub-it-1', name: 'Laptop & PC Hardware Repair', nameHi: 'लैपटॉप रिपेयर', slug: 'laptop-repair', description: 'Screen replacement, keyboard fix, RAM/SSD upgrade, hinge repair.', avgPrice: '₹499 / diagnosis' },
      { id: 'sub-it-2', name: 'Home & Office Wi-Fi Networking', nameHi: 'वाईफाई व नेटवर्क', slug: 'networking', description: 'Dual-band router, range extender, structured Cat6 cabling, and switch setup.', avgPrice: '₹650 / setup' },
    ],
    pricingGuide: [
      { service: 'Laptop Deep Clean & Thermal Paste Replacement', rate: '₹599', timeEst: '1 hr', description: 'Cooling fan dust removal, Arctic MX-4 thermal paste renewal, temperature drop test.' },
      { service: 'SSD Upgrade & Windows Cloning', rate: '₹699', timeEst: '1.5 hrs', description: 'Data clone from old HDD to high-speed NVMe/SATA SSD with zero data loss.' },
    ],
    requiredTools: ['Precision Anti-Static Screwdriver Kit', 'RJ45 Network Cable Crimper & Tester', 'Digital Multimeter', 'External SATA/NVMe USB Enclosure'],
    certifications: ['CompTIA A+ / Cisco CCNA / Microsoft MCP Certified', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Is my data safe during laptop repairs?', answer: 'Yes, our certified technicians carry strict privacy agreements and can perform hardware repairs in your presence at your desk.' },
    ],
  },
  {
    id: 'cat-healthcare-workers',
    slug: 'healthcare-workers',
    aliases: ['healthcare-worker', 'nursing-attendant', 'home-care'],
    name: 'Healthcare Workers & Nursing Attendants',
    nameHi: 'स्वास्थ्य परिचारक व नर्स',
    singular: 'Healthcare Worker',
    sector: 'Care & Education',
    iconName: 'ShieldCheck',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
    intro: 'Trained medical attendants, GDA bedside nurses, elder care companions, and post-surgery rehabilitation aides for home care.',
    detailedBio: 'Certified General Duty Assistants (GDA) and ANM/GNM nurses experienced in vital signs monitoring, IV line maintenance, tracheostomy care, catheter management, and bedridden patient physiotherapy.',
    baseHourlyRate: 350,
    baseDailyRate: 1200,
    workerCountEstimate: '420+ Available',
    popularSkills: ['Elderly Care', 'Vital Signs Monitoring', 'Injection & IV Support', 'Post-Op Rehab', 'Bedridden Care', 'Wound Dressing'],
    subcategories: [
      { id: 'sub-health-1', name: '12-Hour Bedside Nursing Attendant', nameHi: '12-घंटे नर्सिंग अटेंडेंट', slug: 'bedside-care', description: 'Bathing, medication management, feeding, and mobility assistance.', avgPrice: '₹1,200 / 12-hr shift' },
      { id: 'sub-health-2', name: 'On-Call Nurse Procedure Visit', nameHi: 'नर्स विजिट', slug: 'procedure', description: 'Injection administration, surgical dressing, urinary catheter change.', avgPrice: '₹349 / visit' },
    ],
    pricingGuide: [
      { service: 'Daily Nursing Attendant (12 Hours Shift)', rate: '₹1,200', timeEst: '12 hrs', description: 'Continuous patient observation, medication, sponge bath, and vital charts.' },
      { service: 'Surgical Wound Dressing & Bandage', rate: '₹349', timeEst: '30 mins', description: 'Sterile Betadine cleaning, non-stick dressing, and surgical taping.' },
    ],
    requiredTools: ['Digital Blood Pressure Monitor', 'Pulse Oximeter', 'Digital Thermometer', 'Glucometer Kit', 'Sterile Dressing Scissors'],
    certifications: ['General Duty Assistant (GDA) Healthcare Council Card', 'ANM/GNM Nursing Diploma', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Can attendants handle oxygen concentrators and BiPAP machines?', answer: 'Yes, our certified nursing attendants are trained in operating home medical oxygen devices and nebulizers.' },
    ],
  },
  {
    id: 'cat-beauty-professionals',
    slug: 'beauty-professionals',
    aliases: ['beauty-professional', 'beautician', 'salon-at-home'],
    name: 'Beauty Professionals & Beauticians',
    nameHi: 'ब्यूटीशियन व सैलून एक्सपर्ट',
    singular: 'Beauty Professional',
    sector: 'Care & Education',
    iconName: 'Sparkles',
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80',
    intro: 'Certified salon-at-home beauticians for facials, waxing, manicures, bridal makeup, hair styling, and mehendi design.',
    detailedBio: 'Trained aesthetic professionals using single-use hygienic disposable kits and branded cosmetics (O3+, Cheryls, L’Oreal). Complete salon experience in the comfort of your home.',
    baseHourlyRate: 350,
    baseDailyRate: 1200,
    workerCountEstimate: '610+ Available',
    popularSkills: ['Bridal Makeup', 'O3+ Facial', 'Rica Waxing', 'Pedicure & Manicure', 'Hair Spa', 'Mehendi Design'],
    subcategories: [
      { id: 'sub-beauty-1', name: 'Facial & Cleanup Treatments', nameHi: 'फेशियल व क्लीनअप', slug: 'facials', description: 'O3+ diamond brightening, anti-tan facial, and ultrasonic skin scrubber.', avgPrice: '₹799–1,499' },
      { id: 'sub-beauty-2', name: 'Rica Liposoluble Waxing', nameHi: 'वैक्सिंग', slug: 'waxing', description: 'Pain-free, colophony-free Italian Rica wax with single-use strips.', avgPrice: '₹499 / full arms+legs' },
    ],
    pricingGuide: [
      { service: 'O3+ Glow Diamond Facial Package', rate: '₹1,299', timeEst: '1 hr', description: 'Cleansing, enzymatic exfoliation, whitening serum massage, peel-off mask.' },
      { service: 'Full Arms & Legs Rica Waxing + Underarms', rate: '₹649', timeEst: '45 mins', description: 'Hygienic single-use cartridges, post-wax calming lotion.' },
    ],
    requiredTools: ['Wax Heater Unit', 'High-Frequency Facial Wand', 'Single-Use Disposable Bed Linen Kit', 'Professional Makeup Case'],
    certifications: ['Beauty & Wellness Sector Skill Council (B&WSSC) Certificate', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Do beauticians bring single-use disposable kits?', answer: 'Yes, 100% disposable sheets, wooden spatulas, headbands, and gloves are unpacked fresh in front of the client.' },
    ],
  },
  {
    id: 'cat-tutors',
    slug: 'tutors',
    aliases: ['tutor', 'home-tutor', 'teacher'],
    name: 'Home Tutors & Instructors',
    nameHi: 'होम ट्यूटर व शिक्षक',
    singular: 'Tutor',
    sector: 'Care & Education',
    iconName: 'ClipboardCheck',
    coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
    intro: 'Experienced home tutors for CBSE/ICSE board preparation, STEM subjects, English communication, music instruments, and competitive exams.',
    detailedBio: 'Degree-holding educators with proven track records in Mathematics, Physics, Chemistry, and Languages. Personalized 1-on-1 teaching methodology focused on conceptual clarity.',
    baseHourlyRate: 400,
    baseDailyRate: 1200,
    workerCountEstimate: '530+ Available',
    popularSkills: ['Mathematics', 'Physics & Chemistry', 'CBSE / ICSE Board', 'English Speaking', 'Coding for Kids', 'Guitar / Keyboard'],
    subcategories: [
      { id: 'sub-tut-1', name: 'Class 9th–12th STEM Subjects', nameHi: 'कक्षा 9-12 विज्ञान व गणित', slug: 'stem', description: 'Specialized 1-on-1 coaching for Physics, Chemistry, and Advanced Mathematics.', avgPrice: '₹500 / hr' },
      { id: 'sub-tut-2', name: 'Primary & Middle School All Subjects', nameHi: 'कक्षा 1-8 सभी विषय', slug: 'primary', description: 'Daily homework help, concept building, and weekly test evaluation.', avgPrice: '₹350 / hr' },
    ],
    pricingGuide: [
      { service: '1-on-1 Hourly Tuition Session', rate: '₹400', timeEst: '1 hr', description: 'Interactive chapter revision, doubt clearing, and practice worksheets.' },
      { service: 'Monthly 12-Session Package (3 days/wk)', rate: '₹4,500', timeEst: '12 hrs', description: 'Dedicated monthly syllabus completion with monthly progress reports.' },
    ],
    requiredTools: ['Digital Stylus Tablet', 'Curated NCERT / Exemplar Notes', 'Diagnostic Assessment Papers'],
    certifications: ['Postgraduate / B.Ed Academic Degree', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Can I request a free demo session before confirming a monthly tutor?', answer: 'Yes, most tutors offer a 30-minute introductory interaction to assess the student syllabus requirements.' },
    ],
  },
  {
    id: 'cat-machine-operators',
    slug: 'machine-operators',
    aliases: ['machine-operator', 'heavy-machinery-jcb-operator', 'jcb-operator', 'crane-operator'],
    name: 'Heavy Machine & JCB Operators',
    nameHi: 'भारी मशीनरी व जेसीबी ऑपरेटर',
    singular: 'Machine Operator',
    sector: 'Transport & Logistics',
    iconName: 'Car',
    coverImage: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1200&auto=format&fit=crop&q=80',
    intro: 'Certified heavy earthmoving machine operators for JCB 3DX, tracked excavators, hydra mobile cranes, soil compactors, and road rollers.',
    detailedBio: 'Experienced operators with HMV/Earthmoving endorsed licences. Skilled in deep trenching, rock breaking, high-rise tower footing excavation, and precision crane rigging.',
    baseHourlyRate: 500,
    baseDailyRate: 1500,
    workerCountEstimate: '480+ Available',
    popularSkills: ['JCB 3DX Backhoe', 'Tracked Excavator', 'Hydra Mobile Crane', 'Rock Breaker Attachment', 'Soil Compactor', 'Site Levelling'],
    subcategories: [
      { id: 'sub-mach-1', name: 'JCB 3DX Loader & Backhoe Operator', nameHi: 'जेसीबी ऑपरेटर', slug: 'jcb', description: 'Trenching, pit excavation, soil backfilling, and truck loading.', avgPrice: '₹1,500 / day shift' },
      { id: 'sub-mach-2', name: 'Tracked Excavator & Breaker', nameHi: 'हाइड्रोलिक एक्सकेवेटर', slug: 'excavator', description: 'Basement deep excavation and rock breaker pneumatic operation.', avgPrice: '₹1,800 / day shift' },
    ],
    pricingGuide: [
      { service: 'Daily JCB Operator Wage (8 Hours)', rate: '₹1,500', timeEst: '8 hrs shift', description: 'Experienced licensed pilot for backhoe and front loader.' },
      { service: 'Mobile Hydra Crane Operator (12–15 Ton)', rate: '₹1,700', timeEst: '8 hrs shift', description: 'Precision heavy machinery erection and precast beam placement.' },
    ],
    requiredTools: ['Heavy Commercial Transport & Earthmoving Licence', 'Machine Diagnostic Scanner', 'Safety Harness & Hard Hat'],
    certifications: ['Directorate of Transport Earthmoving Operator Badge', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Does the operator wage include machine rental?', answer: 'The rate listed is for the certified machine operator pilot. Machine hire with diesel can be arranged via the Tenders & Contractor desk.' },
    ],
  },
  {
    id: 'cat-warehouse-workers',
    slug: 'warehouse-workers',
    aliases: ['warehouse-worker', 'warehouse-packaging-workforce', 'packaging'],
    name: 'Warehouse & Logistics Staff',
    nameHi: 'वेयरहाउस व पैकेजिंग मजदूर',
    singular: 'Warehouse Worker',
    sector: 'Transport & Logistics',
    iconName: 'Package',
    coverImage: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&auto=format&fit=crop&q=80',
    intro: 'E-commerce warehouse sorting associates, pallet shrink wrappers, barcode scanner operators, and container unloading helpers.',
    detailedBio: 'Trained workforce for modern logistics hubs and fulfillment centers. Experienced with Hand Pallet Trucks (BOPT), carton taping, pick-list matching, and inventory stocking.',
    baseHourlyRate: 200,
    baseDailyRate: 700,
    workerCountEstimate: '2,200+ Available',
    popularSkills: ['Carton Packaging', 'BOPT Pallet Handling', 'Container Unloading', 'Barcode Scanning', 'Inventory Sorting', 'Shrink Wrapping'],
    subcategories: [
      { id: 'sub-pack-1', name: 'Order Packing & Carton Taping', nameHi: 'पैकिंग व टेपिंग', slug: 'packing', description: 'High-speed eCommerce carton packing with bubble cushioning and label scanning.', avgPrice: '₹700 / shift' },
      { id: 'sub-pack-2', name: 'Pallet Handling & BOPT Operation', nameHi: 'पैलेट मूविंग', slug: 'pallet', description: 'Shrink wrapping wooden pallets and staging goods into bay racks.', avgPrice: '₹750 / shift' },
    ],
    pricingGuide: [
      { service: 'Daily Warehouse Associate Shift (8 Hours)', rate: '₹700', timeEst: '8 hrs shift', description: 'Includes picking, scanning, packing, and dispatch sorting.' },
    ],
    requiredTools: ['Handheld Stretch Film Dispenser', 'Manual Pallet Truck (BOPT)', 'Barcode Scanner Terminal', 'Heavy Duty Grip Gloves'],
    certifications: ['Logistics Sector Skill Council (LSSC) Card', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Can warehouse teams work on night shifts?', answer: 'Yes, our logistics crews are available for both day and night dispatch shifts with digital attendance.' },
    ],
  },
  {
    id: 'cat-delivery-workers',
    slug: 'delivery-workers',
    aliases: ['delivery-worker', 'delivery-boy', 'courier'],
    name: 'Delivery Workers & Fleet Pilots',
    nameHi: 'डिलीवरी बॉय व कूरियर पायलट',
    singular: 'Delivery Worker',
    sector: 'Transport & Logistics',
    iconName: 'Truck',
    coverImage: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=1200&auto=format&fit=crop&q=80',
    intro: 'On-demand delivery pilots with 2-wheelers and commercial EV vans for intra-city parcel, grocery, medicine, and food logistics.',
    detailedBio: 'Fast, verified delivery personnel equipped with smartphones and insulated thermal delivery bags. Punctual transit with real-time GPS tracking and OTP proof-of-delivery.',
    baseHourlyRate: 200,
    baseDailyRate: 700,
    workerCountEstimate: '1,750+ Available',
    popularSkills: ['Hyperlocal Delivery', 'EV 2-Wheeler Fleet', 'Cash on Delivery (COD)', 'OTP Verification', 'Route Optimization', 'Express Parcel'],
    subcategories: [
      { id: 'sub-del-1', name: 'Dedicated Daily Delivery Pilot', nameHi: 'दैनिक डिलीवरी पायलट', slug: 'daily-pilot', description: 'Full day dedicated 2-wheeler delivery associate for local stores or e-commerce.', avgPrice: '₹750 / day' },
    ],
    pricingGuide: [
      { service: 'Full Day Dedicated Delivery Associate', rate: '₹750', timeEst: '8 hrs', description: 'Up to 30 hyperlocal parcel drops with live OTP confirmation.' },
    ],
    requiredTools: ['Smartphone with GPS', 'Thermal Insulated Courier Bag', 'Power Bank Backup'],
    certifications: ['Valid Two-Wheeler / LMV Driving Licence', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Do delivery workers handle Cash on Delivery (COD)?', answer: 'Yes, verified fleet pilots can collect secure cash payments with instant digital receipt reconciliation.' },
    ],
  },
  {
    id: 'cat-housekeeping',
    slug: 'housekeeping',
    aliases: ['housekeeper', 'housekeeping-staff', 'maid'],
    name: 'Housekeeping & Facility Staff',
    nameHi: 'हाउसकीपिंग व घरेलू सहायक',
    singular: 'Housekeeping Staff',
    sector: 'Facility & Security',
    iconName: 'Sparkles',
    coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80',
    intro: 'Reliable housekeeping staff for daily home tidying, mopping, dusting, utensil washing, and corporate office pantry upkeep.',
    detailedBio: 'Punctual, background-verified domestic help and facility executives. Trained in wet and dry mopping, kitchen hygiene, linen changing, and office washroom sanitation.',
    baseHourlyRate: 200,
    baseDailyRate: 700,
    workerCountEstimate: '2,100+ Available',
    popularSkills: ['Floor Mopping & Dusting', 'Kitchen Pantry', 'Utensil Cleaning', 'Linen Change', 'Washroom Sanitation', 'Office Housekeeping'],
    subcategories: [
      { id: 'sub-hk-1', name: 'Daily Domestic Help (1–2 Hours/Day)', nameHi: 'घरेलू सहायक', slug: 'domestic', description: 'Sweeping, mopping, utensil washing, and dusting on monthly plan.', avgPrice: '₹3,000 / month' },
      { id: 'sub-hk-2', name: 'Office Facility Housekeeper', nameHi: 'कॉर्पोरेट हाउसकीपिंग', slug: 'corporate', description: '8-hour full time pantry and office maintenance executive.', avgPrice: '₹800 / day' },
    ],
    pricingGuide: [
      { service: 'One-Time Housekeeping Visit (2 Hours)', rate: '₹399', timeEst: '2 hrs', description: 'Thorough broom, mop, dusting, and kitchen washroom quick refresh.' },
      { service: 'Daily Corporate Housekeeper Shift', rate: '₹750', timeEst: '8 hrs shift', description: 'Dedicated office cleanliness, tea/coffee service, and sanitation.' },
    ],
    requiredTools: ['Microfiber Flat Mop System', 'Color-Coded Cleaning Cloths', 'Bio-Degradable Surface Disinfectants'],
    certifications: ['Housekeeping Standards Certification', 'Police Verification Clearance', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Is police verification completed for housekeeping staff?', answer: 'Yes, 100% of housekeeping staff profiles undergo background and identity checks before being allowed on KaamSetu.' },
    ],
  },
  {
    id: 'cat-event-workers',
    slug: 'event-workers',
    aliases: ['event-worker', 'event-setup-banquet-workforce', 'stage-rigging', 'hospitality-staff'],
    name: 'Event Setup & Hospitality Staff',
    nameHi: 'इवेंट सेटअप व हॉस्पिटैलिटी क्रू',
    singular: 'Event Worker',
    sector: 'Hospitality & Events',
    iconName: 'PartyPopper',
    coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80',
    intro: 'Wedding and expo stage trussing crews, banquet hospitality stewards, exhibition stall builders, and sound/light helpers.',
    detailedBio: 'Disciplined crew for high-pressure live event environments. Skilled in German tent erection, LED wall rigging, buffet catering service, and rapid post-event teardown.',
    baseHourlyRate: 250,
    baseDailyRate: 850,
    workerCountEstimate: '1,100+ Available',
    popularSkills: ['Stage Truss Rigging', 'Banquet Stewards', 'Audio Visual Cable Helpers', 'Exhibition Stall Setup', 'Carpet Laying', 'Backstage Crew'],
    subcategories: [
      { id: 'sub-evt-1', name: 'Stage & Truss Rigging Crew', nameHi: 'स्टेज व टेंट सेटअप', slug: 'stage-setup', description: 'Aluminium truss assembly, canopy stretching, stage carpet stapling.', avgPrice: '₹850 / day' },
      { id: 'sub-evt-2', name: 'Banquet Waiter & Steward', nameHi: 'बैंक्वेट स्टीवर्ड', slug: 'steward', description: 'Uniformed catering staff for guest service, buffet replenishment, and plate clearing.', avgPrice: '₹950 / event' },
    ],
    pricingGuide: [
      { service: 'Uniformed Banquet Steward (6 Hours)', rate: '₹850', timeEst: '6 hrs', description: 'Well-groomed catering service staff with black and white uniform.' },
      { service: 'Event Rigger / Teardown Labour', rate: '₹800', timeEst: '8 hrs shift', description: 'Fast equipment loading, truss dismantling, and transport packing.' },
    ],
    requiredTools: ['Stage Rigging Clamps', 'Heavy Duty Cable Protectors', 'High Tension Stapler Gun', 'Uniform Attire'],
    certifications: ['Hospitality & Event Services Protocol Verification', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Can I book a crew of 15 banquet waiters for a wedding?', answer: 'Yes, select Event Workers and enter your required headcount in our booking or bulk hiring calculator.' },
    ],
  },
  {
    id: 'cat-interior-workers',
    slug: 'interior-workers',
    aliases: ['interior-worker', 'tiles-marble-granite', 'pop-worker', 'false-ceiling'],
    name: 'Interior & POP Workers',
    nameHi: 'इंटीरियर कारीगर (पीओपी व फॉल्स सीलिंग)',
    singular: 'Interior Worker',
    sector: 'Construction & Civil',
    iconName: 'Layers',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    intro: 'Specialist artisans for Gypsum false ceiling, POP molding, wallpaper pasting, Italian marble laying, and architectural glass/aluminium fabrication.',
    detailedBio: 'Master interior finishers for residential villas and luxury apartments. Experts in channel framework, recessed COB lighting profiles, bookmatched marble, and acoustic paneling.',
    baseHourlyRate: 400,
    baseDailyRate: 1100,
    workerCountEstimate: '890+ Available',
    popularSkills: ['Gypsum False Ceiling', 'POP Cornice Molding', 'Italian Marble Laying', 'Wallpaper Pasting', 'Aluminium Glass Partition', 'Epoxy Grouting'],
    subcategories: [
      { id: 'sub-int-1', name: 'Gypsum False Ceiling & Cove', nameHi: 'फॉल्स सीलिंग', slug: 'false-ceiling', description: 'Saint-Gobain Gyproc board ceiling with hidden LED cove light profiles.', avgPrice: '₹85–110 / sq ft' },
      { id: 'sub-int-2', name: 'Tile & Italian Marble Laying', nameHi: 'टाइल व मार्बल', slug: 'marble-tiles', description: 'Laser-level floor tile installation and diamond disc marble polish.', avgPrice: '₹35–55 / sq ft' },
    ],
    pricingGuide: [
      { service: 'Daily Master Interior Craftsman Wage', rate: '₹1,100', timeEst: '8 hrs shift', description: 'High-precision false ceiling, POP molding, or stone fabrication.' },
      { service: 'Designer Wallpaper Pasting (per roll)', rate: '₹399', timeEst: '45 mins', description: 'Precision pattern matching, bubble-free adhesive application.' },
    ],
    requiredTools: ['Laser Level Multi-Line Meter', 'Diamond Blade Marble Cutter', 'Gypsum Drywall Screw Gun', 'Suction Cup Tile Vibrator'],
    certifications: ['CSDC Interior Construction & Flooring Specialist', 'Aadhaar Identity Verified'],
    faqs: [
      { question: 'Can interior workers design custom cove lights in false ceilings?', answer: 'Yes, our craftsmen coordinate with electricians to create seamless hidden cove channels for strip lights.' },
    ],
  },
];

export const PROFESSIONS = PROFESSIONS_LIST;

// Helper functions for profession queries
export function getAllProfessions(): ProfessionData[] {
  return PROFESSIONS_LIST;
}

export function getProfessionBySlug(slug: string): ProfessionData | null {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim();
  const direct = PROFESSIONS_LIST.find((p) => p.slug === clean);
  if (direct) return direct;

  const byAlias = PROFESSIONS_LIST.find(
    (p) => p.aliases.includes(clean) || p.id === clean || p.slug === clean.replace(/-workers$/, '').replace(/s$/, '')
  );
  if (byAlias) return byAlias;

  // Fallback to substring matching
  const byMatch = PROFESSIONS_LIST.find(
    (p) => p.slug.includes(clean) || clean.includes(p.slug) || p.name.toLowerCase().includes(clean)
  );
  return byMatch || null;
}

export function getProfessionSectors(): string[] {
  const set = new Set(PROFESSIONS_LIST.map((p) => p.sector));
  return ['All Sectors', ...Array.from(set)];
}

export function searchProfessions(query: string, sector?: string): ProfessionData[] {
  const q = query.toLowerCase().trim();
  return PROFESSIONS_LIST.filter((p) => {
    const matchSector = !sector || sector === 'All Sectors' || p.sector === sector;
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.nameHi.includes(q) ||
      p.slug.includes(q) ||
      p.popularSkills.some((s) => s.toLowerCase().includes(q)) ||
      p.intro.toLowerCase().includes(q);
    return matchSector && matchQuery;
  });
}
