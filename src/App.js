import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Auth, { SESSION_KEY } from './Auth';
import { getTotalUsers, getOnlineUsers, setUserOffline, getAllUsers, addListing, getActiveListings, rateListing } from './api';
import {
  COMMODITY_CATEGORIES, ALL_CROPS, BASE_PRICES,
  MANDI_DB, MANDI_MULTIPLIERS, STATE_MANDI_DISTANCES, INTL_PRICES,
  INPUT_STATE_MULTIPLIER, INDIA_LOCATIONS, ALL_STATES,
  WEATHER_DATA, GOVT_SCHEMES, MCX_COMMODITIES, FUEL_BASE_PRICES
} from './data';
import { fetchLiveWeather } from './weatherService';
import { I18N, calculateWeatherDecisions, PLANT_DISEASES_DB, generateCropRecommendations } from './agronomyEngine';

/* ══════════════════════════════════════════════════════════
   SMART CROP ADVISOR AI — PROFESSIONAL FARMING ECOSYSTEM
   Full Featured: Live Prices • Weather • Schemes • MCX
══════════════════════════════════════════════════════════ */

const SCHEME_ELIGIBILITY = (land, sector, aadhaar, bank, isSCST) => {
  const all = land > 0;
  const small = land <= 2;
  const results = [];
  if (all && aadhaar && bank) results.push('PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)');
  if (all && aadhaar) results.push('PM Fasal Bima Yojana (PMFBY)');
  if (all) results.push('Soil Health Card Scheme');
  if (all && bank) results.push('Kisan Credit Card (KCC)');
  if (all && aadhaar && bank) results.push('National Agriculture Market (eNAM)');
  if (small) results.push('PM Krishi Sinchai Yojana (PMKSY)');
  if (all) results.push('National Food Security Mission (NFSM)');
  if (all && aadhaar) results.push('Sub-Mission on Agricultural Mechanization (SMAM)');
  if (land >= 2) results.push('Paramparagat Krishi Vikas Yojana (PKVY)');
  if (all && aadhaar && bank) results.push('PM-AASHA — MSP Price Protection');
  if (sector === 'fisheries') results.push('PM Matsya Sampada Yojana');
  if (isSCST) results.push('SMAM Extra 80% Subsidy (SC/ST/Women Farmers)');
  return results;
};

// ── Utility: get today's day label for weather bar
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const today = new Date().getDay();

// Starter listings for the marketplace — covering all categories with photos & stock
const STARTER_LISTINGS = [
  // 🥬 Vegetables
  {
    id: "veg_spinach",
    title: "Fresh Farm Organic Spinach (Palak / Paalak)",
    category: "🥬 Vegetables",
    price: 18, mrp: 25,
    quantity: 150, unit: "kg",
    description: "Tender, iron-rich organic palak leaves. Harvested at sunrise, 100% natural.",
    sellerId: "green_farm_1", sellerName: "Ramesh Organic Farms", sellerPhone: "9876543210",
    sellerLocation: { state: "Telangana", district: "Hyderabad", mandal: "Secunderabad" },
    rating: 4.9, ratingCount: 124,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_tomato",
    title: "Red Hybrid Farm-Fresh Tomatoes (Tamatar)",
    category: "🥬 Vegetables",
    price: 22, mrp: 32,
    quantity: 500, unit: "kg",
    description: "Firm, glossy red tomatoes with balanced sweetness and acidity. Ideal for curries and salads.",
    sellerId: "kisan_agro_2", sellerName: "Venkateswara Agri Farms", sellerPhone: "9440123456",
    sellerLocation: { state: "Andhra Pradesh", district: "Guntur", mandal: "Tenali" },
    rating: 4.8, ratingCount: 186,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_onion",
    title: "Premium Red Nasik Onions (Pyaaz / Ullipaya)",
    category: "🥬 Vegetables",
    price: 28, mrp: 40,
    quantity: 1200, unit: "kg",
    description: "Grade-A dry red Nasik onions with pungent aroma, thin dry skin, and extended shelf life.",
    sellerId: "nashik_farms", sellerName: "Patil Farmer Producer Co.", sellerPhone: "9822012345",
    sellerLocation: { state: "Maharashtra", district: "Nashik", mandal: "Malegaon" },
    rating: 4.7, ratingCount: 240,
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_potato",
    title: "Fresh Harvest Jyoti Potatoes (Aloo / Bangaladumpa)",
    category: "🥬 Vegetables",
    price: 20, mrp: 28,
    quantity: 900, unit: "kg",
    description: "Clean, unblemished large table potatoes from UP cold-store farms. Low sugar, great for fries.",
    sellerId: "up_potatoes", sellerName: "Agra Wholesale Farmers", sellerPhone: "9711098765",
    sellerLocation: { state: "Uttar Pradesh", district: "Agra", mandal: "Etmadpur" },
    rating: 4.6, ratingCount: 95,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_carrot",
    title: "Crunchy Red Nantes Carrots (Gajar)",
    category: "🥬 Vegetables",
    price: 30, mrp: 45,
    quantity: 350, unit: "kg",
    description: "Sweet, crunchy high-carotene mountain carrots. Excellent for halwa, salads, and juicing.",
    sellerId: "carrot_hp", sellerName: "Himachal Valley Growers", sellerPhone: "9816012345",
    sellerLocation: { state: "Himachal Pradesh", district: "Shimla", mandal: "Rohru" },
    rating: 4.8, ratingCount: 110,
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_cauliflower",
    title: "Snowball White Cauliflower (Phool Gobi)",
    category: "🥬 Vegetables",
    price: 26, mrp: 38,
    quantity: 400, unit: "kg",
    description: "Dense, compact white curds shielded by natural green jacket leaves. Freshly cut.",
    sellerId: "pb_gobi", sellerName: "Ludhiana Vegetable Growers", sellerPhone: "9815012345",
    sellerLocation: { state: "Punjab", district: "Ludhiana", mandal: "Jagraon" },
    rating: 4.6, ratingCount: 78,
    image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_okra",
    title: "Tender Green Okra (Bhindi / Bhendi)",
    category: "🥬 Vegetables",
    price: 32, mrp: 48,
    quantity: 300, unit: "kg",
    description: "Young, slender, fiber-free lady finger pods for crispy fry and spicy sambar.",
    sellerId: "bhindi_tn", sellerName: "Coimbatore Agri Farms", sellerPhone: "9843012345",
    sellerLocation: { state: "Tamil Nadu", district: "Coimbatore", mandal: "Pollachi" },
    rating: 4.7, ratingCount: 132,
    image: "https://images.unsplash.com/photo-1627735483748-bc5bfd1f0e68?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_brinjal",
    title: "Glossy Purple Brinjal (Baingan / Vankaya)",
    category: "🥬 Vegetables",
    price: 22, mrp: 32,
    quantity: 280, unit: "kg",
    description: "Tender, shiny eggplants perfect for roasting, bharta, and stuffed gutti vankaya.",
    sellerId: "baingan_ap", sellerName: "Krishna Basin Vegetables", sellerPhone: "9440987654",
    sellerLocation: { state: "Andhra Pradesh", district: "Krishna", mandal: "Vuyyuru" },
    rating: 4.6, ratingCount: 88,
    image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_capsicum",
    title: "Crisp Green Bell Peppers (Capsicum / Shimla Mirch)",
    category: "🥬 Vegetables",
    price: 48, mrp: 70,
    quantity: 220, unit: "kg",
    description: "Thick-walled crunchy green bell peppers directly from climate-controlled polyhouses.",
    sellerId: "bell_pepper_tn", sellerName: "Ooty Hillfresh Produce", sellerPhone: "9842112345",
    sellerLocation: { state: "Tamil Nadu", district: "Nilgiris", mandal: "Ooty" },
    rating: 4.8, ratingCount: 145,
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_garlic",
    title: "Desi Pungent Garlic Bulbs (Lahsun / Vellulli)",
    category: "🥬 Vegetables",
    price: 130, mrp: 180,
    quantity: 450, unit: "kg",
    description: "Naturally dried aromatic garlic cloves with high allicin content. Boosts heart health.",
    sellerId: "garlic_mp", sellerName: "Madhya Pradesh Spice Growers", sellerPhone: "9827012345",
    sellerLocation: { state: "Madhya Pradesh", district: "Mandsaur", mandal: "Sitamau" },
    rating: 4.9, ratingCount: 160,
    image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "veg_ginger",
    title: "Spicy Fresh Ginger Root (Adrak / Allam)",
    category: "🥬 Vegetables",
    price: 85, mrp: 120,
    quantity: 350, unit: "kg",
    description: "Juicy, fiber-light fresh ginger harvested from organic mountain soil in Idukki.",
    sellerId: "ginger_ker", sellerName: "Kerala Spice Growers", sellerPhone: "9447112345",
    sellerLocation: { state: "Kerala", district: "Idukki", mandal: "Thodupuzha" },
    rating: 4.9, ratingCount: 198,
    image: "https://images.unsplash.com/photo-1573401015249-000df68ff7ca?w=600&auto=format&fit=crop&q=80"
  },

  // 🍎 Fruits
  {
    id: "fruit_mango",
    title: "GI-Certified Ratnagiri Alphonso Mangoes (Hapus)",
    category: "🍎 Fruits",
    price: 130, mrp: 180,
    quantity: 250, unit: "kg",
    description: "Tree-ripened, golden-saffron Alphonso mangoes with royal aroma and buttery texture.",
    sellerId: "mango_king", sellerName: "Kokan Agro Orchards", sellerPhone: "9823456789",
    sellerLocation: { state: "Maharashtra", district: "Ratnagiri", mandal: "Dapoli" },
    rating: 5.0, ratingCount: 312,
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_banana",
    title: "Natural Robusta Bananas (Kela / Aratipandu)",
    category: "🍎 Fruits",
    price: 28, mrp: 40,
    quantity: 450, unit: "kg",
    description: "Ethylene-free naturally ripened sweet bananas packed with energy and dietary potassium.",
    sellerId: "kerala_fruits", sellerName: "Malabar Fruit Producers", sellerPhone: "9447012345",
    sellerLocation: { state: "Kerala", district: "Palakkad", mandal: "Ottappalam" },
    rating: 4.8, ratingCount: 175,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_grapes",
    title: "Sweet Seedless Thomson Green Grapes (Angoor)",
    category: "🍎 Fruits",
    price: 85, mrp: 120,
    quantity: 300, unit: "kg",
    description: "Crisp, thin-skinned export quality green grapes from Sahyadri mountain vineyards.",
    sellerId: "grapes_nashik", sellerName: "Sahyadri Farmers Producer Co.", sellerPhone: "9822334455",
    sellerLocation: { state: "Maharashtra", district: "Nashik", mandal: "Dindori" },
    rating: 4.9, ratingCount: 164,
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_apple",
    title: "Kashmiri Royal Delicious Apples (Seb)",
    category: "🍎 Fruits",
    price: 155, mrp: 210,
    quantity: 260, unit: "kg",
    description: "Handpicked crisp red mountain apples. High juice content with balanced sweetness.",
    sellerId: "apple_kash", sellerName: "J&K Horticulture Board", sellerPhone: "9906312345",
    sellerLocation: { state: "Jammu & Kashmir", district: "Shopian", mandal: "Keller" },
    rating: 4.9, ratingCount: 280,
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_pomegranate",
    title: "Ruby Red Bhagwa Pomegranate (Anar / Danimma)",
    category: "🍎 Fruits",
    price: 95, mrp: 140,
    quantity: 320, unit: "kg",
    description: "Deep red juicy pearls with soft edible seeds. Rich in polyphenols and antioxidants.",
    sellerId: "anar_solapur", sellerName: "Solapur Pomegranate Growers", sellerPhone: "9822556677",
    sellerLocation: { state: "Maharashtra", district: "Solapur", mandal: "Mangalvedhe" },
    rating: 4.9, ratingCount: 195,
    image: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "fruit_lemon",
    title: "Juicy Thin-Skinned Kagzi Lemons (Nimbu Pack)",
    category: "🍎 Fruits",
    price: 65, mrp: 90,
    quantity: 400, unit: "kg",
    description: "High juice yield organic Kagzi lemons. Loaded with natural Vitamin C and bioflavonoids.",
    sellerId: "lemon_ap", sellerName: "Coastal Citrus Farms", sellerPhone: "9440712345",
    sellerLocation: { state: "Andhra Pradesh", district: "Nellore", mandal: "Kavali" },
    rating: 4.7, ratingCount: 142,
    image: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80"
  },

  // 🌾 Grains & Flour
  {
    id: "grain_basmati",
    title: "1121 Extra Long-Grain Aged Basmati Rice",
    category: "🌾 Grains & Flour",
    price: 98, mrp: 145,
    quantity: 600, unit: "kg",
    description: "Aged for 18 months. Fluffy, non-sticky grains expanding to over 20mm after cooking.",
    sellerId: "punjab_rice", sellerName: "Golden Field Millers", sellerPhone: "9814012345",
    sellerLocation: { state: "Punjab", district: "Amritsar", mandal: "Ajnala" },
    rating: 5.0, ratingCount: 320,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "grain_sona_masuri",
    title: "Sona Masuri Steam Raw Rice (Godavari Heritage)",
    category: "🌾 Grains & Flour",
    price: 56, mrp: 75,
    quantity: 1200, unit: "kg",
    description: "Lightweight, easy-to-digest daily staple rice. Low glycemic index, unpolished natural goodness.",
    sellerId: "ap_rice", sellerName: "Godavari Rice Mills", sellerPhone: "9441234567",
    sellerLocation: { state: "Andhra Pradesh", district: "West Godavari", mandal: "Tanuku" },
    rating: 4.8, ratingCount: 410,
    image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "grain_atta",
    title: "Sharbati Whole Wheat Chakki Fresh Atta",
    category: "🌾 Grains & Flour",
    price: 44, mrp: 60,
    quantity: 900, unit: "kg",
    description: "Stone-milled 100% whole Sharbati wheat flour retaining fiber, germ, and bran. Makes soft rotis.",
    sellerId: "chakki_atta", sellerName: "Organic Chakki Mills", sellerPhone: "9812012345",
    sellerLocation: { state: "Haryana", district: "Rohtak", mandal: "Kalanaur" },
    rating: 4.9, ratingCount: 380,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "grain_poha",
    title: "Thick Hand-Pounded Flattened Rice (Poha / Atukulu)",
    category: "🌾 Grains & Flour",
    price: 68, mrp: 90,
    quantity: 350, unit: "kg",
    description: "Nutritious roasted thick beaten rice flakes. Quick healthy breakfast rich in plant iron.",
    sellerId: "poha_mp", sellerName: "Nimar Valley Rice Mills", sellerPhone: "9827312345",
    sellerLocation: { state: "Madhya Pradesh", district: "Khandwa", mandal: "Punasa" },
    rating: 4.7, ratingCount: 165,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "grain_besan",
    title: "100% Pure Desi Chana Dal Besan (Gram Flour)",
    category: "🌾 Grains & Flour",
    price: 78, mrp: 105,
    quantity: 450, unit: "kg",
    description: "Stone-ground unadulterated chickpea flour for pakodas, dhokla, sweets, and savoury snacks.",
    sellerId: "besan_raj", sellerName: "Rajasthan Gram Processors", sellerPhone: "9828112345",
    sellerLocation: { state: "Rajasthan", district: "Bikaner", mandal: "Nokha" },
    rating: 4.8, ratingCount: 220,
    image: "https://images.unsplash.com/photo-1627735483748-bc5bfd1f0e68?w=600&auto=format&fit=crop&q=80"
  },

  // 🫘 Pulses & Dal
  {
    id: "pulse_toor",
    title: "Unpolished Desi Toor Dal (Arhar / Kandipappu)",
    category: "🫘 Pulses & Dal",
    price: 145, mrp: 190,
    quantity: 500, unit: "kg",
    description: "GI-famed Gulbarga toor dal. High natural protein, no artificial oil or water polishing.",
    sellerId: "gulbarga_dal", sellerName: "Deccan Pulses Co.", sellerPhone: "9845012345",
    sellerLocation: { state: "Karnataka", district: "Kalaburagi", mandal: "Kalaburagi City" },
    rating: 4.9, ratingCount: 245,
    image: "https://images.unsplash.com/photo-1585994191611-72ec0b73c41e?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "pulse_moong",
    title: "Yellow Split Moong Dal (Pesara Pappu)",
    category: "🫘 Pulses & Dal",
    price: 125, mrp: 165,
    quantity: 400, unit: "kg",
    description: "Easily digestible premium yellow moong dal. Perfect for khichdi, dal tadka, and daily meals.",
    sellerId: "moong_raj", sellerName: "Barmer Pulse Growers", sellerPhone: "9829012345",
    sellerLocation: { state: "Rajasthan", district: "Barmer", mandal: "Balotra" },
    rating: 4.8, ratingCount: 190,
    image: "https://images.unsplash.com/photo-1599579776378-5aa72f1a0c8c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "pulse_chana",
    title: "Desi Organic Kala Chana (Brown Chickpeas)",
    category: "🫘 Pulses & Dal",
    price: 92, mrp: 125,
    quantity: 650, unit: "kg",
    description: "Nutrient-packed desi kala chana with earthy taste. High fiber for sprouts and spicy curries.",
    sellerId: "chana_up", sellerName: "Kanpur Agricultural Co-op", sellerPhone: "9839012345",
    sellerLocation: { state: "Uttar Pradesh", district: "Kanpur", mandal: "Bilhaur" },
    rating: 4.7, ratingCount: 178,
    image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "pulse_rajma",
    title: "Kashmiri Chitra Red Kidney Beans (Rajma)",
    category: "🫘 Pulses & Dal",
    price: 165, mrp: 215,
    quantity: 280, unit: "kg",
    description: "Authentic speckled Chitra beans from Jammu hills. Cooks soft and creamy with rich gravy.",
    sellerId: "rajma_jk", sellerName: "J&K Valley Beans Growers", sellerPhone: "9906412345",
    sellerLocation: { state: "Jammu & Kashmir", district: "Jammu", mandal: "Akhnoor" },
    rating: 4.9, ratingCount: 260,
    image: "https://images.unsplash.com/photo-1551360934-39d45c0eda44?w=600&auto=format&fit=crop&q=80"
  },

  // 🌶 Spices & Masala
  {
    id: "spice_turmeric",
    title: "Salem Golden Turmeric Powder (5% Natural Curcumin)",
    category: "🌶 Spices & Masala",
    price: 165, mrp: 220,
    quantity: 350, unit: "kg",
    description: "Pure GI Salem turmeric with deep yellow hue and 5%+ active curcumin. Potent immunity booster.",
    sellerId: "salem_spices", sellerName: "Kongu Spices & Herbs", sellerPhone: "9842012345",
    sellerLocation: { state: "Tamil Nadu", district: "Salem", mandal: "Attur" },
    rating: 5.0, ratingCount: 310,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "spice_chilli",
    title: "Guntur Stemless Hot Red Chilli (Mirchi / Mirapakaya)",
    category: "🌶 Spices & Masala",
    price: 205, mrp: 275,
    quantity: 320, unit: "kg",
    description: "Sun-dried whole Guntur chillies known for vibrant natural red color and fiery pungent heat.",
    sellerId: "chilli_ap", sellerName: "Guntur Chilli Traders", sellerPhone: "9440812345",
    sellerLocation: { state: "Andhra Pradesh", district: "Guntur", mandal: "Ongole" },
    rating: 4.9, ratingCount: 295,
    image: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "spice_cumin",
    title: "Whole Aromatic Cumin Seeds (Jeera / Jeelakarra)",
    category: "🌶 Spices & Masala",
    price: 325, mrp: 430,
    quantity: 240, unit: "kg",
    description: "Bold Rajasthani cumin seeds sorted and cleaned. Fragrant essential spice for daily tempering.",
    sellerId: "jeera_raj", sellerName: "Jodhpur Spice Farmers", sellerPhone: "9829112345",
    sellerLocation: { state: "Rajasthan", district: "Jodhpur", mandal: "Tinwari" },
    rating: 4.9, ratingCount: 215,
    image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "spice_pepper",
    title: "Wayanad Bold Whole Black Pepper (Kali Mirch / Miriyalu)",
    category: "🌶 Spices & Masala",
    price: 660, mrp: 880,
    quantity: 120, unit: "kg",
    description: "The King of Spices. Handpicked large Malabar black peppercorns with intense piperine pungency.",
    sellerId: "pepper_ker", sellerName: "Wayanad Spice Planters", sellerPhone: "9447212345",
    sellerLocation: { state: "Kerala", district: "Wayanad", mandal: "Mananthavady" },
    rating: 5.0, ratingCount: 275,
    image: "https://images.unsplash.com/photo-1594568284297-7c64464062b4?w=600&auto=format&fit=crop&q=80"
  },

  // 🥜 Dry Fruits & Nuts
  {
    id: "dry_almond",
    title: "Raw Premium California Almonds (Badam)",
    category: "🥜 Dry Fruits & Nuts",
    price: 760, mrp: 980,
    quantity: 180, unit: "kg",
    description: "Crunchy, sweet jumbo almonds loaded with natural Vitamin E, magnesium, and healthy fats.",
    sellerId: "kashmir_dry", sellerName: "Himalayan Dry Fruits", sellerPhone: "9906012345",
    sellerLocation: { state: "Uttarakhand", district: "Dehradun", mandal: "Rishikesh" },
    rating: 4.9, ratingCount: 310,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "dry_cashew",
    title: "Whole W240 Jumbo Cashews (Kaju / Jeedipappu)",
    category: "🥜 Dry Fruits & Nuts",
    price: 920, mrp: 1200,
    quantity: 140, unit: "kg",
    description: "First-grade export quality coastal cashews. Creamy, buttery bite with zero broken pieces.",
    sellerId: "cashew_coast", sellerName: "Mangalore Cashew Exports", sellerPhone: "9845912345",
    sellerLocation: { state: "Karnataka", district: "Mangaluru", mandal: "Puttur" },
    rating: 5.0, ratingCount: 285,
    image: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "dry_foxnuts",
    title: "Bihar Jumbo Phool Makhana (Fox Nuts / Lotus Seeds)",
    category: "🥜 Dry Fruits & Nuts",
    price: 720, mrp: 950,
    quantity: 150, unit: "kg",
    description: "GI-graded Darbhanga 4-Suta makhana. Low sodium, zero cholesterol roasted superfood.",
    sellerId: "makhana_bihar", sellerName: "Darbhanga Makhana Co.", sellerPhone: "9835012345",
    sellerLocation: { state: "Bihar", district: "Darbhanga", mandal: "Singhwara" },
    rating: 4.9, ratingCount: 240,
    image: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=600&auto=format&fit=crop&q=80"
  },

  // 🥛 Dairy & Oils
  {
    id: "dairy_ghee",
    title: "Pure A2 Gir Cow Vedic Bilona Ghee (Natu Neyyi)",
    category: "🥛 Dairy & Oils",
    price: 1150, mrp: 1500,
    quantity: 90, unit: "litre",
    description: "Traditional hand-churned cultured curd bilona ghee from free-grazing Gir cows. Golden & aromatic.",
    sellerId: "gir_dairy", sellerName: "Krishna Gaushala Organics", sellerPhone: "9825012345",
    sellerLocation: { state: "Gujarat", district: "Junagadh", mandal: "Sanand" },
    rating: 5.0, ratingCount: 420,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "dairy_honey",
    title: "Raw Multifloral Wild Forest Honey (Tein / Shahad)",
    category: "🥛 Dairy & Oils",
    price: 460, mrp: 620,
    quantity: 180, unit: "kg",
    description: "Unfiltered, unpasteurized natural honey gathered by Himalayan beekeepers. Contains bee pollen.",
    sellerId: "honey_uttara", sellerName: "Kumaon Forest Beekeepers", sellerPhone: "9917012345",
    sellerLocation: { state: "Uttarakhand", district: "Nainital", mandal: "Ramnagar" },
    rating: 5.0, ratingCount: 360,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "dairy_mustard_oil",
    title: "Cold-Pressed Kachi Ghani Mustard Oil (Sarson Tel)",
    category: "🥛 Dairy & Oils",
    price: 185, mrp: 240,
    quantity: 350, unit: "litre",
    description: "First-press wooden expeller oil. Natural pungent kick, great for pickling and Ayurvedic massage.",
    sellerId: "mustard_hr", sellerName: "Haryana Oilseed Mills", sellerPhone: "9812112345",
    sellerLocation: { state: "Haryana", district: "Rewari", mandal: "Kosli" },
    rating: 4.8, ratingCount: 220,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80"
  },

  // 🧴 Daily Routine
  {
    id: "daily_jaggery",
    title: "Chemical-Free Organic Sugarcane Jaggery Cubes (Gud)",
    category: "🧴 Daily Routine",
    price: 62, mrp: 85,
    quantity: 550, unit: "kg",
    description: "Naturally clarified solid jaggery blocks. Rich in natural plant iron and digestive enzymes.",
    sellerId: "jaggery_maha", sellerName: "Kolhapur Jaggery Farmers", sellerPhone: "9822712345",
    sellerLocation: { state: "Maharashtra", district: "Kolhapur", mandal: "Shirol" },
    rating: 4.9, ratingCount: 270,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "daily_tea",
    title: "Premium Assam CTC Kadak Granule Tea (Chai)",
    category: "🧴 Daily Routine",
    price: 260, mrp: 340,
    quantity: 320, unit: "kg",
    description: "Malty, strong reddish-golden liquor tea from Dibrugarh tea estates. Perfect morning cup.",
    sellerId: "tea_assam", sellerName: "Dibrugarh Tea Gardens", sellerPhone: "9435012345",
    sellerLocation: { state: "Assam", district: "Dibrugarh", mandal: "Moran" },
    rating: 4.9, ratingCount: 310,
    image: "https://images.unsplash.com/photo-1564890369478-c89ca3d9cde4?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "daily_salt",
    title: "Himalayan Pink Rock Salt (Sendha Namak)",
    category: "🧴 Daily Routine",
    price: 36, mrp: 55,
    quantity: 1100, unit: "kg",
    description: "Pure unprocessed pink crystal salt containing 84 elemental trace minerals. Great for digestion.",
    sellerId: "salt_pk", sellerName: "Himalayan Mineral Works", sellerPhone: "9881012345",
    sellerLocation: { state: "Uttarakhand", district: "Haridwar", mandal: "Jwalapur" },
    rating: 4.8, ratingCount: 230,
    image: "https://images.unsplash.com/photo-1562547256-2c5ee93b60b7?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "daily_soap",
    title: "Handmade Neem & Holy Tulsi Herbal Bath Soap",
    category: "🧴 Daily Routine",
    price: 48, mrp: 70,
    quantity: 520, unit: "pcs",
    description: "Cold-processed botanical bathing bar with fresh neem oil and wild tulsi. Antibacterial protection.",
    sellerId: "soap_goa", sellerName: "Goa Natural Organics", sellerPhone: "9821012345",
    sellerLocation: { state: "Goa", district: "North Goa", mandal: "Panaji" },
    rating: 4.8, ratingCount: 190,
    image: "https://images.unsplash.com/photo-1607006314597-9e76747b0a70?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "daily_coffee",
    title: "Coorg Pure Arabica Plantation Coffee Powder",
    category: "🧴 Daily Routine",
    price: 390, mrp: 500,
    quantity: 160, unit: "kg",
    description: "Medium-roasted shade-grown coffee with chocolatey notes and velvety crema. Pure South Indian filter aroma.",
    sellerId: "coffee_coorg", sellerName: "Kodagu Coffee Estates", sellerPhone: "9845312345",
    sellerLocation: { state: "Karnataka", district: "Kodagu", mandal: "Madikeri" },
    rating: 5.0, ratingCount: 245,
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80"
  },

  // 🌱 Seeds
  {
    id: "seed_tomato",
    title: "Abhinav F1 Disease-Tolerant Hybrid Tomato Seeds (10g)",
    category: "🌱 Seeds",
    price: 155, mrp: 210,
    quantity: 80, unit: "pkt",
    description: "High-yield hybrid seeds yielding 35-40 tons/acre. Tolerant to leaf curl virus and bacterial wilt.",
    sellerId: "seed_corp", sellerName: "Krishna Seed Biotech", sellerPhone: "9848022338",
    sellerLocation: { state: "Telangana", district: "Hyderabad", mandal: "Secunderabad" },
    rating: 4.8, ratingCount: 120,
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "seed_paddy",
    title: "Certified IR-64 High-Tillering Paddy Seeds (5kg Bag)",
    category: "🌱 Seeds",
    price: 285, mrp: 375,
    quantity: 250, unit: "bag",
    description: "Medium-duration certified paddy seeds for Kharif/Rabi. Produces strong tillers and heavy panicles.",
    sellerId: "paddy_seed_ap", sellerName: "Sri Rama Seed House", sellerPhone: "9441812345",
    sellerLocation: { state: "Andhra Pradesh", district: "West Godavari", mandal: "Bhimavaram" },
    rating: 4.7, ratingCount: 180,
    image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "seed_maize",
    title: "DKC-9144 Drought-Resilient Hybrid Maize Seeds (4kg)",
    category: "🌱 Seeds",
    price: 920, mrp: 1200,
    quantity: 110, unit: "bag",
    description: "Top-rated Dekalb hybrid maize seeds with deep orange flint grains and strong lodging resistance.",
    sellerId: "maize_seed_ts", sellerName: "Telangana Hybrid Seeds", sellerPhone: "9849012345",
    sellerLocation: { state: "Telangana", district: "Warangal", mandal: "Narsampet" },
    rating: 4.8, ratingCount: 95,
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=600&auto=format&fit=crop&q=80"
  },

  // 🧪 Fertilizers & Agri
  {
    id: "fert_npk",
    title: "Water-Soluble 100% Balanced NPK 19-19-19 (50kg Bag)",
    category: "🧪 Fertilizers & Agri",
    price: 960, mrp: 1250,
    quantity: 140, unit: "bag",
    description: "Foliar and drip fertigation grade balanced nutrients. Promotes rapid vegetative growth and root mass.",
    sellerId: "agri_store", sellerName: "Balaji Agro Chemicals", sellerPhone: "9440123456",
    sellerLocation: { state: "Andhra Pradesh", district: "Guntur", mandal: "Tenali" },
    rating: 4.8, ratingCount: 190,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "fert_urea",
    title: "Neem-Coated Slow-Release Agricultural Urea (50kg)",
    category: "🧪 Fertilizers & Agri",
    price: 285, mrp: 360,
    quantity: 550, unit: "bag",
    description: "Government-subsidized neem coated urea. Reduces nitrogen loss, boosts nitrogen uptake efficiency.",
    sellerId: "urea_farmer", sellerName: "Krishak Agri Suppliers", sellerPhone: "9849112345",
    sellerLocation: { state: "Telangana", district: "Karimnagar", mandal: "Jammikunta" },
    rating: 4.6, ratingCount: 160,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "pest_neemoil",
    title: "Pure Cold-Pressed Neem Oil Bio-Pesticide 10000 PPM (5L)",
    category: "🧪 Fertilizers & Agri",
    price: 360, mrp: 480,
    quantity: 90, unit: "can",
    description: "Natural organic botanical pesticide with azadirachtin. Controls bollworms, aphids, and leaf miners.",
    sellerId: "eco_grow", sellerName: "Green Earth Organics", sellerPhone: "9123456789",
    sellerLocation: { state: "Maharashtra", district: "Nagpur", mandal: "Katol" },
    rating: 4.8, ratingCount: 175,
    image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop&q=80"
  },

  // 💧 Irrigation
  {
    id: "irr_drip",
    title: "16mm Inline Drip Irrigation Tape with 20cm Spacing (100m)",
    category: "💧 Irrigation",
    price: 660, mrp: 880,
    quantity: 220, unit: "roll",
    description: "High-grade UV-treated inline drip pipe with labyrinth drippers. Delivers 2-4 LPH water per plant.",
    sellerId: "drip_jain", sellerName: "Jain Irrigation Dealers", sellerPhone: "9825412345",
    sellerLocation: { state: "Maharashtra", district: "Jalgaon", mandal: "Jalgaon City" },
    rating: 4.7, ratingCount: 110,
    image: "https://images.unsplash.com/photo-1519003300449-424ad0405076?w=600&auto=format&fit=crop&q=80"
  },

  // 🛠️ Farming Tools
  {
    id: "tool_cultivator",
    title: "Heavy-Duty Ergonomic 5-Prong Hand Cultivator Weeder",
    category: "🛠️ Farming Tools",
    price: 460, mrp: 600,
    quantity: 35, unit: "pcs",
    description: "Tough forged carbon steel tines with soft-grip anti-slip handle. Aerates hard soil and clears weeds.",
    sellerId: "tool_works", sellerName: "Kisan Steel & Tools", sellerPhone: "9876543210",
    sellerLocation: { state: "Karnataka", district: "Bengaluru", mandal: "Whitefield" },
    rating: 4.8, ratingCount: 140,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "tool_sprayer",
    title: "16L Rechargeable Lithium Battery Backpack Knapsack Sprayer",
    category: "🛠️ Farming Tools",
    price: 3250, mrp: 4300,
    quantity: 40, unit: "pcs",
    description: "Dual-motor high pressure electric pump with brass telescopic lance and speed controller. 4-hour runtime.",
    sellerId: "sprayer_ts", sellerName: "Kisan Machinery Stores", sellerPhone: "9440312345",
    sellerLocation: { state: "Telangana", district: "Hyderabad", mandal: "Uppal" },
    rating: 4.9, ratingCount: 195,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80"
  }
];

export default function App() {
  /* ── Auth state ─────────────────────────────────── */
  const [user, setUser]   = useState(null);

  /* ── Nav ────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('overview');

  /* ── Live price engine ──────────────────────────── */
  const [livePrices, setLivePrices]   = useState({});
  const [priceTrend, setPriceTrend]   = useState({});
  const [priceFlash, setPriceFlash]   = useState({});
  const [liveMcx, setLiveMcx]         = useState({});
  const [mcxTrend, setMcxTrend]       = useState({});

  /* ── Location state ─────────────────────────────── */
  const [selState,    setSelState]    = useState('Telangana');
  const [selDistrict, setSelDistrict] = useState('Hyderabad');
  const [selMandal,   setSelMandal]   = useState('Secunderabad');

  /* ── Market tab ─────────────────────────────────── */
  const [marketCrop,     setMarketCrop]     = useState('Tomato');
  const [marketCategory, setMarketCategory] = useState('All');
  const [marketSearch,   setMarketSearch]   = useState('');
  const [transportCost,  setTransportCost]  = useState('2');
  const [inputsState,    setInputsState]    = useState('Telangana');

  /* ── Price alert ─────────────────────────────────── */
  const [alertCrop,      setAlertCrop]      = useState('Tomato');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [alertEmail,     setAlertEmail]     = useState('');
  const [alertPhone,     setAlertPhone]     = useState('');
  const [alertSending,   setAlertSending]   = useState(false);
  const [alertSent,      setAlertSent]      = useState(false);

  /* ── Crop advisor (5-step farm setup) ─────────────── */
  const [cropStep, setCropStep] = useState(1);
  const [farmSetup, setFarmSetup] = useState({
    farmSize: '5',
    irrigation: 'Drip Irrigation',
    prevCrop: 'Legumes / Pulses',
    soilType: 'Black Cotton',
    nitrogen: 75,
    phosphorus: 35,
    potassium: 45,
    ph: 6.8,
    season: 'Kharif',
  });
  const [cropRecommendations, setCropRecommendations] = useState(null);
  const [selectedCropRank, setSelectedCropRank] = useState(0);

  /* ── Plant Health Scanner ────────────────────────── */
  const [scanCropType, setScanCropType] = useState('tomato_blight');
  const [uploadedScanImage, setUploadedScanImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diseaseReport, setDiseaseReport] = useState(null);

  /* ── Ledger ──────────────────────────────────────── */
  const [ledger,      setLedger]       = useState([
    { id:1, type:'expense', category:'Seeds',      desc:'Bought Tomato Hybrid Seeds',     amount:1200,  date:'2024-06-01' },
    { id:2, type:'expense', category:'Fertilizer', desc:'Purchased Urea 2 bags',          amount:2800,  date:'2024-06-05' },
    { id:3, type:'income',  category:'Sales',      desc:'Sold 200kg Tomato at Mandi',     amount:4400,  date:'2024-06-15' },
  ]);
  const [ledgerInput, setLedgerInput]  = useState({ type:'expense', category:'Fertilizer', desc:'', amount:'' });

  /* ── Chat ────────────────────────────────────────── */
  const [chatMessages, setChatMessages] = useState([
    { sender:'bot', text:'🌾 Namaste! I am your Smart Crop AI. Ask me about weather, fertilizers, crop prices, or disease treatment!' }
  ]);
  const [chatInput,    setChatInput]    = useState('');
  const [isRecording,  setIsRecording]  = useState(false);

  /* ── Govt Schemes ────────────────────────────────── */
  const [schemeLand,   setSchemeLand]   = useState('5');
  const [schemeState,  setSchemeState]  = useState('Telangana');
  const [schemeSector, setSchemeSector] = useState('Agriculture');
  const [schemeAadhaar,setSchemeAadhaar]= useState(true);
  const [schemeBank,   setSchemeBank]   = useState(true);
  const [schemeSCST,   setSchemeSCST]   = useState(false);

  /* ── Language ──────────────────────────────────── */
  const [lang, setLang] = useState('en');

  /* ── User Stats from Firestore ───────────────── */
  const [totalUsers, setTotalUsers] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);

  /* ── Live Weather ─────────────────────────────── */
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  /* ── Responsive Sidebar State ─────────────────── */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ── Farmers Registry State ─────────────────── */
  const [registeredFarmers, setRegisteredFarmers] = useState([]);
  const [directorySearch, setDirectorySearch]     = useState('');

  /* ── P2P Marketplace State ──────────────────── */
  const [activeListings, setActiveListingsState]  = useState([]);
  const [listingsLoading, setListingsLoading]     = useState(false);
  const [marketFilter, setMarketFilter]           = useState('All');
  const [marketSearchInput, setMarketSearchInput] = useState('');
  const [marketLocFilter, setMarketLocFilter]     = useState('All');
  const [marketplaceMode, setMarketplaceMode]     = useState('buy'); // 'buy' or 'sell'
  const [cart, setCart]                           = useState([]);
  const [isCartOpen, setIsCartOpen]               = useState(false);
  const [wishlist, setWishlist]                   = useState([]);

  /* ── E-Commerce Filters, Sorting & Hero Promo Carousel ── */
  const [priceRangeFilter, setPriceRangeFilter]   = useState('all');
  const [sortBy, setSortBy]                       = useState('featured');
  const [inStockOnly, setInStockOnly]             = useState(false);
  const [promoSlide, setPromoSlide]               = useState(0);

  /* ── Universal Floating Kisan AI Chatbot ──────── */
  const [isChatbotOpen, setIsChatbotOpen]         = useState(false);
  const [chatbotInput, setChatbotInput]           = useState('');
  const [chatbotMessages, setChatbotMessages]     = useState([
    {
      sender: 'bot',
      text: '🌾 **Namaste! I am Kisan AI, your 24/7 Smart Agronomist & Farming Assistant.**\n\nAsk me about any crop cultivation, NPK fertilizer dosage, leaf diseases, today\'s mandi prices, government schemes, or how to buy and sell on this platform!',
      time: 'Online'
    }
  ]);
  const [chatbotSpeaking, setChatbotSpeaking]     = useState(false);
  const [newListing, setNewListing] = useState({
    title: '', category: '🥬 Vegetables', price: '', quantity: '',
    unit: 'kg', description: '', imageUrl: '',
    sellerName: '', sellerPhone: '', sellerState: 'Telangana',
    sellerDistrict: 'Hyderabad', sellerMandal: 'Secunderabad'
  });
  const [successOrder, setSuccessOrder]           = useState(null);

  const chatEndRef = useRef(null);

  /* ══ EFFECTS ══════════════════════════════════════ */

  // Load session on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) try { setUser(JSON.parse(saved)); } catch(e) {}
    
    // Auto-load geo-detected location from permissions screen
    const detState = sessionStorage.getItem('detected_state');
    const detDistrict = sessionStorage.getItem('detected_district');
    if (detState) {
      setSelState(detState);
      if (detDistrict) {
        setSelDistrict(detDistrict);
        // pick first mandal
        const mandalsList = (INDIA_LOCATIONS[detState]?.[detDistrict]) || [];
        if (mandalsList.length) setSelMandal(mandalsList[0]);
      }
    }

    // Fetch user stats from Firestore
    async function fetchStats() {
      const total = await getTotalUsers();
      const online = await getOnlineUsers();
      setTotalUsers(total);
      setOnlineUsers(online);
    }
    fetchStats();
    // Refresh stats every 30s
    const statsInterval = setInterval(fetchStats, 30000);
    // Set user offline when page closes
    const handleBeforeUnload = () => {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        try {
          const u = JSON.parse(session);
          if (u.phone) setUserOffline(u.phone);
        } catch(e) {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => { clearInterval(statsInterval); window.removeEventListener('beforeunload', handleBeforeUnload); };
  }, []);

  // Initialize live prices from BASE_PRICES
  useEffect(() => {
    const init = {};
    ALL_CROPS.forEach(c => { init[c] = BASE_PRICES[c] || 20; });
    setLivePrices(init);
    const mcxInit = {};
    if (MCX_COMMODITIES) MCX_COMMODITIES.forEach(m => { mcxInit[m.name] = m.price; });
    setLiveMcx(mcxInit);
  }, []);

  // Fetch directory and marketplace listings on mount
  useEffect(() => {
    async function loadDirectoryAndMarket() {
      try {
        const usersList = await getAllUsers();
        setRegisteredFarmers(usersList);
      } catch (e) {
        console.error("Error loading directory:", e);
      }

      setListingsLoading(true);
      try {
        const listingsList = await getActiveListings();
        if (listingsList.length > 0) {
          setActiveListingsState(listingsList);
        } else {
          setActiveListingsState(STARTER_LISTINGS);
        }
      } catch (e) {
        console.error("Error loading listings:", e);
        setActiveListingsState(STARTER_LISTINGS);
      } finally {
        setListingsLoading(false);
      }
    }
    
    if (user) {
      loadDirectoryAndMarket();
    }
  }, [user]);

  // Live price ticker engine — ticks every 3 seconds
  useEffect(() => {
    if (!ALL_CROPS.length) return;
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 5) + 3;
      const picked = [...ALL_CROPS].sort(() => Math.random() - 0.5).slice(0, count);
      setLivePrices(prev => {
        const next = { ...prev };
        const trend = {};
        const flash = {};
        picked.forEach(crop => {
          const old = prev[crop] || BASE_PRICES[crop] || 20;
          const change = (Math.random() * 0.04 - 0.02);
          const newP = Math.max(1, +(old * (1 + change)).toFixed(2));
          next[crop] = newP;
          trend[crop] = newP > old ? 'up' : newP < old ? 'down' : 'flat';
          flash[crop] = true;
        });
        setPriceTrend(prev => ({ ...prev, ...trend }));
        setPriceFlash(prev => ({ ...prev, ...flash }));
        setTimeout(() => setPriceFlash(prev => {
          const clr = { ...prev };
          picked.forEach(c => { clr[c] = false; });
          return clr;
        }), 800);
        return next;
      });
      // MCX tick
      if (MCX_COMMODITIES) {
        setLiveMcx(prev => {
          const next = { ...prev };
          const trendUpd = {};
          MCX_COMMODITIES.forEach(m => {
            const old = prev[m.name] || m.price;
            const ch = (Math.random() * 0.02 - 0.01);
            const newP = Math.max(1, +(old * (1 + ch)).toFixed(2));
            next[m.name] = newP;
            trendUpd[m.name] = newP > old ? 'up' : 'down';
          });
          setMcxTrend(prev => ({ ...prev, ...trendUpd }));
          return next;
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [chatMessages]);

  // Fetch live weather when location changes
  useEffect(() => {
    let cancelled = false;
    setWeatherLoading(true);
    fetchLiveWeather(selState, selDistrict, selMandal).then(data => {
      if (!cancelled) {
        setLiveWeather(data);
        setWeatherLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setWeatherLoading(false);
    });
    return () => { cancelled = true; };
  }, [selState, selDistrict, selMandal]);

  // Promo carousel auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoSlide(prev => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  /* ══ HELPER FUNCTIONS ════════════════════════════ */

  const getWeather = (state) => {
    // Use live weather if available
    if (liveWeather) return liveWeather;
    // Fallback to static data
    if (WEATHER_DATA && WEATHER_DATA[state]) return WEATHER_DATA[state];
    const temps = { Telangana:34, 'Andhra Pradesh':35, Maharashtra:32, Karnataka:30, 'Tamil Nadu':33, Gujarat:36, Punjab:38, 'West Bengal':31, Kerala:29 };
    const t = temps[state] || 32;
    return {
      temp:`${t}°C`, humidity:'68%', rain:'45%', wind:'14 km/h', condition:'Partly Cloudy ⛅',
      advisory:`Monitor soil moisture in ${state}. Ideal conditions for Kharif sowing.`,
      forecast: DAYS.map((d,i) => ({ day: DAYS[(today+i)%7], icon: i===2?'🌧':i===4?'⛈':i===0?'☀️':'⛅', high: t + Math.floor(Math.random()*4)-2, low: t-6 + Math.floor(Math.random()*3) }))
    };
  };

  const handleStateChange = (s) => {
    setSelState(s);
    const dists = Object.keys(INDIA_LOCATIONS[s] || {});
    const d = dists[0] || '';
    setSelDistrict(d);
    const mandals = (INDIA_LOCATIONS[s]?.[d]) || [];
    setSelMandal(mandals[0] || '');
  };
  const handleDistrictChange = (d) => {
    setSelDistrict(d);
    const mandals = (INDIA_LOCATIONS[selState]?.[d]) || [];
    setSelMandal(mandals[0] || '');
  };

  const getBestMandi = () => {
    const base = livePrices[marketCrop] || BASE_PRICES[marketCrop] || 20;
    const trans = parseFloat(transportCost) || 0;
    if (!MANDI_DB || !MANDI_MULTIPLIERS) return { best:'Hyderabad', details:[], maxVal:base };

    const stateDistances = (STATE_MANDI_DISTANCES && STATE_MANDI_DISTANCES[selState]) || [];

    const rows = MANDI_DB.map((m, idx) => {
      const distanceKm = stateDistances[idx] !== undefined ? stateDistances[idx] : m.dist;
      const deliveryFee = distanceKm * 5; // 1 kilometer = 5 rupees
      const grossPrice = +(base * (MANDI_MULTIPLIERS[m.name] || 1)).toFixed(2);
      // Freight cost per kg (base + ₹5/km total delivery cost distributed per 100kg quintal = 0.05 per kg)
      const logCost = +(trans + distanceKm * 0.05).toFixed(2);
      const net = +(grossPrice - logCost).toFixed(2);
      return { 
        ...m, 
        distanceKm, 
        deliveryFee, 
        price: grossPrice, 
        log: logCost, 
        net 
      };
    }).sort((a,b) => b.net - a.net);

    return { best: rows[0]?.name || 'Hyderabad', details: rows, maxVal: rows[0]?.net || base };
  };

  const getFilteredCrops = () => {
    let list = marketCategory === 'All'
      ? Object.entries(COMMODITY_CATEGORIES).flatMap(([cat,items]) => items.map(i => ({ item:i, cat })))
      : (COMMODITY_CATEGORIES[marketCategory]||[]).map(i => ({ item:i, cat:marketCategory }));
    if (marketSearch.trim()) {
      const q = marketSearch.toLowerCase();
      list = list.filter(c => c.item.toLowerCase().includes(q));
    }
    return list;
  };

  const getMatchingSchemes = () => {
    const land = parseFloat(schemeLand) || 0;
    const eligible = SCHEME_ELIGIBILITY(land, schemeSector.toLowerCase(), schemeAadhaar, schemeBank, schemeSCST);
    if (!GOVT_SCHEMES) return [];
    return GOVT_SCHEMES.filter(scheme =>
      eligible.some(name =>
        scheme.name.toLowerCase().includes(name.split(' —')[0].split(' (')[0].toLowerCase()) ||
        name.toLowerCase().includes(scheme.name.split(' —')[0].split(' (')[0].toLowerCase())
      )
    );
  };

  const handleRecommendCrop = (e) => {
    if (e) e.preventDefault();
    const w = getWeather(selState);
    const recs = generateCropRecommendations({
      ...farmSetup,
      state: selState,
      district: selDistrict,
      mandal: selMandal,
    }, w);
    setCropRecommendations(recs);
    setSelectedCropRank(0);
    setCropStep(5);
  };

  const triggerScan = () => {
    setIsScanning(true);
    setDiseaseReport(null);
    setTimeout(() => {
      setIsScanning(false);
      const rep = PLANT_DISEASES_DB[scanCropType] || PLANT_DISEASES_DB.tomato_blight;
      setDiseaseReport(uploadedScanImage ? { ...rep, sampleImage: uploadedScanImage, confidence: '95.8%' } : rep);
    }, 2000);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedScanImage(url);
      setIsScanning(true);
      setDiseaseReport(null);
      setTimeout(() => {
        setIsScanning(false);
        const rep = PLANT_DISEASES_DB[scanCropType] || PLANT_DISEASES_DB.tomato_blight;
        setDiseaseReport({
          ...rep,
          sampleImage: url,
          confidence: '96.5% (High Precision Agronomic AI)'
        });
      }, 2200);
    }
  };

  const handleAddLedger = (e) => {
    e.preventDefault();
    if (!ledgerInput.desc || !ledgerInput.amount) return;
    setLedger(prev => [...prev, { id:Date.now(), ...ledgerInput, amount:parseFloat(ledgerInput.amount), date:new Date().toISOString().split('T')[0] }]);
    setLedgerInput({ type:'expense', category:'Fertilizer', desc:'', amount:'' });
  };

  // Category → Unsplash CDN fallback image
  const CATEGORY_IMAGES = {
    '🥬 Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    '🍎 Fruits':     'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80',
    '🌾 Grains & Seeds': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
    '🫘 Pulses & Spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
    '🥜 Dry Fruits & Nuts': 'https://images.unsplash.com/photo-1563412580-2b36f02c1e9c?w=400&q=80',
    '🥛 Dairy & Oils': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    '🧪 Fertilizers & Agri': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
    '🛠️ Farming Tools': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    // Validate all required fields
    if (!newListing.title.trim()) return alert('Product title is required.');
    if (!newListing.price || parseFloat(newListing.price) <= 0) return alert('Enter a valid price.');
    if (!newListing.quantity || parseFloat(newListing.quantity) <= 0) return alert('Enter a valid quantity.');
    const sName = newListing.sellerName.trim() || user.name || 'Farmer';
    const sPhone = newListing.sellerPhone.trim() || user.phone || '';
    if (!sPhone) return alert('Seller phone number is required for buyers to contact you.');
    if (sPhone && !/^\d{10}$/.test(sPhone)) return alert('Phone must be 10 digits (without +91).');

    const imageUrl = newListing.imageUrl.trim() ||
      CATEGORY_IMAGES[newListing.category] ||
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80';

    const listingData = {
      title: newListing.title.trim(),
      category: newListing.category,
      price: parseFloat(newListing.price),
      quantity: parseFloat(newListing.quantity),
      unit: newListing.unit,
      description: newListing.description.trim(),
      sellerId: user.phone || user.email || 'unknown',
      sellerName: sName,
      sellerPhone: sPhone,
      sellerLocation: {
        state: newListing.sellerState || selState,
        district: newListing.sellerDistrict || selDistrict,
        mandal: newListing.sellerMandal || selMandal
      },
      image: imageUrl,
      rating: 5.0,
      ratingCount: 1
    };

    const newId = await addListing(listingData);
    const finalListing = { id: newId || Date.now().toString(), ...listingData };

    setActiveListingsState(prev => [finalListing, ...prev]);
    setNewListing({
      title: '', category: '🥬 Vegetables', price: '', quantity: '',
      unit: 'kg', description: '', imageUrl: '',
      sellerName: '', sellerPhone: '', sellerState: 'Telangana',
      sellerDistrict: 'Hyderabad', sellerMandal: 'Secunderabad'
    });
    setMarketplaceMode('buy');
  };

  const handleRateProduct = async (listingId, stars) => {
    const isStarter = isNaN(listingId) ? (listingId.startsWith('seed') || listingId.startsWith('fert') || listingId.startsWith('pest') || listingId.startsWith('tool')) : true;
    
    if (!isStarter) {
      try {
        await rateListing(listingId, stars);
      } catch (e) {
        console.error("Error writing rating:", e);
      }
    }
    
    setActiveListingsState(prev => prev.map(item => {
      if (item.id === listingId) {
        const currentRating = item.rating || 5;
        const currentCount = item.ratingCount || 1;
        const newCount = currentCount + 1;
        const newRating = parseFloat(((currentRating * currentCount + stars) / newCount).toFixed(1));
        return {
          ...item,
          rating: newRating,
          ratingCount: newCount
        };
      }
      return item;
    }));
  };

  const handleAddToCart = (listing, qty) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === listing.id);
      if (existing) {
        return prev.map(item => item.id === listing.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        quantity: qty,
        unit: listing.unit,
        sellerName: listing.sellerName,
        sellerPhone: listing.sellerPhone,
        sellerLocation: listing.sellerLocation,
        image: listing.image
      }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newTransactions = cart.map(item => ({
      id: Date.now() + Math.random(),
      type: 'expense',
      category: item.title.includes('Seeds') ? 'Seeds' :
                item.title.includes('Fertilizer') ? 'Fertilizer' :
                item.title.includes('Pesticide') ? 'Pesticide' : 'Equipment',
      desc: `Bought ${item.quantity} ${item.unit} of ${item.title} from ${item.sellerName}`,
      amount: item.price * item.quantity,
      date: new Date().toISOString().split('T')[0]
    }));

    setLedger(prev => [...prev, ...newTransactions]);
    setSuccessOrder(cart);
    setCart([]);
    setIsCartOpen(false);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const clean = text.replace(/[*_#•]/g, '');
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      } catch(e) {}
    }
  };

  const levDistance = (a, b) => {
    if (!a || !b) return 99;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const hasFuzzyMatch = (qText, keywords) => {
    const cleanQ = qText.toLowerCase();
    const words = cleanQ.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    for (const kw of keywords) {
      if (cleanQ.includes(kw)) return true;
      for (const w of words) {
        if (w.length >= 3 && kw.length >= 3) {
          if (w.startsWith(kw) || kw.startsWith(w)) return true;
          if (Math.abs(w.length - kw.length) <= 2 && levDistance(w, kw) <= 2) return true;
        }
      }
    }
    return false;
  };

  const generateChatGPTResponse = (text) => {
    const q = text.toLowerCase();
    const w = getWeather(selState);
    const currCrop = cropRecommendations ? cropRecommendations[selectedCropRank]?.name : 'Tomato / Cotton';

    // Yellow leaves query
    if (q.includes('yellow') || q.includes('peeli') || q.includes('pasupu') || q.includes('chlorosis')) {
      if (lang === 'te') {
        return `🍂 **ఆకులు పసుపు రంగులోకి మారడానికి నివారణ (${currCrop})**:\n\n` +
               `1. **నత్రజని లోపం**: దిగువ ఆకులు పసుపు రంగులోకి మారితే, ఎకరాకు 25 కేజీల యూరియా లేదా 19-19-19 స్ప్రే (5 గ్రా/లీ) చేయండి.\n` +
               `2. **ఇనుము/జింక్ లోపం**: పై లేత ఆకులు పసుపు రంగులోకి మారితే, చీలేటెడ్ జింక్ (1 గ్రా/లీ) పిచికారీ చేయండి.\n` +
               `3. **నీటి నిల్వ**: పొలంలో నీరు నిల్వ ఉంటే వేర్లు ఊపిరాడక పసుపు రంగులోకి మారతాయి; కాలువలు తీసి నీటిని తొలగించండి.`;
      }
      if (lang === 'hi') {
        return `🍂 **पत्तियों का पीला पड़ना — कारण एवं रोकथाम (${currCrop})**:\n\n` +
               `1. **नाइट्रोजन की कमी**: निचली पत्तियां पीली पड़ रही हैं तो 19-19-19 (5 ग्राम/लीटर पानी) का छिड़काव करें।\n` +
               `2. **जिंक/आयरन की कमी**: ऊपरी नई पत्तियां पीली हैं तो चिलेटेड जिंक (1 ग्राम/लीटर) स्प्रे करें।\n` +
               `3. **जलभराव**: अधिक पानी से जड़ें सड़ने लगती हैं, खेत से अतिरिक्त पानी तुरंत निकालें।`;
      }
      return `🍂 **Diagnosis & Remedy for Yellowing Leaves (${currCrop})**:\n\n` +
             `1. **Nitrogen Deficiency**: Older lower leaves turn pale yellow first. Apply 19-19-19 foliar spray (5g/L) or top-dress 25kg Urea/acre.\n` +
             `2. **Zinc / Micronutrient Chlorosis**: Yellowing between leaf veins on young leaves. Spray Chelated Zinc (1g/L) + Ferrous Sulphate (2g/L).\n` +
             `3. **Waterlogging & Root Asphyxiation**: Excessive moisture starves roots of oxygen. Ensure drainage channels are clear.\n` +
             `4. **Sucking Pests (Whiteflies/Thrips)**: Spray Cold-Pressed Neem Oil (15ml/L) or Acetamiprid (0.5g/L).`;
    }

    // Cotton irrigation query
    if ((q.includes('cotton') || q.includes('kapas') || q.includes('paththi')) && (q.includes('irrigate') || q.includes('water') || q.includes('pani'))) {
      return `💧 **Cotton Irrigation Management Guide (${selState})**:\n\n` +
             `• **Critical Stages**: Square formation (45-50 days), Flowering (70-80 days), and Boll development (90-110 days).\n` +
             `• **Schedule**: In ${farmSetup.soilType} soil, irrigate every 12-15 days. If using Drip Irrigation, run for 2 hours every alternate morning.\n` +
             `• **Caution**: Never allow waterlogging at boll development stage; excessive moisture triggers shedding of squares and young bolls.`;
    }

    // Paddy 30 days fertilizer
    if ((q.includes('paddy') || q.includes('rice') || q.includes('dhan') || q.includes('vari')) && (q.includes('30') || q.includes('tillering') || q.includes('fertilizer'))) {
      return `🌾 **Paddy 30-Day (Active Tillering Stage) Nutrient Plan**:\n\n` +
             `1. **Top Dressing (Per Acre)**: 35 kg Neem-Coated Urea + 10 kg MOP (Potash) + 5 kg Zinc Sulphate.\n` +
             `2. **Water Management**: Maintain 2-3 cm standing water during fertilizer broadcast; do not drain for 48 hours.\n` +
             `3. **Weed & Blast Check**: Monitor for early leaf blast spots. Apply Tricyclazole (0.6g/L) if spindle spots appear.`;
    }

    // Chilli leaf curl
    if (q.includes('chilli') || q.includes('mirchi') || q.includes('curl') || q.includes('murda') || q.includes('anthracnose')) {
      return `🌶️ **Chilli Leaf Curl & Pest Shield Guide**:\n\n` +
             `• **Vector Control (Thrips & Mites)**: Downward curling is caused by mites (spray Fenazaquin 1.5ml/L); upward curling is caused by thrips (spray Fipronil 2ml/L).\n` +
             `• **Organic Barrier**: Spray Cold-Pressed Neem Oil (15ml/L) + Pongamia oil every 10 days.\n` +
             `• **Immunity Booster**: Apply Micronutrient Mixture (2g/L) to strengthen plant vigor against virus transmission.`;
    }
    const tomP = (livePrices['Tomato'] || BASE_PRICES['Tomato'] || 22).toFixed(2);
    const onionP = (livePrices['Onion'] || BASE_PRICES['Onion'] || 28).toFixed(2);
    const cottonP = (livePrices['Cotton (170kg)'] || 28500).toFixed(0);

    // Weather & Rain (fuzzy spellings: rain, weat, wether, barish, mausam, mosam, varsham, pani, temp, etc.)
    if (hasFuzzyMatch(q, ['rain', 'weather', 'wether', 'waether', 'barish', 'baris', 'mausam', 'mosam', 'mosum', 'varsham', 'varsam', 'temp', 'temprature', 'cloud', 'clod'])) {
      return `🌦️ **Live Weather & Farming Advisory (${selMandal}, ${selState})**:\n\n` +
             `• **Current Temp**: ${w.temp || '32°C'} | **Humidity**: ${w.humidity || '68%'}\n` +
             `• **Rain Probability**: ${w.rain || '45%'} | **Condition**: ${w.condition || 'Partly Cloudy'}\n\n` +
             `💡 **Actionable Advice**: Moderate rain risk. If sowing Kharif crops (Paddy/Cotton/Maize), ensure field drainage channels are clear. Avoid applying chemical sprays right before rainfall.`;
    }

    // Mandi Rates & Commodity Prices (fuzzy: price, pric, mandi, madi, rate, rat, bhav, bhao, dam, cost, tomato, onion, cotton, etc.)
    if (hasFuzzyMatch(q, ['price', 'pric', 'prce', 'mandi', 'madi', 'mandee', 'rate', 'rat', 'bhav', 'bhao', 'dam', 'daam', 'cost', 'tomato', 'tomat', 'tamatar', 'onion', 'pyaaz', 'cotton', 'kapas'])) {
      return `💰 **Live Mandi Rates & Market Trends (${selState})**:\n\n` +
             `• 🍅 **Tomato**: ₹${tomP}/kg (Bengaluru Mandi offers +25% export premium)\n` +
             `• 🧅 **Onion**: ₹${onionP}/kg (Nashik & Guntur mandis reporting stable arrivals)\n` +
             `• ☁️ **Cotton**: ₹${cottonP}/bale (MCX futures showing bullish trend ▲)\n\n` +
             `📊 **Tip**: Visit the 'Market & Prices' tab to select any of 300+ commodities and calculate exact road distance with ₹5/km delivery charges!`;
    }

    // Fertilizer & NPK Dosage (fuzzy: fertilizer, fert, fertlisr, urea, dap, npk, khad, kaad, dosage, dose, compost)
    if (hasFuzzyMatch(q, ['fertilizer', 'fert', 'fertiliser', 'fertlisr', 'urea', 'ureia', 'dap', 'npk', 'khad', 'khaad', 'kaad', 'dosage', 'dosag', 'dose', 'compost'])) {
      return `🧪 **Precision Fertilizer Dosage Plan (Per Acre)**:\n\n` +
             `1. **Basal Dose (Sowing)**: 50 kg DAP + 25 kg MOP (Potash) + 10 kg Zinc Sulphate.\n` +
             `2. **First Top Dressing (30 Days)**: 45 kg Neem-Coated Urea + 50 kg Organic Compost.\n` +
             `3. **Flowering Stage (60 Days)**: 19-19-19 Foliar Spray (5g/L water) + 1 kg Boron.\n\n` +
             `⚠️ **Caution**: Avoid over-applying Urea to prevent vegetative overgrowth and pest infestation.`;
    }

    // Pest & Disease (fuzzy: pest, pestisid, pesticide, disease, desease, keeda, kida, fungus, bug, spot, blast, insect, neem, worm)
    if (hasFuzzyMatch(q, ['pest', 'pestisid', 'pesticide', 'disease', 'diseas', 'desease', 'keeda', 'kida', 'fungus', 'bug', 'spot', 'blast', 'insect', 'neem', 'worm', 'caterpillar'])) {
      return `🐛 **AI Crop Protection & Disease Cure**:\n\n` +
             `• **Sucking Pests (Aphids/Thrips)**: Spray Cold-Pressed Neem Oil (15ml/L) or Cypermethrin (1.5ml/L).\n` +
             `• **Fungal Blight / Leaf Spot**: Apply Copper Oxychloride 50 WP (2.5g/L) or Mancozeb (2g/L).\n` +
             `• **Bollworm in Cotton**: Use Pheromone Traps (5 per acre) + BT Bio-pesticide spray.\n\n` +
             `🔬 **Tip**: You can also take a photo of your leaf in the 'Disease Scanner' tab for instant AI diagnosis!`;
    }

    // Schemes & Subsidies (fuzzy: scheme, schem, skeme, subsidy, subsidey, kisan, kisn, pm, yojana, yojna, loan, bima, govt)
    if (hasFuzzyMatch(q, ['scheme', 'schem', 'skeme', 'subsidy', 'subsidey', 'subsidee', 'kisan', 'pm', 'yojana', 'yojna', 'yoana', 'loan', 'bima', 'beema', 'govt', 'gov'])) {
      return `🏛️ **Government Subsidies & Benefits Portal (${selState})**:\n\n` +
             `1. **PM-KISAN**: ₹6,000 yearly directly transferred to your bank in 3 equal ₹2,000 installments.\n` +
             `2. **PMFBY Insurance**: Protects against flood, drought, or storm damage at nominal 1.5–2% premium.\n` +
             `3. **Kisan Credit Card (KCC)**: Instant low-interest crop loan up to ₹3 Lakh at 4% effective interest.\n` +
             `4. **Sub-Mission on Mechanization**: Up to 80% subsidy for SC/ST/Women farmers on tractors & implements.\n\n` +
             `📋 Check the 'Govt Schemes' tab to verify your exact land eligibility!`;
    }

    // Drip & Irrigation (fuzzy: drip, irrigation, irrigatn, sinchai, secai, paani, pani, water, pipe)
    if (hasFuzzyMatch(q, ['drip', 'irrigation', 'irrigatn', 'sinchai', 'secai', 'seanchai', 'paani', 'pani', 'water', 'pipe'])) {
      return `💧 **Smart Water Management & Drip Fertigation**:\n\n` +
             `• **Water Efficiency**: Drip systems reduce water consumption by 50% while increasing crop yield by 35%.\n` +
             `• **Irrigation Schedule**: Run drip for 2 hours every morning during summer months.\n` +
             `• **Subsidy**: 80–90% subsidy under PMKSY Micro Irrigation scheme in ${selState}.\n\n` +
             `🌱 Soluble fertilizers like 19-19-19 can be directly fed through the drip venturi injector.`;
    }

    // Dairy & Livestock (fuzzy: milk, milik, dairy, dary, cow, caow, buffalo, baffalo, ghee, cattle, pashu)
    if (hasFuzzyMatch(q, ['milk', 'milik', 'dairy', 'dary', 'cow', 'caow', 'buffalo', 'baffalo', 'ghee', 'cattle', 'catle', 'pashu'])) {
      return `🥛 **Dairy Farming & Livestock Care**:\n\n` +
             `• **Milk Yield Booster**: Feed 25kg green fodder + 8kg dry straw + 1kg balanced concentrate per 2.5L milk.\n` +
             `• **Nutrition**: Add 50g Mineral Mixture daily to boost milk fat and SNF percentage.\n` +
             `• **Health**: Ensure periodic deworming every 3 months and annual Foot & Mouth Disease (FMD) vaccination.`;
    }

    return `🌾 **Smart Farm Advisor (ChatGPT Farming AI)**:\n\n` +
           `Regarding: "${text}"\n\n` +
           `• **Best Practice**: For optimal crop yields in ${selState}, maintain balanced soil pH (6.5–7.5) and organic carbon.\n` +
           `• **Market Strategy**: Sell produce when mandi prices hit green upward trends or leverage our P2P marketplace.\n` +
           `• **Weather Timing**: Always check 5-day weather forecasts before applying foliar fertilizers or pesticides.\n\n` +
           `💬 *Ask me about specific crops, fertilizer ratios, pest solutions, live rates, or govt subsidies!*`;
  };

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput; setChatInput('');
    setChatMessages(prev => [...prev, { sender:'user', text }]);
    setTimeout(() => {
      const reply = generateChatGPTResponse(text);
      setChatMessages(prev => [...prev, { sender:'bot', text:reply }]);
      speakText(reply);
    }, 500);
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsRecording(true);

        recognition.onresult = (event) => {
          setIsRecording(false);
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript) {
            setChatMessages(prev => [...prev, { sender: 'user', text: `🎙️ "${transcript}"` }]);
            const botReply = generateChatGPTResponse(transcript);
            setTimeout(() => {
              setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
              speakText(botReply);
            }, 500);
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
          runVoiceSim();
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (e) {
        console.error(e);
      }
    }
    runVoiceSim();
  };

  const runVoiceSim = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const sampleQ = 'What is the best fertilizer and weather advisory for cotton crop?';
      setChatMessages(prev => [...prev, { sender: 'user', text: `🎙️ "${sampleQ}"` }]);
      const botReply = generateChatGPTResponse(sampleQ);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
        speakText(botReply);
      }, 500);
    }, 2000);
  };

  const handleAlert = (e) => {
    e.preventDefault();
    if (!alertEmail && !alertPhone) return;
    setAlertSending(true);
    setTimeout(() => { setAlertSending(false); setAlertSent(true); setTimeout(() => setAlertSent(false), 5000); }, 1500);
  };

  const totalIncome  = ledger.filter(i=>i.type==='income').reduce((s,i)=>s+i.amount,0);
  const totalExpense = ledger.filter(i=>i.type==='expense').reduce((s,i)=>s+i.amount,0);
  const netReturn    = totalIncome - totalExpense;

  const weather = getWeather(selState);
  const mandiResult = getBestMandi();
  const filteredCrops = getFilteredCrops();
  const matchingSchemes = getMatchingSchemes();

  const districts = Object.keys(INDIA_LOCATIONS[selState] || {});
  const mandals   = (INDIA_LOCATIONS[selState]?.[selDistrict]) || [];


  /* ══ RENDER ══════════════════════════════════════ */

  if (!user) return <Auth onLogin={u => setUser(u)} />;

  const TABS = [
    { id:'overview',    icon:'🏡', label:'Farm Overview' },
    { id:'marketplace', icon:'🛒', label:'Agri P2P Store' },
    { id:'directory',   icon:'👥', label:'Farmers Registry' },
    { id:'advisor',     icon:'🌱', label:'AI Crop Advisor' },
    { id:'scanner',     icon:'🔬', label:'Disease Scanner' },
    { id:'market',      icon:'📈', label:'Market & Prices' },
    { id:'expenses',    icon:'💰', label:'Expense Ledger' },
    { id:'chat',        icon:'🤖', label:'AI Chat & Voice' },
    { id:'schemes',     icon:'🏛', label:'Govt Schemes' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#101010', fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif", color:'#f1f1f1' }}>

      {/* ═══ Global Styles — Amazon/Flipkart/Myntra Theme ═══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Plus Jakarta Sans','Inter',sans-serif!important; background:#F1F5F9; color:#0F172A; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#E2E8F0; }
        ::-webkit-scrollbar-thumb { background:#94A3B8; border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background:#64748B; }

        @keyframes priceUp   { 0%{background:rgba(34,197,94,0.3)} 100%{background:transparent} }
        @keyframes priceDown { 0%{background:rgba(239,68,68,0.3)} 100%{background:transparent} }
        @keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.85;transform:scale(1.03)} }
        @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatGlow { 0%,100%{box-shadow:0 8px 24px rgba(22,101,52,0.35)} 50%{box-shadow:0 12px 32px rgba(34,197,94,0.5)} }

        .card { background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:1.5rem; animation:fadeIn .3s ease; box-shadow:0 2px 8px rgba(0,0,0,0.04); transition:all .2s ease; }
        .card:hover { border-color:#CBD5E1; box-shadow:0 6px 18px rgba(0,0,0,0.07); }
        .stat-card { background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:.4rem; box-shadow:0 2px 8px rgba(0,0,0,0.04); transition:border-color .2s; }
        .stat-card:hover { border-color:#22C55E; }
        
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:.45rem; padding:.55rem 1.15rem; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:.875rem; transition:all .18s; font-family:'Plus Jakarta Sans',sans-serif; }
        .btn-primary { background:#166534; color:#FFFFFF; }
        .btn-primary:hover { background:#14532D; transform:translateY(-1px); box-shadow:0 4px 12px rgba(22,101,52,0.25); }
        .btn-secondary { background:#2563EB; color:#FFFFFF; }
        .btn-secondary:hover { background:#1D4ED8; }
        .btn-warning { background:#F59E0B; color:#0F172A; }
        .btn-warning:hover { background:#D97706; color:#fff; }
        .btn-outline { background:#FFFFFF; border:1px solid #CBD5E1; color:#334155; }
        .btn-outline:hover { background:#F8FAFC; border-color:#94A3B8; color:#0F172A; }
        
        .input { width:100%; padding:.6rem .85rem; background:#FFFFFF; border:1.5px solid #CBD5E1; border-radius:8px; color:#0F172A; font-size:.875rem; outline:none; font-family:'Plus Jakarta Sans',sans-serif; transition:all .2s; }
        .input:focus { border-color:#166534; box-shadow:0 0 0 3px rgba(22,101,52,.12); }
        select.input option { background:#FFFFFF; color:#0F172A; }
        label.fld { display:block; font-size:.75rem; font-weight:700; color:#475569; margin-bottom:.35rem; text-transform:uppercase; letter-spacing:.05em; }
        
        .up { color:#15803D; font-weight:700; } .down { color:#DC2626; font-weight:700; } .flat { color:#64748B; }
        
        .nav-btn { display:flex; align-items:center; gap:.85rem; padding:.75rem 1rem; border-radius:10px; border:none; cursor:pointer; font-size:.9rem; font-weight:500; background:transparent; color:#94A3B8; transition:all .18s; width:100%; text-align:left; font-family:'Plus Jakarta Sans',sans-serif; }
        .nav-btn:hover { background:#1E293B; color:#F8FAFC; }
        .nav-btn.active { background:#166534; color:#FFFFFF; font-weight:700; box-shadow:0 4px 14px rgba(22,101,52,0.3); }
        .nav-icon { font-size:1.15rem; width:24px; text-align:center; }
        
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
        .grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
        .grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
        @media(max-width:1100px){ .grid4{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:900px) { .grid3{grid-template-columns:1fr 1fr} }
        @media(max-width:700px) { .grid2,.grid3,.grid4{grid-template-columns:1fr} }
        
        .price-row { display:flex; justify-content:space-between; align-items:center; padding:.5rem .7rem; border-radius:7px; font-size:.82rem; transition:background .4s; }
        .price-row.flash-up   { animation:priceUp .8s ease; }
        .price-row.flash-down { animation:priceDown .8s ease; }
        
        .scheme-card { background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:1.25rem; display:flex; flex-direction:column; gap:.65rem; transition:all .2s; box-shadow:0 2px 6px rgba(0,0,0,0.03); }
        .scheme-card:hover { border-color:#CBD5E1; transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,0.06); }
        
        .chat-bubble { padding:.75rem 1rem; border-radius:12px; max-width:85%; font-size:.875rem; line-height:1.55; animation:fadeIn .3s ease; }
        .chat-bubble.user { background:#166534; color:#FFFFFF; align-self:flex-end; border-bottom-right-radius:2px; }
        .chat-bubble.bot  { background:#F1F5F9; color:#0F172A; border:1px solid #E2E8F0; align-self:flex-start; border-bottom-left-radius:2px; }
        
        .scan-btn { border:1.5px solid #CBD5E1; border-radius:8px; background:#FFFFFF; color:#475569; padding:.5rem 1rem; cursor:pointer; font-size:.8rem; font-weight:600; transition:all .2s; font-family:'Plus Jakarta Sans',sans-serif; }
        .scan-btn:hover { border-color:#94A3B8; color:#0F172A; }
        .scan-btn.active { background:#EFF6FF; border-color:#2563EB; color:#2563EB; }
        
        .ledger-item { display:flex; justify-content:space-between; align-items:center; padding:.75rem 1rem; border-radius:10px; font-size:.85rem; background:#FFFFFF; border:1px solid #E2E8F0; box-shadow:0 1px 3px rgba(0,0,0,0.02); }
        .section-title { font-size:1.05rem; font-weight:800; color:#0F172A; display:flex; align-items:center; gap:.5rem; margin-bottom:1.1rem; }
        
        .mcx-ticker-wrap { background:#0F172A; border-bottom:1px solid #1E293B; padding:.45rem 0; overflow:hidden; flex-shrink:0; }
        .mcx-ticker { display:inline-flex; gap:2.5rem; animation:ticker 85s linear infinite; white-space:nowrap; }
        .mcx-item { display:inline-flex; align-items:center; gap:.45rem; font-size:.76rem; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; }
        
        .tag { display:inline-flex; align-items:center; padding:.2rem .6rem; border-radius:6px; font-size:.72rem; font-weight:700; }
        .badge { display:inline-flex; align-items:center; padding:.25rem .75rem; border-radius:20px; font-size:.75rem; font-weight:700; }
        
        /* ═══ E-COMMERCE SPECIFIC STYLES (Flipkart / Amazon / Myntra format) ═══ */
        
        /* Circular Category Ribbon */
        .category-ribbon {
          display: flex;
          align-items: center;
          gap: 1rem;
          overflow-x: auto;
          padding: 0.75rem 0.25rem;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .category-ribbon::-webkit-scrollbar { display: none; }
        
        .cat-circle-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          flex-shrink: 0;
          padding: 0.35rem;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
        }
        .cat-circle-card:hover .cat-circle-icon {
          transform: translateY(-3px) scale(1.06);
          box-shadow: 0 8px 18px rgba(22,101,52,0.18);
          border-color: #22C55E;
        }
        .cat-circle-icon {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.65rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        .cat-circle-card.active .cat-circle-icon {
          background: #F0FDF4;
          border-color: #166534;
          box-shadow: 0 0 0 3px rgba(22,101,52,0.2);
        }
        .cat-circle-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
          text-align: center;
          white-space: nowrap;
        }
        .cat-circle-card.active .cat-circle-label {
          color: #166534;
        }

        /* Hero Promo Banner Slider */
        .promo-banner {
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          color: #FFFFFF;
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 180px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: all 0.4s ease;
        }
        .promo-slide-0 { background: linear-gradient(135deg, #0f4c3a 0%, #166534 50%, #1e3a5f 100%); }
        .promo-slide-1 { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0f766e 100%); }
        .promo-slide-2 { background: linear-gradient(135deg, #831843 0%, #be123c 50%, #9a3412 100%); }
        .promo-slide-3 { background: linear-gradient(135deg, #14532d 0%, #065f46 50%, #047857 100%); }

        .promo-dots {
          display: flex;
          gap: 0.4rem;
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
        }
        .promo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.2s;
        }
        .promo-dot.active {
          width: 24px;
          border-radius: 10px;
          background: #FFFFFF;
        }

        /* Amazon/Flipkart Product Cards */
        .marketplace-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 1240px) {
          .marketplace-grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        }
        @media (max-width: 860px) {
          .marketplace-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        }
        @media (max-width: 480px) {
          .marketplace-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
        }

        .product-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          position: relative;
        }
        .product-card:hover {
          border-color: #22C55E;
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(22,101,52,0.14);
        }
        
        .product-img-container {
          height: 185px;
          position: relative;
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .product-img-container { height: 135px; }
        }
        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
        }
        .product-card:hover .product-img {
          transform: scale(1.06);
        }
        .product-img-fallback {
          font-size: 3.5rem;
        }

        .discount-pill {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #DC2626;
          color: #FFFFFF;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
          letter-spacing: 0.02em;
        }
        .wishlist-icon-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.95rem;
          z-index: 2;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        .wishlist-icon-btn:hover {
          transform: scale(1.15);
          background: #FFFFFF;
        }

        .product-details {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          background: #FFFFFF;
        }
        @media (max-width: 480px) {
          .product-details { padding: 0.75rem; }
        }

        /* Quantity stepper */
        .cart-qty-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F0FDF4;
          border: 1.5px solid #166534;
          border-radius: 8px;
          padding: 0.25rem 0.5rem;
        }
        .qty-step-btn {
          border: none;
          background: transparent;
          color: #166534;
          font-weight: 800;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 0 0.4rem;
        }

        /* Universal Floating Kisan AI Chatbot */
        .kisan-chatbot-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 5000;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: linear-gradient(135deg, #0F5132 0%, #166534 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 50px;
          padding: 0.75rem 1.25rem;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.9rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 8px 24px rgba(15,81,50,0.4);
          animation: floatGlow 3s infinite;
          transition: all 0.25s ease;
        }
        .kisan-chatbot-fab:hover {
          transform: translateY(-3px) scale(1.04);
        }
        @media (max-width: 768px) {
          .kisan-chatbot-fab {
            bottom: 74px;
            right: 16px;
            padding: 0.65rem 1rem;
            font-size: 0.82rem;
          }
        }

        .kisan-chatbot-drawer {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 400px;
          max-width: calc(100vw - 32px);
          height: 560px;
          max-height: calc(100vh - 100px);
          background: #FFFFFF;
          border-radius: 18px;
          border: 1px solid #CBD5E1;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          z-index: 5001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 768px) {
          .kisan-chatbot-drawer {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            max-width: 100%;
            height: 90vh;
            max-height: 90vh;
            border-radius: 20px 20px 0 0;
          }
        }

        /* Mobile Bottom Nav */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #FFFFFF;
          border-top: 1px solid #E2E8F0;
          padding: 0.45rem 0 calc(0.45rem + env(safe-area-inset-bottom));
          z-index: 4000;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
        }
        .mobile-bottom-nav-inner {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
        .bottom-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.6rem;
          color: #64748B;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
        }
        .bottom-nav-btn .bn-icon { font-size: 1.3rem; }
        .bottom-nav-btn .bn-label { font-size: 0.65rem; font-weight: 700; }
        .bottom-nav-btn.active { color: #166534; }
        .bottom-nav-badge {
          position: absolute;
          top: -2px;
          right: 6px;
          background: #DC2626;
          color: #fff;
          font-size: 0.6rem;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: block; }
          main { padding-bottom: 5.5rem !important; }
        }
              /* Responsive Sidebar Drawer for Mobile */
        .responsive-sidebar {
          width: 240px; background: #111; border-right: 1px solid #222;
          display: flex; flex-direction: column; flex-shrink: 0;
          height: calc(100vh - 36px); position: sticky; top: 36px;
          overflow-y: auto; padding: 1.25rem 1rem; z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hamburger-btn {
          display: none;
          background: transparent;
          border: none;
          color: #f1f1f1;
          font-size: 1.4rem;
          cursor: pointer;
          padding: 0;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        @media (max-width: 768px) {
          .responsive-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            height: 100vh;
            transform: translateX(-100%);
            box-shadow: 20px 0 50px rgba(0,0,0,0.8);
            z-index: 2000;
          }
          .responsive-sidebar.open {
            transform: translateX(0);
          }
          .hamburger-btn {
            display: inline-flex;
          }
          .sidebar-overlay.show {
            display: block;
          }
        }

        /* P2P Marketplace Styles - Responsive 4 col (PC) / 3 col (Tablet) / 2 col (Mobile) */
        .marketplace-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 1200px) {
          .marketplace-grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        }
        @media (max-width: 860px) {
          .marketplace-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        }
        @media (max-width: 480px) {
          .marketplace-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
        }

        .product-card {
          background: #ffffff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          position: relative;
        }
        .product-card:hover {
          border-color: #22c55e;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(22, 101, 52, 0.12);
        }
        .product-img-container {
          height: 165px;
          position: relative;
          background: #F3F4F6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .product-img-container { height: 130px; }
        }
        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .product-card:hover .product-img {
          transform: scale(1.04);
        }
        .product-img-fallback {
          font-size: 3rem;
        }
        .product-details {
          padding: 0.9rem;
          display: flex;
          flex-direction: column;
          flex: 1;
          background: #ffffff;
        }
        @media (max-width: 480px) {
          .product-details { padding: 0.65rem; }
        }

        .discount-pill {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #DC2626;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          z-index: 2;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
        }
        .wishlist-icon-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.85rem;
          z-index: 2;
          transition: transform 0.15s;
        }
        .wishlist-icon-btn:hover {
          transform: scale(1.15);
        }

        /* Mobile Bottom Nav */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          border-top: 1px solid #E5E7EB;
          padding: 0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom));
          z-index: 4000;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
        }
        .mobile-bottom-nav-inner {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
        .bottom-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.3rem 0.6rem;
          color: #64748B;
          font-family: 'Inter', sans-serif;
          position: relative;
        }
        .bottom-nav-btn .bn-icon { font-size: 1.25rem; }
        .bottom-nav-btn .bn-label { font-size: 0.65rem; font-weight: 600; }
        .bottom-nav-btn.active { color: #166534; }
        .bottom-nav-badge {
          position: absolute;
          top: -2px;
          right: 4px;
          background: #DC2626;
          color: #fff;
          font-size: 0.6rem;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: block; }
          main { padding-bottom: 4.5rem !important; }
        }

        /* Category Filter Pills */
        .cat-scroll-container {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.4rem;
          margin-bottom: 0.5rem;
          scrollbar-width: thin;
        }
        .cat-scroll-container::-webkit-scrollbar {
          height: 4px;
        }
        .cat-scroll-pill {
          padding: 0.35rem 0.8rem;
          border-radius: 20px;
          border: 1px solid #333;
          background: #1e1e1e;
          color: #ccc;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .cat-scroll-pill:hover {
          border-color: #22c55e;
          color: #fff;
        }
        .cat-scroll-pill.active {
          background: #166534;
          border-color: #22c55e;
          color: #ffffff;
        }
        .seller-badge {
          font-size: 0.72rem;
          background: #2563eb;
          color: #fff;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          font-weight: 600;
          display: inline-block;
        }
        .star-rating {
          display: inline-flex;
          gap: 0.15rem;
          color: #fbbf24;
          cursor: pointer;
        }
        .star-rating-static {
          display: inline-flex;
          gap: 0.15rem;
          color: #fbbf24;
        }
        
        /* Cart Overlay & Sidebar */
        .cart-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 380px;
          background: #151515;
          border-left: 1px solid #2a2a2a;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.7);
          z-index: 3000;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cart-sidebar.open {
          transform: translateX(0);
        }
        .cart-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 2999;
          display: none;
        }
        .cart-overlay.open {
          display: block;
        }

        /* Farmers Directory */
        .directory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .farmer-card {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s ease;
          position: relative;
        }
        .farmer-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
        }
        .avatar-circle {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 700;
          color: #fff;
          position: relative;
          flex-shrink: 0;
        }
        .online-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #1a1a1a;
          position: absolute;
          bottom: 2px;
          right: 2px;
        }
      `}</style>

      {/* ═══ Live Market Ticker ═══ */}
      <div className="mcx-ticker-wrap">
        <div className="mcx-ticker">
          {(() => {
            const stateMult = INPUT_STATE_MULTIPLIER[selState] || 1.0;
            const petrol = { name:`Petrol (${selState})`, price: FUEL_BASE_PRICES.PETROL * stateMult, pct:(stateMult-1)*100 };
            const diesel = { name:`Diesel (${selState})`, price: FUEL_BASE_PRICES.DIESEL * stateMult, pct:(stateMult-1)*100 };
            const mega = [petrol, diesel, ...MCX_COMMODITIES];
            Object.entries(BASE_PRICES).slice(0,12).forEach(([crop,price]) => mega.push({ name:crop, price, pct:0 }));
            return [...mega,...mega].map((m,i) => {
              const lp = liveMcx[m.name] || m.price;
              const pct = m.pct !== undefined ? m.pct : (((lp-(m.price||lp))/(m.price||lp))*100);
              const isUp = pct >= 0 && mcxTrend[m.name] !== 'down';
              return (
                <span key={i} className="mcx-item">
                  <span style={{color:'#888'}}>{m.name}</span>
                  <span style={{color:isUp?'#22c55e':'#ef4444',fontWeight:700}}>&#x20B9;{lp.toFixed(m.name.includes('Petrol')||m.name.includes('Diesel')?2:0)}</span>
                  <span style={{color:isUp?'#22c55e':'#ef4444',fontSize:'.7rem'}}>{isUp?'▲':'▼'}</span>
                  <span style={{color:'#333',margin:'0 .5rem'}}>|</span>
                </span>
              );
            });
          })()}
        </div>
      </div>

      {/* ═══ App Shell: Sidebar + Content ═══ */}
      <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

        {/* Sidebar backdrop overlay click shield (mobile only) */}
        <div className={`sidebar-overlay${isSidebarOpen ? ' show' : ''}`} onClick={() => setIsSidebarOpen(false)} />

        {/* ── Left Sidebar ── */}
        <aside className={`responsive-sidebar${isSidebarOpen ? ' open' : ''}`}>
          <div style={{ display:'flex', alignItems:'center', gap:'.7rem', marginBottom:'2rem', padding:'0 .25rem' }}>
            <span style={{ fontSize:'1.6rem' }}>🌾</span>
            <div>
              <div style={{ fontWeight:800, fontSize:'1rem', color:'#fff', letterSpacing:'-.01em' }}>Smart Crop AI</div>
              <div style={{ fontSize:'.7rem', color:'#666', fontWeight:500 }}>Farm Assistant</div>
            </div>
          </div>

          <nav style={{ display:'flex', flexDirection:'column', gap:'.2rem', flex:1 }}>
            {TABS.map(t => (
              <button key={t.id} className={`nav-btn${activeTab===t.id?' active':''}`} onClick={() => { setActiveTab(t.id); setIsSidebarOpen(false); }}>
                <span className="nav-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ marginTop:'auto', paddingTop:'1.25rem', borderTop:'1px solid #222' }}>
            {/* Live user stats */}
            <div style={{ display:'flex', gap:'.4rem', marginBottom:'.75rem' }}>
              <div style={{ flex:1, background:'#1a1a1a', borderRadius:6, padding:'.35rem .5rem', textAlign:'center' }}>
                <div style={{ fontSize:'.65rem', color:'#666' }}>Farmers</div>
                <div style={{ fontSize:'.85rem', fontWeight:700, color:'#60a5fa' }}>{totalUsers || '—'}</div>
              </div>
              <div style={{ flex:1, background:'#1a1a1a', borderRadius:6, padding:'.35rem .5rem', textAlign:'center' }}>
                <div style={{ fontSize:'.65rem', color:'#666' }}>Online</div>
                <div style={{ fontSize:'.85rem', fontWeight:700, color:'#22c55e' }}>{onlineUsers || '—'}</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'.75rem' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:'1rem', flexShrink:0 }}>
                {(user?.name || user?.email || 'F').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:'.88rem', fontWeight:600, color:'#f1f1f1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name || 'Farmer'}</div>
                <div style={{ fontSize:'.72rem', color:'#666', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email || user?.phone || ''}</div>
              </div>
            </div>
            <button className="btn btn-outline" style={{ width:'100%', fontSize:'.82rem', padding:'.5rem', justifyContent:'center' }}
              onClick={() => { localStorage.removeItem(SESSION_KEY); setUser(null); }}>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Right Content ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, height:'calc(100vh - 36px)', overflowY:'auto' }}>

          {/* Top Header Bar — Amazon / Flipkart Style */}
          <header style={{ background:'#0F172A', borderBottom:'1px solid #1E293B', padding:'.7rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'.75rem', position:'sticky', top:0, zIndex:20, boxShadow:'0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
              <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{color:'#fff'}}>☰</button>
              <div style={{ display:'flex', alignItems:'center', gap:'.4rem', fontWeight:800, fontSize:'1.05rem', color:'#FFFFFF' }}>
                <span style={{ fontSize:'1.3rem' }}>{TABS.find(t => t.id === activeTab)?.icon}</span>
                <span>{TABS.find(t => t.id === activeTab)?.label}</span>
              </div>
              {weatherLoading && <span style={{fontSize:'.72rem',color:'#60a5fa',background:'rgba(37,99,235,0.15)',padding:'.15rem .5rem',borderRadius:12}}>⏳ Live Open-Meteo Updating...</span>}
            </div>

            {/* Quick Header Right Tools: Location, Wishlist, Cart, Language */}
            <div style={{ display:'flex', gap:'.65rem', alignItems:'center', flexWrap:'wrap' }}>
              {/* Deliver-To Location Picker */}
              <div style={{ display:'flex', alignItems:'center', gap:'.35rem', background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'.3rem .6rem', border:'1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ fontSize:'.85rem', color:'#4ade80' }}>📍</span>
                <span style={{ fontSize:'.75rem', color:'#CBD5E1', fontWeight:600 }}>{selMandal}, {selState}</span>
              </div>

              {/* State & District Selectors */}
              <select className="input" style={{width:'auto',padding:'.35rem .6rem',fontSize:'.78rem',background:'#1E293B',color:'#fff',borderColor:'#334155'}} value={selState} onChange={e=>handleStateChange(e.target.value)}>
                {ALL_STATES && ALL_STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>

              {/* Language Switch */}
              <select className="input" style={{width:'auto',padding:'.35rem .6rem',fontSize:'.78rem',background:'#1E293B',color:'#fff',borderColor:'#334155'}} value={lang} onChange={e=>setLang(e.target.value)}>
                <option value="en">English (EN)</option>
                <option value="hi">हिन्दी (HI)</option>
                <option value="te">తెలుగు (TE)</option>
              </select>

              {/* Wishlist Indicator */}
              <button 
                onClick={() => { setActiveTab('marketplace'); }} 
                title="Your Wishlist"
                style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#fff', padding:'.35rem .65rem', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:'.3rem', fontSize:'.8rem' }}
              >
                <span>❤️</span>
                <span style={{ fontWeight:700 }}>{wishlist.length}</span>
              </button>

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                style={{ background:'#166534', border:'1px solid #22c55e', color:'#fff', padding:'.35rem .85rem', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:'.4rem', fontWeight:700, fontSize:'.8rem' }}
              >
                <span>🛒</span>
                <span>Cart ({cart.reduce((s,i)=>s+i.quantity,0)})</span>
              </button>
            </div>
          </header>

          {/* Main Page Content */}
          <main style={{ padding:'1.5rem', maxWidth:1400, width:'100%', margin:'0 auto', flex:1 }}>

            {/* ════ AGRI P2P MARKETPLACE (Amazon / Flipkart / Myntra Layout) ════ */}
            {activeTab==='marketplace' && (() => {
              // Filtering & Sorting Pipeline
              const sLower = marketSearchInput.toLowerCase().trim();
              let items = activeListings.filter(item => {
                const matchSearch = !sLower || 
                  (item.title || '').toLowerCase().includes(sLower) || 
                  (item.description || '').toLowerCase().includes(sLower) ||
                  (item.category || '').toLowerCase().includes(sLower) ||
                  (item.sellerName || '').toLowerCase().includes(sLower);
                
                const matchCategory = marketFilter === 'All' || item.category === marketFilter;
                const matchLocation = marketLocFilter === 'All' || item.sellerLocation?.state === marketLocFilter;
                
                let matchPrice = true;
                if (priceRangeFilter === 'under50') matchPrice = item.price < 50;
                else if (priceRangeFilter === '50to200') matchPrice = item.price >= 50 && item.price <= 200;
                else if (priceRangeFilter === '200to500') matchPrice = item.price > 200 && item.price <= 500;
                else if (priceRangeFilter === 'above500') matchPrice = item.price > 500;

                const matchStock = !inStockOnly || item.quantity > 0;

                return matchSearch && matchCategory && matchLocation && matchPrice && matchStock;
              });

              // Sorting
              if (sortBy === 'priceLow') {
                items = [...items].sort((a,b) => a.price - b.price);
              } else if (sortBy === 'priceHigh') {
                items = [...items].sort((a,b) => b.price - a.price);
              } else if (sortBy === 'rating') {
                items = [...items].sort((a,b) => (b.rating||0) - (a.rating||0));
              }

              // Promos
              const PROMOS = [
                {
                  title: '🌾 Kisan Mega Mandi — 100% Farm Fresh Harvest',
                  subtitle: 'Buy Vegetables, Fruits, Grains & Ghee directly from verified local farmers at 0% intermediary markup.',
                  cta: 'Shop Fresh Harvest',
                  filter: '🥬 Vegetables',
                  badge: 'MEGA HARVEST OFFER · UP TO 35% OFF'
                },
                {
                  title: '🤖 Smart AI Agronomist — Precision Crop & Fertilizer Strategy',
                  subtitle: 'Input your soil test NPK & rainfall to unlock highest-profit crops with complete cultivation calendar.',
                  cta: 'Launch AI Advisor',
                  action: () => setActiveTab('advisor'),
                  badge: 'AI DECISION PLATFORM'
                },
                {
                  title: '🔬 Plant Leaf Disease Hospital — Instant AI Diagnosis',
                  subtitle: 'Take or upload a photo of affected leaf spots to identify fungus, blight, or leaf curl with biological remedies.',
                  cta: 'Scan Crop Disease',
                  action: () => setActiveTab('scanner'),
                  badge: 'COMPUTER VISION PLANT SCANNER'
                },
                {
                  title: '⚡ Live APMC Mandi Rates & MCX Commodity Ticker',
                  subtitle: 'Real-time daily arrival prices across 30+ states. Compare wholesale mandis & calculate road freight.',
                  cta: 'View Live Rates',
                  action: () => setActiveTab('market'),
                  badge: 'TRANSPARENT FARM PRICING'
                }
              ];

              const currentPromo = PROMOS[promoSlide];

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Top Bar: Mode Switch (Buy Produce vs Sell Harvest) */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🌾</span>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                          Agri Superstore & Direct Farmer Marketplace
                        </h2>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
                        Buy certified organic harvests, seeds, fertilizers, and farm tools — or sell your own yield directly to buyers.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                      <div style={{ background: '#F1F5F9', borderRadius: 10, padding: '0.25rem', display: 'flex', border: '1px solid #E2E8F0' }}>
                        <button
                          className={`btn ${marketplaceMode==='buy' ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', borderRadius: 8, border: 'none' }}
                          onClick={() => setMarketplaceMode('buy')}
                        >
                          🛍️ Buy Products
                        </button>
                        <button
                          className={`btn ${marketplaceMode==='sell' ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', borderRadius: 8, border: 'none' }}
                          onClick={() => setMarketplaceMode('sell')}
                        >
                          💼 Sell Your Crop
                        </button>
                      </div>

                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', position: 'relative', borderColor: '#CBD5E1' }}
                        onClick={() => setIsCartOpen(true)}
                      >
                        🛒 Cart ({cart.reduce((s,i)=>s+i.quantity,0)})
                        {cart.length > 0 && (
                          <span style={{ position: 'absolute', top: -5, right: -5, background: '#DC2626', color: '#fff', fontSize: '0.65rem', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {cart.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {marketplaceMode === 'buy' ? (
                    <>
                      {/* ═══ Circular Category Ribbon (Flipkart / Myntra format) ═══ */}
                      <div style={{ background: '#FFFFFF', borderRadius: 14, padding: '0.75rem 1rem', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div className="category-ribbon">
                          {[
                            { label: 'All Store', val: 'All', icon: '🛒' },
                            { label: 'Vegetables', val: '🥬 Vegetables', icon: '🥬' },
                            { label: 'Fresh Fruits', val: '🍎 Fruits', icon: '🍎' },
                            { label: 'Atta & Grains', val: '🌾 Grains & Flour', icon: '🌾' },
                            { label: 'Dals & Pulses', val: '🫘 Pulses & Dal', icon: '🫘' },
                            { label: 'Spices', val: '🌶 Spices & Masala', icon: '🌶' },
                            { label: 'Dry Fruits', val: '🥜 Dry Fruits & Nuts', icon: '🥜' },
                            { label: 'A2 Ghee & Oils', val: '🥛 Dairy & Oils', icon: '🥛' },
                            { label: 'Daily Routine', val: '🧴 Daily Routine', icon: '🧴' },
                            { label: 'Hybrid Seeds', val: '🌱 Seeds', icon: '🌱' },
                            { label: 'Fertilizers', val: '🧪 Fertilizers & Agri', icon: '🧪' },
                            { label: 'Drip Irrigation', val: '💧 Irrigation', icon: '💧' },
                            { label: 'Farming Tools', val: '🛠️ Farming Tools', icon: '🛠️' },
                          ].map(cat => (
                            <button
                              key={cat.val}
                              className={`cat-circle-card ${marketFilter === cat.val ? 'active' : ''}`}
                              onClick={() => setMarketFilter(cat.val)}
                            >
                              <div className="cat-circle-icon">
                                <span>{cat.icon}</span>
                              </div>
                              <span className="cat-circle-label">{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ═══ Flipkart / Amazon Hero Promo Carousel Banner ═══ */}
                      <div className={`promo-banner promo-slide-${promoSlide}`}>
                        <div style={{ maxWidth: '640px', zIndex: 2 }}>
                          <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                            {currentPromo.badge}
                          </span>
                          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.6rem', lineHeight: 1.25, color: '#FFFFFF' }}>
                            {currentPromo.title}
                          </h2>
                          <p style={{ fontSize: '0.85rem', color: '#E2E8F0', marginTop: '0.4rem', lineHeight: 1.45, maxWidth: '540px' }}>
                            {currentPromo.subtitle}
                          </p>
                          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                            <button
                              className="btn"
                              style={{ background: '#FFFFFF', color: '#0F172A', fontWeight: 800, fontSize: '0.85rem', padding: '0.55rem 1.25rem', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
                              onClick={() => {
                                if (currentPromo.action) currentPromo.action();
                                else if (currentPromo.filter) setMarketFilter(currentPromo.filter);
                              }}
                            >
                              {currentPromo.cta} →
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF', background: 'rgba(255,255,255,0.1)' }}
                              onClick={() => setIsChatbotOpen(true)}
                            >
                              💬 Ask Kisan AI
                            </button>
                          </div>
                        </div>

                        {/* Slide Indicator Dots */}
                        <div className="promo-dots">
                          {[0,1,2,3].map(i => (
                            <div
                              key={i}
                              className={`promo-dot ${promoSlide === i ? 'active' : ''}`}
                              onClick={() => setPromoSlide(i)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* ═══ Universal Search & Filter Facets Bar (Amazon format) ═══ */}
                      <div className="card" style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {/* Search Input */}
                          <div style={{ flex: 3, minWidth: '220px', position: 'relative' }}>
                            <label className="fld">Search Products & Crops</label>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>🔍</span>
                              <input
                                className="input"
                                style={{ paddingLeft: '2.2rem', paddingRight: marketSearchInput ? '2rem' : '0.85rem' }}
                                placeholder="Search spinach, tomato, basmati, seeds, urea, ghee, tools..."
                                value={marketSearchInput}
                                onChange={e => setMarketSearchInput(e.target.value)}
                              />
                              {marketSearchInput && (
                                <button
                                  onClick={() => setMarketSearchInput('')}
                                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '1rem' }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Price Range */}
                          <div style={{ flex: 1.2, minWidth: '130px' }}>
                            <label className="fld">Price Filter</label>
                            <select className="input" value={priceRangeFilter} onChange={e => setPriceRangeFilter(e.target.value)}>
                              <option value="all">All Prices</option>
                              <option value="under50">Under ₹50</option>
                              <option value="50to200">₹50 – ₹200</option>
                              <option value="200to500">₹200 – ₹500</option>
                              <option value="above500">Above ₹500</option>
                            </select>
                          </div>

                          {/* Region / State */}
                          <div style={{ flex: 1.2, minWidth: '140px' }}>
                            <label className="fld">Farmer Region</label>
                            <select className="input" value={marketLocFilter} onChange={e => setMarketLocFilter(e.target.value)}>
                              <option value="All">All India</option>
                              {ALL_STATES && ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>

                          {/* Sort By */}
                          <div style={{ flex: 1.2, minWidth: '140px' }}>
                            <label className="fld">Sort Products</label>
                            <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                              <option value="featured">Featured / Best Match</option>
                              <option value="priceLow">Price: Low to High</option>
                              <option value="priceHigh">Price: High to Low</option>
                              <option value="rating">Customer Rating</option>
                            </select>
                          </div>

                          {/* In-Stock Toggle */}
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '100px' }}>
                            <label className="fld">Availability</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600, cursor: 'pointer', height: '38px' }}>
                              <input
                                type="checkbox"
                                checked={inStockOnly}
                                onChange={e => setInStockOnly(e.target.checked)}
                                style={{ accentColor: '#166534', width: 16, height: 16 }}
                              />
                              In Stock Only
                            </label>
                          </div>
                        </div>

                        {/* Active Filters Summary */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            Showing <strong>{items.length}</strong> verified agricultural products & daily staples
                          </span>
                          {(marketFilter !== 'All' || marketSearchInput || marketLocFilter !== 'All' || priceRangeFilter !== 'all' || inStockOnly) && (
                            <button
                              onClick={() => {
                                setMarketFilter('All');
                                setMarketSearchInput('');
                                setMarketLocFilter('All');
                                setPriceRangeFilter('all');
                                setInStockOnly(false);
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#2563EB', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              ↺ Reset Filters
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ═══ Product Cards Grid (Amazon / Flipkart Responsive Grid) ═══ */}
                      {listingsLoading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: '#FFFFFF', borderRadius: 14 }}>
                          <span style={{ fontSize: '2.5rem', animation: 'spin 1s infinite' }}>🔄</span>
                          <p style={{ color: '#64748B', marginTop: '1rem', fontWeight: 600 }}>Loading verified farm-fresh listings...</p>
                        </div>
                      ) : items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                          <span style={{ fontSize: '3.5rem' }}>🔍</span>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.75rem' }}>No products match your current filters</h3>
                          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.35rem' }}>Try clearing filters or search for another crop or daily routine item.</p>
                          <button
                            className="btn btn-primary"
                            style={{ marginTop: '1rem' }}
                            onClick={() => {
                              setMarketFilter('All');
                              setMarketSearchInput('');
                              setMarketLocFilter('All');
                              setPriceRangeFilter('all');
                              setInStockOnly(false);
                            }}
                          >
                            Show All Products
                          </button>
                        </div>
                      ) : (
                        <div className="marketplace-grid">
                          {items.map(item => {
                            const inCartItem = cart.find(c => c.id === item.id);
                            const discountPct = item.mrp && item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;

                            return (
                              <div key={item.id} className="product-card">
                                {/* Discount pill on top-left */}
                                {discountPct > 0 && (
                                  <span className="discount-pill">
                                    {discountPct}% OFF
                                  </span>
                                )}

                                {/* Wishlist toggle button on top-right */}
                                <button
                                  className="wishlist-icon-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setWishlist(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                                  }}
                                  title="Add to Wishlist"
                                >
                                  {wishlist.includes(item.id) ? '❤️' : '🤍'}
                                </button>

                                {/* Product Image */}
                                <div className="product-img-container">
                                  {item.image && item.image.startsWith('http') ? (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="product-img"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="product-img-fallback"
                                    style={{ display: item.image && item.image.startsWith('http') ? 'none' : 'flex' }}
                                  >
                                    {item.category?.includes('Vegetables') ? '🥬' :
                                     item.category?.includes('Fruits') ? '🍎' :
                                     item.category?.includes('Grains') ? '🌾' :
                                     item.category?.includes('Pulses') ? '🫘' :
                                     item.category?.includes('Spices') ? '🌶' :
                                     item.category?.includes('Dry') ? '🥜' :
                                     item.category?.includes('Dairy') ? '🥛' :
                                     item.category?.includes('Daily') ? '🧴' :
                                     item.category?.includes('Seeds') ? '🌱' :
                                     item.category?.includes('Fertilizers') ? '🧪' : '🛠️'}
                                  </div>
                                </div>

                                {/* Product Info Details */}
                                <div className="product-details">
                                  {/* Category tag & Star Rating */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.68rem', background: '#F0FDF4', color: '#166534', padding: '0.15rem 0.45rem', borderRadius: 6, fontWeight: 700 }}>
                                      {item.category}
                                    </span>
                                    <div 
                                      style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', color: '#D97706', fontWeight: 700, cursor: 'pointer' }}
                                      title="Rate this product"
                                      onClick={() => handleRateProduct(item.id, 5)}
                                    >
                                      <span>★ {item.rating || 4.9}</span>
                                      <span style={{ color: '#94A3B8', fontWeight: 500 }}>({item.ratingCount || 100})</span>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem', lineHeight: 1.35, height: '2.5rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {item.title}
                                  </h3>

                                  {/* Pricing Row: Price, MRP, Savings */}
                                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803D' }}>
                                      ₹{item.price}
                                    </span>
                                    <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                                      / {item.unit}
                                    </span>
                                    {item.mrp && item.mrp > item.price && (
                                      <span style={{ fontSize: '0.76rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                                        ₹{item.mrp}
                                      </span>
                                    )}
                                  </div>

                                  {/* Delivery & Seller Tag */}
                                  <div style={{ background: '#F8FAFC', padding: '0.45rem 0.6rem', borderRadius: 8, fontSize: '0.7rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ color: '#64748B' }}>Seller:</span>
                                      <strong style={{ color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                        ✅ {item.sellerName}
                                      </strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ color: '#64748B' }}>Origin:</span>
                                      <span style={{ color: '#334155' }}>📍 {item.sellerLocation?.district || 'Farm'}, {item.sellerLocation?.state}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '0.15rem', marginTop: '0.1rem' }}>
                                      <span style={{ color: '#166534', fontWeight: 600 }}>⚡ 24-hr Delivery</span>
                                      <strong style={{ color: item.quantity > 5 ? '#15803D' : '#DC2626' }}>
                                        {item.quantity > 5 ? `${item.quantity} ${item.unit}s in stock` : 'Only a few left!'}
                                      </strong>
                                    </div>
                                  </div>

                                  {/* Actions: Add to Cart / Qty Stepper & WhatsApp Contact */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: 'auto' }}>
                                    {inCartItem ? (
                                      <div className="cart-qty-stepper">
                                        <button className="qty-step-btn" onClick={() => handleUpdateCartQty(item.id, inCartItem.quantity - 1)}>–</button>
                                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#166534' }}>In Cart: {inCartItem.quantity} {item.unit}</span>
                                        <button className="qty-step-btn" onClick={() => handleUpdateCartQty(item.id, inCartItem.quantity + 1)}>+</button>
                                      </div>
                                    ) : (
                                      <button
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
                                        onClick={() => handleAddToCart(item, 1)}
                                      >
                                        🛒 Add to Cart
                                      </button>
                                    )}

                                    {item.sellerPhone && (
                                      <a
                                        href={`https://wa.me/91${item.sellerPhone}?text=${encodeURIComponent(`Hi ${item.sellerName}, I want to buy "${item.title}" (₹${item.price}/${item.unit}) from Smart Crop Advisor.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.45rem', background: '#25D366', color: '#FFFFFF', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
                                      >
                                        <span>💬</span>
                                        <span>WhatsApp Farmer</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    /* ═══ Farmer Seller Portal — List Harvest / Product ═══ */
                    <div className="card" style={{ maxWidth: '720px', margin: '0 auto', width: '100%', padding: '2rem' }}>
                      <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                        <span style={{ background: '#F0FDF4', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800 }}>
                          🌾 DIRECT FARMER ONBOARDING
                        </span>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginTop: '0.5rem' }}>
                          Sell Your Harvest Directly to Buyers
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
                          List your produce in 2 minutes. Receive direct buyer inquiries on WhatsApp with zero intermediary fees.
                        </p>
                      </div>

                      <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                          <label className="fld">Produce / Product Title *</label>
                          <input
                            className="input"
                            placeholder="e.g. Organic Red Tomatoes, Sona Masuri Paddy, A2 Desi Cow Ghee..."
                            value={newListing.title}
                            onChange={e => setNewListing(p => ({ ...p, title: e.target.value }))}
                            required
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label className="fld">Category *</label>
                            <select
                              className="input"
                              value={newListing.category}
                              onChange={e => setNewListing(p => ({ ...p, category: e.target.value }))}
                            >
                              <option value="🥬 Vegetables">🥬 Vegetables</option>
                              <option value="🍎 Fruits">🍎 Fruits</option>
                              <option value="🌾 Grains & Flour">🌾 Grains & Flour</option>
                              <option value="🫘 Pulses & Dal">🫘 Pulses & Dal</option>
                              <option value="🌶 Spices & Masala">🌶 Spices & Masala</option>
                              <option value="🥜 Dry Fruits & Nuts">🥜 Dry Fruits & Nuts</option>
                              <option value="🥛 Dairy & Oils">🥛 Dairy & Oils</option>
                              <option value="🧴 Daily Routine">🧴 Daily Routine</option>
                              <option value="🌱 Seeds">🌱 Seeds</option>
                              <option value="🧪 Fertilizers & Agri">🧪 Fertilizers & Agri</option>
                              <option value="💧 Irrigation">💧 Irrigation</option>
                              <option value="🛠️ Farming Tools">🛠️ Farming Tools</option>
                            </select>
                          </div>

                          <div>
                            <label className="fld">Unit of Measurement *</label>
                            <select
                              className="input"
                              value={newListing.unit}
                              onChange={e => setNewListing(p => ({ ...p, unit: e.target.value }))}
                            >
                              <option value="kg">Kilogram (kg)</option>
                              <option value="quintal">Quintal (100 kg)</option>
                              <option value="tonne">Tonne</option>
                              <option value="litre">Litre (L)</option>
                              <option value="bag">Bag / Sack</option>
                              <option value="pcs">Pieces / Units</option>
                              <option value="pkt">Packet</option>
                              <option value="box">Crate / Box</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label className="fld">Your Price (₹) *</label>
                            <input
                              type="number"
                              className="input"
                              placeholder="e.g. 25"
                              value={newListing.price}
                              onChange={e => setNewListing(p => ({ ...p, price: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <label className="fld">Market MRP (₹)</label>
                            <input
                              type="number"
                              className="input"
                              placeholder="e.g. 35"
                              value={newListing.mrp || ''}
                              onChange={e => setNewListing(p => ({ ...p, mrp: e.target.value }))}
                            />
                          </div>

                          <div>
                            <label className="fld">Total Available Stock *</label>
                            <input
                              type="number"
                              className="input"
                              placeholder="e.g. 500"
                              value={newListing.quantity}
                              onChange={e => setNewListing(p => ({ ...p, quantity: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="fld">Harvest Description & Quality Details</label>
                          <textarea
                            className="input"
                            rows={3}
                            placeholder="Describe freshness, seed variety, harvest date, and organic cultivation methods..."
                            value={newListing.description}
                            onChange={e => setNewListing(p => ({ ...p, description: e.target.value }))}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <label className="fld">State *</label>
                            <select
                              className="input"
                              value={newListing.sellerState}
                              onChange={e => setNewListing(p => ({ ...p, sellerState: e.target.value, sellerDistrict: Object.keys(INDIA_LOCATIONS[e.target.value] || {})[0] || '', sellerMandal: '' }))}
                            >
                              {ALL_STATES && ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="fld">District *</label>
                            <select
                              className="input"
                              value={newListing.sellerDistrict}
                              onChange={e => setNewListing(p => ({ ...p, sellerDistrict: e.target.value, sellerMandal: (INDIA_LOCATIONS[p.sellerState]?.[e.target.value])?.[0] || '' }))}
                            >
                              {Object.keys(INDIA_LOCATIONS[newListing.sellerState] || {}).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="fld">Mandal / Village *</label>
                            <select
                              className="input"
                              value={newListing.sellerMandal}
                              onChange={e => setNewListing(p => ({ ...p, sellerMandal: e.target.value }))}
                            >
                              {(INDIA_LOCATIONS[newListing.sellerState]?.[newListing.sellerDistrict] || []).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="fld">Product Photo URL (Unsplash or Direct Image)</label>
                          <input
                            className="input"
                            placeholder="https://images.unsplash.com/... or leave blank for auto category photo"
                            value={newListing.imageUrl || ''}
                            onChange={e => setNewListing(p => ({ ...p, imageUrl: e.target.value }))}
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ padding: '0.85rem', fontWeight: 800, fontSize: '1rem', marginTop: '0.5rem' }}
                        >
                          🚀 Publish Produce to Marketplace
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              );
            })()}

            {/* ════ FARMERS REGISTRY ════ */}
            {activeTab==='directory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>👥 Registered Farmers Directory</h2>
                    <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.2rem' }}>Connect with agricultural producers and buyers in the community.</p>
                  </div>
                  <input 
                    className="input" 
                    style={{ width: '320px', margin: 0 }} 
                    placeholder="🔍 Search by name, village, or state..." 
                    value={directorySearch}
                    onChange={e => setDirectorySearch(e.target.value)}
                  />
                </div>

                <div className="directory-grid">
                  {(() => {
                    const searchLower = directorySearch.toLowerCase();
                    const filteredFarmers = registeredFarmers.filter(f => 
                      (f.name || '').toLowerCase().includes(searchLower) ||
                      (f.state || '').toLowerCase().includes(searchLower) ||
                      (f.district || '').toLowerCase().includes(searchLower) ||
                      (f.mandal || '').toLowerCase().includes(searchLower)
                    );

                    const displayFarmers = [...filteredFarmers];
                    if (user && !displayFarmers.some(f => f.phone === user.phone)) {
                      displayFarmers.push({
                        name: user.name || "You (Farmer)",
                        phone: user.phone || "",
                        email: user.email || "",
                        state: selState,
                        district: selDistrict,
                        mandal: selMandal,
                        isOnline: true,
                        isCurrentUser: true
                      });
                    }

                    if (displayFarmers.length === 0) {
                      return (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                          <span style={{ fontSize: '3rem' }}>👥</span>
                          <p style={{ color: '#888', marginTop: '1rem' }}>No farmers match your search query.</p>
                        </div>
                      );
                    }

                    return displayFarmers.map((f, idx) => (
                      <div key={idx} className="farmer-card" style={{ borderLeft: f.isCurrentUser ? '4px solid #2563eb' : '1px solid #2a2a2a' }}>
                        <div className="avatar-circle" style={{ background: f.isCurrentUser ? '#1d4ed8' : '#22c55e' }}>
                          {(f.name || 'F').charAt(0).toUpperCase()}
                          <div className="online-dot" style={{ background: f.isOnline ? '#22c55e' : '#888' }}></div>
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{f.name}</span>
                            {f.isCurrentUser && <span style={{ background: '#2563eb', fontSize: '0.62rem', padding: '0.1rem 0.35rem', borderRadius: 4, fontWeight: 700 }}>YOU</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>
                            📍 {f.mandal || 'Village'}, {f.district}, {f.state}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.4rem', fontWeight: 600 }}>
                            📞 +91 {f.phone || '99999 99999'}
                          </div>
                        </div>
                        {!f.isCurrentUser && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <a href={`tel:${f.phone}`} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem' }}>Call</a>
                            <a href={`https://wa.me/91${f.phone}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', background: '#16a34a' }}>Chat</a>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* ════ OVERVIEW HOME ════ */}
            {activeTab==='overview' && (() => {
              const t = I18N[lang] || I18N.en;
              const weatherDecisions = calculateWeatherDecisions(weather);
              const hour = new Date().getHours();
              const greeting = hour < 5 ? '🌙 Good Night' : hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : hour < 21 ? '🌆 Good Evening' : '🌙 Good Night';
              const topCrops = [
                { emoji:'🍅', name:'Tomato', price: livePrices['Tomato'] || 28, trend:'up', pct: '+4.2' },
                { emoji:'🌾', name:'Paddy', price: livePrices['Paddy (Rice)'] || 2250, trend:'up', pct: '+1.8' },
                { emoji:'🌶️', name:'Red Chilli', price: livePrices['Red Chilli (Dry)'] || 180, trend:'down', pct: '-2.1' },
                { emoji:'🧅', name:'Onion', price: livePrices['Onion'] || 22, trend:'up', pct: '+6.5' },
                { emoji:'🌿', name:'Turmeric', price: livePrices['Turmeric (Haldi)'] || 95, trend:'up', pct: '+3.3' },
                { emoji:'🌻', name:'Sunflower', price: livePrices['Sunflower'] || 5800, trend:'down', pct: '-1.4' },
              ];
              
              return (
                <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>

                  {/* ── HERO BANNER ─────────────────────────────────── */}
                  <div style={{
                    background:'linear-gradient(135deg,#0a1f0a 0%,#0d2b1a 40%,#111827 100%)',
                    borderRadius:20,
                    padding:'0',
                    overflow:'hidden',
                    border:'1px solid rgba(34,197,94,0.25)',
                    position:'relative',
                    minHeight:220,
                    display:'flex',
                    flexDirection:'column',
                    justifyContent:'flex-end'
                  }}>
                    {/* Animated background blobs */}
                    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
                      <div style={{position:'absolute',top:'-60px',right:'-60px',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(34,197,94,0.15) 0%,transparent 70%)'}} />
                      <div style={{position:'absolute',bottom:'-40px',left:'-40px',width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)'}} />
                      <div style={{position:'absolute',top:'30%',left:'40%',width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(168,85,247,0.08) 0%,transparent 70%)'}} />
                      {/* Grid pattern overlay */}
                      <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />
                    </div>

                    {/* Top badge row */}
                    <div style={{position:'relative',padding:'1.5rem 1.75rem 0',display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'0.5rem'}}>
                      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                        <span style={{background:'rgba(34,197,94,0.2)',border:'1px solid rgba(34,197,94,0.4)',borderRadius:20,padding:'0.2rem 0.65rem',fontSize:'0.68rem',fontWeight:700,color:'#4ade80',letterSpacing:'0.04em'}}>
                          🌱 AI FARM PLATFORM
                        </span>
                        {liveWeather?.isLive && (
                          <span style={{background:'rgba(37,99,235,0.2)',border:'1px solid rgba(37,99,235,0.4)',borderRadius:20,padding:'0.2rem 0.65rem',fontSize:'0.68rem',fontWeight:700,color:'#60a5fa'}}>
                            ● LIVE WEATHER
                          </span>
                        )}
                      </div>
                      {/* Live weather mini badge */}
                      <div style={{background:'rgba(0,0,0,0.5)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'0.4rem 0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <span style={{fontSize:'1.1rem'}}>{weather.conditionIcon || '🌤'}</span>
                        <div>
                          <div style={{fontSize:'0.9rem',fontWeight:800,color:'#fff',lineHeight:1}}>{weather.temp || '--'}</div>
                          <div style={{fontSize:'0.6rem',color:'#9ca3af'}}>{selDistrict}</div>
                        </div>
                      </div>
                    </div>

                    {/* Main hero content */}
                    <div style={{position:'relative',padding:'1rem 1.75rem 1.75rem'}}>
                      <div style={{fontSize:'0.78rem',fontWeight:600,color:'#86efac',marginBottom:'0.3rem'}}>{greeting}, {user?.name?.split(' ')[0] || 'Farmer'} 👋</div>
                      <h1 style={{fontSize:'clamp(1.4rem,4vw,2.1rem)',fontWeight:900,color:'#fff',lineHeight:1.15,marginBottom:'0.5rem',letterSpacing:'-0.02em'}}>
                        {t.title}
                      </h1>
                      <p style={{fontSize:'0.85rem',color:'#9ca3af',maxWidth:520,lineHeight:1.6,marginBottom:'1.25rem'}}>
                        📍 {selMandal}, {selDistrict}, {selState} · {weather.condition || 'Checking weather...'}
                      </p>

                      {/* CTA Buttons */}
                      <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                        <button
                          onClick={() => setActiveTab('advisor')}
                          style={{background:'linear-gradient(135deg,#16a34a,#15803d)',border:'none',color:'#fff',borderRadius:12,padding:'0.65rem 1.25rem',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',boxShadow:'0 4px 15px rgba(22,163,74,0.4)',transition:'all 0.2s'}}
                        >
                          🌱 Get Crop Advice
                        </button>
                        <button
                          onClick={() => setActiveTab('marketplace')}
                          style={{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.2)',color:'#fff',borderRadius:12,padding:'0.65rem 1.25rem',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem'}}
                        >
                          🛒 Shop Market
                        </button>
                        <button
                          onClick={() => setActiveTab('market')}
                          style={{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.2)',color:'#fff',borderRadius:12,padding:'0.65rem 1.25rem',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem'}}
                        >
                          📈 Live Prices
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── STAT PILL ROW ───────────────────────────────── */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem'}}>
                    {[
                      { icon:'🌡️', label:'Temp', val: weather.temp || '--', sub: weather.feelsLike ? `Feels ${weather.feelsLike}` : 'Live', color:'#f97316' },
                      { icon:'💧', label:'Humidity', val: weather.humidity || '--', sub: weather.cloudCover ? `Cloud ${weather.cloudCover}` : 'Live', color:'#38bdf8' },
                      { icon:'🌧', label:'Rain', val: weather.rain || '--', sub: weather.precipitation ? `${weather.precipitation}` : 'Forecast', color:'#818cf8' },
                      { icon:'💨', label:'Wind', val: weather.wind || '--', sub: weather.windGusts ? `Gusts ${weather.windGusts}` : 'Live', color:'#34d399' },
                    ].map(s => (
                      <div key={s.label} style={{background:'#111',border:'1px solid #1f1f1f',borderRadius:14,padding:'0.9rem 0.75rem',textAlign:'center',transition:'transform 0.15s',cursor:'default'}}>
                        <div style={{fontSize:'1.4rem',marginBottom:'0.2rem'}}>{s.icon}</div>
                        <div style={{fontSize:'1.1rem',fontWeight:800,color:s.color,lineHeight:1}}>{s.val}</div>
                        <div style={{fontSize:'0.65rem',color:'#9ca3af',marginTop:'0.2rem',fontWeight:600}}>{s.label}</div>
                        <div style={{fontSize:'0.6rem',color:'#4b5563',marginTop:'0.1rem'}}>{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── LIVE PRICE TICKER ────────────────────────────── */}
                  <div style={{background:'#0d1f0d',border:'1px solid rgba(34,197,94,0.2)',borderRadius:16,padding:'1rem 1.25rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
                      <span style={{fontSize:'0.82rem',fontWeight:800,color:'#fff',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:'#22c55e',display:'inline-block',boxShadow:'0 0 6px #22c55e'}}></span>
                        Live Mandi Rates
                      </span>
                      <button onClick={() => setActiveTab('market')} style={{background:'transparent',border:'1px solid #22c55e',color:'#22c55e',borderRadius:8,padding:'0.2rem 0.6rem',fontSize:'0.68rem',fontWeight:700,cursor:'pointer'}}>
                        View All →
                      </button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
                      {topCrops.map(c => (
                        <div key={c.name} style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:'0.6rem 0.75rem',border:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                          <span style={{fontSize:'1.3rem',flexShrink:0}}>{c.emoji}</span>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:'0.72rem',color:'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                            <div style={{display:'flex',alignItems:'center',gap:'0.3rem',marginTop:'0.1rem'}}>
                              <span style={{fontSize:'0.88rem',fontWeight:800,color:'#fff'}}>₹{c.price}</span>
                              <span style={{fontSize:'0.6rem',fontWeight:700,color: c.trend==='up'?'#22c55e':'#ef4444'}}>
                                {c.trend==='up'?'▲':'▼'}{c.pct}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── QUICK ACTION CARDS ───────────────────────────── */}
                  <div>
                    <div style={{fontSize:'0.78rem',fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.6rem'}}>⚡ Quick Actions</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.65rem'}}>
                      {[
                        { icon:'🌱', label:'AI Crop\nAdvisor', tab:'advisor', bg:'linear-gradient(145deg,#132a13,#0d1b12)', border:'#22c55e', glow:'rgba(34,197,94,0.2)' },
                        { icon:'🛒', label:'Buy &\nSell', tab:'marketplace', bg:'linear-gradient(145deg,#1e1b2e,#13111c)', border:'#8b5cf6', glow:'rgba(139,92,246,0.2)' },
                        { icon:'🔬', label:'Disease\nScanner', tab:'scanner', bg:'linear-gradient(145deg,#1a1f1e,#0f1917)', border:'#06b6d4', glow:'rgba(6,182,212,0.2)' },
                        { icon:'🤖', label:'Kisan\nAssistant', tab:'chat', bg:'linear-gradient(145deg,#1e1a2e,#0f0d1a)', border:'#3b82f6', glow:'rgba(59,130,246,0.2)' },
                        { icon:'📈', label:'Market\nPrices', tab:'market', bg:'linear-gradient(145deg,#1f1a0d,#120f06)', border:'#f59e0b', glow:'rgba(245,158,11,0.2)' },
                        { icon:'🏛️', label:'Gov\nSchemes', tab:'schemes', bg:'linear-gradient(145deg,#1a1414,#110d0d)', border:'#ef4444', glow:'rgba(239,68,68,0.2)' },
                        { icon:'💰', label:'Farm\nLedger', tab:'expenses', bg:'linear-gradient(145deg,#131a1f,#0c1117)', border:'#06b6d4', glow:'rgba(6,182,212,0.2)' },
                        { icon:'👥', label:'Farmer\nDirectory', tab:'directory', bg:'linear-gradient(145deg,#161316,#0d0b0d)', border:'#ec4899', glow:'rgba(236,72,153,0.2)' },
                      ].map(a => (
                        <button key={a.tab} onClick={() => setActiveTab(a.tab)} style={{
                          background: a.bg,
                          border: `1px solid ${a.border}`,
                          borderRadius: 14,
                          padding: '0.9rem 0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: `0 0 20px ${a.glow}`,
                          transition: 'transform 0.15s, box-shadow 0.15s',
                          textAlign: 'center',
                        }}>
                          <span style={{fontSize:'1.6rem'}}>{a.icon}</span>
                          <span style={{fontSize:'0.65rem',fontWeight:700,color:'#e2e8f0',whiteSpace:'pre-line',lineHeight:1.3}}>{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── FARM ADVISORY CARDS ───────────────────────────── */}
                  <div>
                    <div style={{fontSize:'0.78rem',fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'0.6rem'}}>🌾 Today's Farm Advisory</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem'}}>
                      {[
                        { label:'Irrigation', icon: weatherDecisions.irrigation.icon, action: weatherDecisions.irrigation.action, badge: weatherDecisions.irrigation.badge, detail: weatherDecisions.irrigation.detail, color: weatherDecisions.irrigation.color },
                        { label:'Field Work', icon: weatherDecisions.fieldWork.icon, action: weatherDecisions.fieldWork.action, badge: weatherDecisions.fieldWork.badge, detail: weatherDecisions.fieldWork.detail, color: weatherDecisions.fieldWork.color },
                        { label:'Disease Risk', icon: weatherDecisions.diseaseRisk.icon, action: weatherDecisions.diseaseRisk.action, badge: weatherDecisions.diseaseRisk.badge, detail: weatherDecisions.diseaseRisk.detail, color: weatherDecisions.diseaseRisk.color },
                      ].map(d => (
                        <div key={d.label} style={{background:'#111',border:`1px solid #1f1f1f`,borderLeft:`3px solid ${d.color}`,borderRadius:14,padding:'0.9rem 1rem'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem'}}>
                            <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.06em'}}>{d.label}</span>
                            <span style={{fontSize:'0.6rem',fontWeight:700,color:d.color,background:'rgba(255,255,255,0.05)',padding:'0.1rem 0.4rem',borderRadius:4}}>{d.badge}</span>
                          </div>
                          <div style={{fontSize:'0.9rem',fontWeight:800,color:'#fff',display:'flex',alignItems:'center',gap:'0.35rem',marginBottom:'0.3rem'}}>
                            {d.icon} {d.action}
                          </div>
                          <div style={{fontSize:'0.72rem',color:'#6b7280',lineHeight:1.4}}>{d.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── 7-DAY FORECAST ───────────────────────────────── */}
                  <div style={{background:'#0a0a0a',border:'1px solid #1f1f1f',borderRadius:16,padding:'1rem 1.25rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
                      <span style={{fontSize:'0.82rem',fontWeight:800,color:'#fff'}}>📅 7-Day Forecast</span>
                      <span style={{fontSize:'0.65rem',color:'#4b5563'}}>Updated {weather.lastUpdated || 'just now'}</span>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'0.35rem'}}>
                      {(weather.forecast||[]).map((f,i) => (
                        <div key={i} style={{
                          textAlign:'center',
                          background: i===0 ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${i===0?'rgba(34,197,94,0.3)':'rgba(255,255,255,0.05)'}`,
                          borderRadius:10,
                          padding:'0.5rem 0.2rem'
                        }}>
                          <div style={{fontSize:'0.6rem',fontWeight:700,color: i===0?'#22c55e':'#9ca3af'}}>{i===0?'Today':f.day}</div>
                          {f.date && <div style={{fontSize:'0.5rem',color:'#374151'}}>{f.date}</div>}
                          <div style={{fontSize:'1.1rem',margin:'0.3rem 0'}}>{f.icon}</div>
                          <div style={{fontSize:'0.68rem',fontWeight:700,color:'#f87171'}}>{f.high}°</div>
                          <div style={{fontSize:'0.6rem',color:'#60a5fa'}}>{f.low}°</div>
                          {f.rainChance !== undefined && (
                            <div style={{fontSize:'0.5rem',color:'#818cf8',marginTop:'0.15rem'}}>🌧{f.rainChance}%</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── SOIL + MANDI GRID ─────────────────────────────── */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>

                    {/* Soil Health */}
                    <div style={{background:'#0a0a0a',border:'1px solid #1f1f1f',borderRadius:16,padding:'1rem 1.25rem'}}>
                      <div style={{fontSize:'0.82rem',fontWeight:800,color:'#fff',marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                        🧪 Soil Health Status
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                        {[
                          { name:'Nitrogen (N)', val:'75 kg/ha', pct:75, color:'#22c55e' },
                          { name:'Phosphorus (P)', val:'35 kg/ha', pct:45, color:'#f59e0b' },
                          { name:'Potassium (K)', val:'45 kg/ha', pct:60, color:'#22c55e' },
                          { name:'Soil pH', val:'6.8 pH', pct:80, color:'#3b82f6' },
                        ].map(s => (
                          <div key={s.name}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.2rem'}}>
                              <span style={{fontSize:'0.72rem',color:'#9ca3af'}}>{s.name}</span>
                              <span style={{fontSize:'0.72rem',fontWeight:700,color:s.color}}>{s.val}</span>
                            </div>
                            <div style={{height:5,background:'rgba(255,255,255,0.07)',borderRadius:999}}>
                              <div style={{height:'100%',width:`${s.pct}%`,background:s.color,borderRadius:999,transition:'width 1s ease'}} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trending Mandi */}
                    <div style={{background:'#0a0a0a',border:'1px solid #1f1f1f',borderRadius:16,padding:'1rem 1.25rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
                        <span style={{fontSize:'0.82rem',fontWeight:800,color:'#fff'}}>📊 Mandi Highlights</span>
                        <span style={{fontSize:'0.6rem',color:'#4b5563'}}>e-NAM</span>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'0.45rem'}}>
                        {['Paddy (Rice)','Cotton (Long Staple)','Tomato','Onion','Red Chilli (Dry)','Turmeric (Haldi)'].map(crop => {
                          const price = livePrices[crop]||BASE_PRICES[crop]||20;
                          const base = BASE_PRICES[crop]||20;
                          const pct = (((price-base)/base)*100).toFixed(1);
                          const isUp = priceTrend[crop]!=='down';
                          return (
                            <div key={crop} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.3rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                              <span style={{fontSize:'0.72rem',color:'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'60%'}}>{crop}</span>
                              <div style={{display:'flex',alignItems:'center',gap:'0.4rem',flexShrink:0}}>
                                <span style={{fontSize:'0.82rem',fontWeight:800,color:'#fff'}}>₹{price.toFixed(0)}</span>
                                <span style={{fontSize:'0.62rem',fontWeight:700,color:isUp?'#22c55e':'#ef4444'}}>{isUp?'▲':'▼'}{Math.abs(pct)}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── FEATURED PRODUCTS STRIP ──────────────────────── */}
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.6rem'}}>
                      <span style={{fontSize:'0.78rem',fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.08em'}}>🛒 Hot Deals</span>
                      <button onClick={() => setActiveTab('marketplace')} style={{background:'transparent',border:'none',color:'#22c55e',fontSize:'0.72rem',fontWeight:700,cursor:'pointer'}}>View All →</button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.65rem'}}>
                      {[...STARTER_LISTINGS].slice(0,4).map(p => {
                        const disc = p.mrp ? Math.round(((p.mrp - p.price)/p.mrp)*100) : 0;
                        return (
                          <div key={p.id} onClick={() => setActiveTab('marketplace')} style={{background:'#111',border:'1px solid #1f1f1f',borderRadius:14,overflow:'hidden',cursor:'pointer',transition:'transform 0.15s'}}>
                            <div style={{height:100,overflow:'hidden',position:'relative'}}>
                              <img src={p.image} alt={p.title} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none'}} />
                              {disc > 0 && <span style={{position:'absolute',top:6,left:6,background:'#dc2626',color:'#fff',fontSize:'0.58rem',fontWeight:800,borderRadius:4,padding:'0.1rem 0.3rem'}}>{disc}% OFF</span>}
                            </div>
                            <div style={{padding:'0.6rem 0.65rem'}}>
                              <div style={{fontSize:'0.72rem',color:'#e2e8f0',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</div>
                              <div style={{display:'flex',alignItems:'center',gap:'0.3rem',marginTop:'0.25rem'}}>
                                <span style={{fontSize:'0.82rem',fontWeight:800,color:'#22c55e'}}>₹{p.price}</span>
                                {p.mrp && <span style={{fontSize:'0.62rem',color:'#6b7280',textDecoration:'line-through'}}>₹{p.mrp}</span>}
                              </div>
                              <div style={{fontSize:'0.6rem',color:'#f59e0b',marginTop:'0.15rem'}}>{'⭐'.repeat(Math.floor(p.rating||4))} {p.rating||4.5}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── FARMER PROFILE CARD ──────────────────────────── */}
                  <div style={{background:'linear-gradient(135deg,#0a1628,#0d1f0d)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'1.1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                      <div style={{width:50,height:50,borderRadius:'50%',background:'linear-gradient(135deg,#16a34a,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',fontWeight:900,color:'#fff',flexShrink:0}}>
                        {(user?.name||'F').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:'1rem',fontWeight:800,color:'#fff'}}>{user?.name||'Farmer'}</div>
                        <div style={{fontSize:'0.72rem',color:'#60a5fa',marginTop:'0.1rem'}}>📍 {selMandal}, {selDistrict}, {selState}</div>
                        <div style={{fontSize:'0.65rem',color:'#9ca3af',marginTop:'0.1rem'}}>Member since {user?.joinedAt ? new Date(user.joinedAt).getFullYear() : '2026'}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <button onClick={() => setActiveTab('marketplace')} style={{background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',color:'#4ade80',borderRadius:10,padding:'0.4rem 0.75rem',fontSize:'0.72rem',fontWeight:700,cursor:'pointer'}}>
                        🛒 Buy
                      </button>
                      <button onClick={() => setActiveTab('marketplace')} style={{background:'rgba(37,99,235,0.15)',border:'1px solid rgba(37,99,235,0.3)',color:'#60a5fa',borderRadius:10,padding:'0.4rem 0.75rem',fontSize:'0.72rem',fontWeight:700,cursor:'pointer'}}>
                        💼 Sell
                      </button>
                    </div>
                  </div>

                </div>
              );
            })()}


            {/* ════ AI CROP ADVISOR (5-STEP AGRI DECISION PLATFORM) ════ */}
            {activeTab==='advisor' && (() => {
              const t = I18N[lang] || I18N.en;
              const activeRec = cropRecommendations ? cropRecommendations[selectedCropRank] : null;

              return (
                <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                  {/* Step Progress Header */}
                  <div className="card" style={{padding:'1rem 1.5rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'.5rem',marginBottom:'.75rem'}}>
                      <div>
                        <h2 style={{fontSize:'1.2rem',fontWeight:800,color:'#fff'}}>🌱 AI Farm Setup & Crop Recommendation</h2>
                        <p style={{fontSize:'.8rem',color:'#888',marginTop:'.2rem'}}>
                          Enter your exact farm, soil, and weather variables to compute Top 3 crops with Suitability Scores and Farm Action Plans.
                        </p>
                      </div>
                      <span style={{fontSize:'.75rem',background:'rgba(34,197,94,0.15)',color:'#4ade80',padding:'.3rem .75rem',borderRadius:20,fontWeight:700}}>
                        Step {cropStep} of 5
                      </span>
                    </div>

                    {/* Step Tabs */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(5, 1fr)',gap:'.5rem'}}>
                      {[
                        { num: 1, label: t.stepLocation },
                        { num: 2, label: t.stepFarm },
                        { num: 3, label: t.stepSoil },
                        { num: 4, label: t.stepSeason },
                        { num: 5, label: t.stepPlan },
                      ].map(s => (
                        <button
                          key={s.num}
                          onClick={() => {
                            if (s.num === 5 && !cropRecommendations) handleRecommendCrop();
                            else setCropStep(s.num);
                          }}
                          style={{
                            background: cropStep === s.num ? '#16a34a' : cropStep > s.num ? '#1f2937' : '#111827',
                            color: cropStep === s.num ? '#fff' : cropStep > s.num ? '#86efac' : '#6b7280',
                            border: `1px solid ${cropStep === s.num ? '#22c55e' : '#374151'}`,
                            borderRadius: 8,
                            padding: '.5rem .25rem',
                            fontSize: '.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 1: Location */}
                  {cropStep === 1 && (
                    <div className="card" style={{maxWidth:650,margin:'0 auto',width:'100%'}}>
                      <h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#fff',marginBottom:'.5rem'}}>📍 Step 1 — Verify Location</h3>
                      <p style={{fontSize:'.8rem',color:'#888',marginBottom:'1.25rem'}}>Agro-climatic zones, rainfall norms, and mandi pricing are mapped to your location.</p>
                      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                        <div>
                          <label className="fld">State</label>
                          <select className="input" value={selState} onChange={e=>handleStateChange(e.target.value)}>
                            {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                          <div>
                            <label className="fld">District</label>
                            <select className="input" value={selDistrict} onChange={e=>handleDistrictChange(e.target.value)}>
                              {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="fld">Mandal / Village</label>
                            <select className="input" value={selMandal} onChange={e=>setSelMandal(e.target.value)}>
                              {mandals.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{display:'flex',justifyContent:'flex-end',marginTop:'.5rem'}}>
                          <button className="btn btn-primary" onClick={() => setCropStep(2)}>
                            {t.next}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Farm Details */}
                  {cropStep === 2 && (
                    <div className="card" style={{maxWidth:650,margin:'0 auto',width:'100%'}}>
                      <h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#fff',marginBottom:'.5rem'}}>🌾 Step 2 — Farm Specifics</h3>
                      <p style={{fontSize:'.8rem',color:'#888',marginBottom:'1.25rem'}}>Farm size, irrigation facilities, and previous crop rotation dictate agronomic success.</p>
                      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                        <div>
                          <label className="fld">Farm Area (Acres)</label>
                          <input className="input" type="number" step="0.5" min="0.5" value={farmSetup.farmSize} onChange={e => setFarmSetup(p=>({...p, farmSize: e.target.value}))} />
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                          <div>
                            <label className="fld">Irrigation Source</label>
                            <select className="input" value={farmSetup.irrigation} onChange={e => setFarmSetup(p=>({...p, irrigation: e.target.value}))}>
                              <option value="Drip Irrigation">Drip Irrigation (Micro)</option>
                              <option value="Borewell + Sprinkler">Borewell + Sprinkler</option>
                              <option value="Canal / Flood">Canal / River Flood</option>
                              <option value="Rainfed">Rainfed (Monsoon Only)</option>
                            </select>
                          </div>
                          <div>
                            <label className="fld">Previous Cultivated Crop</label>
                            <select className="input" value={farmSetup.prevCrop} onChange={e => setFarmSetup(p=>({...p, prevCrop: e.target.value}))}>
                              <option value="Legumes / Pulses">Legumes / Pulses (Nitrogen fixing)</option>
                              <option value="Paddy (Rice)">Paddy (Rice)</option>
                              <option value="Cotton">Cotton</option>
                              <option value="Maize">Maize</option>
                              <option value="Vegetables">Vegetables</option>
                              <option value="Fallow / New Land">Fallow / New Land</option>
                            </select>
                          </div>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',marginTop:'.5rem'}}>
                          <button className="btn btn-outline" onClick={() => setCropStep(1)}>{t.back}</button>
                          <button className="btn btn-primary" onClick={() => setCropStep(3)}>{t.next}</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Soil Health */}
                  {cropStep === 3 && (
                    <div className="card" style={{maxWidth:650,margin:'0 auto',width:'100%'}}>
                      <h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#fff',marginBottom:'.5rem'}}>🧪 Step 3 — Soil Nutrients & pH</h3>
                      <p style={{fontSize:'.8rem',color:'#888',marginBottom:'1.25rem'}}>Enter your Soil Health Card values (or use local averages).</p>
                      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                        <div>
                          <label className="fld">Soil Type</label>
                          <select className="input" value={farmSetup.soilType} onChange={e => setFarmSetup(p=>({...p, soilType: e.target.value}))}>
                            <option value="Black Cotton">Black Cotton Soil (Regur)</option>
                            <option value="Red Loamy">Red Loamy Soil</option>
                            <option value="Alluvial">Alluvial Soil</option>
                            <option value="Clay">Clay Soil</option>
                            <option value="Sandy Loam">Sandy Loam Soil</option>
                          </select>
                        </div>

                        <div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem',color:'#ccc',marginBottom:'.3rem'}}>
                            <span>Nitrogen (N): <strong>{farmSetup.nitrogen} kg/ha</strong></span>
                            <span style={{color:'#888'}}>Scale: 20–140</span>
                          </div>
                          <input type="range" min="20" max="140" value={farmSetup.nitrogen} onChange={e => setFarmSetup(p=>({...p, nitrogen: parseInt(e.target.value)}))} style={{width:'100%',accentColor:'#22c55e'}} />
                        </div>

                        <div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem',color:'#ccc',marginBottom:'.3rem'}}>
                            <span>Phosphorus (P): <strong>{farmSetup.phosphorus} kg/ha</strong></span>
                            <span style={{color:'#888'}}>Scale: 10–90</span>
                          </div>
                          <input type="range" min="10" max="90" value={farmSetup.phosphorus} onChange={e => setFarmSetup(p=>({...p, phosphorus: parseInt(e.target.value)}))} style={{width:'100%',accentColor:'#f59e0b'}} />
                        </div>

                        <div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem',color:'#ccc',marginBottom:'.3rem'}}>
                            <span>Potassium (K): <strong>{farmSetup.potassium} kg/ha</strong></span>
                            <span style={{color:'#888'}}>Scale: 10–100</span>
                          </div>
                          <input type="range" min="10" max="100" value={farmSetup.potassium} onChange={e => setFarmSetup(p=>({...p, potassium: parseInt(e.target.value)}))} style={{width:'100%',accentColor:'#3b82f6'}} />
                        </div>

                        <div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem',color:'#ccc',marginBottom:'.3rem'}}>
                            <span>Soil pH Level: <strong>{farmSetup.ph} pH</strong></span>
                            <span style={{color:'#888'}}>Scale: 4.5–8.5</span>
                          </div>
                          <input type="range" min="4.5" max="8.5" step="0.1" value={farmSetup.ph} onChange={e => setFarmSetup(p=>({...p, ph: parseFloat(e.target.value)}))} style={{width:'100%',accentColor:'#a855f7'}} />
                        </div>

                        <div style={{display:'flex',justifyContent:'space-between',marginTop:'.5rem'}}>
                          <button className="btn btn-outline" onClick={() => setCropStep(2)}>{t.back}</button>
                          <button className="btn btn-primary" onClick={() => setCropStep(4)}>{t.next}</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Season */}
                  {cropStep === 4 && (
                    <div className="card" style={{maxWidth:650,margin:'0 auto',width:'100%'}}>
                      <h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#fff',marginBottom:'.5rem'}}>📅 Step 4 — Cropping Season</h3>
                      <p style={{fontSize:'.8rem',color:'#888',marginBottom:'1.25rem'}}>Select your upcoming planting period.</p>
                      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.75rem'}}>
                          {[
                            { id: 'Kharif', label: 'Kharif (Monsoon)', sub: 'June – October', icon: '🌧️' },
                            { id: 'Rabi', label: 'Rabi (Winter)', sub: 'October – March', icon: '❄️' },
                            { id: 'Zaid', label: 'Zaid (Summer)', sub: 'March – June', icon: '☀️' },
                          ].map(s => (
                            <div
                              key={s.id}
                              onClick={() => setFarmSetup(p=>({...p, season: s.id}))}
                              style={{
                                background: farmSetup.season === s.id ? '#1e3a29' : '#1f1f1f',
                                border: `2px solid ${farmSetup.season === s.id ? '#22c55e' : '#2a2a2a'}`,
                                borderRadius: 10,
                                padding: '1rem .75rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{fontSize:'1.5rem',marginBottom:'.3rem'}}>{s.icon}</div>
                              <div style={{fontSize:'.85rem',fontWeight:700,color:'#fff'}}>{s.label}</div>
                              <div style={{fontSize:'.7rem',color:'#888',marginTop:'.2rem'}}>{s.sub}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{display:'flex',justifyContent:'space-between',marginTop:'1rem'}}>
                          <button className="btn btn-outline" onClick={() => setCropStep(3)}>{t.back}</button>
                          <button className="btn btn-primary" style={{padding:'.75rem 1.5rem',fontSize:'.95rem',fontWeight:800}} onClick={handleRecommendCrop}>
                            {t.generatePlan}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: AI Recommendations Output */}
                  {cropStep === 5 && (
                    <div>
                      {!cropRecommendations ? (
                        <div className="card" style={{textAlign:'center',padding:'3rem'}}>
                          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🌱</div>
                          <p style={{color:'#888'}}>Generating multi-criteria agronomic plan...</p>
                          <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={handleRecommendCrop}>{t.generatePlan}</button>
                        </div>
                      ) : (
                        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
                          {/* Top 3 Crop Cards Selector */}
                          <div>
                            <div style={{fontSize:'.85rem',fontWeight:700,color:'#888',marginBottom:'.5rem',textTransform:'uppercase'}}>
                              🏆 Top 3 Recommended Crops by Suitability Score
                            </div>
                            <div className="grid3">
                              {cropRecommendations.map((crop, idx) => (
                                <div
                                  key={crop.name}
                                  onClick={() => setSelectedCropRank(idx)}
                                  className="card"
                                  style={{
                                    border: selectedCropRank === idx ? '2px solid #22c55e' : '1px solid #2a2a2a',
                                    background: selectedCropRank === idx ? 'linear-gradient(145deg, #122b1c 0%, #0d1e14 100%)' : '#1a1a1a',
                                    cursor: 'pointer',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '.5rem',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                    <span style={{fontSize:'.75rem',fontWeight:800,color:idx===0?'#4ade80':idx===1?'#60a5fa':'#facc15'}}>{crop.rank}</span>
                                    <span style={{fontSize:'.72rem',background:'rgba(255,255,255,0.08)',padding:'.15rem .45rem',borderRadius:4,color:'#aaa'}}>{crop.category}</span>
                                  </div>
                                  <div style={{fontSize:'1.3rem',fontWeight:800,color:'#fff',display:'flex',alignItems:'center',gap:'.4rem'}}>
                                    <span>{crop.icon}</span> {crop.name}
                                  </div>
                                  <div style={{display:'flex',alignItems:'baseline',gap:'.4rem',marginTop:'.3rem'}}>
                                    <span style={{fontSize:'1.5rem',fontWeight:800,color:'#22c55e'}}>{crop.suitabilityScore}%</span>
                                    <span style={{fontSize:'.75rem',color:'#888',fontWeight:600}}>{t.suitabilityScore}</span>
                                  </div>
                                  <div style={{fontSize:'.75rem',color:'#94a3b8',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'.4rem'}}>
                                    Est. Net: <strong style={{color:'#f1f1f1'}}>{crop.totalEstProfit}</strong> ({crop.estProfitPerAcre}/acre)
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Active Crop Detailed Plan */}
                          {activeRec && (
                            <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
                              {/* 🧠 Explainable AI Panel */}
                              <div className="card" style={{borderLeft:'4px solid #3b82f6'}}>
                                <div className="section-title" style={{color:'#60a5fa'}}>
                                  {t.whyAiRecommended} ({activeRec.name})
                                </div>
                                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'.75rem'}}>
                                  {activeRec.whyExplanation.map((why, i) => (
                                    <div key={i} style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem .9rem',border:'1px solid #2a2a2a'}}>
                                      <div style={{display:'flex',alignItems:'center',gap:'.4rem',marginBottom:'.2rem'}}>
                                        <span style={{color:why.icon==='✓'?'#22c55e':'#f59e0b',fontWeight:800}}>{why.icon}</span>
                                        <span style={{fontSize:'.82rem',fontWeight:700,color:'#fff'}}>{why.title}</span>
                                      </div>
                                      <div style={{fontSize:'.75rem',color:'#aaa',lineHeight:1.45}}>{why.detail}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 📋 Complete Farm Action Plan */}
                              <div className="grid2">
                                {/* Left Column: Sowing & Fertilizer */}
                                <div className="card">
                                  <div className="section-title">🌾 Sowing & Precision Fertilizer Schedule</div>
                                  <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
                                    <div style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                                      <div style={{fontSize:'.72rem',color:'#888',textTransform:'uppercase',fontWeight:700}}>Sowing Window & Seed Rate</div>
                                      <div style={{fontSize:'.85rem',fontWeight:700,color:'#4ade80',marginTop:'.2rem'}}>📅 {activeRec.sowingWindow}</div>
                                      <div style={{fontSize:'.78rem',color:'#ccc',marginTop:'.2rem'}}>🌱 Seed Rate: {activeRec.seedRate}</div>
                                      <div style={{fontSize:'.78rem',color:'#ccc',marginTop:'.2rem'}}>📦 Expected Yield: {activeRec.yieldRange}</div>
                                    </div>

                                    {activeRec.fertilizerStages.map((st, i) => (
                                      <div key={i} style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                                        <div style={{fontSize:'.78rem',fontWeight:700,color:'#60a5fa'}}>{st.stage}</div>
                                        <div style={{fontSize:'.78rem',color:'#aaa',marginTop:'.2rem',lineHeight:1.45}}>{st.desc}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Right Column: Irrigation & Disease Risks */}
                                <div className="card">
                                  <div className="section-title">💧 Water & Disease Management</div>
                                  <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
                                    <div style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                                      <div style={{fontSize:'.72rem',color:'#888',textTransform:'uppercase',fontWeight:700}}>Irrigation Protocol ({activeRec.irrigationPlan.method})</div>
                                      <div style={{fontSize:'.82rem',color:'#60a5fa',marginTop:'.2rem',fontWeight:600}}>💧 Total Need: {activeRec.irrigationPlan.requirement}</div>
                                      <div style={{fontSize:'.78rem',color:'#aaa',marginTop:'.2rem'}}>{activeRec.irrigationPlan.stages}</div>
                                      <div style={{fontSize:'.78rem',color:'#4ade80',marginTop:'.2rem'}}>{activeRec.irrigationPlan.schedule}</div>
                                    </div>

                                    <div style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                                      <div style={{fontSize:'.72rem',color:'#888',textTransform:'uppercase',fontWeight:700}}>Disease Threats & Prevention</div>
                                      {activeRec.diseaseRisks.map((d, i) => (
                                        <div key={i} style={{fontSize:'.78rem',color:'#fca5a5',marginTop:'.3rem',lineHeight:1.4}}>
                                          • {d}
                                        </div>
                                      ))}
                                    </div>

                                    {/* 🛒 Link to Marketplace Inputs */}
                                    <div style={{background:'rgba(34,197,94,0.08)',borderRadius:8,padding:'.75rem',border:'1px solid rgba(34,197,94,0.2)'}}>
                                      <div style={{fontSize:'.75rem',fontWeight:700,color:'#4ade80',marginBottom:'.4rem'}}>
                                        🛒 Required Farming Inputs (In Agri Store)
                                      </div>
                                      <div style={{display:'flex',gap:'.4rem',flexWrap:'wrap'}}>
                                        {activeRec.matchingInputs.map(inp => (
                                          <span key={inp} style={{background:'#1a1a1a',color:'#f1f1f1',fontSize:'.72rem',padding:'.2rem .5rem',borderRadius:4,border:'1px solid #333'}}>
                                            {inp}
                                          </span>
                                        ))}
                                      </div>
                                      <button 
                                        className="btn btn-primary" 
                                        style={{width:'100%',marginTop:'.65rem',fontSize:'.8rem',padding:'.45rem'}}
                                        onClick={() => {
                                          setActiveTab('marketplace');
                                          setMarketSearchInput(activeRec.name.split(' ')[0]);
                                        }}
                                      >
                                        🛍️ View & Buy Inputs in Marketplace →
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Agricultural Expert Disclaimer */}
                              <div style={{background:'#181818',border:'1px solid #2a2a2a',borderRadius:8,padding:'.75rem 1rem',fontSize:'.75rem',color:'#888',lineHeight:1.5}}>
                                {t.disclaimer}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ════ PLANT HEALTH SCANNER ════ */}
            {activeTab==='scanner' && (() => {
              const currentReport = diseaseReport || PLANT_DISEASES_DB[scanCropType];

              return (
                <div className="grid2">
                  {/* Left Column: Camera Upload & Scanner */}
                  <div className="card">
                    <div className="section-title">🔬 Plant Health & Leaf Scanner</div>
                    <p style={{fontSize:'.82rem',color:'#888',marginBottom:'1rem'}}>
                      Upload a photo of an affected leaf or choose a crop scenario to initiate AI automated agronomic scanning.
                    </p>

                    {/* Crop Target Presets */}
                    <div style={{display:'flex',gap:'.4rem',flexWrap:'wrap',marginBottom:'1rem'}}>
                      {[
                        { id:'tomato_blight', label:'🍅 Tomato Early Blight' },
                        { id:'rice_blast', label:'🌾 Rice Blast' },
                        { id:'cotton_blight', label:'☁️ Cotton Bacterial Blight' },
                        { id:'chilli_anthracnose', label:'🌶️ Chilli Anthracnose' },
                        { id:'healthy_leaf', label:'🌿 Healthy Leaf' },
                      ].map(s => (
                        <button
                          key={s.id}
                          className={`scan-btn${scanCropType===s.id?' active':''}`}
                          onClick={() => {
                            setScanCropType(s.id);
                            setUploadedScanImage(null);
                            setDiseaseReport(null);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {/* Camera Photo Upload Buttons */}
                    <div style={{display:'flex',gap:'.5rem',marginBottom:'1rem'}}>
                      <label className="btn btn-outline" style={{flex:1,cursor:'pointer',fontSize:'.8rem'}}>
                        📷 Take / Upload Leaf Photo
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoUpload} />
                      </label>
                      <button className="btn btn-primary" style={{flex:1,fontSize:'.8rem'}} onClick={triggerScan}>
                        ⚡ Run AI Diagnosis
                      </button>
                    </div>

                    {/* Viewport with Laser Animation */}
                    <div style={{
                      background: '#151515',
                      border: '2px dashed #333',
                      borderRadius: 12,
                      height: 260,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {uploadedScanImage || currentReport?.sampleImage ? (
                        <img
                          src={uploadedScanImage || currentReport?.sampleImage}
                          alt="Leaf Specimen"
                          style={{width:'100%',height:'100%',objectFit:'cover'}}
                        />
                      ) : (
                        <div style={{textAlign:'center',padding:'1rem'}}>
                          <div style={{fontSize:'3rem'}}>🍃</div>
                          <div style={{color:'#888',fontSize:'.8rem',marginTop:'.5rem'}}>Select specimen or upload photo</div>
                        </div>
                      )}

                      {/* Laser scanning beam */}
                      {isScanning && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(34,197,94,0.15)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{fontSize:'2.5rem',animation:'pulse 1s infinite'}}>🔬</div>
                          <div style={{color:'#22c55e',fontWeight:800,fontSize:'.9rem',marginTop:'.5rem'}}>
                            Analyzing Leaf Pathogens...
                          </div>
                          <div style={{
                            position: 'absolute',
                            height: 3,
                            background: 'linear-gradient(90deg, transparent, #22c55e, #4ade80, transparent)',
                            width: '100%',
                            left: 0,
                            animation: 'scanLine 1.5s linear infinite'
                          }}></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Diagnostic Report */}
                  <div className="card">
                    <div className="section-title">📋 Diagnostic Report & Treatment</div>

                    {currentReport ? (
                      <div style={{display:'flex',flexDirection:'column',gap:'.9rem',animation:'fadeIn .3s ease'}}>
                        {/* Header Box */}
                        <div style={{
                          background: currentReport.riskLevel === 'None' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                          border: `1px solid ${currentReport.riskLevel === 'None' ? '#22c55e' : '#ef4444'}`,
                          borderRadius: 10,
                          padding: '1rem',
                          textAlign: 'center'
                        }}>
                          <div style={{fontSize:'1.15rem',fontWeight:800,color:currentReport.riskColor}}>{currentReport.disease}</div>
                          <div style={{fontSize:'.8rem',color:'#888',marginTop:'.25rem'}}>
                            Confidence: <strong style={{color:'#f1f1f1'}}>{currentReport.confidence}</strong> | Risk Level: <strong style={{color:currentReport.riskColor}}>{currentReport.riskLevel}</strong>
                          </div>
                        </div>

                        {/* Symptoms Checklist */}
                        <div style={{background:'#1f1f1f',borderRadius:8,padding:'.85rem',border:'1px solid #2a2a2a'}}>
                          <div style={{fontSize:'.75rem',fontWeight:700,color:'#60a5fa',marginBottom:'.3rem',textTransform:'uppercase'}}>🔍 Diagnostic Symptoms</div>
                          {currentReport.symptoms.map((sym, i) => (
                            <div key={i} style={{fontSize:'.78rem',color:'#cbd5e1',marginTop:'.2rem',lineHeight:1.4}}>
                              • {sym}
                            </div>
                          ))}
                        </div>

                        {/* Immediate Steps */}
                        <div style={{background:'#1f1f1f',borderRadius:8,padding:'.85rem',border:'1px solid #2a2a2a'}}>
                          <div style={{fontSize:'.75rem',fontWeight:700,color:'#f59e0b',marginBottom:'.3rem',textTransform:'uppercase'}}>🚨 Immediate Action Steps</div>
                          {currentReport.immediateSteps.map((step, i) => (
                            <div key={i} style={{fontSize:'.78rem',color:'#e2e8f0',marginTop:'.25rem',lineHeight:1.4}}>
                              {step}
                            </div>
                          ))}
                        </div>

                        {/* Dual Treatment */}
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.6rem'}}>
                          <div style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                            <div style={{fontSize:'.72rem',fontWeight:700,color:'#4ade80',marginBottom:'.2rem'}}>🌿 Organic Treatment</div>
                            <div style={{fontSize:'.74rem',color:'#aaa',lineHeight:1.4}}>{currentReport.organicRemedy}</div>
                          </div>
                          <div style={{background:'#1f1f1f',borderRadius:8,padding:'.75rem',border:'1px solid #2a2a2a'}}>
                            <div style={{fontSize:'.72rem',fontWeight:700,color:'#f87171',marginBottom:'.2rem'}}>🧪 Chemical Remedy</div>
                            <div style={{fontSize:'.74rem',color:'#aaa',lineHeight:1.4}}>{currentReport.chemicalRemedy}</div>
                          </div>
                        </div>

                        {/* Buy Medicine in Store */}
                        {currentReport.marketplaceMatch && (
                          <button
                            className="btn btn-primary"
                            style={{width:'100%',padding:'.65rem',fontWeight:700,fontSize:'.85rem'}}
                            onClick={() => {
                              setActiveTab('marketplace');
                              setMarketSearchInput(currentReport.marketplaceMatch.split(' ')[0]);
                            }}
                          >
                            🛒 Buy {currentReport.marketplaceMatch} in Agri Store →
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{textAlign:'center',padding:'3rem',opacity:0.5}}>
                        <span style={{fontSize:'3rem'}}>🔬</span>
                        <p style={{color:'#888',fontSize:'.85rem',marginTop:'1rem'}}>Select specimen or upload photo to diagnose.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ════ MARKET & PRICES ════ */}
            {activeTab==='market' && (
              <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                <div className="grid2">
                  <div className="card">
                    <div className="section-title" style={{ justifyContent: 'space-between' }}>
                      <span>🚚 Best Mandi & Live Market — {marketCrop}</span>
                      <span style={{ fontSize: '.72rem', background: '#1e3a5f', color: '#60a5fa', padding: '.2rem .5rem', borderRadius: 6, fontWeight: 700 }}>
                        📍 From: {selState} (₹5/km delivery)
                      </span>
                    </div>
                    <div style={{display:'flex',gap:'.7rem',marginBottom:'1rem',flexWrap:'wrap'}}>
                      <div style={{flex:1}}>
                        <label className="fld">Commodity</label>
                        <select className="input" value={marketCrop} onChange={e=>setMarketCrop(e.target.value)}>
                          {ALL_CROPS.map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div style={{width:140}}>
                        <label className="fld">Extra Handling &#x20B9;/kg</label>
                        <input className="input" type="number" step="0.5" value={transportCost} onChange={e=>setTransportCost(e.target.value)} />
                      </div>
                    </div>
                    <div style={{maxHeight:360,overflowY:'auto',display:'flex',flexDirection:'column',gap:'.4rem'}}>
                      {mandiResult.details.map((m,i)=>(
                        <div key={m.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.65rem .9rem',borderRadius:8,background:i===0?'rgba(34,197,94,.08)':'#1f1f1f',border:i===0?'1px solid rgba(34,197,94,.3)':'1px solid #2a2a2a'}}>
                          <div>
                            <div style={{fontWeight:700,fontSize:'.88rem',color:'#f1f1f1',display:'flex',alignItems:'center',gap:'.4rem'}}>
                              <span>{m.flag} {m.name}</span>
                              {i===0 && <span style={{background:'#16a34a',color:'#fff',fontSize:'.62rem',padding:'.1rem .4rem',borderRadius:4,fontWeight:800}}>BEST PROFIT ⭐</span>}
                            </div>
                            <div style={{fontSize:'.74rem',color:'#888',marginTop:'.2rem',display:'flex',gap:'.6rem',flexWrap:'wrap',alignItems:'center'}}>
                              <span>{m.state}</span>
                              <span>·</span>
                              <span style={{color:'#60a5fa',fontWeight:600}}>📍 {m.distanceKm} km</span>
                              <span>·</span>
                              <span style={{color:'#fbbf24',fontWeight:600}}>🚚 Delivery (₹5/km): &#x20B9;{(m.deliveryFee || 0).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontWeight:800,fontSize:'1.05rem',color:'#22c55e'}}>&#x20B9;{m.net}/kg net</div>
                            <div style={{fontSize:'.72rem',color:'#888'}}>Mandi: &#x20B9;{m.price}/kg</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <div className="section-title">🧪 Farming Inputs — {inputsState}</div>
                    <div style={{marginBottom:'1rem'}}>
                      <label className="fld">State</label>
                      <select className="input" value={inputsState} onChange={e=>setInputsState(e.target.value)}>
                        {INPUT_STATE_MULTIPLIER && Object.keys(INPUT_STATE_MULTIPLIER).map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{maxHeight:290,overflowY:'auto',display:'flex',flexDirection:'column',gap:'.3rem'}}>
                      {COMMODITY_CATEGORIES['🧪 Farming Inputs']?.slice(0,14).map(item=>{
                        const base=BASE_PRICES[item]||100;
                        const stateP=+(base*(INPUT_STATE_MULTIPLIER?.[inputsState]||1)).toFixed(0);
                        const diff=stateP-base;
                        return (
                          <div key={item} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.5rem .7rem',borderRadius:7,background:'#1f1f1f',border:'1px solid #2a2a2a'}}>
                            <div>
                              <div style={{fontWeight:600,fontSize:'.8rem',color:'#f1f1f1'}}>{item}</div>
                              <div style={{fontSize:'.7rem',color:'#888'}}>Base: &#x20B9;{base}</div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontWeight:800,color:'#22c55e'}}>&#x20B9;{stateP}</div>
                              <div style={{fontSize:'.68rem',color:diff>0?'#ef4444':'#22c55e'}}>{diff>0?`+&#x20B9;${diff} costlier`:`&#x20B9;${Math.abs(diff)} cheaper`}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'1rem'}}>
                    <div className="section-title" style={{marginBottom:0}}>📋 Live Commodity Rate Sheet</div>
                    <input className="input" style={{width:260,margin:0}} placeholder="🔍 Search commodity…" value={marketSearch} onChange={e=>setMarketSearch(e.target.value)} />
                  </div>
                  <div style={{display:'flex',gap:'.4rem',overflowX:'auto',paddingBottom:'.5rem',marginBottom:'1rem'}}>
                    <button className={`tab-btn${marketCategory==='All'?' active':''}`} onClick={()=>setMarketCategory('All')}>All</button>
                    {Object.keys(COMMODITY_CATEGORIES).map(cat=>(
                      <button key={cat} className={`tab-btn${marketCategory===cat?' active':''}`} onClick={()=>setMarketCategory(cat)} style={{fontSize:'.75rem',padding:'.4rem .75rem'}}>{cat}</button>
                    ))}
                  </div>
                  <div style={{maxHeight:600,overflowY:'auto',borderRadius:10,border:'1px solid #222'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'.82rem'}}>
                      <thead style={{position:'sticky',top:0,background:'#111',zIndex:1}}>
                        <tr style={{color:'#888',fontWeight:600,fontSize:'.75rem',textTransform:'uppercase',letterSpacing:'.05em'}}>
                          <th style={{padding:'.7rem 1rem',textAlign:'left'}}>Commodity</th>
                          <th style={{padding:'.7rem',textAlign:'left'}}>Category</th>
                          <th style={{padding:'.7rem',textAlign:'right'}}>Live Price</th>
                          <th style={{padding:'.7rem',textAlign:'right'}}>Change</th>
                          <th style={{padding:'.7rem',textAlign:'right'}}>Base</th>
                          {INTL_PRICES && <th style={{padding:'.7rem',textAlign:'right'}}>Dubai 🇦🇪</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCrops.map(({item,cat})=>{
                          const lp=livePrices[item]||BASE_PRICES[item]||20;
                          const base=BASE_PRICES[item]||20;
                          const pct=(((lp-base)/base)*100).toFixed(1);
                          const isUp=priceTrend[item]!=='down';
                          const flash=priceFlash[item];
                          const intl=INTL_PRICES?.[item];
                          return (
                            <tr key={item} className={flash?(isUp?'flash-up':'flash-down'):''} style={{borderBottom:'1px solid #1f1f1f',cursor:'pointer'}} onClick={()=>setMarketCrop(item)}>
                              <td style={{padding:'.55rem 1rem',fontWeight:600,color:'#f1f1f1'}}>{item}</td>
                              <td style={{padding:'.55rem .7rem',fontSize:'.72rem',color:'#888'}}>{cat}</td>
                              <td style={{padding:'.55rem .7rem',textAlign:'right',fontWeight:700,color:isUp?'#22c55e':'#ef4444'}}>&#x20B9;{lp.toFixed(2)}</td>
                              <td style={{padding:'.55rem .7rem',textAlign:'right',fontSize:'.75rem',color:isUp?'#22c55e':'#ef4444'}}>{isUp?'▲':'▼'}{Math.abs(pct)}%</td>
                              <td style={{padding:'.55rem .7rem',textAlign:'right',color:'#888'}}>&#x20B9;{base}</td>
                              {INTL_PRICES && <td style={{padding:'.55rem .7rem',textAlign:'right',color:'#fbbf24'}}>{intl?`&#x20B9;${intl.Dubai}`:'–'}</td>}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card">
                  <div className="section-title">🔔 Price Alert</div>
                  {alertSent && <div style={{background:'rgba(34,197,94,.08)',border:'1px solid rgba(34,197,94,.2)',borderRadius:8,padding:'.75rem 1rem',marginBottom:'1rem',fontSize:'.85rem',color:'#86efac'}}>✅ Alert set for <strong>{alertCrop}</strong> at &#x20B9;{alertThreshold}.</div>}
                  <form onSubmit={handleAlert} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                    <div><label className="fld">Commodity</label><select className="input" value={alertCrop} onChange={e=>setAlertCrop(e.target.value)}>{ALL_CROPS.slice(0,50).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="fld">Price Threshold (&#x20B9;)</label><input className="input" type="number" placeholder="e.g. 30" value={alertThreshold} onChange={e=>setAlertThreshold(e.target.value)} required /></div>
                    <div><label className="fld">Email</label><input className="input" type="email" placeholder="farmer@example.com" value={alertEmail} onChange={e=>setAlertEmail(e.target.value)} /></div>
                    <div><label className="fld">Phone</label><input className="input" type="tel" placeholder="9876543210" maxLength={10} value={alertPhone} onChange={e=>setAlertPhone(e.target.value.replace(/\D/g,'').slice(0,10))} /></div>
                    <button type="submit" className="btn btn-primary" style={{gridColumn:'span 2'}} disabled={alertSending||(!alertEmail&&!alertPhone)}>{alertSending?'📡 Sending…':'🔔 Set Alert'}</button>
                  </form>
                </div>
              </div>
            )}

            {/* ════ EXPENSE LEDGER ════ */}
            {activeTab==='expenses' && (
              <div className="grid2">
                <div className="card">
                  <div className="section-title">💰 Farm Expense Ledger</div>
                  <div className="grid2" style={{marginBottom:'1.25rem'}}>
                    <div style={{background:'rgba(34,197,94,.07)',border:'1px solid rgba(34,197,94,.15)',borderRadius:10,padding:'1rem'}}>
                      <div style={{fontSize:'.78rem',color:'#888'}}>Total Income</div>
                      <div style={{fontSize:'1.5rem',fontWeight:800,color:'#22c55e'}}>&#x20B9;{totalIncome.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.15)',borderRadius:10,padding:'1rem'}}>
                      <div style={{fontSize:'.78rem',color:'#888'}}>Total Expenses</div>
                      <div style={{fontSize:'1.5rem',fontWeight:800,color:'#ef4444'}}>&#x20B9;{totalExpense.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div style={{background:netReturn>=0?'rgba(34,197,94,.05)':'rgba(239,68,68,.05)',border:`1px solid ${netReturn>=0?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)'}`,borderRadius:10,padding:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
                    <span style={{fontSize:'.9rem',color:'#888'}}>Net Profit / Loss</span>
                    <span style={{fontSize:'1.3rem',fontWeight:800,color:netReturn>=0?'#22c55e':'#ef4444'}}>{netReturn>=0?'+':'–'}&#x20B9;{Math.abs(netReturn).toLocaleString('en-IN')}</span>
                  </div>
                  <form onSubmit={handleAddLedger} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.8rem'}}>
                    <div><label className="fld">Type</label><select className="input" value={ledgerInput.type} onChange={e=>setLedgerInput(p=>({...p,type:e.target.value}))}><option value="expense">Expense (–)</option><option value="income">Income (+)</option></select></div>
                    <div><label className="fld">Category</label><select className="input" value={ledgerInput.category} onChange={e=>setLedgerInput(p=>({...p,category:e.target.value}))}>{['Seeds','Fertilizer','Pesticide','Labor','Fuel','Equipment','Sales','Subsidy'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                    <div style={{gridColumn:'span 2'}}><label className="fld">Description</label><input className="input" value={ledgerInput.desc} onChange={e=>setLedgerInput(p=>({...p,desc:e.target.value}))} placeholder="e.g. Bought 2 bags of Urea" /></div>
                    <div><label className="fld">Amount (&#x20B9;)</label><input className="input" type="number" value={ledgerInput.amount} onChange={e=>setLedgerInput(p=>({...p,amount:e.target.value}))} placeholder="Amount" /></div>
                    <div style={{display:'flex',alignItems:'flex-end'}}><button type="submit" className="btn btn-primary" style={{width:'100%'}}>+ Add Entry</button></div>
                  </form>
                </div>
                <div className="card">
                  <div className="section-title">📊 Recent Transactions</div>
                  <div style={{display:'flex',flexDirection:'column',gap:'.5rem',maxHeight:460,overflowY:'auto'}}>
                    {[...ledger].reverse().map(item=>(
                      <div key={item.id} className="ledger-item">
                        <div>
                          <div style={{fontWeight:600,color:'#f1f1f1',fontSize:'.83rem'}}>{item.desc}</div>
                          <div style={{fontSize:'.72rem',color:'#888'}}>{item.category} · {item.date}</div>
                        </div>
                        <div style={{fontWeight:800,fontSize:'1rem',color:item.type==='income'?'#22c55e':'#ef4444'}}>
                          {item.type==='income'?'+':'–'} &#x20B9;{item.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════ AI CHAT ════ */}
            {activeTab==='chat' && (
              <div className="card" style={{maxWidth:850,margin:'0 auto',background:'linear-gradient(145deg, #161a23 0%, #0d1117 100%)',border:'1px solid #232d3f'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem',borderBottom:'1px solid #222d3d',paddingBottom:'.85rem'}}>
                  <div className="section-title" style={{marginBottom:0,color:'#93c5fd',fontSize:'1.1rem'}}>
                    🤖 ChatGPT AI Farming Assistant (Voice & Audio)
                  </div>
                  <div style={{fontSize:'.75rem',color:'#4ade80',background:'rgba(34,197,94,0.1)',padding:'.2rem .6rem',borderRadius:20,fontWeight:700,display:'flex',alignItems:'center',gap:'.4rem'}}>
                    <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}></span>
                    AI Ready · {lang.toUpperCase()} Voice
                  </div>
                </div>

                {/* Prompt Guides / Presets */}
                <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap',marginBottom:'1.25rem'}}>
                  {[
                    '🌦️ Weather & Rain Advisory',
                    '💰 Tomato & Mandi Rates',
                    '🧪 Cotton Fertilizer Dosage',
                    '🐛 Pest & Leaf Disease Remedy',
                    '🏛️ PM-KISAN & Subsidies',
                    '💧 Drip Irrigation Schedule',
                    '🥛 Milk & Dairy Yield Booster'
                  ].map(q => (
                    <button key={q} className="btn btn-outline" style={{fontSize:'.76rem',padding:'.4rem .75rem',background:'#121824',borderColor:'#232d3f',color:'#cbd5e1',borderRadius:8}} onClick={() => {
                      setChatMessages(p => [...p, { sender:'user', text: q }]);
                      const reply = generateChatGPTResponse(q);
                      setTimeout(() => {
                        setChatMessages(p => [...p, { sender:'bot', text: reply }]);
                        speakText(reply);
                      }, 400);
                    }}>
                      {q}
                    </button>
                  ))}
                </div>

                {/* Chat Message Window */}
                <div style={{background:'#090d16',borderRadius:12,border:'1px solid #1e293b',padding:'1.25rem',height:420,overflowY:'auto',display:'flex',flexDirection:'column',gap: '1rem',marginBottom:'1.25rem'}}>
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.sender}`} style={{ position: 'relative', borderRadius: 12, padding: '0.85rem 1.1rem', maxWidth: '85%' }}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem' }}>{m.text}</div>
                      {m.sender === 'bot' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.4rem' }}>
                          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>AI Expert Response</span>
                          <button 
                            onClick={() => speakText(m.text)} 
                            title="Listen out loud"
                            style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 6, padding: '0.2rem 0.6rem', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            🔊 Listen
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef}></div>
                </div>

                {/* Input & Voice Controls */}
                <form onSubmit={handleChat} style={{display:'flex',gap:'.75rem',alignItems:'center'}}>
                  <button 
                    type="button" 
                    onClick={handleVoice} 
                    style={{
                      background: isRecording ? 'rgba(239,68,68,0.2)' : '#1e293b',
                      border: `1px solid ${isRecording ? '#ef4444' : '#334155'}`,
                      borderRadius: 10,
                      padding: '.75rem 1rem',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      animation: isRecording ? 'pulse 1s infinite' : 'none',
                      flexShrink: 0,
                      color: isRecording ? '#ef4444' : '#fff'
                    }}
                    title="Click to speak (Voice Input)"
                  >
                    🎙️ {isRecording ? 'Listening...' : ''}
                  </button>

                  <input 
                    className="input" 
                    style={{flex:1,margin:0,background:'#0f172a',border:'1px solid #334155',padding:'.75rem 1rem',fontSize:'.92rem',color:'#f8fafc'}} 
                    value={chatInput} 
                    onChange={e=>setChatInput(e.target.value)} 
                    placeholder="Ask anything in English, हिंदी, or తెలుగు (e.g. fertilizer dose, tomato rates, rainfall)..." 
                  />

                  <button type="submit" className="btn btn-primary" style={{padding:'.75rem 1.25rem',fontSize:'.9rem',fontWeight:700}}>
                    Send ↗
                  </button>
                </form>
              </div>
            )}

            {/* ════ GOVT SCHEMES ════ */}
            {activeTab==='schemes' && (
              <div className="grid2">
                <div className="card">
                  <div className="section-title">📋 Eligibility Checker</div>
                  <p style={{fontSize:'.85rem',color:'#888',marginBottom:'1.25rem'}}>Enter your details to instantly match eligible government schemes.</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'.9rem'}}>
                    <div><label className="fld">Total Land Size (Acres)</label><input className="input" type="number" step="0.1" min="0" value={schemeLand} onChange={e=>setSchemeLand(e.target.value)} /></div>
                    <div><label className="fld">State Jurisdiction</label><select className="input" value={schemeState} onChange={e=>setSchemeState(e.target.value)}>{ALL_STATES && ALL_STATES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                    <div><label className="fld">Farming Sector</label><select className="input" value={schemeSector} onChange={e=>setSchemeSector(e.target.value)}><option value="Agriculture">Agriculture (Crops)</option><option value="Allied">Allied Sectors</option><option value="fisheries">Fisheries</option></select></div>
                    <div><label className="fld">Social Category</label><select className="input" value={schemeSCST?'SC/ST/Women':'General'} onChange={e=>setSchemeSCST(e.target.value==='SC/ST/Women')}><option value="SC/ST/Women">SC / ST / Women Farmer</option><option value="General">General / OBC Farmer</option></select></div>
                    <div style={{borderTop:'1px solid #222',paddingTop:'1rem',display:'flex',flexDirection:'column',gap:'.7rem'}}>
                      <div style={{fontSize:'.75rem',fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'.05em'}}>Document Status</div>
                      {[['schemeAadhaar',schemeAadhaar,setSchemeAadhaar,'🔗 Aadhaar Linked to Mobile'],['schemeBank',schemeBank,setSchemeBank,'🏦 Bank Account DBT Linked']].map(([k,v,set,lbl])=>(
                        <label key={k} style={{display:'flex',alignItems:'center',gap:'.6rem',cursor:'pointer',fontSize:'.875rem',color:'#f1f1f1'}}>
                          <input type="checkbox" checked={v} onChange={e=>set(e.target.checked)} style={{width:'1.1rem',height:'1.1rem',cursor:'pointer',accentColor:'#2563eb'}} />
                          {lbl}
                        </label>
                      ))}
                    </div>
                    <div style={{background:'#1f1f1f',borderRadius:8,padding:'.8rem',fontSize:'.8rem',color:'#888'}}>
                      Showing <strong style={{color:'#22c55e'}}>{matchingSchemes.length}</strong> schemes matching your profile.
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="section-title">🏛 Eligible Schemes ({matchingSchemes.length})</div>
                  <div style={{display:'flex',flexDirection:'column',gap:'.85rem',maxHeight:620,overflowY:'auto',paddingRight:'.25rem'}}>
                    {GOVT_SCHEMES ? GOVT_SCHEMES.slice(0,12).map(scheme=>(
                      <div key={scheme.name} className="scheme-card">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem'}}>
                          <div>
                            <div style={{fontSize:'.7rem',color:'#22c55e',fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em'}}>{scheme.ministry}</div>
                            <h4 style={{color:'#f1f5f9',fontSize:'.95rem',fontWeight:700,marginTop:'.2rem'}}>{scheme.name}</h4>
                          </div>
                          <span className="tag" style={{background:scheme.color||'#16a34a',color:'#fff',flexShrink:0}}>{scheme.badge}</span>
                        </div>
                        <p style={{fontSize:'.82rem',color:'#888',lineHeight:1.6}}><strong style={{color:'#ccc'}}>Benefit:</strong> {scheme.benefit}</p>
                        <div style={{background:'#111',borderRadius:8,padding:'.75rem'}}>
                          <div style={{fontSize:'.72rem',fontWeight:600,color:'#f1f1f1',marginBottom:'.35rem'}}>📋 Required Documents</div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:'.35rem'}}>
                            {(scheme.docs||[]).map(doc=>{
                              const ok=(doc.toLowerCase().includes('aadhaar')&&schemeAadhaar)||(doc.toLowerCase().includes('bank')&&schemeBank);
                              return <span key={doc} className="tag" style={{background:ok?'rgba(34,197,94,.12)':'rgba(255,255,255,.05)',color:ok?'#22c55e':'#888',border:`1px solid ${ok?'rgba(34,197,94,.2)':'rgba(255,255,255,.08)'}`}}>{ok?'✅ ':'📄 '}{doc}</span>;
                            })}
                          </div>
                        </div>
                        <div style={{display:'flex',justifyContent:'flex-end'}}>
                          <a href={`https://${scheme.apply}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{textDecoration:'none',padding:'.45rem 1rem',fontSize:'.78rem'}}>Apply Online ↗</a>
                        </div>
                      </div>
                    )) : <div style={{color:'#888',textAlign:'center',padding:'2rem'}}>No schemes data available.</div>}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ═══ Mobile Bottom Navigation (5 key actions: Home, AI, Market, Orders, Me) ═══ */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          <button 
            className={`bottom-nav-btn ${activeTab==='overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
          >
            <span className="bn-icon">🏡</span>
            <span className="bn-label">Home</span>
          </button>
          
          <button 
            className={`bottom-nav-btn ${(activeTab==='advisor' || activeTab==='scanner') ? 'active' : ''}`}
            onClick={() => { setActiveTab('advisor'); setIsSidebarOpen(false); }}
          >
            <span className="bn-icon">🌱</span>
            <span className="bn-label">AI Farm</span>
          </button>
          
          <button 
            className={`bottom-nav-btn ${activeTab==='marketplace' ? 'active' : ''}`}
            onClick={() => { setActiveTab('marketplace'); setIsSidebarOpen(false); }}
          >
            <span className="bn-icon">🛒</span>
            <span className="bn-label">Market</span>
            {cart.length > 0 && (
              <span className="bottom-nav-badge">
                {cart.reduce((s,i)=>s+i.quantity,0)}
              </span>
            )}
          </button>
          
          <button 
            className={`bottom-nav-btn ${activeTab==='expenses' ? 'active' : ''}`}
            onClick={() => { setActiveTab('expenses'); setIsSidebarOpen(false); }}
          >
            <span className="bn-icon">📦</span>
            <span className="bn-label">Orders</span>
          </button>
          
          <button 
            className={`bottom-nav-btn ${(activeTab==='chat' || activeTab==='schemes') ? 'active' : ''}`}
            onClick={() => { setActiveTab('chat'); setIsSidebarOpen(false); }}
          >
            <span className="bn-icon">👤</span>
            <span className="bn-label">Me</span>
          </button>
        </div>
      </nav>

      {/* ════ UNIVERSAL FLOATING KISAN AI CHATBOT WIDGET ════ */}
      {!isChatbotOpen && (
        <button
          className="kisan-chatbot-fab"
          onClick={() => setIsChatbotOpen(true)}
          title="Open Kisan AI Farming Assistant"
        >
          <span style={{ fontSize: '1.4rem' }}>🤖</span>
          <span>Ask Kisan AI</span>
          <span style={{ background: '#22C55E', color: '#0F172A', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 800 }}>
            ONLINE
          </span>
        </button>
      )}

      {isChatbotOpen && (
        <div className="kisan-chatbot-drawer">
          {/* Header */}
          <div style={{ background: '#0F5132', color: '#FFFFFF', padding: '0.9rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#22C55E', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', fontWeight: 800 }}>
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.2 }}>Kisan AI Assistant</div>
                <div style={{ fontSize: '0.7rem', color: '#86EFAC', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>● Online 24/7</span> · <span>Agronomist</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Language Switch */}
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.72rem', padding: '0.2rem 0.4rem', cursor: 'pointer' }}
              >
                <option value="en" style={{ color: '#000' }}>EN</option>
                <option value="hi" style={{ color: '#000' }}>HI</option>
                <option value="te" style={{ color: '#000' }}>TE</option>
              </select>

              {/* Voice Speech Toggle */}
              <button
                onClick={() => setChatbotSpeaking(p => !p)}
                style={{ background: chatbotSpeaking ? '#22C55E' : 'rgba(255,255,255,0.2)', color: chatbotSpeaking ? '#0F172A' : '#fff', border: 'none', borderRadius: 6, fontSize: '0.72rem', padding: '0.2rem 0.45rem', cursor: 'pointer', fontWeight: 700 }}
                title={chatbotSpeaking ? 'Voice Audio Speech: ON' : 'Voice Audio Speech: OFF'}
              >
                {chatbotSpeaking ? '🔊 Voice' : '🔇 Mute'}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsChatbotOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '1.2rem', cursor: 'pointer', padding: '0.2rem' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div style={{ background: '#F8FAFC', padding: '0.6rem 0.85rem', borderBottom: '1px solid #E2E8F0', overflowX: 'auto', display: 'flex', gap: '0.45rem', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
            {[
              '🍂 Why are tomato leaves turning yellow?',
              '🌾 Cotton fertilizer schedule for 5 acres',
              '💧 Paddy water at tillering stage',
              '🌶️ Chilli leaf curl mite remedy',
              '🍅 Tomato mandi price today',
              '🏛️ How to apply for PM-KISAN ₹6000?',
              '🛒 How to buy products on this app?',
              '💼 How to sell my harvest as a farmer?'
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => {
                  setChatbotMessages(prev => [...prev, { sender: 'user', text: prompt, time: 'Now' }]);
                  const reply = generateChatGPTResponse(prompt);
                  setTimeout(() => {
                    setChatbotMessages(prev => [...prev, { sender: 'bot', text: reply, time: 'Now' }]);
                    if (chatbotSpeaking) speakText(reply);
                  }, 400);
                }}
                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 20, padding: '0.25rem 0.65rem', fontSize: '0.72rem', color: '#334155', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#FAFAFA' }}>
            {chatbotMessages.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className={`chat-bubble ${m.sender}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>
                  {m.sender === 'bot' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{m.time || 'AI Verified'}</span>
                      <button
                        onClick={() => speakText(m.text)}
                        style={{ background: 'transparent', border: 'none', color: '#166534', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}
                      >
                        🔊 Listen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!chatbotInput.trim()) return;
              const text = chatbotInput;
              setChatbotInput('');
              setChatbotMessages(prev => [...prev, { sender: 'user', text, time: 'Now' }]);
              const reply = generateChatGPTResponse(text);
              setTimeout(() => {
                setChatbotMessages(prev => [...prev, { sender: 'bot', text: reply, time: 'Now' }]);
                if (chatbotSpeaking) speakText(reply);
              }, 400);
            }}
            style={{ padding: '0.75rem', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <input
              className="input"
              style={{ fontSize: '0.84rem', padding: '0.55rem 0.8rem', borderRadius: 20 }}
              placeholder="Type any farming, crop, or store query..."
              value={chatbotInput}
              onChange={e => setChatbotInput(e.target.value)}
            />
            <button
              type="button"
              onClick={() => runVoiceSim()}
              title="Voice Input Simulation"
              style={{ background: isRecording ? '#DC2626' : '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              🎙️
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: '50%', width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* ── Cart Sidebar Panel ── */}
      <div className={`cart-overlay${isCartOpen ? ' open' : ''}`} onClick={() => setIsCartOpen(false)} />
      <div className={`cart-sidebar${isCartOpen ? ' open' : ''}`}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🛒 Shopping Cart ({cart.reduce((s,i)=>s+i.quantity,0)})
          </h3>
          <button 
            style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}
            onClick={() => setIsCartOpen(false)}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', height: '80%', opacity: 0.4 }}>
              <span style={{ fontSize: '3rem' }}>🛒</span>
              <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.5rem' }}>Your shopping cart is empty.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '0.75rem', background: '#1c1c1c', border: '1px solid #222', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ width: '52px', height: '52px', background: '#121212', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image && item.image.startsWith('http') ? (
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                      {(item.title || '').toLowerCase().includes('seed') ? '🌾' :
                       (item.title || '').toLowerCase().includes('fertilizer') ? '🧪' :
                       (item.title || '').toLowerCase().includes('vegetable') || (item.title || '').toLowerCase().includes('spinach') ? '🥬' :
                       (item.title || '').toLowerCase().includes('fruit') ? '🍎' :
                       (item.title || '').toLowerCase().includes('tool') ? '🛠️' : '📦'}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.1rem' }}>
                    Seller: {item.sellerName}
                  </div>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#22c55e' }}>
                      ₹{item.price * item.quantity}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#121212', border: '1px solid #222', borderRadius: '6px', padding: '0.1rem' }}>
                      <button 
                        style={{ border: 'none', background: 'transparent', color: '#aaa', fontSize: '0.8rem', padding: '0.1rem 0.35rem', cursor: 'pointer' }}
                        onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>{item.quantity}</span>
                      <button 
                        style={{ border: 'none', background: 'transparent', color: '#aaa', fontSize: '0.8rem', padding: '0.1rem 0.35rem', cursor: 'pointer' }}
                        onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '1.25rem', background: '#111', borderTop: '1px solid #2a2a2a' }}>
            <div style={{ display: 'flex', justify: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
              <span>Items Total:</span>
              <span>₹{cart.reduce((s,i) => s + i.price * i.quantity, 0)}</span>
            </div>
            <div style={{ display: 'flex', justify: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: '#fff', fontWeight: 800 }}>
              <span>Grand Total:</span>
              <span style={{ color: '#22c55e' }}>₹{cart.reduce((s,i) => s + i.price * i.quantity, 0)}</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold', fontSize: '0.9rem', borderRadius: '8px' }}
              onClick={handleCheckout}
            >
              🤝 Complete P2P Checkout
            </button>
          </div>
        )}
      </div>

      {/* ── Checkout Success Modal ── */}
      {successOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease', border: '1px solid #22c55e', boxShadow: '0 8px 40px rgba(34, 197, 94, 0.2)' }}>
            <div style={{ fontSize: '3.5rem', animation: 'pulse 1.5s infinite' }}>🎉</div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#22c55e' }}>Order Successfully Placed!</h3>
              <p style={{ fontSize: '0.82rem', color: '#888', marginTop: '0.25rem' }}>Your order has been recorded. The sellers will contact you soon.</p>
            </div>

            <div style={{ background: '#151515', borderRadius: '10px', padding: '1rem', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '1px solid #222', paddingBottom: '0.35rem' }}>
                Order Summary & Seller Contacts
              </div>
              {successOrder.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', gap: '0.5rem' }}>
                  <div style={{ textAlign: 'left', minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title} ({item.quantity} {item.unit})</div>
                    <div style={{ color: '#666', fontSize: '0.7rem' }}>Seller: {item.sellerName} (📍 {item.sellerLocation?.state})</div>
                  </div>
                  <a 
                    href={`https://wa.me/91${item.sellerPhone}?text=Hi%20${item.sellerName},%20I%20just%20placed%20an%20order%20for%20${item.quantity}%20${item.unit}%20of%20your%20${item.title}%20on%20Smart%20Crop%20Advisor%20AI!`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary" 
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.68rem', background: '#16a34a', textDecoration: 'none' }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.78rem', color: '#86efac' }}>
              💰 <strong>Ledger Update:</strong> This purchase has been automatically logged under your **Expense Ledger** tab for seasonal cashflow tracking!
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.65rem' }} 
              onClick={() => setSuccessOrder(null)}
            >
              Done & Return to Market
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
