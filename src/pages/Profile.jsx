import React, { useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_user")) || null; } catch { return null; }
  });
  const [form, setForm] = useState({ name: "", phone: "", district: "", role: "farmer" });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // NOTE: This stores only non-sensitive profile info. No passwords stored here.
    const profile = { ...form, createdAt: new Date().toISOString() };
    localStorage.setItem("mf_user", JSON.stringify(profile));
    setUser(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("mf_user");
    setUser(null);
    setForm({ name: "", phone: "", district: "", role: "farmer" });
  };

  return (
    <div className="min-h-screen bg-green-50 pb-24">
      <div className="bg-primary text-white px-4 pt-10 pb-6 rounded-b-3xl">
        <h1 className="text-xl font-bold">👤 My Profile</h1>
        <p className="text-sm opacity-80 mt-1">
          {user ? `Welcome, ${user.name}` : "Set up your farm profile"}
        </p>
      </div>

      <div className="mx-4 mt-4">
        {user ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-2xl">👨‍🌾</div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">{user.name}</h2>
                  <p className="text-xs text-gray-500 capitalize">{user.role} · {user.district}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Phone", value: user.phone },
                  { label: "Role", value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1) },
                  { label: "District", value: user.district },
                  { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString("en-IN") },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs text-amber-800">🔐 For full security (OTP login, order history, cloud sync), connect to our backend. Currently using local storage for demo purposes.</p>
            </div>

            <button onClick={handleLogout} className="w-full border border-red-300 text-red-500 rounded-2xl py-3 font-semibold text-sm hover:bg-red-50 transition">
              Log Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Raju Reddy" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
              <input required type="tel" pattern="[0-9]{10}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="block text-xs font-semibold text-gray-500 mb-1">District</label>
              <input required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g. Guntur" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Your Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-primary text-white rounded-2xl py-3 font-semibold text-sm hover:bg-green-800 transition">
              {saved ? "✅ Saved!" : "Save Profile"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
