# 🌾 Smart Crop Advisor AI — Farm Smarter, Earn Better

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/Deployment-GitHub%20Pages-blue?logo=github)](https://hharshithkumar91-crypto.github.io/Smart-Crop-Advisor-AI/)
[![Security](https://img.shields.io/badge/Security-Audit%20Passed-brightgreen)](https://github.com/hharshithkumar91-crypto/Smart-Crop-Advisor-AI)

> **India's Intelligent Agriculture Platform & Direct Farm-to-Buyer Marketplace**  
> Empowering Indian farmers with precision AI agronomist advisory, real-time APMC Mandi commodity rates, Open-Meteo weather forecasting, computer-vision plant disease scanner, government subsidy scheme eligibility, and a 0% commission direct farm produce marketplace.

---

## 🌐 Live Application
- **Production URL**: [https://hharshithkumar91-crypto.github.io/Smart-Crop-Advisor-AI/](https://hharshithkumar91-crypto.github.io/Smart-Crop-Advisor-AI/)
- **Repository**: [https://github.com/hharshithkumar91-crypto/Smart-Crop-Advisor-AI](https://github.com/hharshithkumar91-crypto/Smart-Crop-Advisor-AI)

---

## 🚀 Key Platform Features

### 1. 🛒 Agri P2P Superstore (Amazon / Flipkart / Zepto Caliber)
- **Zero Intermediary Markup**: Verified farmers list produce directly to buyers, households, and wholesalers.
- **Dynamic Category Ribbon**: 🥬 Fresh Vegetables, 🍎 Fruits, 🌾 Cereals & Grains, 🫘 Pulses, 🌿 Spices, 🧪 Fertilizers & Organic Inputs, 🚜 Farming Tools & Seeds.
- **Cart & Instant Checkout**: Quantity stepper (`- [qty] +`), real-time road distance calculator (₹5/km transport estimation), and wishlisting.
- **Flash Mandi Deals & Live Stock Badges**: Real-time inventory tracking with discount badges and verified farmer phone contact.

### 2. 🤖 Domain-Specific AI Crop Assistant (Kisan AI)
- **Agricultural Guardrails**: Specialized strictly in agronomy, soil chemistry (N:P:K), irrigation intervals, and disease management.
- **Defensive Redirection**: Politely declines and redirects non-farming inquiries to maintain agricultural focus.
- **Cybersecurity & Safety Precautions**: Educates farmers on online payment security (never share UPI PINs to *receive* money, beware of fake lottery/subsidy calls).
- **Multilingual Support**: Supports English, हिन्दी (Hindi), and తెలుగు (Telugu) with built-in voice input and audio text-to-speech.

### 3. 📈 Live Mandi Rates & MCX Commodity Ticker
- **APMC Market Tracking**: Real-time arrival prices for 300+ commodities across all major Indian states.
- **MCX Real-Time Ticker**: High-frequency streaming ticker for Cotton, Turmeric, Crude Oil, Diesel, and Petrol.
- **Distance-Adjusted Pricing**: Calculate net margins considering mandis in Bengaluru, Guntur, Nashik, Agra, and more.

### 4. 🔬 Computer Vision Plant Disease Scanner
- **Instant Pathogen Detection**: Upload or photograph symptomatic leaves to detect fungal leaf spots, blights, powdery mildew, and viral curl.
- **Integrated Actionable Cures**: Organic bio-controls (Neem oil, Trichoderma) and calibrated chemical remedies with exact dosage per liter.

### 5. 🌦️ Open-Meteo Hyperlocal Weather Engine
- **Field-Work & Spray Windows**: Calculates live rain probability, temperature, humidity, wind gusts, and cloud cover to advise optimal pesticide and fertilizer application times.
- **7-Day Agronomic Forecast**: Day-by-day temperature highs/lows and rainfall risks.

### 6. 🏛️ Central & State Government Scheme Navigator
- **Automated Eligibility Engine**: Matches landholding size, social category, Aadhaar, and bank seeding to PM-KISAN, PMFBY, KCC, PMKSY, and SMAM subsidies.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 19 | Fast virtual DOM, functional components, hooks |
| **Styling & UI** | Custom Responsive CSS | Light modern theme (Flipkart/Zepto inspired), mobile bottom nav |
| **Typography** | Plus Jakarta Sans & Inter | High-readability fonts optimized for data-dense interfaces |
| **Weather Integration** | Open-Meteo API | Real-time weather without API key exposure |
| **Data Engine** | `agronomyEngine.js` | Multilingual I18N, weather decision matrix, diagnostic trees |
| **Market Data** | `data.js` | MCX commodities, state fuel bases, mandi multipliers |
| **Hosting** | GitHub Pages | Automated static build and continuous deployment |

---

## 🔒 Security & Privacy Best Practices

- **Zero Secret Exposure**: No private API keys or database service role secrets committed to the repository.
- **Environment Isolation**: `.env*` files are strictly gitignored; configuration template provided in `.env.example`.
- **Client-Side Defense**: XSS-safe input parsing, number validation, sanitized query execution.
- **Fraud Prevention**: Anti-phishing guidelines integrated directly into the conversational AI assistant.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hharshithkumar91-crypto/Smart-Crop-Advisor-AI.git
   cd Smart-Crop-Advisor-AI
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend endpoint and configuration
   ```

4. **Start Development Server**:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

6. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

---

## 📄 License
This project is licensed under the MIT License. Built with ❤️ for Indian Farmers.
