import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const quickActions = [
  { label: "Mandi Prices", emoji: "📊", path: "/mandi", color: "bg-amber-50 border-amber-200 text-amber-800" },
  { label: "Crop Advisor", emoji: "🌾", path: "/advisor", color: "bg-green-50 border-green-200 text-green-800" },
  { label: "Scan Disease", emoji: "🔬", path: "/scan", color: "bg-red-50 border-red-200 text-red-800" },
  { label: "Marketplace", emoji: "🛒", path: "/market", color: "bg-blue-50 border-blue-200 text-blue-800" },
  { label: "Govt Schemes", emoji: "🏛️", path: "/schemes", color: "bg-purple-50 border-purple-200 text-purple-800" },
  { label: "My Profile", emoji: "👤", path: "/profile", color: "bg-gray-50 border-gray-200 text-gray-800" },
];

export default function Home() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    // Open-Meteo – free, no API key needed
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`
        )
          .then((r) => r.json())
          .then((d) => setWeather(d.current_weather))
          .catch(() => {});
      },
      () => {
        // Fallback: Hyderabad
        fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=17.38&longitude=78.47&current_weather=true"
        )
          .then((r) => r.json())
          .then((d) => setWeather(d.current_weather))
          .catch(() => {});
      }
    );
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
      {/* Header */}
      <div className="bg-primary text-white px-4 pt-10 pb-8 rounded-b-3xl shadow-lg">
        <p className="text-sm opacity-80">{greeting} 👋</p>
        <h1 className="text-2xl font-bold mt-1">Mana Farming</h1>
        <p className="text-xs opacity-70 mt-1">Your farm, your future.</p>

        {/* Search */}
        <div className="mt-4 flex items-center bg-white/20 backdrop-blur rounded-xl px-3 py-2">
          <svg className="w-4 h-4 text-white/70 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7 7 0 104.65 4.65a7 7 0 0012 12z" />
          </svg>
          <input
            type="text"
            placeholder="Search crops, seeds, products..."
            className="bg-transparent text-white placeholder-white/60 text-sm flex-1 outline-none"
          />
        </div>
      </div>

      {/* Weather card */}
      <div className="mx-4 -mt-4 bg-white rounded-2xl shadow-md p-4 flex items-center justify-between border border-green-100">
        <div>
          <p className="text-xs text-gray-500">Current Weather</p>
          {weather ? (
            <p className="text-2xl font-bold text-primary">{weather.temperature}°C</p>
          ) : (
            <p className="text-sm text-gray-400">Fetching…</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {weather ? `Wind ${weather.windspeed} km/h` : ""}
          </p>
        </div>
        <div className="text-5xl">🌤️</div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${a.color} hover:scale-105 transition-transform active:scale-95`}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-xs font-medium mt-1 text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">📢 Notice</p>
        <p className="text-sm text-amber-800">
          Mandi prices and AI advice shown here are for guidance only. Always verify with your local agriculture officer before making decisions.
        </p>
      </div>
    </div>
  );
}
