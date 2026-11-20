// Seed script for MongoDB Atlas Profession Catalogue
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://8887642828:Abhinav%402008@cluster0.jjs2wil.mongodb.net/kaamsetu';

// Master Categories (A to Z)
const CATEGORIES = [
  { id: 'cat-a-construction', code: 'A', name: 'Construction & Civil Work', nameHi: 'भवन निर्माण एवं सिविल कार्य', slug: 'construction-civil-work' },
  { id: 'cat-b-electrical', code: 'B', name: 'Electrical, Electronics & Energy', nameHi: 'बिजली, इलेक्ट्रॉनिक्स एवं ऊर्जा', slug: 'electrical-electronics-energy' },
  { id: 'cat-c-plumbing-hvac', code: 'C', name: 'Plumbing, HVAC & Maintenance', nameHi: 'प्लंबिंग, एसी एवं रखरखाव', slug: 'plumbing-hvac-maintenance' },
  { id: 'cat-d-transport-logistics', code: 'D', name: 'Transport, Driving & Logistics', nameHi: 'परिवहन, ड्राइविंग एवं लॉजिस्टिक्स', slug: 'transport-driving-logistics' },
  { id: 'cat-e-education-training', code: 'E', name: 'Education & Training', nameHi: 'शिक्षा, ट्यूशन एवं प्रशिक्षण', slug: 'education-training' },
  { id: 'cat-f-it-software', code: 'F', name: 'IT, Software & Technology', nameHi: 'आईटी, सॉफ्टवेयर एवं टेक्नोलॉजी', slug: 'it-software-technology' },
  { id: 'cat-g-creative-media', code: 'G', name: 'Digital, Media & Creative', nameHi: 'डिजिटल, मीडिया एवं क्रिएटिव', slug: 'digital-media-creative' },
  { id: 'cat-h-office-admin', code: 'H', name: 'Office & Administration', nameHi: 'कार्यालय एवं प्रशासन', slug: 'office-administration' },
  { id: 'cat-i-finance-business', code: 'I', name: 'Accounting, Finance & Business', nameHi: 'अकाउंटिंग, फाइनेंस एवं व्यापार', slug: 'accounting-finance-business' },
  { id: 'cat-j-hospitality-food', code: 'J', name: 'Hotel, Food & Hospitality', nameHi: 'होटल, खानपान एवं हॉस्पिटैलिटी', slug: 'hotel-food-hospitality' },
  { id: 'cat-k-home-household', code: 'K', name: 'Home & Household Services', nameHi: 'घरेलू सेवाएं एवं हाउसकीपिंग', slug: 'home-household-services' },
  { id: 'cat-l-beauty-fashion', code: 'L', name: 'Beauty, Personal Care & Fashion', nameHi: 'सौंदर्य, हेयर स्टाइलिंग एवं फैशन', slug: 'beauty-personal-care-fashion' },
  { id: 'cat-m-factory-manufacturing', code: 'M', name: 'Factory, Industrial & Manufacturing', nameHi: 'फैक्ट्री, उत्पादन एवं निर्माण उद्योग', slug: 'factory-industrial-manufacturing' },
  { id: 'cat-n-agriculture-animal', code: 'N', name: 'Agriculture & Animal Care', nameHi: 'कृषि, पशुपालन एवं बागवानी', slug: 'agriculture-animal-care' },
  { id: 'cat-o-security-facilities', code: 'O', name: 'Security & Facility Operations', nameHi: 'सुरक्षा गार्ड एवं सुविधा प्रबंधन', slug: 'security-facility-operations' },
  { id: 'cat-p-healthcare-wellness', code: 'P', name: 'Healthcare & Wellness', nameHi: 'स्वास्थ्य सेवा, नर्सिंग एवं योग', slug: 'healthcare-wellness' },
  { id: 'cat-q-retail-sales', code: 'Q', name: 'Retail, Shop & Customer Service', nameHi: 'रिटेल, दुकान एवं सेल्स प्रमोटर', slug: 'retail-shop-customer-service' },
  { id: 'cat-r-events-weddings', code: 'R', name: 'Events, Weddings & Entertainment', nameHi: 'इवेंट, शादी-विवाह एवं मनोरंजन', slug: 'events-weddings-entertainment' },
  { id: 'cat-s-automobile-vehicles', code: 'S', name: 'Automobile & Vehicle Services', nameHi: 'ऑटोमोबाइल एवं वाहन मरम्मत', slug: 'automobile-vehicle-services' },
  { id: 'cat-t-professional-legal', code: 'T', name: 'Professional, Legal & Consulting', nameHi: 'पेशेवर, कानूनी एवं तकनीकी परामर्श', slug: 'professional-legal-consulting' },
  { id: 'cat-u-handicrafts-artisan', code: 'U', name: 'Handicrafts & Artisan Work', nameHi: 'हस्तशिल्प, कारीगरी एवं हथकरघा', slug: 'handicrafts-artisan-work' },
  { id: 'cat-v-pet-animal', code: 'V', name: 'Pet & Animal Services', nameHi: 'पालतू पशु देखभाल एवं प्रशिक्षण', slug: 'pet-animal-services' },
  { id: 'cat-w-property-real-estate', code: 'W', name: 'Property & Real Estate Support', nameHi: 'प्रॉपर्टी, रियल एस्टेट एवं रखरखाव', slug: 'property-real-estate-support' },
  { id: 'cat-x-environment-waste', code: 'X', name: 'Environment, Cleaning & Waste', nameHi: 'पर्यावरण, सफाई एवं अपशिष्ट प्रबंधन', slug: 'environment-cleaning-waste' },
  { id: 'cat-y-remote-online', code: 'Y', name: 'Remote, Freelance & Online Work', nameHi: 'रिमोट, फ्रीलांस एवं ऑनलाइन कार्य', slug: 'remote-freelance-online-work' },
  { id: 'cat-z-custom-professions', code: 'Z', name: 'Other Professions & Trades', nameHi: 'अन्य व्यवसाय एवं कौशल', slug: 'other-professions-trades' }
];

async function seed() {
  console.log('[Seed] Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('kaamsetu');

  const catCol = db.collection('profession_categories');
  const profCol = db.collection('professions');

  console.log(`[Seed] Upserting ${CATEGORIES.length} Categories...`);
  for (const cat of CATEGORIES) {
    await catCol.updateOne(
      { id: cat.id },
      { $set: { ...cat, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
  }

  const catCount = await catCol.countDocuments();
  console.log(`[SUCCESS] Seeded ${catCount} categories into MongoDB Atlas.`);

  await client.close();
}

seed().catch(console.error);
