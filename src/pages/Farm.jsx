import React, { useState } from "react";

function buildTasks(crop, sowingDate) {
  const start = sowingDate ? new Date(sowingDate) : new Date();
  const addDays = (d) => {
    const dt = new Date(start);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().slice(0, 10);
  };
  return [
    { id: 1, title: `Land prep & ${crop} sowing`, date: addDays(0), done: true },
    { id: 2, title: "First irrigation & gap filling", date: addDays(7), done: false },
    { id: 3, title: "Weeding & basal fertilizer check", date: addDays(21), done: false },
    { id: 4, title: "Top-dressing (Nitrogen split)", date: addDays(35), done: false },
    { id: 5, title: "Pest & leaf inspection", date: addDays(50), done: false },
    { id: 6, title: "Harvest readiness check", date: addDays(105), done: false },
  ];
}

export default function Farm() {
  const [farms, setFarms] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_farms")) || []; } catch { return []; }
  });
  const [form, setForm] = useState({ name: "", acres: "2", soil: "Loamy", crop: "Paddy", sowingDate: new Date().toISOString().slice(0, 10) });

  const saveFarms = (next) => {
    setFarms(next);
    localStorage.setItem("mf_farms", JSON.stringify(next));
  };

  const addFarm = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const newFarm = {
      id: Date.now(),
      ...form,
      tasks: buildTasks(form.crop, form.sowingDate),
      expenses: [],
    };
    saveFarms([newFarm, ...farms]);
    setForm({ ...form, name: "" });
  };

  const toggleTask = (farmId, taskId) => {
    saveFarms(
      farms.map((f) =>
        f.id === farmId
          ? { ...f, tasks: f.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
          : f
      )
    );
  };

  const deleteFarm = (farmId) => saveFarms(farms.filter((f) => f.id !== farmId));

  return (
    <div className="min-h-screen bg-[#FAF6EE] pb-24">
      <div className="bg-primary text-white px-4 pt-10 pb-6 rounded-b-3xl">
        <h1 className="text-xl font-bold">🚜 Personal Farm Manager</h1>
        <p className="text-xs opacity-80 mt-1">Track plots, sowing schedules & crop tasks</p>
      </div>

      <div className="mx-4 mt-4 space-y-4">
        <form onSubmit={addFarm} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-800">Add Farm Plot</h2>
          <input
            required
            placeholder="Plot name (e.g. East Field)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.5"
              min="0.5"
              placeholder="Acres"
              value={form.acres}
              onChange={(e) => setForm({ ...form, acres: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
            <select value={form.soil} onChange={(e) => setForm({ ...form, soil: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
              {["Loamy", "Clay", "Black", "Sandy Loam"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <input
              placeholder="Crop (e.g. Paddy)"
              value={form.crop}
              onChange={(e) => setForm({ ...form, crop: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={form.sowingDate}
              onChange={(e) => setForm({ ...form, sowingDate: e.target.value })}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-800">
            + Add Plot & Generate Schedule
          </button>
        </form>

        {farms.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">
            No farm plots added yet. Add a plot above to auto-generate your activity calendar.
          </div>
        ) : (
          farms.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{f.name}</h3>
                  <p className="text-xs text-gray-500">{f.acres} acres · {f.soil} soil · {f.crop} (Sown {f.sowingDate})</p>
                </div>
                <button onClick={() => deleteFarm(f.id)} className="text-xs text-red-500 hover:underline">Remove</button>
              </div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Activity Calendar</p>
              <div className="space-y-2">
                {f.tasks.map((t) => (
                  <label key={t.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={t.done} onChange={() => toggleTask(f.id, t.id)} className="accent-primary" />
                      <span className={`text-xs ${t.done ? "line-through text-gray-400" : "text-gray-700 font-medium"}`}>{t.title}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{t.date}</span>
                  </label>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
