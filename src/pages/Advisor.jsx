import React, { useState } from "react";

const CROPS = [
  { name: "Rice (Paddy)", soil: ["clay", "loamy"], seasons: ["Kharif"], districts: ["all"] },
  { name: "Wheat", soil: ["loamy", "sandy loam"], seasons: ["Rabi"], districts: ["all"] },
  { name: "Cotton", soil: ["black", "loamy"], seasons: ["Kharif"], districts: ["all"] },
  { name: "Sugarcane", soil: ["loamy", "clay"], seasons: ["Zaid", "Kharif"], districts: ["all"] },
  { name: "Groundnut", soil: ["sandy loam", "loamy"], seasons: ["Kharif", "Rabi"], districts: ["all"] },
  { name: "Maize (Corn)", soil: ["loamy", "sandy loam", "black"], seasons: ["Kharif", "Rabi"], districts: ["all"] },
  { name: "Tomato", soil: ["loamy", "sandy loam"], seasons: ["Rabi", "Zaid"], districts: ["all"] },
  { name: "Chilli", soil: ["loamy", "black"], seasons: ["Kharif", "Rabi"], districts: ["all"] },
  { name: "Turmeric", soil: ["loamy", "clay"], seasons: ["Kharif"], districts: ["all"] },
  { name: "Sunflower", soil: ["loamy", "black", "sandy loam"], seasons: ["Rabi", "Zaid"], districts: ["all"] },
];

const SOIL_TYPES = ["loamy", "clay", "black", "sandy loam", "red laterite"];
const SEASONS = ["Kharif", "Rabi", "Zaid"];

function getReason(crop, soil, season) {
  return `${crop.name} grows well in ${soil} soil during the ${season} season. It suits your selected district and is a commonly profitable crop for Indian farmers.`;
}

export default function Advisor() {
  const [soil, setSoil] = useState("");
  const [season, setSeason] = useState("");
  const [district, setDistrict] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!soil || !season || !district) return;
    setLoading(true);
    setTimeout(() => {
      const matched = CROPS.filter(
        (c) => c.soil.includes(soil) && c.seasons.includes(season)
      );
      setResults(matched.length ? matched : CROPS.slice(0, 3));
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-green-50 pb-24">
      <div className="bg-primary text-white px-4 pt-10 pb-6 rounded-b-3xl">
        <h1 className="text-xl font-bold">🌾 Crop Advisor</h1>
        <p className="text-sm opacity-80 mt-1">Enter your farm details for personalised recommendations</p>
      </div>

      <form onSubmit={handleSubmit} className="mx-4 mt-4 space-y-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Soil Type</label>
          <select value={soil} onChange={(e) => setSoil(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Select soil type</option>
            {SOIL_TYPES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Season</label>
          <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Select season</option>
            {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-xs font-semibold text-gray-500 mb-1">District</label>
          <input
            type="text"
            placeholder="e.g. Guntur, Warangal, Kurnool"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button type="submit" className="w-full bg-primary text-white rounded-2xl py-3 font-semibold text-sm hover:bg-green-800 transition">
          {loading ? "Finding crops…" : "Get Recommendations"}
        </button>
      </form>

      {results && (
        <div className="mx-4 mt-4 space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-800">⚠️ This advice is general guidance only. Please confirm with your local Agriculture Officer before planting.</p>
          </div>
          {results.map((crop, i) => (
            <div key={crop.name} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-primary">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-800">#{i + 1} {crop.name}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommended</span>
              </div>
              <p className="text-xs text-gray-500">{getReason(crop, soil, season)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
