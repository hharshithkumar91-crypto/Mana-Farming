import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { t, getLang, setLang } from "../i18n";

const quickActions = [
  { key: "mandiPrices",    labelEn: "Mandi Prices",   labelTe: "మండి ధరలు",      emoji: "📊", path: "/mandi",   color: "bg-amber-50 border-amber-200 text-amber-800" },
  { key: "cropAdvisor",    labelEn: "Crop Advisor",   labelTe: "పంట సలహా",       emoji: "🌾", path: "/advisor", color: "bg-green-50 border-green-200 text-green-800" },
  { key: "diseaseScanner", labelEn: "Plant Doctor",   labelTe: "వ్యాధి స్కాన్",   emoji: "🔬", path: "/scan",    color: "bg-red-50 border-red-200 text-red-800" },
  { key: "marketplace",    labelEn: "Marketplace",    labelTe: "మార్కెట్",        emoji: "🛒", path: "/market",  color: "bg-blue-50 border-blue-200 text-blue-800" },
  { key: "manaAI",         labelEn: "Mana AI Voice",  labelTe: "మన AI వాయిస్",    emoji: "🤖", path: "/ai",      color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { key: "profitCalc",     labelEn: "Profit Calc",    labelTe: "లాభాల లెక్క",     emoji: "💰", path: "/profit",  color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
  { key: "farmManager",    labelEn: "Farm Manager",   labelTe: "పొలం నిర్వహణ",    emoji: "🚜", path: "/farm",    color: "bg-teal-50 border-teal-200 text-teal-800" },
  { key: "govtSchemes",    labelEn: "Govt Schemes",   labelTe: "ప్రభుత్వ పథకాలు", emoji: "🏛️", path: "/schemes", color: "bg-purple-50 border-purple-200 text-purple-800" },
  { key: "myProfile",      labelEn: "My Profile",     labelTe: "నా ప్రొఫైల్",     emoji: "👤", path: "/profile", color: "bg-gray-50 border-gray-200 text-gray-800" },
];

export default function Home() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [lang, setLangState] = useState(getLang());

  const handleLang = (l) => { setLang(l); setLangState(l); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("goodMorning") : hour < 17 ? t("goodAfternoon") : t("goodEvening");

  useEffect(() => {
    const loc = (lat, lon) =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        .then((r) => r.json()).then((d) => setWeather(d.current_weather)).catch(() => {});
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => loc(coords.latitude, coords.longitude),
      () => loc(17.38, 78.47)
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
      <div className="bg-primary text-white px-4 pt-10 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">{greeting} 👋</p>
            <h1 className="text-2xl font-bold mt-1">{t("appName")}</h1>
            <p className="text-xs opacity-70 mt-0.5">{t("tagline")}</p>
          </div>
          <div className="flex space-x-1 mt-1">
            {["en", "te"].map((l) => (
              <button
                key={l}
                onClick={() => handleLang(l)}
                className={`text-xs px-2 py-1 rounded-lg font-semibold transition ${
                  lang === l ? "bg-white text-primary" : "bg-white/20 text-white"
                }`}
              >
                {l === "en" ? "EN" : "తె"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center bg-white/20 backdrop-blur rounded-xl px-3 py-2">
          <svg className="w-4 h-4 text-white/70 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7 7 0 104.65 4.65a7 7 0 0012 12z" />
          </svg>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/market")}
            className="bg-transparent text-white placeholder-white/60 text-sm flex-1 outline-none"
          />
        </div>
      </div>

      {/* Weather */}
      <div className="mx-4 -mt-4 bg-white rounded-2xl shadow-md p-4 flex items-center justify-between border border-green-100">
        <div>
          <p className="text-xs text-gray-500">{t("weather")}</p>
          {weather
            ? <p className="text-2xl font-bold text-primary">{weather.temperature}°C</p>
            : <p className="text-sm text-gray-400">Fetching…</p>}
          {weather && <p className="text-xs text-gray-400 mt-1">Wind {weather.windspeed} km/h</p>}
        </div>
        <div className="text-5xl">{weather?.weathercode <= 1 ? "☀️" : "🌤️"}</div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3">{t("quickActions")}</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.key}
              onClick={() => navigate(a.path)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${a.color} hover:scale-105 transition-transform active:scale-95`}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-xs font-medium mt-1 text-center leading-tight">
                {lang === "te" ? a.labelTe : a.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="mx-4 mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">📢 {t("notice")}</p>
        <p className="text-sm text-amber-800">{t("noticeText")}</p>
      </div>
    </div>
  );
}
