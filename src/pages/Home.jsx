import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { t, getLang, setLang } from "../i18n";

const CATEGORIES = [
  { labelEn: "Advisor",   labelTe: "సలహా",      emoji: "🌾", path: "/advisor", bg: "bg-emerald-50" },
  { labelEn: "AI Voice",  labelTe: "AI వాయిస్", emoji: "🎙️", path: "/ai",      bg: "bg-orange-50" },
  { labelEn: "Mandi",     labelTe: "మండి",      emoji: "📊", path: "/mandi",   bg: "bg-amber-50" },
  { labelEn: "Doctor",    labelTe: "స్కాన్",    emoji: "🔬", path: "/scan",    bg: "bg-rose-50" },
  { labelEn: "Profit",    labelTe: "లాభాలు",    emoji: "💰", path: "/profit",  bg: "bg-lime-50" },
  { labelEn: "My Farm",   labelTe: "నా పొలం",   emoji: "🚜", path: "/farm",    bg: "bg-teal-50" },
  { labelEn: "Schemes",   labelTe: "పథకాలు",    emoji: "🏛️", path: "/schemes", bg: "bg-sky-50" },
];

const FEATURED_PRODUCTS = [
  { id: 1, title: "Fresh Tomatoes",   weight: "1 kg",    seller: "Guntur Farm",   price: 25,  mrp: 35,  emoji: "🍅" },
  { id: 2, title: "Basmati Rice",     weight: "5 kg",    seller: "Kurnool Mill",  price: 325, mrp: 380, emoji: "🌾" },
  { id: 4, title: "Cotton Hybrid Seed", weight: "450 g", seller: "Warangal Agro", price: 450, mrp: 520, emoji: "🌱" },
  { id: 5, title: "Guntur Red Chilli", weight: "1 kg",   seller: "Spice Hub",     price: 220, mrp: 260, emoji: "🌶️" },
];

export default function Home() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [lang, setLangState] = useState(getLang());
  const [added, setAdded] = useState({});

  const handleLang = (l) => {
    setLang(l);
    setLangState(l);
  };

  useEffect(() => {
    const loc = (lat, lon) =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then((r) => r.json())
        .then((d) => setWeather(d.current_weather))
        .catch(() => {});
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => loc(coords.latitude, coords.longitude),
      () => loc(17.38, 78.47)
    );
  }, []);

  const toggleAdd = (id) => {
    setAdded((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Sticky Zepto / Amazon Header + Search */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
              <h1 className="text-lg font-extrabold tracking-tight text-stone-900">
                {t("appName")}
              </h1>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              {weather ? `${weather.temperature}°C · Wind ${weather.windspeed} km/h` : "Hyderabad · Live Weather"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {["en", "te"].map((l) => (
              <button
                key={l}
                onClick={() => handleLang(l)}
                className={`text-xs px-2.5 py-1 rounded-full font-bold transition active:scale-95 ${
                  lang === l
                    ? "bg-primary text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {l === "en" ? "EN" : "తెలుగు"}
              </button>
            ))}
          </div>
        </div>

        {/* Sticky Search */}
        <div
          onClick={() => navigate("/market")}
          className="flex items-center bg-[#FAF7F2] border border-stone-200 rounded-xl px-3.5 py-2.5 cursor-pointer hover:border-primary/40 transition"
        >
          <svg className="w-4 h-4 text-stone-400 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-4.35-4.35m0 0A7 7 0 104.65 4.65a7 7 0 0012 12z" />
          </svg>
          <span className="text-sm text-stone-400 flex-1 truncate">{t("searchPlaceholder")}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate("/ai"); }}
            className="text-xs font-bold text-harvest pl-2 border-l border-stone-200"
          >
            🎙️ Voice
          </button>
        </div>
      </header>

      {/* Round Category Icons Row (Zepto-style) */}
      <section className="px-4 pt-4 pb-2 flex gap-3.5 overflow-x-auto no-scrollbar animate-rise">
        {CATEGORIES.map((c) => (
          <button
            key={c.path}
            onClick={() => navigate(c.path)}
            className="flex flex-col items-center shrink-0 group active:scale-95 transition-transform"
          >
            <div className={`w-14 h-14 rounded-full ${c.bg} border border-stone-200/70 flex items-center justify-center text-2xl shadow-sm group-hover:-translate-y-0.5 transition-transform`}>
              {c.emoji}
            </div>
            <span className="text-[11px] font-semibold text-stone-700 mt-1.5">
              {lang === "te" ? c.labelTe : c.labelEn}
            </span>
          </button>
        ))}
      </section>

      {/* Hero Editorial Banner */}
      <section className="px-4 mt-3 animate-rise">
        <div className="bg-primary text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
            {lang === "te" ? "రైతు నేస్తం" : "FARMER COMPANION"}
          </p>
          <h2 className="text-xl font-extrabold mt-1 leading-snug">
            {lang === "te" ? "మీ పంటకు సరైన సలహా & మార్కెట్ ధరలు" : "Better crop decisions, fair mandi prices."}
          </h2>
          <p className="text-xs text-emerald-100 mt-1.5 max-w-[85%]">
            {lang === "te"
              ? "విత్తనాలు, మండి రేట్లు, వ్యాధి నిర్ధారణ మరియు లాభాల లెక్కలు ఒకే చోట."
              : "Check live rates, compare crop profit, and buy farm inputs directly."}
          </p>
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={() => navigate("/advisor")}
              className="bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
            >
              {lang === "te" ? "పంట సలహా పొందండి" : "Crop Advisor →"}
            </button>
            <button
              onClick={() => navigate("/ai")}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition active:scale-95"
            >
              🎙️ {lang === "te" ? "తెలుగు AI" : "Ask Mana AI"}
            </button>
          </div>
        </div>
      </section>

      {/* Live Mandi Price Card with Pulsing Dot */}
      <section className="px-4 mt-4 animate-rise">
        <div
          onClick={() => navigate("/mandi")}
          className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm hover:shadow-md transition cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wide text-stone-800">
                {lang === "te" ? "లైవ్ మండి ధరలు" : "Live Mandi Snapshot"}
              </span>
            </div>
            <span className="text-xs font-bold text-primary">View all →</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { crop: "Chilli", mkt: "Guntur", price: "₹12,000", trend: "▲ 2.1%", up: true },
              { crop: "Cotton", mkt: "Kurnool", price: "₹6,800", trend: "▲ 1.4%", up: true },
              { crop: "Paddy",  mkt: "Warangal", price: "₹2,100", trend: "▼ 0.5%", up: false },
            ].map((r) => (
              <div key={r.crop} className="bg-[#FAF7F2] rounded-xl p-2.5">
                <p className="text-xs font-bold text-stone-800">{r.crop}</p>
                <p className="text-[10px] text-stone-400">{r.mkt}</p>
                <p className="text-sm font-extrabold text-primary mt-1">{r.price}</p>
                <p className={`text-[10px] font-bold ${r.up ? "text-emerald-600" : "text-rose-500"}`}>{r.trend}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zepto-style 2-Column Featured Products */}
      <section className="px-4 mt-5 animate-rise">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-stone-900">
            {lang === "te" ? "రైతు మార్కెట్" : "Fresh from Farms & Stores"}
          </h2>
          <button onClick={() => navigate("/market")} className="text-xs font-bold text-primary">
            See all →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {FEATURED_PRODUCTS.map((p) => {
            const qty = added[p.id] || 0;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="bg-[#FAF7F2] rounded-xl h-24 flex items-center justify-center text-4xl mb-2.5">
                  {p.emoji}
                </div>
                <p className="text-[10px] font-semibold text-stone-400">{p.seller}</p>
                <h3 className="text-sm font-bold text-stone-900 leading-tight mt-0.5">{p.title}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{p.weight}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                  <div>
                    <span className="text-sm font-extrabold text-stone-900">₹{p.price}</span>
                    <span className="text-[11px] text-stone-400 line-through ml-1">₹{p.mrp}</span>
                  </div>
                  <button
                    onClick={() => toggleAdd(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition active:scale-95 ${
                      qty > 0
                        ? "bg-primary text-white"
                        : "border border-primary text-primary bg-emerald-50/50 hover:bg-primary hover:text-white"
                    }`}
                  >
                    {qty > 0 ? `ADDED (${qty})` : "ADD"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Honest Disclaimer */}
      <div className="mx-4 mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>📢 {t("notice")}:</strong> {t("noticeText")}
        </p>
      </div>
    </div>
  );
}
