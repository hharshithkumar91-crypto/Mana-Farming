import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLang, setLang } from "../i18n";
import {
  SproutIcon,
  MicIcon,
  ChartIcon,
  ScanIcon,
  CoinIcon,
  CalendarIcon,
  ShieldIcon,
  SearchIcon,
  SunIcon,
} from "../components/Icons.jsx";
import { ScrollReveal, TaglineReveal } from "../components/Reveal.jsx";

const TOOLS = [
  { labelEn: "Advisor", labelTe: "సలహా", path: "/advisor", icon: <SproutIcon className="w-6 h-6 text-[#166534]" /> },
  { labelEn: "Voice AI", labelTe: "వాయిస్", path: "/ai", icon: <MicIcon className="w-6 h-6 text-[#D97706]" /> },
  { labelEn: "Mandi", labelTe: "మండి", path: "/mandi", icon: <ChartIcon className="w-6 h-6 text-[#166534]" /> },
  { labelEn: "Doctor", labelTe: "డాక్టర్", path: "/scan", icon: <ScanIcon className="w-6 h-6 text-[#166534]" /> },
  { labelEn: "Profit", labelTe: "లాభాలు", path: "/profit", icon: <CoinIcon className="w-6 h-6 text-[#D97706]" /> },
  { labelEn: "My Farm", labelTe: "నా పొలం", path: "/farm", icon: <CalendarIcon className="w-6 h-6 text-[#166534]" /> },
  { labelEn: "Schemes", labelTe: "పథకాలు", path: "/schemes", icon: <ShieldIcon className="w-6 h-6 text-[#166534]" /> },
];

const FEATURED_PRODUCTS = [
  { id: 1, title: "Fresh Tomatoes", weight: "1 kg", seller: "Raju Farms, Guntur", price: 25, mrp: 34 },
  { id: 2, title: "Basmati Rice", weight: "5 kg", seller: "Kumar Exports, Kurnool", price: 325, mrp: 380 },
  { id: 4, title: "Cotton Seed Pack", weight: "450 g", seller: "Green Agro, Warangal", price: 450, mrp: 515 },
  { id: 5, title: "Guntur Red Chilli", weight: "1 kg", seller: "Spice Hub, Guntur", price: 220, mrp: 265 },
];

const MANDI_SNAPSHOT = [
  { crop: "Chilli", market: "Guntur", price: "12,000", change: "+2.1%", up: true },
  { crop: "Cotton", market: "Kurnool", price: "6,800", change: "+1.4%", up: true },
  { crop: "Paddy", market: "Warangal", price: "2,100", change: "0.5% down", up: false },
];

export default function Home() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [lang, setLangState] = useState(getLang());
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mf_cart")) || {};
    } catch {
      return {};
    }
  });
  const [infoNote, setInfoNote] = useState("");

  const handleLang = (next) => {
    setLang(next);
    setLangState(next);
  };

  useEffect(() => {
    const fetchWeather = (lat, lon) =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then((r) => r.json())
        .then((d) => setWeather(d.current_weather))
        .catch(() => {});

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchWeather(coords.latitude, coords.longitude),
        () => fetchWeather(17.38, 78.47)
      );
    } else {
      fetchWeather(17.38, 78.47);
    }
  }, []);

  const addItem = (id) => {
    const next = { ...cart, [id]: (cart[id] || 0) + 1 };
    setCart(next);
    localStorage.setItem("mf_cart", JSON.stringify(next));
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] pb-24">
      {/* Floating compact top bar */}
      <header className="sticky top-0 z-40 px-4 pt-3 pb-2 bg-[#FAF6EE]/90 backdrop-blur-md">
        <div className="bg-white/90 border border-[#E6DFD1] rounded-2xl px-3 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E9F2EC] flex items-center justify-center">
              <SproutIcon className="w-5 h-5 text-[#166534]" />
            </div>
            <div>
              <p className="title-4 text-[#1C241B]">
                {lang === "te" ? "మన ఫార్మింగ్" : "Mana Farming"}
              </p>
              {weather ? (
                <p className="caption-5 text-[#5C665A] flex items-center gap-1">
                  <SunIcon className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>{weather.temperature}°C · {weather.windspeed} km/h</span>
                </p>
              ) : (
                <div className="h-3 w-24 bg-[#F3EDE0] rounded skeleton-pulse mt-1" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#FAF6EE] p-1 rounded-xl border border-[#E6DFD1]">
            {["en", "te"].map((l) => (
              <button
                key={l}
                onClick={() => handleLang(l)}
                className={`button-sm px-2.5 py-1 rounded-lg transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] ${
                  lang === l ? "bg-[#166534] text-white" : "text-[#5C665A] hover:text-[#1C241B]"
                }`}
              >
                {l === "en" ? "EN" : "తెలుగు"}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-2 flex items-center bg-white border border-[#E6DFD1] rounded-xl px-3 py-2">
          <button
            type="button"
            onClick={() => navigate("/market")}
            className="flex items-center flex-1 text-left focus-visible:outline-none"
          >
            <SearchIcon className="w-4 h-4 text-[#5C665A] mr-2" />
            <span className="body-6 text-[#5C665A] truncate">
              {lang === "te"
                ? "పంటలు, విత్తనాలు, మండి ధరలు వెతకండి"
                : "Search seeds, crops, and mandi prices"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/ai")}
            aria-label="Open voice assistant"
            className="p-1.5 rounded-lg bg-[#FAF6EE] text-[#166534] hover:bg-[#E9F2EC] transition-colors duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534]"
          >
            <MicIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section (flat cream surface, text gradient on heading, single primary CTA) */}
      <section className="px-4 pt-4 pb-2">
        <div className="bg-white border border-[#E6DFD1] rounded-2xl p-6">
          <p className="caption-3 uppercase tracking-wider text-[#166534]">
            {lang === "te" ? "రైతు సహాయకుడు" : "FARMER WORKSPACE"}
          </p>
          <h1 className="heading-4 max-w-[680px] mt-2 bg-gradient-to-r from-[#000000] to-[#666666] bg-clip-text text-transparent">
            {lang === "te" ? (
              <>
                మెరుగైన పంట నిర్ణయాలు
                <br />
                సరైన మండి ధరలతో
              </>
            ) : (
              <>
                Clear crop decisions
                <br />
                without guesswork
              </>
            )}
          </h1>
          <p className="body-6 text-[#5C665A] max-w-[680px] mt-3">
            {lang === "te"
              ? "ఈ సీజన్ పంట సలహా, మండి ధరలు మరియు పొలం ఖర్చుల లెక్కలు ఒకే చోట."
              : "Check local mandi rates, compare season crops, and buy verified inputs in one place."}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => navigate("/advisor")}
              className="button-md bg-[#166534] hover:bg-[#14532D] text-white py-2 px-3 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] focus-visible:ring-offset-2"
            >
              {lang === "te" ? "పంట సలహా చూడండి" : "Open crop advisor"}
            </button>
            <span className="caption-4 text-[#5C665A]">
              {lang === "te" ? "ఉచిత రైతు సేవ" : "Free for farmers"}
            </span>
          </div>
        </div>
      </section>

      {/* Quick Tools Strip */}
      <ScrollReveal className="px-4 pt-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className="flex flex-col items-center shrink-0 group active:scale-95 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] rounded-xl p-1"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-[#E6DFD1] flex items-center justify-center group-hover:border-[#166534] transition-colors duration-300">
                {tool.icon}
              </div>
              <span className="caption-4 text-[#1C241B] mt-1.5">
                {lang === "te" ? tool.labelTe : tool.labelEn}
              </span>
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Live Mandi Card */}
      <ScrollReveal className="px-4 pt-4" delay={60}>
        <article
          onClick={() => navigate("/mandi")}
          className="bg-white border border-[#E6DFD1] rounded-2xl p-4 cursor-pointer hover:border-[#166534] transition-colors duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#166534] opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#166534]" />
              </span>
              <h2 className="title-4 text-[#1C241B]">
                {lang === "te" ? "మండి ధరల సారాంశం" : "Mandi price snapshot"}
              </h2>
            </div>
            <span className="button-sm text-[#166534]">See all</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {MANDI_SNAPSHOT.map((row) => (
              <div key={row.crop} className="bg-[#FAF6EE] border border-[#EDE6D6] rounded p-2">
                <p className="body-4 text-[#1C241B]">{row.crop}</p>
                <p className="caption-5 text-[#5C665A]">{row.market}</p>
                <p className="body-4 text-[#166534] mt-1">₹{row.price}</p>
                <p className={`caption-4 ${row.up ? "text-[#166534]" : "text-[#D97706]"}`}>
                  {row.change}
                </p>
              </div>
            ))}
          </div>
        </article>
      </ScrollReveal>

      {/* Mandatory Tagline Reveal Section (B11) */}
      <TaglineReveal
        text={
          lang === "te"
            ? "ప్రతి రైతుకు స్పష్టమైన సమాచారం, సరైన విత్తనాలు మరియు న్యాయమైన మార్కెట్ ధరలు అందాలి."
            : "Every farmer deserves clear local advice, honest market rates, and direct buyer access."
        }
      />

      {/* Marketplace Preview Grid */}
      <ScrollReveal className="px-4 pt-2" delay={80}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="heading-6 text-[#1C241B]">
            {lang === "te" ? "రైతు మార్కెట్" : "Farm store and produce"}
          </h2>
          <button
            onClick={() => navigate("/market")}
            className="button-sm text-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] rounded-lg px-2 py-1"
          >
            Open market
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FEATURED_PRODUCTS.map((p) => {
            const qty = cart[p.id] || 0;
            return (
              <article
                key={p.id}
                className="bg-white border border-[#E6DFD1] rounded-2xl p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="bg-[#FAF6EE] border border-[#EDE6D6] rounded h-20 flex items-center justify-center mb-3">
                    <SproutIcon className="w-8 h-8 text-[#166534]" />
                  </div>
                  <p className="caption-5 text-[#5C665A] truncate">{p.seller}</p>
                  <h3 className="title-4 text-[#1C241B] mt-0.5">{p.title}</h3>
                  <p className="caption-5 text-[#5C665A]">{p.weight}</p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F3EDE0]">
                  <div>
                    <span className="body-4 text-[#1C241B]">₹{p.price}</span>
                    <span className="caption-5 text-[#5C665A] line-through ml-1">₹{p.mrp}</span>
                  </div>
                  <button
                    onClick={() => addItem(p.id)}
                    className={`button-sm py-2 px-3 rounded-lg transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] ${
                      qty > 0
                        ? "bg-[#166534] text-white"
                        : "bg-[#E9F2EC] text-[#166534] hover:bg-[#166534] hover:text-white"
                    }`}
                  >
                    {qty > 0 ? `Added ${qty}` : "Add"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Footer with Privacy & Terms (B10) */}
      <footer className="px-4 pt-8 pb-4 text-center">
        <p className="caption-5 text-[#5C665A]">
          Guidance only. Confirm crop and treatment choices with your local agriculture officer.
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <button
            type="button"
            onClick={() => setInfoNote("Mana Farming stores farm preferences locally and follows India DPDP privacy principles.")}
            className="caption-4 text-[#166534] hover:underline focus-visible:outline-none"
          >
            Privacy policy
          </button>
          <button
            type="button"
            onClick={() => setInfoNote("Indicative prices and AI advice are for informational support only.")}
            className="caption-4 text-[#166534] hover:underline focus-visible:outline-none"
          >
            Terms of use
          </button>
        </div>
        {infoNote && (
          <p className="caption-5 text-[#1C241B] bg-white border border-[#E6DFD1] rounded-xl p-3 mt-3">
            {infoNote}
          </p>
        )}
      </footer>
    </div>
  );
}
