// KAAMSETU — Universal India-Wide Profession Master Catalogue
// 3-Level Hierarchy: CATEGORY (A-Z) -> SUBCATEGORY -> PROFESSION
// Covers all industries across India: Construction, Energy, Transport, IT, Healthcare, Education, Hotel, etc.

export interface MasterSubcategory {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  description: string;
}

export interface MasterProfession {
  id: string;
  slug: string;
  categoryId: string;
  subcategoryId: string;
  name: string;
  nameHi: string;
  singular: string;
  aliases: string[];
  description: string;
  popularSkills: string[];
  baseHourlyRate: number;
  baseDailyRate: number;
  isRegulated?: boolean;
  verificationRequirements?: string[];
  isActive: boolean;
}

export interface MasterCategory {
  id: string;
  code: string;
  name: string;
  nameHi: string;
  slug: string;
  iconName: string;
  description: string;
  subcategories: MasterSubcategory[];
}

// --------------------------------------------------------------------------
// 1. ALL 26 MASTER CATEGORIES (A to Z)
// --------------------------------------------------------------------------
export const MASTER_CATEGORIES: MasterCategory[] = [
  {
    id: 'cat-a-construction',
    code: 'A',
    name: 'Construction & Civil Work',
    nameHi: 'भवन निर्माण एवं सिविल कार्य',
    slug: 'construction-civil-work',
    iconName: 'Building2',
    description: 'Masons, concrete workers, shuttering, bar benders, road workers, civil site engineers and supervisors.',
    subcategories: [
      { id: 'sub-a1-masonry', name: 'Masonry & Structural Work', nameHi: 'चिनाई व ढांचा निर्माण', slug: 'masonry-structural', description: 'Brickwork, blockwork, stone and mortar construction.' },
      { id: 'sub-a2-finishing', name: 'Finishing, Tiles & Plaster', nameHi: 'प्लास्टर, टाइल व फिनिशिंग', slug: 'finishing-tiles', description: 'Plastering, POP, gypsum, marble, granite and tile laying.' },
      { id: 'sub-a3-fabrication', name: 'Fabrication & Shuttering', nameHi: 'फेब्रिकेशन व शटरिंग', slug: 'fabrication-shuttering', description: 'Steel shuttering, bar bending, welding and aluminium framing.' },
      { id: 'sub-a4-engineering', name: 'Site Engineering & Supervision', nameHi: 'साइट इंजीनियरिंग व सुपरविजन', slug: 'site-engineering', description: 'Site supervisors, civil engineers, quantity surveyors and draughtsmen.' },
      { id: 'sub-a5-earthwork', name: 'Heavy Earthwork & Machinery', nameHi: 'सड़क व अर्थवर्क मशीन ऑपरेटर', slug: 'earthwork-machinery', description: 'Excavation, road construction, equipment operators and scaffolding.' }
    ]
  },
  {
    id: 'cat-b-electrical',
    code: 'B',
    name: 'Electrical, Electronics & Energy',
    nameHi: 'बिजली, इलेक्ट्रॉनिक्स एवं ऊर्जा',
    slug: 'electrical-electronics-energy',
    iconName: 'Zap',
    description: 'Electricians, appliance repair, electronics, solar energy, telecom and broadband infrastructure.',
    subcategories: [
      { id: 'sub-b1-electrician', name: 'Wiring & House Electricity', nameHi: 'हाउस वायरिंग व फॉल्ट रिपेयर', slug: 'wiring-electrician', description: 'Residential and commercial wiring, switchboards and power distribution.' },
      { id: 'sub-b2-appliances', name: 'Appliance & Device Repair', nameHi: 'उपकरण, मोबाइल व लैपटॉप रिपेयर', slug: 'device-repair', description: 'Home appliances, mobile phones, laptops, and computer hardware.' },
      { id: 'sub-b3-solar-energy', name: 'Solar Panels, Inverters & Battery', nameHi: 'सोलर पैनल, इन्वर्टर व बैटरी', slug: 'solar-energy-battery', description: 'Rooftop solar installation, hybrid inverters, UPS and battery maintenance.' },
      { id: 'sub-b4-telecom', name: 'Telecom, CCTV & Networks', nameHi: 'टेलीकॉम, सीसीटीवी व नेटवर्क', slug: 'telecom-cctv-network', description: 'Fiber optics, broadband lines, CCTV security cameras and automation.' }
    ]
  },
  {
    id: 'cat-c-plumbing-hvac',
    code: 'C',
    name: 'Plumbing, HVAC & Maintenance',
    nameHi: 'प्लंबिंग, एसी एवं भवन रखरखाव',
    slug: 'plumbing-hvac-maintenance',
    iconName: 'Wrench',
    description: 'Sanitary plumbing, water pumps, borewell, AC and refrigeration, lifts, and building maintenance.',
    subcategories: [
      { id: 'sub-c1-plumbing', name: 'Sanitary Plumbing & Pipefitting', nameHi: 'नल मिस्त्री व पाइप फिटिंग', slug: 'sanitary-plumbing', description: 'CPVC/UPVC concealed piping, sanitary fixtures, water pumps and borewells.' },
      { id: 'sub-c2-hvac', name: 'AC, Cooling & Refrigeration', nameHi: 'एसी व कूलिंग सिस्टम', slug: 'ac-cooling-refrigeration', description: 'Split/window AC servicing, industrial HVAC, chillers and duct installation.' },
      { id: 'sub-c3-facility', name: 'Lifts & Mechanical Facility', nameHi: 'लिफ्ट व मैकेनिकल मेंटेनेंस', slug: 'lift-facility-maintenance', description: 'Elevator/escalator technicians and commercial building maintenance.' }
    ]
  },
  {
    id: 'cat-d-transport-logistics',
    code: 'D',
    name: 'Transport, Driving & Logistics',
    nameHi: 'परिवहन, ड्राइविंग एवं लॉजिस्टिक्स',
    slug: 'transport-driving-logistics',
    iconName: 'Truck',
    description: 'Personal drivers, commercial taxi/bus/truck pilots, delivery partners, and warehouse warehouse crews.',
    subcategories: [
      { id: 'sub-d1-drivers', name: 'Personal & Commercial Drivers', nameHi: 'कार, टैक्सी, ऑटो व बस ड्राइवर', slug: 'personal-commercial-drivers', description: 'Personal chauffeurs, cab pilots, auto drivers and heavy vehicle truck drivers.' },
      { id: 'sub-d2-delivery', name: 'Courier & Last-Mile Delivery', nameHi: 'डिलीवरी पार्टनर व कूरियर', slug: 'courier-last-mile', description: 'Bike delivery workers, food/grocery logistics and dispatch staff.' },
      { id: 'sub-d3-warehouse', name: 'Warehouse, Loading & Shifting', nameHi: 'गोदाम, लोडर व शिफ्टिंग', slug: 'warehouse-loading-shifting', description: 'Warehouse loaders, unloaders, pickers, packers and moving helpers.' }
    ]
  },
  {
    id: 'cat-e-education-training',
    code: 'E',
    name: 'Education & Training',
    nameHi: 'शिक्षा, ट्यूशन एवं प्रशिक्षण',
    slug: 'education-training',
    iconName: 'GraduationCap',
    description: 'School teachers, home tutors, coaching faculty, vocational instructors, music and dance trainers.',
    subcategories: [
      { id: 'sub-e1-school-teaching', name: 'School Subjects & Lecturers', nameHi: 'स्कूली विषय व कॉलेज लेक्चरर', slug: 'school-subjects-lecturers', description: 'Maths, Science, English, Hindi, Physics, Chemistry and Social Studies.' },
      { id: 'sub-e2-tutoring', name: 'Home Tutors & Online Faculty', nameHi: 'होम ट्यूटर व ऑनलाइन शिक्षक', slug: 'home-tutors-online', description: 'Doorstep home tuition, competitive exam coaching and academic counseling.' },
      { id: 'sub-e3-skills-arts', name: 'Vocational, Arts & Sports', nameHi: 'स्किल ट्रेनर, कला, संगीत व खेल', slug: 'vocational-arts-sports', description: 'Coding instructors, music/dance teachers, sports coaches and skill trainers.' }
    ]
  },
  {
    id: 'cat-f-it-software',
    code: 'F',
    name: 'IT, Software & Technology',
    nameHi: 'आईटी, सॉफ्टवेयर एवं टेक्नोलॉजी',
    slug: 'it-software-technology',
    iconName: 'Code',
    description: 'Web/mobile software developers, cloud, DevOps, AI/ML, data science, tech support and UI/UX designers.',
    subcategories: [
      { id: 'sub-f1-development', name: 'Web, Mobile & AI Developers', nameHi: 'वेब, मोबाइल व एआई डेवलपर', slug: 'web-mobile-ai-dev', description: 'Frontend, backend, full stack, Flutter, React, Android, iOS and Python engineers.' },
      { id: 'sub-f2-cloud-devops', name: 'Cloud, DevOps & Database', nameHi: 'क्लाउड, डेवऑप्स व डेटाबेस एडमिन', slug: 'cloud-devops-database', description: 'AWS, Azure, Docker, Kubernetes, CI/CD and database administrators.' },
      { id: 'sub-f3-tech-support', name: 'IT Support & Systems Admin', nameHi: 'आईटी सपोर्ट व सिस्टम एडमिन', slug: 'it-support-sysadmin', description: 'Computer operators, network administrators, desktop support and QA testers.' },
      { id: 'sub-f4-design', name: 'UI/UX & Product Design', nameHi: 'यूआई/यूएक्स व प्रोडक्ट डिजाइनर', slug: 'ui-ux-product-design', description: 'User interface designers, wireframing, UX researchers and product architects.' }
    ]
  },
  {
    id: 'cat-g-creative-media',
    code: 'G',
    name: 'Digital, Media & Creative',
    nameHi: 'डिजिटल, मीडिया एवं क्रिएटिव',
    slug: 'digital-media-creative',
    iconName: 'Palette',
    description: 'Graphic designers, video editors, photographers, digital marketers, copywriters, and audio artists.',
    subcategories: [
      { id: 'sub-g1-visual-design', name: 'Graphic Design & 3D Art', nameHi: 'ग्राफिक डिजाइन, 3D व एनिमेशन', slug: 'graphic-design-3d', description: 'Photoshop, Illustrator, 3D modeling, motion graphics and illustrators.' },
      { id: 'sub-g2-video-photo', name: 'Video Editing & Photography', nameHi: 'वीडियो एडिटिंग व फोटोग्राफी', slug: 'video-editing-photo', description: 'Premiere Pro/FCP editors, camera operators, wedding and product photographers.' },
      { id: 'sub-g3-writing-content', name: 'Content Writing & Marketing', nameHi: 'कंटेंट राइटिंग व डिजिटल मार्केटिंग', slug: 'content-digital-marketing', description: 'SEO specialists, copywriters, social media managers and performance ad managers.' },
      { id: 'sub-g4-audio-voice', name: 'Voice-over, Audio & Podcasts', nameHi: 'वॉइस ओवर, साउंड व पॉडकास्ट', slug: 'voice-audio-podcast', description: 'Sound engineers, dubbing artists, podcast editors and audio technicians.' }
    ]
  },
  {
    id: 'cat-h-office-admin',
    code: 'H',
    name: 'Office & Administration',
    nameHi: 'कार्यालय एवं प्रशासन',
    slug: 'office-administration',
    iconName: 'FileSpreadsheet',
    description: 'Receptionists, front desk, office assistants, data entry operators, HR coordinators, and telecallers.',
    subcategories: [
      { id: 'sub-h1-front-desk', name: 'Front Desk & Office Management', nameHi: 'रिसेप्शनिस्ट व ऑफिस असिस्टेंट', slug: 'front-desk-office-staff', description: 'Receptionists, front desk executives, office boys and executive assistants.' },
      { id: 'sub-h2-data-entry', name: 'Data Entry, Typing & Clerical', nameHi: 'डाटा एंट्री ऑपरेटर व टाइपिस्ट', slug: 'data-entry-typing', description: 'English/Hindi typists, Excel data operators, back-office executives and filing clerks.' },
      { id: 'sub-h3-hr-recruitment', name: 'HR & Operations Support', nameHi: 'एचआर असिस्टेंट व ऑपरेशन्स', slug: 'hr-operations-support', description: 'Recruitment coordinators, payroll assistants and document verifiers.' },
      { id: 'sub-h4-customer-support', name: 'Customer Care & Telecalling', nameHi: 'कॉल सेंटर व टेलीकॉलर', slug: 'call-center-telecalling', description: 'Inbound/outbound telecallers, BPO executives and chat support agents.' }
    ]
  },
  {
    id: 'cat-i-finance-business',
    code: 'I',
    name: 'Accounting, Finance & Business',
    nameHi: 'अकाउंटिंग, फाइनेंस एवं व्यापार',
    slug: 'accounting-finance-business',
    iconName: 'BadgeDollarSign',
    description: 'Accountants, GST assistants, tax professionals, bookkeepers, sales executives and business analysts.',
    subcategories: [
      { id: 'sub-i1-accounting-tax', name: 'Accounting, Bookkeeping & GST', nameHi: 'मुनीम, अकाउंटेंट व जीएसटी', slug: 'accounting-bookkeeping-gst', description: 'Tally/Busy operators, balance sheet preparation, GST and tax filing assistants.' },
      { id: 'sub-i2-finance-audit', name: 'Finance, Banking & Audit', nameHi: 'फाइनेंस एनालिस्ट व ऑडिट', slug: 'finance-banking-audit', description: 'Audit assistants, financial analysts and banking operations professionals.' },
      { id: 'sub-i3-sales-bizdev', name: 'Sales, Marketing & BD', nameHi: 'सेल्स, मार्केटिंग व फील्ड एजेंट', slug: 'sales-marketing-field', description: 'Field sales executives, B2B business development, relationship managers and CRM.' }
    ]
  },
  {
    id: 'cat-j-hospitality-food',
    code: 'J',
    name: 'Hotel, Food & Hospitality',
    nameHi: 'होटल, खानपान एवं हॉस्पिटैलिटी',
    slug: 'hotel-food-hospitality',
    iconName: 'Utensils',
    description: 'Chefs, home cooks, bakers, kitchen helpers, waiters, stewards, hotel managers, and room attendants.',
    subcategories: [
      { id: 'sub-j1-culinary-cooks', name: 'Chefs, Cooks & Bakers', nameHi: 'शेफ, हलवाई, कुक व बेकर', slug: 'chefs-cooks-bakers', description: 'Home cooks, Maharaj/Rasoiya, Indian/Tandoor/Continental chefs and pastry bakers.' },
      { id: 'sub-j2-service-waiters', name: 'Waiters, Stewards & Baristas', nameHi: 'वेटर, स्टीवर्ड व बरिस्ता', slug: 'waiters-stewards-baristas', description: 'Dining service staff, restaurant stewards, banquet waiters and cafe baristas.' },
      { id: 'sub-j3-kitchen-support', name: 'Kitchen Helpers & Dishwashers', nameHi: 'किचन हेल्पर व बर्तन सफाई', slug: 'kitchen-helpers-dishwashing', description: 'Vegetable cutting helpers, dishwashers and food packing workers.' },
      { id: 'sub-j4-hotel-management', name: 'Hotel Desk & Room Attendants', nameHi: 'होटल रिसेप्शन व रूम सर्विस', slug: 'hotel-desk-room-attendants', description: 'Hotel receptionists, guest relations, room attendants and hotel housekeepers.' }
    ]
  },
  {
    id: 'cat-k-home-household',
    code: 'K',
    name: 'Home & Household Services',
    nameHi: 'घरेलू सेवाएं एवं हाउसकीपिंग',
    slug: 'home-household-services',
    iconName: 'Home',
    description: 'House cleaners, maids, cooks, deep cleaning, sofa/carpet shampooing, water tank and pest control.',
    subcategories: [
      { id: 'sub-k1-domestic-help', name: 'Maids, Helpers & Daily Cooks', nameHi: 'बाई / सहायिका व घरेलू कुक', slug: 'maids-helpers-cooks', description: 'Part-time/full-time maids, babysitters, caretakers and daily domestic cooks.' },
      { id: 'sub-k2-deep-cleaning', name: 'Deep Cleaning & Specialized Care', nameHi: 'डीप क्लीनिंग, सोफा व कालीन सफाई', slug: 'deep-cleaning-specialized', description: 'Sofa foam extraction, bathroom descaling, kitchen degreasing and carpet care.' },
      { id: 'sub-k3-maintenance-pest', name: 'Pest Control & Tank Cleaning', nameHi: 'पेस्ट कंट्रोल व पानी टंकी सफाई', slug: 'pest-control-tank-cleaning', description: 'Termite/cockroach pest control, overhead water tank and chimney cleaning.' }
    ]
  },
  {
    id: 'cat-l-beauty-fashion',
    code: 'L',
    name: 'Beauty, Personal Care & Fashion',
    nameHi: 'सौंदर्य, हेयर स्टाइलिंग एवं फैशन',
    slug: 'beauty-personal-care-fashion',
    iconName: 'Sparkles',
    description: 'Barbers, beauticians, bridal makeup artists, hair stylists, tailors, mehendi artists, and fashion designers.',
    subcategories: [
      { id: 'sub-l1-hair-barber', name: 'Barber & Hair Styling', nameHi: 'नाई, बाल कटिंग व हेयर स्टाइल', slug: 'barber-hair-styling', description: 'Men hair stylists, barbers, grooming and salon assistants.' },
      { id: 'sub-l2-beautician-makeup', name: 'Salon-at-Home & Makeup Artists', nameHi: 'ब्यूटीशियन, ब्राइडल मेकअप व मेहंदी', slug: 'beauticians-makeup-artists', description: 'Doorstep facial, waxing, bridal makeup, nail art and mehendi artists.' },
      { id: 'sub-l3-tailoring-garments', name: 'Tailoring, Boutique & Embroidery', nameHi: 'दर्जी, सिलाई, बुटीक व कढ़ाई', slug: 'tailoring-boutique-embroidery', description: 'Master tailors (Darzi), sewing machine operators, embroidery and alterations.' }
    ]
  },
  {
    id: 'cat-m-factory-manufacturing',
    code: 'M',
    name: 'Factory, Industrial & Manufacturing',
    nameHi: 'फैक्ट्री, उत्पादन एवं निर्माण उद्योग',
    slug: 'factory-industrial-manufacturing',
    iconName: 'Factory',
    description: 'Factory operators, assembly workers, CNC/lathe machinists, quality inspectors, fitters and plant operators.',
    subcategories: [
      { id: 'sub-m1-machine-operators', name: 'Machine Operators & CNC Lathe', nameHi: 'मशीन ऑपरेटर, सीएनसी व लेथ', slug: 'machine-operators-cnc', description: 'CNC programming, lathe turning, milling, pressing and molding operators.' },
      { id: 'sub-m2-assembly-packing', name: 'Assembly, Packaging & Sorting', nameHi: 'असेंबली लाइन व पैकेजिंग वर्कर', slug: 'assembly-packaging-sorting', description: 'Production line assembly, carton packing, labeling and warehouse helpers.' },
      { id: 'sub-m3-maintenance-fitter', name: 'Industrial Fitters & Technicians', nameHi: 'इंडस्ट्रियल फिटर व मेंटेनेंस', slug: 'industrial-fitters-technicians', description: 'Mechanical fitters, plant maintenance engineers and tooling technicians.' }
    ]
  },
  {
    id: 'cat-n-agriculture-animal',
    code: 'N',
    name: 'Agriculture & Animal Care',
    nameHi: 'कृषि, पशुपालन एवं बागवानी',
    slug: 'agriculture-animal-care',
    iconName: 'Wheat',
    description: 'Farm labourers, tractor operators, dairy assistants, livestock caretakers, nursery staff and gardeners.',
    subcategories: [
      { id: 'sub-n1-farm-labour', name: 'Farming Labour & Crop Harvesting', nameHi: 'खेत मजदूर व फसल कटाई', slug: 'farming-labour-harvesting', description: 'Sowing, weeding, tractor driving, irrigation and seasonal crop harvesting.' },
      { id: 'sub-n2-gardening-nursery', name: 'Gardening, Mali & Nursery', nameHi: 'माली, नर्सरी व लैंडस्केप', slug: 'gardening-mali-nursery', description: 'Residential gardeners (Mali), plant care, lawn mowing and organic farming.' },
      { id: 'sub-n3-dairy-livestock', name: 'Dairy, Cattle & Livestock', nameHi: 'डेयरी वर्कर व पशुपालन', slug: 'dairy-cattle-livestock', description: 'Milking assistants, cattle shed care, poultry assistants and feed managers.' }
    ]
  },
  {
    id: 'cat-o-security-facilities',
    code: 'O',
    name: 'Security & Facility Operations',
    nameHi: 'सुरक्षा गार्ड एवं सुविधा प्रबंधन',
    slug: 'security-facility-operations',
    iconName: 'Shield',
    description: 'Security guards, supervisors, gatekeepers, CCTV surveillance operators, and fire safety officers.',
    subcategories: [
      { id: 'sub-o1-guards', name: 'Security Guards & Gatekeepers', nameHi: 'सुरक्षा गार्ड व चौकीदार', slug: 'security-guards-gatekeepers', description: 'Residential society guards, factory security, bouncers and gatekeepers.' },
      { id: 'sub-o2-supervision', name: 'Security Supervisors & CCTV', nameHi: 'सुरक्षा सुपरवाइजर व सीसीटीवी कंट्रोल', slug: 'security-supervisors-cctv', description: 'Control room CCTV monitors, shift supervisors and visitor management.' },
      { id: 'sub-o3-safety-fire', name: 'Fire Safety & Facility Officers', nameHi: 'फायर सेफ्टी व फैसिलिटी मैनेजर', slug: 'fire-safety-facility-officers', description: 'Firefighting equipment technicians and industrial safety officers.' }
    ]
  },
  {
    id: 'cat-p-healthcare-wellness',
    code: 'P',
    name: 'Healthcare & Wellness',
    nameHi: 'स्वास्थ्य सेवा, नर्सिंग एवं योग',
    slug: 'healthcare-wellness',
    iconName: 'HeartPulse',
    description: 'Registered nurses, clinic assistants, lab technicians, physiotherapists, caregivers, pharmacists and yoga trainers.',
    subcategories: [
      { id: 'sub-p1-nursing-care', name: 'Nurses, Caregivers & Attendants', nameHi: 'नर्स, रोगी देखभाल व अटेंडेंट', slug: 'nurses-caregivers-attendants', description: 'GNM/B.Sc nurses, elderly home care attendants and patient assistants.' },
      { id: 'sub-p2-therapy-fitness', name: 'Physiotherapy, Yoga & Fitness', nameHi: 'फिजियोथेरेपी, योग व जिम ट्रेनर', slug: 'physiotherapy-yoga-fitness', description: 'Certified physiotherapists, doorstep yoga instructors and fitness trainers.' },
      { id: 'sub-p3-clinical-lab', name: 'Lab Techs, Clinic & Pharmacy', nameHi: 'लैब टेक्नीशियन व क्लिनिक स्टाफ', slug: 'clinical-lab-pharmacy', description: 'Blood collection phlebotomists, pharmacy assistants and clinic receptionists.' }
    ]
  },
  {
    id: 'cat-q-retail-sales',
    code: 'Q',
    name: 'Retail, Shop & Customer Service',
    nameHi: 'रिटेल, दुकान एवं सेल्स प्रमोटर',
    slug: 'retail-shop-customer-service',
    iconName: 'ShoppingBag',
    description: 'Shop helpers, cashiers, store managers, retail sales promoters, stock handlers and POS billing staff.',
    subcategories: [
      { id: 'sub-q1-shop-sales', name: 'Shop Assistants & Counter Sales', nameHi: 'दुकान सहायक व काउंटर सेल्स', slug: 'shop-assistants-counter-sales', description: 'Garment showroom sales, grocery store helpers and counter attendants.' },
      { id: 'sub-q2-cashier-pos', name: 'Cashiers & Billing Operators', nameHi: 'कैशियर व कंप्यूटर बिलिंग', slug: 'cashiers-billing-pos', description: 'Supermarket POS operators, barcode scanning and cash collection.' },
      { id: 'sub-q3-stock-management', name: 'Inventory & Store Managers', nameHi: 'स्टोर कीपर व स्टॉक हैंडलर', slug: 'inventory-store-managers', description: 'Stock replenishment, retail inventory tracking and store floor supervisors.' }
    ]
  },
  {
    id: 'cat-r-events-weddings',
    code: 'R',
    name: 'Events, Weddings & Entertainment',
    nameHi: 'इवेंट, शादी-विवाह एवं मनोरंजन',
    slug: 'events-weddings-entertainment',
    iconName: 'PartyPopper',
    description: 'Event planners, decorators, balloon/stage artists, DJ sound techs, anchors, photographers and catering crew.',
    subcategories: [
      { id: 'sub-r1-decor-setup', name: 'Decoration, Stage & Lighting', nameHi: 'टेंट, मंडप, गुब्बारा व स्टेज सजावट', slug: 'event-decor-stage-lighting', description: 'Flower decorators, balloon artists, stage fabricators and sound/light operators.' },
      { id: 'sub-r2-entertainment', name: 'DJs, Anchors, Singers & Artists', nameHi: 'डीजे, एंकर, गायक व कलाकार', slug: 'djs-anchors-entertainers', description: 'Wedding DJs, event anchors (Emcee), live musicians, dancers and performers.' },
      { id: 'sub-r3-coordination-crew', name: 'Event Coordination & Catering Crew', nameHi: 'इवेंट कोऑर्डिनेटर व कैटरिंग टीम', slug: 'event-coordination-catering', description: 'Wedding coordinators, banquet catering staff, event bouncers and cleanup crews.' }
    ]
  },
  {
    id: 'cat-s-automobile-vehicles',
    code: 'S',
    name: 'Automobile & Vehicle Services',
    nameHi: 'ऑटोमोबाइल एवं वाहन मरम्मत',
    slug: 'automobile-vehicle-services',
    iconName: 'Car',
    description: 'Car/bike mechanics, auto electricians, tyre fitters, denting-painting, car detailing and washing.',
    subcategories: [
      { id: 'sub-s1-mechanics', name: 'Car & Two-Wheeler Mechanics', nameHi: 'कार व बाइक मिस्त्री', slug: 'car-bike-mechanics', description: 'Engine overhaul, brake service, clutch repair and general vehicle maintenance.' },
      { id: 'sub-s2-auto-electric-tyre', name: 'Auto Electricians, Battery & Tyres', nameHi: 'ऑटो इलेक्ट्रीशियन, बैटरी व टायर', slug: 'auto-electrician-battery-tyre', description: 'Vehicle alternator/starter, car battery replacement and wheel alignment.' },
      { id: 'sub-s3-denting-washing', name: 'Denting, Painting & Car Wash', nameHi: 'डेंटिंग, पेंटिंग व कार वाशिंग', slug: 'denting-painting-car-wash', description: 'Body shop dent removal, spray painting, doorstep foam wash and detailing.' }
    ]
  },
  {
    id: 'cat-t-professional-legal',
    code: 'T',
    name: 'Professional, Legal & Consulting',
    nameHi: 'पेशेवर, कानूनी एवं तकनीकी परामर्श',
    slug: 'professional-legal-consulting',
    iconName: 'Scale',
    description: 'Architects, advocates, company secretaries, structural engineers, surveyors, and project managers.',
    subcategories: [
      { id: 'sub-t1-architect-survey', name: 'Architects, Surveyors & CAD', nameHi: 'आर्किटेक्ट, सर्वेक्षक व सीएडी', slug: 'architects-surveyors-cad', description: 'House map planning, AutoCAD drafting, total station land surveying.' },
      { id: 'sub-t2-legal-compliance', name: 'Advocates & Legal Assistance', nameHi: 'वकील, कानूनी सहायक व डीड ड्राफ्टिंग', slug: 'advocates-legal-assistance', description: 'Agreement drafting, court documentation, registry assistants and compliance.' },
      { id: 'sub-t3-consulting-mgmt', name: 'Project Managers & Consultants', nameHi: 'प्रोजेक्ट मैनेजर व कंसल्टेंट', slug: 'project-managers-consultants', description: 'Construction project consultants, safety audits and technical advisors.' }
    ]
  },
  {
    id: 'cat-u-handicrafts-artisan',
    code: 'U',
    name: 'Handicrafts & Artisan Work',
    nameHi: 'हस्तशिल्प, कारीगरी एवं हथकरघा',
    slug: 'handicrafts-artisan-work',
    iconName: 'Scissors',
    description: 'Handloom weavers, potters, sculptors, jewellery makers, leather and wood craftsmen, and candle makers.',
    subcategories: [
      { id: 'sub-u1-weaving-textile', name: 'Weaving, Handloom & Clay', nameHi: 'हथकरघा, बुनकर व कुम्हार', slug: 'weaving-handloom-clay', description: 'Traditional textile weavers, pottery makers and clay idol sculptors.' },
      { id: 'sub-u2-crafts-jewellery', name: 'Jewellery, Leather & Woodcraft', nameHi: 'आभूषण, चमड़ा व काष्ठ कला', slug: 'jewellery-leather-woodcraft', description: 'Handcrafted jewellery, leather embossing, bamboo craft and decorative artists.' }
    ]
  },
  {
    id: 'cat-v-pet-animal',
    code: 'V',
    name: 'Pet & Animal Services',
    nameHi: 'पालतू पशु देखभाल एवं प्रशिक्षण',
    slug: 'pet-animal-services',
    iconName: 'Dog',
    description: 'Dog walkers, pet groomers, pet sitters, animal trainers, and veterinary support assistants.',
    subcategories: [
      { id: 'sub-v1-pet-care', name: 'Dog Walking, Grooming & Sitting', nameHi: 'डॉग वॉकर, ग्रूमिंग व पेट सिटर', slug: 'dog-walking-grooming-sitting', description: 'Daily dog walking, pet bathing/hair trim and home pet boarding care.' },
      { id: 'sub-v2-veterinary-training', name: 'Animal Training & Vet Support', nameHi: 'पशु ट्रेनर व वेटेरिनरी सहायक', slug: 'animal-training-vet-support', description: 'Canine behavioral training and veterinary clinic nursing support.' }
    ]
  },
  {
    id: 'cat-w-property-real-estate',
    code: 'W',
    name: 'Property & Real Estate Support',
    nameHi: 'प्रॉपर्टी, रियल एस्टेट एवं रखरखाव',
    slug: 'property-real-estate-support',
    iconName: 'Landmark',
    description: 'Property managers, caretakers, site inspection assistants, and rental support executives.',
    subcategories: [
      { id: 'sub-w1-caretaking', name: 'Property Caretakers & Maintenance', nameHi: 'प्रॉपर्टी केयरटेकर व साइट रखवाली', slug: 'property-caretakers-maintenance', description: 'Vacant plot security, farmhouse caretaking and building key management.' },
      { id: 'sub-w2-rental-site', name: 'Rental Support & Site Inspection', nameHi: 'किराया व साइट विजिट सहायक', slug: 'rental-support-site-visit', description: 'Tenant viewings, site photography, inventory checklist and rental coordination.' }
    ]
  },
  {
    id: 'cat-x-environment-waste',
    code: 'X',
    name: 'Environment, Cleaning & Waste',
    nameHi: 'पर्यावरण, सफाई एवं अपशिष्ट प्रबंधन',
    slug: 'environment-cleaning-waste',
    iconName: 'Recycle',
    description: 'Waste collection, recycling sorters, sanitation workers, street cleaners, and water treatment operators.',
    subcategories: [
      { id: 'sub-x1-sanitation', name: 'Sanitation & Street Cleaning', nameHi: 'सफाई कर्मचारी व स्वच्छता मित्र', slug: 'sanitation-street-cleaning', description: 'Municipal/society street sweeping, drain cleaning and community sanitation.' },
      { id: 'sub-x2-waste-treatment', name: 'Recycling, Waste & Water Plants', nameHi: 'रीसाइक्लिंग व सीवेज ट्रीटमेंट ऑपरेटर', slug: 'recycling-waste-water-treatment', description: 'Dry/wet waste segregation, scrap recycling and STP/WTP plant operators.' }
    ]
  },
  {
    id: 'cat-y-remote-online',
    code: 'Y',
    name: 'Remote, Freelance & Online Work',
    nameHi: 'रिमोट, फ्रीलांस एवं ऑनलाइन कार्य',
    slug: 'remote-freelance-online-work',
    iconName: 'Laptop',
    description: 'Virtual assistants, online researchers, transcriptionists, translators, freelance writers and developers.',
    subcategories: [
      { id: 'sub-y1-virtual-assist', name: 'Virtual Assistants & Online Data', nameHi: 'वर्चुअल असिस्टेंट व ऑनलाइन रिसर्च', slug: 'virtual-assistants-online-data', description: 'Remote executive assistants, calendar management and web research.' },
      { id: 'sub-y2-translation-voice', name: 'Translation, Transcription & Audio', nameHi: 'अनुवादक, ट्रांसक्रिप्शन व भाषा', slug: 'translation-transcription', description: 'English-to-Hindi/regional language translation, subtitling and audio transcription.' }
    ]
  },
  {
    id: 'cat-z-custom-professions',
    code: 'Z',
    name: 'Other Professions & Trades',
    nameHi: 'अन्य व्यवसाय एवं कौशल',
    slug: 'other-professions-trades',
    iconName: 'PlusCircle',
    description: 'Custom community professions, traditional local crafts, and user-submitted specialized occupations.',
    subcategories: [
      { id: 'sub-z1-custom', name: 'User-Submitted Custom Professions', nameHi: 'यूज़र द्वारा जोड़े गए नए व्यवसाय', slug: 'user-submitted-custom', description: 'New dynamic occupations reviewed and approved by platform administrators.' }
    ]
  }
];

// --------------------------------------------------------------------------
// 2. MASTER PROFESSIONS LIST (INITIAL COMPREHENSIVE REGISTRY)
// --------------------------------------------------------------------------
export const MASTER_PROFESSIONS: MasterProfession[] = [
  // --- A. CONSTRUCTION & CIVIL WORK ---
  {
    id: 'prof-mason',
    slug: 'mason-raj-mistri',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a1-masonry',
    name: 'Mason / Raj Mistri',
    nameHi: 'राज मिस्त्री',
    singular: 'Mason',
    aliases: ['mason', 'raj mistri', 'mistri', 'bricklayer', 'raaj mistri', 'chunai wala', 'bhavan mistri'],
    description: 'Skilled brickwork, cement mortar plastering, lintel slab casting, and structural masonry.',
    popularSkills: ['Brickwork', 'Plastering', 'Wall Construction', 'Mortar Mixing', 'Lintel Casting'],
    baseHourlyRate: 400,
    baseDailyRate: 1050,
    isActive: true
  },
  {
    id: 'prof-construction-labour',
    slug: 'construction-labour-beldar',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a1-masonry',
    name: 'Construction Labour / Beldar',
    nameHi: 'निर्माण मजदूर (बेलदार)',
    singular: 'Labour',
    aliases: ['labour', 'mazdoor', 'beldar', 'helper', 'construction worker', 'dihaadi mazdoor', 'beldari'],
    description: 'Heavy material shifting, concrete mixing, brick carrying, excavation, and site cleanup.',
    popularSkills: ['Concrete Mixing', 'Material Shifting', 'Excavation', 'Site Clearing', 'Brick Shifting'],
    baseHourlyRate: 200,
    baseDailyRate: 650,
    isActive: true
  },
  {
    id: 'prof-general-helper',
    slug: 'general-site-helper',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a1-masonry',
    name: 'General Helper',
    nameHi: 'जनरल हेल्पर',
    singular: 'Helper',
    aliases: ['general helper', 'site helper', 'sahayak', 'construction helper', 'beldar helper'],
    description: 'Assisting skilled technicians, tool handling, and material preparation.',
    popularSkills: ['Tool Support', 'Cleaning', 'Assisting Masons', 'Loading Support'],
    baseHourlyRate: 180,
    baseDailyRate: 600,
    isActive: true
  },
  {
    id: 'prof-carpenter',
    slug: 'carpenter-woodworker',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a2-finishing',
    name: 'Carpenter',
    nameHi: 'बढ़ई (कारपेंटर)',
    singular: 'Carpenter',
    aliases: ['carpenter', 'badhai', 'wood worker', 'furniture maker', 'door fitter', 'chaukhat wala'],
    description: 'Door/window fitting, locks, modular cabinets, wooden partitions, and repair.',
    popularSkills: ['Door Fitting', 'Mortise Lock', 'Modular Kitchen', 'Chisel Work', 'Wood Polishing'],
    baseHourlyRate: 350,
    baseDailyRate: 1000,
    isActive: true
  },
  {
    id: 'prof-painter',
    slug: 'painter-waterproofing',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a2-finishing',
    name: 'Painter',
    nameHi: 'पेंटर (रंग मिस्त्री)',
    singular: 'Painter',
    aliases: ['painter', 'rang mistri', 'putty wala', 'wall painter', 'safedi wala', 'varnish wala'],
    description: 'Wall putty, acrylic emulsion painting, weathercoat, and waterproofing.',
    popularSkills: ['Wall Putty', 'Interior Paint', 'Exterior Weathercoat', 'Waterproofing', 'Texture Paint'],
    baseHourlyRate: 300,
    baseDailyRate: 850,
    isActive: true
  },
  {
    id: 'prof-welder',
    slug: 'welder-fabricator',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a3-fabrication',
    name: 'Welder / Metal Fabricator',
    nameHi: 'वेल्डर व फेब्रिकेटर',
    singular: 'Welder',
    aliases: ['welder', 'fabricator', 'loha mistri', 'grill maker', 'gate fabrication', 'gas welder'],
    description: 'Iron gate, balcony safety grills, tin shed, railing, and spot welding repairs.',
    popularSkills: ['ARC Welding', 'Grill Fabrication', 'Tin Shed', 'Grinder Cutting', 'Metal Gate'],
    baseHourlyRate: 400,
    baseDailyRate: 1150,
    isActive: true
  },
  {
    id: 'prof-tile-installer',
    slug: 'tile-marble-installer',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a2-finishing',
    name: 'Tile & Marble Installer',
    nameHi: 'टाइल व मार्बल मिस्त्री',
    singular: 'Tile Installer',
    aliases: ['tile installer', 'marble mistri', 'granite worker', 'tile fixing', 'flooring mistri'],
    description: 'Vitrified tiles, bathroom tiles, granite kitchen counters, and Italian marble laying.',
    popularSkills: ['Tile Leveling', 'Granite Molding', 'Marble Cutting', 'Epoxy Grouting'],
    baseHourlyRate: 350,
    baseDailyRate: 1100,
    isActive: true
  },
  {
    id: 'prof-pop-false-ceiling',
    slug: 'pop-false-ceiling-worker',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a2-finishing',
    name: 'POP & False Ceiling Worker',
    nameHi: 'पीओपी व फॉल्स सीलिंग कारीगर',
    singular: 'Ceiling Worker',
    aliases: ['pop worker', 'false ceiling', 'gypsum board', 'cove lighting ceiling', 'plaster of paris'],
    description: 'Gypsum board ceiling, perimeter channel framing, decorative POP moldings, and grid panels.',
    popularSkills: ['Gypsum Framing', 'POP Punning', 'Grid Ceiling', 'Cornice Molding'],
    baseHourlyRate: 320,
    baseDailyRate: 950,
    isActive: true
  },
  {
    id: 'prof-shuttering-carpenter',
    slug: 'shuttering-carpenter',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a3-fabrication',
    name: 'Shuttering Carpenter',
    nameHi: 'शटरिंग कारपेंटर',
    singular: 'Shuttering Carpenter',
    aliases: ['shuttering carpenter', 'formwork', 'slab shuttering', 'column shuttering', 'farme wala'],
    description: 'Formwork for columns, beams, staircase and RCC roof slab casting.',
    popularSkills: ['Ply Shuttering', 'Steel Plates', 'Prop Leveling', 'Slab Framework'],
    baseHourlyRate: 350,
    baseDailyRate: 1050,
    isActive: true
  },
  {
    id: 'prof-bar-bender',
    slug: 'bar-bender-saria-mistri',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a3-fabrication',
    name: 'Bar Bender (Saria Mistri)',
    nameHi: 'सरिया मिस्त्री (बार बेंडर)',
    singular: 'Bar Bender',
    aliases: ['bar bender', 'saria mistri', 'steel binder', 'rebar worker', 'ring maker'],
    description: 'Rebar cutting, hook bending, column ring binding, and slab mesh preparation.',
    popularSkills: ['Rebar Bending', 'Binding Wire Tying', 'Column Cages', 'Mesh Laying'],
    baseHourlyRate: 320,
    baseDailyRate: 950,
    isActive: true
  },
  {
    id: 'prof-civil-site-supervisor',
    slug: 'civil-site-supervisor',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a4-engineering',
    name: 'Civil Site Supervisor',
    nameHi: 'सिविल साइट सुपरवाइजर',
    singular: 'Site Supervisor',
    aliases: ['site supervisor', 'civil supervisor', 'construction supervisor', 'site incharge'],
    description: 'Labour attendance, daily progress tracking, material indenting, and quality oversight.',
    popularSkills: ['Labour Management', 'Measurement Book', 'Drawing Reading', 'Site Safety'],
    baseHourlyRate: 450,
    baseDailyRate: 1300,
    isActive: true
  },
  {
    id: 'prof-civil-engineer',
    slug: 'civil-engineer-site',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a4-engineering',
    name: 'Civil Site Engineer',
    nameHi: 'सिविल साइट इंजीनियर',
    singular: 'Civil Engineer',
    aliases: ['civil engineer', 'site engineer', 'btech civil', 'diploma civil'],
    description: 'Structural quality verification, bar bending schedule, BBS, leveling, and billing.',
    popularSkills: ['AutoCAD', 'Structural Auditing', 'Billing', 'Material Quality Check'],
    baseHourlyRate: 600,
    baseDailyRate: 1800,
    isRegulated: true,
    verificationRequirements: ['B.Tech / Diploma in Civil Engineering', 'Identity Verification'],
    isActive: true
  },
  {
    id: 'prof-equipment-operator',
    slug: 'construction-equipment-jcb-operator',
    categoryId: 'cat-a-construction',
    subcategoryId: 'sub-a5-earthwork',
    name: 'Construction Equipment / JCB Operator',
    nameHi: 'जेसीबी व मशीन ऑपरेटर',
    singular: 'Equipment Operator',
    aliases: ['jcb operator', 'crane operator', 'excavator operator', 'roller driver', 'heavy machine operator'],
    description: 'Heavy machinery operation for foundation trenching, soil leveling, and road work.',
    popularSkills: ['Excavator Operation', 'Heavy Vehicle License', 'Trenching', 'Leveling'],
    baseHourlyRate: 500,
    baseDailyRate: 1400,
    isActive: true
  },

  // --- B. ELECTRICAL, ELECTRONICS & ENERGY ---
  {
    id: 'prof-electrician',
    slug: 'electrician-wireman',
    categoryId: 'cat-b-electrical',
    subcategoryId: 'sub-b1-electrician',
    name: 'Electrician',
    nameHi: 'बिजली मिस्त्री (इलेक्ट्रीशियन)',
    singular: 'Electrician',
    aliases: ['electrician', 'bijli mistri', 'wireman', 'electrical worker', 'light fitter', 'switchboard repair'],
    description: 'Concealed residential wiring, MCB tripping repair, inverter setup, and emergency short circuits.',
    popularSkills: ['House Wiring', 'MCB Box Repair', 'Inverter Battery', 'Short Circuit Detection', 'Switchboard'],
    baseHourlyRate: 350,
    baseDailyRate: 1100,
    isActive: true
  },
  {
    id: 'prof-solar-technician',
    slug: 'solar-panel-technician',
    categoryId: 'cat-b-electrical',
    subcategoryId: 'sub-b3-solar-energy',
    name: 'Solar Panel & Inverter Technician',
    nameHi: 'सोलर पैनल व इन्वर्टर टेक्नीशियन',
    singular: 'Solar Technician',
    aliases: ['solar technician', 'solar installer', 'solar panel repair', 'rooftop solar', 'hybrid inverter'],
    description: 'Rooftop solar panel structure mounting, DC wiring, inverter commissioning, and net metering setup.',
    popularSkills: ['Panel Mounting', 'DC Cabling', 'Charge Controller', 'Earthing Pit', 'Inverter Sync'],
    baseHourlyRate: 450,
    baseDailyRate: 1250,
    isActive: true
  },
  {
    id: 'prof-cctv-technician',
    slug: 'cctv-security-technician',
    categoryId: 'cat-b-electrical',
    subcategoryId: 'sub-b4-telecom',
    name: 'CCTV & Security System Technician',
    nameHi: 'सीसीटीवी व सुरक्षा सिस्टम टेक्नीशियन',
    singular: 'CCTV Installer',
    aliases: ['cctv installer', 'camera technician', 'security system', 'nvr dvr setup', 'ip camera'],
    description: 'IP/HD CCTV camera installation, Cat6 cabling, DVR/NVR online viewing setup, and biometric access.',
    popularSkills: ['Cat6 Cabling', 'DVR/NVR Config', 'Mobile App Viewing', 'Punch Down', 'Power Supply'],
    baseHourlyRate: 350,
    baseDailyRate: 1100,
    isActive: true
  },
  {
    id: 'prof-mobile-laptop-repair',
    slug: 'mobile-laptop-repair-technician',
    categoryId: 'cat-b-electrical',
    subcategoryId: 'sub-b2-appliances',
    name: 'Mobile & Laptop Repair Technician',
    nameHi: 'मोबाइल व लैपटॉप रिपेयर टेक्नीशियन',
    singular: 'Electronics Technician',
    aliases: ['mobile repair', 'laptop technician', 'computer repair', 'screen replacement', 'motherboard repair'],
    description: 'Chip-level diagnosis, display folder replacement, charging port repair, and OS installation.',
    popularSkills: ['SMD Soldering', 'Screen Replacement', 'OS Formatting', 'Power IC Repair'],
    baseHourlyRate: 300,
    baseDailyRate: 900,
    isActive: true
  },

  // --- C. PLUMBING, HVAC & MAINTENANCE ---
  {
    id: 'prof-plumber',
    slug: 'plumber-pipe-fitter',
    categoryId: 'cat-c-plumbing-hvac',
    subcategoryId: 'sub-c1-plumbing',
    name: 'Plumber & Pipe Fitter',
    nameHi: 'नल मिस्त्री (प्लंबर)',
    singular: 'Plumber',
    aliases: ['plumber', 'nal mistri', 'pipe fitter', 'plumbing worker', 'tap leak repair', 'water pipe'],
    description: 'Concealed CPVC/UPVC pipelines, sanitary fittings, diverters, motor pumps, and tank cleaning.',
    popularSkills: ['Pipe Threading', 'Tap Fixing', 'CPVC Concealed', 'Water Motor Pump', 'Leakage Diagnosis'],
    baseHourlyRate: 300,
    baseDailyRate: 950,
    isActive: true
  },
  {
    id: 'prof-ac-technician',
    slug: 'ac-refrigeration-technician',
    categoryId: 'cat-c-plumbing-hvac',
    subcategoryId: 'sub-c2-hvac',
    name: 'AC & Refrigeration Technician',
    nameHi: 'एसी व रेफ्रिजरेशन टेक्नीशियन',
    singular: 'AC Technician',
    aliases: ['ac technician', 'ac repair', 'air conditioner', 'fridge repair', 'ac gas filling', 'ac service'],
    description: 'Foam jet AC service, refrigerant gas charging, copper piping, PCB repair, and compressor replacement.',
    popularSkills: ['Jet Pump Service', 'R32/R410 Gas Top-up', 'Flaring Copper Pipe', 'PCB Repair'],
    baseHourlyRate: 450,
    baseDailyRate: 1200,
    isActive: true
  },

  // --- D. TRANSPORT, DRIVING & LOGISTICS ---
  {
    id: 'prof-driver',
    slug: 'personal-commercial-driver',
    categoryId: 'cat-d-transport-logistics',
    subcategoryId: 'sub-d1-drivers',
    name: 'Personal & Commercial Driver',
    nameHi: 'चालक / ड्राइवर (पर्सनल व कमर्शियल)',
    singular: 'Driver',
    aliases: ['driver', 'chalak', 'chauffeur', 'car driver', 'personal driver', 'taxi driver', 'gadi chalak'],
    description: 'Safe city commute, automatic/manual transmission handling, highway transit, and GPS navigation.',
    popularSkills: ['Valid Driving License', 'Manual & Automatic', 'Night Highway Transit', 'Defensive Driving'],
    baseHourlyRate: 200,
    baseDailyRate: 750,
    isActive: true
  },
  {
    id: 'prof-delivery-partner',
    slug: 'courier-delivery-worker',
    categoryId: 'cat-d-transport-logistics',
    subcategoryId: 'sub-d2-delivery',
    name: 'Delivery Partner / Courier Worker',
    nameHi: 'डिलीवरी पार्टनर व कूरियर वर्कर',
    singular: 'Delivery Partner',
    aliases: ['delivery', 'courier', 'delivery boy', 'delivery partner', 'parcel delivery', 'bike rider'],
    description: 'Two-wheeler package delivery, food delivery, grocery distribution, and POD verification.',
    popularSkills: ['Smartphone Navigation', 'Two Wheeler License', 'Cash on Delivery Handling'],
    baseHourlyRate: 150,
    baseDailyRate: 600,
    isActive: true
  },
  {
    id: 'prof-warehouse-packer',
    slug: 'warehouse-picker-packer',
    categoryId: 'cat-d-transport-logistics',
    subcategoryId: 'sub-d3-warehouse',
    name: 'Warehouse Picker & Packer',
    nameHi: 'गोदाम पैकर व लोडर',
    singular: 'Warehouse Worker',
    aliases: ['packer', 'picker', 'warehouse worker', 'loader', 'unloader', 'godam mazdoor'],
    description: 'Barcode scanning, carton sorting, shrink wrapping, palletizing, and truck loading.',
    popularSkills: ['Barcode Scanner', 'Box Taping', 'Stock Sorting', 'Heavy Lifting'],
    baseHourlyRate: 180,
    baseDailyRate: 650,
    isActive: true
  },

  // --- E. EDUCATION & TRAINING ---
  {
    id: 'prof-home-tutor',
    slug: 'home-tutor-online-teacher',
    categoryId: 'cat-e-education-training',
    subcategoryId: 'sub-e2-tutoring',
    name: 'Home Tutor / Private Teacher',
    nameHi: 'होम ट्यूटर / शिक्षक',
    singular: 'Tutor',
    aliases: ['tutor', 'teacher', 'home tutor', 'tuition teacher', 'maths teacher', 'private tutor', 'adhyapak'],
    description: 'Class 1–12 personalized academic tutoring, conceptual clarity, homework guidance, and exam prep.',
    popularSkills: ['Mathematics', 'Science', 'English Grammar', 'CBSE/ICSE Curriculum', 'Patient Explanations'],
    baseHourlyRate: 400,
    baseDailyRate: 1200,
    isActive: true
  },
  {
    id: 'prof-music-dance-coach',
    slug: 'music-dance-sports-coach',
    categoryId: 'cat-e-education-training',
    subcategoryId: 'sub-e3-skills-arts',
    name: 'Music, Dance & Sports Coach',
    nameHi: 'संगीत, नृत्य एवं खेल प्रशिक्षक',
    singular: 'Coach',
    aliases: ['music teacher', 'dance teacher', 'guitar tutor', 'sports coach', 'yoga trainer', 'karate coach'],
    description: 'Vocal training, classical/Bollywood dance coaching, keyboard/guitar lessons, and sports drills.',
    popularSkills: ['Classical/Western Music', 'Choreography', 'Instrument Training', 'Fitness Coaching'],
    baseHourlyRate: 500,
    baseDailyRate: 1500,
    isActive: true
  },

  // --- F. IT, SOFTWARE & TECHNOLOGY ---
  {
    id: 'prof-software-developer',
    slug: 'fullstack-software-developer',
    categoryId: 'cat-f-it-software',
    subcategoryId: 'sub-f1-development',
    name: 'Software Developer (Full Stack / Web / Mobile)',
    nameHi: 'सॉफ्टवेयर डेवलपर (वेब व मोबाइल)',
    singular: 'Developer',
    aliases: ['software developer', 'programmer', 'web developer', 'coder', 'full stack developer', 'frontend', 'backend', 'app developer'],
    description: 'End-to-end web & mobile app engineering, REST/GraphQL APIs, React, Next.js, Node.js, and databases.',
    popularSkills: ['React/Next.js', 'Node.js', 'TypeScript', 'MongoDB/PostgreSQL', 'API Development'],
    baseHourlyRate: 800,
    baseDailyRate: 3500,
    isActive: true
  },
  {
    id: 'prof-ui-ux-designer',
    slug: 'ui-ux-product-designer',
    categoryId: 'cat-f-it-software',
    subcategoryId: 'sub-f4-design',
    name: 'UI/UX & Product Designer',
    nameHi: 'यूआई/यूएक्स डिजाइनर',
    singular: 'UI/UX Designer',
    aliases: ['ui designer', 'ux designer', 'product designer', 'figma designer', 'web designer'],
    description: 'Mobile and web wireframes, high-fidelity prototypes in Figma, design systems, and user research.',
    popularSkills: ['Figma', 'Prototyping', 'Design Systems', 'Responsive Web', 'Usability Testing'],
    baseHourlyRate: 700,
    baseDailyRate: 3000,
    isActive: true
  },

  // --- G. DIGITAL, MEDIA & CREATIVE ---
  {
    id: 'prof-video-editor',
    slug: 'video-editor-animator',
    categoryId: 'cat-g-creative-media',
    subcategoryId: 'sub-g2-video-photo',
    name: 'Video Editor & Motion Designer',
    nameHi: 'वीडियो एडिटर एवं मोशन डिजाइनर',
    singular: 'Video Editor',
    aliases: ['video editor', 'video editing', 'youtube editor', 'reels editor', 'motion graphics', 'video cutter'],
    description: 'Short-form Reels, YouTube vlogs, wedding highlights, color grading, sound design, and subtitle timing.',
    popularSkills: ['Premiere Pro', 'After Effects', 'Color Grading', 'Sound Sync', 'Thumbnail Creation'],
    baseHourlyRate: 500,
    baseDailyRate: 2000,
    isActive: true
  },
  {
    id: 'prof-photographer',
    slug: 'photographer-videographer',
    categoryId: 'cat-g-creative-media',
    subcategoryId: 'sub-g2-video-photo',
    name: 'Photographer & Videographer',
    nameHi: 'फोटोग्राफर व कैमरामैन',
    singular: 'Photographer',
    aliases: ['photographer', 'cameraman', 'photo shoot', 'wedding photographer', 'event photographer', 'videographer'],
    description: 'Professional DSLR/mirrorless photography for weddings, portraits, products, and commercial events.',
    popularSkills: ['Lighting Setup', 'Portrait Photography', 'Event Shoots', 'Lightroom Editing'],
    baseHourlyRate: 600,
    baseDailyRate: 3000,
    isActive: true
  },
  {
    id: 'prof-content-writer',
    slug: 'content-writer-copywriter',
    categoryId: 'cat-g-creative-media',
    subcategoryId: 'sub-g3-writing-content',
    name: 'Content Writer & Copywriter',
    nameHi: 'कंटेंट राइटर व कॉपीराइटर',
    singular: 'Writer',
    aliases: ['writer', 'content writer', 'copywriter', 'blog writer', 'script writer', 'article writer', 'lekhak'],
    description: 'SEO blog articles, marketing ad copy, website landing pages, video scripts, and proofreading.',
    popularSkills: ['SEO Writing', 'Copywriting', 'Research', 'Grammar Editing', 'Script Writing'],
    baseHourlyRate: 400,
    baseDailyRate: 1500,
    isActive: true
  },

  // --- H. OFFICE & ADMINISTRATION ---
  {
    id: 'prof-data-entry-operator',
    slug: 'data-entry-typist',
    categoryId: 'cat-h-office-admin',
    subcategoryId: 'sub-h2-data-entry',
    name: 'Data Entry Operator & Typist',
    nameHi: 'डाटा एंट्री ऑपरेटर व टाइपिस्ट',
    singular: 'Data Entry Operator',
    aliases: ['data entry', 'typist', 'hindi typist', 'excel operator', 'computer operator', 'back office'],
    description: 'Fast typing (40+ WPM in Hindi/English), MS Excel data validation, invoice entry, and form processing.',
    popularSkills: ['MS Excel', 'Fast Typing', 'Data Validation', 'Google Sheets', 'Filing'],
    baseHourlyRate: 200,
    baseDailyRate: 700,
    isActive: true
  },
  {
    id: 'prof-receptionist-office-boy',
    slug: 'receptionist-office-assistant',
    categoryId: 'cat-h-office-admin',
    subcategoryId: 'sub-h1-front-desk',
    name: 'Receptionist & Front Desk Executive',
    nameHi: 'रिसेप्शनिस्ट व फ्रंट डेस्क',
    singular: 'Receptionist',
    aliases: ['receptionist', 'front desk', 'office assistant', 'office boy', 'office coordinator'],
    description: 'Visitor greeting, call routing, courier management, conference room scheduling, and hospitality.',
    popularSkills: ['Customer Greeting', 'Phone Etiquette', 'Email Communication', 'Office Record Keeping'],
    baseHourlyRate: 250,
    baseDailyRate: 800,
    isActive: true
  },

  // --- I. ACCOUNTING, FINANCE & BUSINESS ---
  {
    id: 'prof-accountant',
    slug: 'accountant-tally-gst',
    categoryId: 'cat-i-finance-business',
    subcategoryId: 'sub-i1-accounting-tax',
    name: 'Accountant (Tally / GST / Billing)',
    nameHi: 'अकाउंटेंट (मुनीम / टैली / जीएसटी)',
    singular: 'Accountant',
    aliases: ['accountant', 'muneem', 'tally operator', 'gst filing', 'bookkeeper', 'billing executive', 'ca assistant'],
    description: 'Day-to-day bookkeeping, bank reconciliation, sales/purchase voucher entry, and GST computation.',
    popularSkills: ['Tally Prime', 'GST Returns', 'Bank Reconciliation', 'TDS Calculation', 'MIS Reporting'],
    baseHourlyRate: 450,
    baseDailyRate: 1400,
    isActive: true
  },

  // --- J. HOTEL, FOOD & HOSPITALITY ---
  {
    id: 'prof-cook-chef',
    slug: 'cook-chef-rasoiya',
    categoryId: 'cat-j-hospitality-food',
    subcategoryId: 'sub-j1-culinary-cooks',
    name: 'Cook / Chef / Maharaj',
    nameHi: 'रसोइया / बावर्ची / कुक / महाराज',
    singular: 'Cook',
    aliases: ['cook', 'rasoiya', 'maharaj', 'chef', 'khana banane wala', 'halwai', 'bavarchi', 'caterer cook'],
    description: 'Hygienic home food, regional North/South Indian meals, catering, thali preparation, and banquet cooking.',
    popularSkills: ['North Indian', 'South Indian', 'Tandoori Items', 'Bulk Catering Cooking', 'Kitchen Hygiene'],
    baseHourlyRate: 300,
    baseDailyRate: 1000,
    isActive: true
  },
  {
    id: 'prof-waiter-steward',
    slug: 'waiter-steward-banquet',
    categoryId: 'cat-j-hospitality-food',
    subcategoryId: 'sub-j2-service-waiters',
    name: 'Waiter & Catering Steward',
    nameHi: 'वेटर व कैटरिंग स्टाफ',
    singular: 'Waiter',
    aliases: ['waiter', 'steward', 'banquet staff', 'catering boy', 'food server'],
    description: 'Food table service, banquet buffet replenishing, guest courtesy, and crockery handling.',
    popularSkills: ['Table Service', 'Tray Balancing', 'Banquet Courtesy', 'Buffet Management'],
    baseHourlyRate: 200,
    baseDailyRate: 750,
    isActive: true
  },

  // --- K. HOME & HOUSEHOLD SERVICES ---
  {
    id: 'prof-house-cleaner-maid',
    slug: 'house-cleaner-maid-helper',
    categoryId: 'cat-k-home-household',
    subcategoryId: 'sub-k1-domestic-help',
    name: 'Maid / House Cleaner / Domestic Helper',
    nameHi: 'घरेलू सहायिका / बाई / सफाई कर्मी',
    singular: 'Housekeeper',
    aliases: ['maid', 'cleaner', 'house cleaner', 'bai', 'jhadu pocha', 'kamwali', 'safai karmi', 'housekeeping'],
    description: 'Daily broom & mopping, utensil cleaning, dusting, laundry, and general domestic assistance.',
    popularSkills: ['Floor Mopping', 'Utensil Washing', 'Dusting', 'Kitchen Cleaning', 'Hygiene'],
    baseHourlyRate: 200,
    baseDailyRate: 600,
    isActive: true
  },

  // --- L. BEAUTY, PERSONAL CARE & FASHION ---
  {
    id: 'prof-barber-hair-stylist',
    slug: 'barber-hair-stylist',
    categoryId: 'cat-l-beauty-fashion',
    subcategoryId: 'sub-l1-hair-barber',
    name: 'Barber & Men’s Hair Stylist',
    nameHi: 'नाई (हेयर कटिंग व शेविंग)',
    singular: 'Barber',
    aliases: ['barber', 'nai', 'hair stylist', 'hair dresser', 'bal katne wala', 'shaving', 'salon artist'],
    description: 'Men’s hair styling, classic scissor cut, beard trimming, face massage, and hair coloring.',
    popularSkills: ['Scissor Haircut', 'Beard Trim', 'Razor Shave', 'Head Massage'],
    baseHourlyRate: 250,
    baseDailyRate: 800,
    isActive: true
  },
  {
    id: 'prof-beautician-makeup',
    slug: 'beautician-bridal-makeup',
    categoryId: 'cat-l-beauty-fashion',
    subcategoryId: 'sub-l2-beautician-makeup',
    name: 'Beautician & Bridal Makeup Artist',
    nameHi: 'ब्यूटीशियन व मेकअप आर्टिस्ट',
    singular: 'Beautician',
    aliases: ['beautician', 'makeup artist', 'bridal makeup', 'mehendi artist', 'salon at home', 'facial waxing'],
    description: 'Doorstep facial, threading, waxing, bridal makeovers, hair styling, and mehendi application.',
    popularSkills: ['Facial & Cleanup', 'Bridal Makeup', 'Threading & Waxing', 'Party Hair Styling'],
    baseHourlyRate: 400,
    baseDailyRate: 1500,
    isActive: true
  },
  {
    id: 'prof-tailor',
    slug: 'tailor-darzi-garments',
    categoryId: 'cat-l-beauty-fashion',
    subcategoryId: 'sub-l3-tailoring-garments',
    name: 'Tailor (Darzi) & Alteration Specialist',
    nameHi: 'दर्जी (सिलाई व फिटिंग)',
    singular: 'Tailor',
    aliases: ['tailor', 'darzi', 'silai wala', 'blouse master', 'suit alteration', 'garment stitcher'],
    description: 'Custom suit/kurta stitching, blouse cutting, dress alterations, and zipper/fitting repairs.',
    popularSkills: ['Measurement Taking', 'Pattern Cutting', 'Machine Stitching', 'Fitting Alterations'],
    baseHourlyRate: 250,
    baseDailyRate: 850,
    isActive: true
  },

  // --- O. SECURITY & FACILITY OPERATIONS ---
  {
    id: 'prof-security-guard',
    slug: 'security-guard-chowkidar',
    categoryId: 'cat-o-security-facilities',
    subcategoryId: 'sub-o1-guards',
    name: 'Security Guard / Chowkidar',
    nameHi: 'सुरक्षा गार्ड / चौकीदार',
    singular: 'Security Guard',
    aliases: ['security guard', 'chowkidar', 'guard', 'suraksha guard', 'gatekeeper', 'watchman', 'bouncer'],
    description: 'Residential society security, entry register logging, perimeter patrolling, and gate safety.',
    popularSkills: ['Access Control', 'Visitor Log', 'Perimeter Patrol', 'Emergency Response', 'Alertness'],
    baseHourlyRate: 180,
    baseDailyRate: 650,
    isActive: true
  },

  // --- P. HEALTHCARE & WELLNESS (REGULATED) ---
  {
    id: 'prof-nurse-caregiver',
    slug: 'registered-nurse-patient-caregiver',
    categoryId: 'cat-p-healthcare-wellness',
    subcategoryId: 'sub-p1-nursing-care',
    name: 'Qualified Nurse / Home Caregiver',
    nameHi: 'नर्स एवं रोगी देखभाल सहायक',
    singular: 'Nurse',
    aliases: ['nurse', 'caregiver', 'patient care', 'home nurse', 'attendant', 'elderly care', 'rogi dekhbhal'],
    description: 'Vital signs monitoring, IV line management, post-surgery dressing, insulin, and elderly care.',
    popularSkills: ['Vitals Monitoring', 'Wound Dressing', 'Medication Administration', 'Patient Mobility'],
    baseHourlyRate: 400,
    baseDailyRate: 1400,
    isRegulated: true,
    verificationRequirements: ['State Nursing Council Registration / GNM / B.Sc', 'Police Verification'],
    isActive: true
  },
  {
    id: 'prof-physiotherapist',
    slug: 'physiotherapist-home-rehab',
    categoryId: 'cat-p-healthcare-wellness',
    subcategoryId: 'sub-p2-therapy-fitness',
    name: 'Physiotherapist',
    nameHi: 'फिजियोथेरेपिस्ट',
    singular: 'Physiotherapist',
    aliases: ['physiotherapist', 'physio', 'back pain doctor', 'ortho rehab', 'paralysis rehab'],
    description: 'Post-fracture rehabilitation, stroke recovery, ergonomic back/knee pain therapy exercises.',
    popularSkills: ['Manual Therapy', 'TENS/Ultrasound Machine', 'Exercise Prescription', 'Gait Training'],
    baseHourlyRate: 700,
    baseDailyRate: 2500,
    isRegulated: true,
    verificationRequirements: ['BPT / MPT Degree', 'State Council Certification'],
    isActive: true
  },

  // --- S. AUTOMOBILE & VEHICLE SERVICES ---
  {
    id: 'prof-auto-mechanic',
    slug: 'car-bike-mechanic',
    categoryId: 'cat-s-automobile-vehicles',
    subcategoryId: 'sub-s1-mechanics',
    name: 'Car & Two-Wheeler Mechanic',
    nameHi: 'कार व बाइक मिस्त्री (ऑटो मैकेनिक)',
    singular: 'Mechanic',
    aliases: ['mechanic', 'car mechanic', 'bike mechanic', 'auto mechanic', 'motor mistri', 'puncture wala'],
    description: 'Engine servicing, brake pads, oil change, roadside breakdown assistance, and tyre puncture.',
    popularSkills: ['Brake Service', 'Engine Diagnostics', 'Carburetor/FI Tuning', 'Tyre Puncture Repair'],
    baseHourlyRate: 350,
    baseDailyRate: 1000,
    isActive: true
  },

  // --- T. PROFESSIONAL, LEGAL & CONSULTING (REGULATED) ---
  {
    id: 'prof-advocate-legal',
    slug: 'advocate-legal-assistant',
    categoryId: 'cat-t-professional-legal',
    subcategoryId: 'sub-t2-legal-compliance',
    name: 'Legal Professional / Advocate',
    nameHi: 'अधिवक्ता / कानूनी सलाहकार',
    singular: 'Advocate',
    aliases: ['advocate', 'lawyer', 'vakil', 'legal advisor', 'court lawyer', 'deed writer'],
    description: 'Rent agreement drafting, property title verification, affidavit, notary, and legal consultation.',
    popularSkills: ['Contract Drafting', 'Title Search', 'Legal Advisory', 'Affidavit Preparation'],
    baseHourlyRate: 800,
    baseDailyRate: 3500,
    isRegulated: true,
    verificationRequirements: ['Bar Council Enrollment Number (COP)', 'LLB Degree'],
    isActive: true
  }
];

// Helper functions for dynamic lookups
export function getAllCategories(): MasterCategory[] {
  return MASTER_CATEGORIES;
}

export function getAllProfessionsList(): MasterProfession[] {
  return MASTER_PROFESSIONS;
}

export function findProfessionByIdOrSlug(query: string): MasterProfession | undefined {
  const q = query.toLowerCase().trim();
  return MASTER_PROFESSIONS.find(
    p => p.id === q || p.slug === q || p.aliases.includes(q) || p.name.toLowerCase() === q
  );
}

export function searchProfessionsCatalogue(searchQuery: string, categoryId?: string): MasterProfession[] {
  let list = MASTER_PROFESSIONS.filter(p => p.isActive);

  if (categoryId) {
    list = list.filter(p => p.categoryId === categoryId);
  }

  if (!searchQuery || !searchQuery.trim()) {
    return list;
  }

  const q = searchQuery.toLowerCase().trim();

  return list.filter(p => {
    if (p.name.toLowerCase().includes(q)) return true;
    if (p.nameHi.includes(q)) return true;
    if (p.singular.toLowerCase().includes(q)) return true;
    if (p.description.toLowerCase().includes(q)) return true;
    if (p.aliases.some(alias => alias.toLowerCase().includes(q) || q.includes(alias.toLowerCase()))) return true;
    if (p.popularSkills.some(skill => skill.toLowerCase().includes(q))) return true;
    return false;
  });
}
