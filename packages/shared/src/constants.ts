// KAAMSETU - Shared Categories, Cities, and Configurations

export const WORKER_CATEGORIES = [
  { id: 'electrician', nameEn: 'Electrician', nameHi: 'इलेक्ट्रीशियन', icon: 'flash-outline' },
  { id: 'plumber', nameEn: 'Plumber', nameHi: 'प्लंबर', icon: 'water-outline' },
  { id: 'carpenter', nameEn: 'Carpenter', nameHi: 'बढ़ई / कारपेंटर', icon: 'hammer-outline' },
  { id: 'painter', nameEn: 'Painter', nameHi: 'पेंटर', icon: 'color-palette-outline' },
  { id: 'mason', nameEn: 'Mason (Rajmistri)', nameHi: 'राजमिस्त्री', icon: 'business-outline' },
  { id: 'welder', nameEn: 'Welder / Fabricator', nameHi: 'वेल्डर / फैब्रिकेटर', icon: 'flame-outline' },
  { id: 'ac_technician', nameEn: 'AC / Appliance Tech', nameHi: 'एसी टेक्नीशियन', icon: 'snow-outline' },
  { id: 'construction', nameEn: 'Construction Labour', nameHi: 'निर्माण मजदूर (लेबर)', icon: 'construct-outline' },
  { id: 'driver', nameEn: 'Driver / Chauffeur', nameHi: 'ड्राइवर', icon: 'car-outline' },
  { id: 'cleaner', nameEn: 'Cleaner / Housekeeping', nameHi: 'सफाई कर्मी', icon: 'sparkles-outline' },
  { id: 'cook', nameEn: 'Cook / Chef', nameHi: 'रसोइया / कुक', icon: 'restaurant-outline' },
  { id: 'security', nameEn: 'Security Guard', nameHi: 'सुरक्षा गार्ड', icon: 'shield-checkmark-outline' },
  { id: 'gardener', nameEn: 'Gardener (Mali)', nameHi: 'माली', icon: 'leaf-outline' },
  { id: 'helper', nameEn: 'General Helper', nameHi: 'जनरल हेल्पर', icon: 'people-outline' },
];

export const MAJOR_INDIAN_CITIES = [
  'Delhi NCR',
  'Noida',
  'Greater Noida',
  'Gurugram',
  'Ghaziabad',
  'Faridabad',
  'Mumbai',
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Ahmedabad',
  'Chennai',
  'Kolkata',
  'Jaipur',
  'Lucknow',
  'Patna',
  'Chandigarh',
  'Bhopal',
  'Indore',
  'Kanpur',
];

export const APP_CONFIG = {
  // Mobile / production API endpoints
  PRODUCTION_API_URL: 'https://api.kaamsetu.in',
  LAN_API_URL: 'http://10.10.31.251:5000',
  EMULATOR_API_URL: 'http://10.0.2.2:5000',
  DEFAULT_API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.10.31.251:5000',
  SOCKET_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.10.31.251:5000',
  CURRENCY: '₹',
  DEFAULT_LANGUAGE: 'en',
};
