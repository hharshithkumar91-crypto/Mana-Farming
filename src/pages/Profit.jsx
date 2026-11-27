import React, { useState } from "react";

const CROP_PRESETS = {
  Paddy:     { yieldPerAcre: 24, pricePerUnit: 2200, unit: "Quintal", water: "High",   season: "Kharif", seedCost: 2500, fertCost: 5500, labourCost: 9000, irrigCost: 2500 },
  Cotton:    { yieldPerAcre: 10, pricePerUnit: 6800, unit: "Quintal", water: "Medium", season: "Kharif", seedCost: 3200, fertCost: 6500, labourCost: 11000, irrigCost: 2000 },
  Maize:     { yieldPerAcre: 22, pricePerUnit: 1950, unit: "Quintal", water: "Medium", season: "Kharif/Rabi", seedCost: 2200, fertCost: 4800, labourCost: 6500, irrigCost: 1800 },
  Chilli:    { yieldPerAcre: 18, pricePerUnit: 12000, unit: "Quintal", water: "Medium", season: "Kharif", seedCost: 6000, fertCost: 14000, labourCost: 25000, irrigCost: 5000 },
  Groundnut: { yieldPerAcre: 10, pricePerUnit: 5500, unit: "Quintal", water: "Low",    season: "Kharif/Rabi", seedCost: 5000, fertCost: 3800, labourCost: 7000, irrigCost: 1500 },
};

export default function Profit() {
  const [crop, setCrop] = useState("Paddy");
  const [acres, setAcres] = useState(2);
  const [costs, setCosts] = useState({ ...CROP_PRESETS.Paddy });

  const selectCrop = (name) => {
    setCrop(name);
    setCosts({ ...CROP_PRESETS[name] });
  };

  const totalCostPerAcre = Number(costs.seedCost) + Number(costs.fertCost) + Number(costs.labourCost) + Number(costs.irrigCost);
  const totalCost = totalCostPerAcre * acres;
  const totalRevenue = Number(costs.yieldPerAcre) * Number(costs.pricePerUnit) * acres;
  const netProfit = totalRevenue - totalCost;
  const roi = totalCost > 0 ? Math.round((netProfit / totalCost) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAF6EE] pb-24">
      <div className="bg-primary text-white px-4 pt-10 pb-6 rounded-b-3xl">
        <h1 className="text-xl font-bold">💰 Crop Profit Calculator</h1>
        <p className="text-xs opacity-80 mt-1">Estimate costs, revenue, and compare crops</p>
      </div>

      <div className="mx-4 mt-4 space-y-4">
        {/* Crop selector + Acres */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Select Crop</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(CROP_PRESETS).map((name) => (
                <button
                  key={name}
                  onClick={() => selectCrop(name)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
                    crop === name ? "bg-primary text-white" : "bg-[#FAF6EE] text-primary"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Land Size (Acres)</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={acres}
              onChange={(e) => setAcres(Math.max(0.5, Number(e.target.value)))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "seedCost", label: "Seeds (₹/acre)" },
              { key: "fertCost", label: "Fertilizer (₹/acre)" },
              { key: "labourCost", label: "Labour (₹/acre)" },
              { key: "irrigCost", label: "Irrigation (₹/acre)" },
              { key: "yieldPerAcre", label: `Yield (${costs.unit}/acre)` },
              { key: "pricePerUnit", label: `Market Price (₹/${costs.unit})` },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">{f.label}</label>
                <input
                  type="number"
                  value={costs[f.key]}
                  onChange={(e) => setCosts({ ...costs, [f.key]: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Estimated Summary ({acres} Acres · {crop})</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Total Cost</p>
              <p className="text-base font-bold text-gray-800">₹{totalCost.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Est. Revenue</p>
              <p className="text-base font-bold text-primary">₹{totalRevenue.toLocaleString("en-IN")}</p>
            </div>
            <div className={`rounded-xl p-3 col-span-2 ${netProfit >= 0 ? "bg-[#FAF6EE] border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">{netProfit >= 0 ? "Estimated Net Profit" : "Estimated Loss"}</p>
                  <p className={`text-xl font-bold ${netProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
                    ₹{netProfit.toLocaleString("en-IN")}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${netProfit >= 0 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                  ROI: {roi}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Crop Comparison Table */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-2">Smart Crop Comparison (Per Acre)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2">Crop</th>
                  <th className="py-2">Water</th>
                  <th className="py-2">Est. Cost</th>
                  <th className="py-2">Est. Profit</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(CROP_PRESETS).map(([name, c]) => {
                  const cost = c.seedCost + c.fertCost + c.labourCost + c.irrigCost;
                  const profit = c.yieldPerAcre * c.pricePerUnit - cost;
                  return (
                    <tr key={name} className="border-b last:border-0">
                      <td className="py-2 font-semibold text-gray-800">{name}</td>
                      <td className="py-2 text-gray-600">{c.water}</td>
                      <td className="py-2">₹{cost.toLocaleString("en-IN")}</td>
                      <td className="py-2 font-bold text-green-700">₹{profit.toLocaleString("en-IN")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-amber-700 mt-2">
            ⚠️ Estimates vary by rainfall, soil fertility, and mandi rates.
          </p>
        </div>
      </div>
    </div>
  );
}
