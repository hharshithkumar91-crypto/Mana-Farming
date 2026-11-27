import React, { useState } from "react";

const SCHEMES = [
  {
    name: "PM-KISAN",
    desc: "Direct income support of ₹6,000 per year to farmer families.",
    link: "https://pmkisan.gov.in",
    questions: [
      { q: "Do you own agricultural land?", key: "land" },
      { q: "Is your annual family income below ₹2 lakh?", key: "income" },
      { q: "Are you a small or marginal farmer?", key: "marginal" },
    ],
    minYes: 2,
  },
  {
    name: "PM Fasal Bima Yojana",
    desc: "Crop insurance coverage against natural calamities, pests and disease.",
    link: "https://pmfby.gov.in",
    questions: [
      { q: "Do you grow notified crops in your area?", key: "notified" },
      { q: "Have you taken a crop loan from a bank?", key: "loan" },
    ],
    minYes: 1,
  },
  {
    name: "Kisan Credit Card (KCC)",
    desc: "Short-term credit up to ₹3 lakh at subsidised interest for farming needs.",
    link: "https://nabard.org/kcc.aspx",
    questions: [
      { q: "Do you have land records in your name?", key: "records" },
      { q: "Do you have a bank account?", key: "bank" },
    ],
    minYes: 2,
  },
  {
    name: "eNAM (National Agriculture Market)",
    desc: "Online trading platform to sell produce at transparent prices.",
    link: "https://enam.gov.in",
    questions: [
      { q: "Do you have a smartphone or computer access?", key: "device" },
      { q: "Is your nearest mandi linked to eNAM?", key: "mandi" },
    ],
    minYes: 1,
  },
];

function SchemeCard({ scheme }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const toggle = (key) => setAnswers((a) => ({ ...a, [key]: !a[key] }));
  const yesCount = Object.values(answers).filter(Boolean).length;
  const eligible = checked && yesCount >= scheme.minYes;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-bold text-gray-800 text-sm mb-1">{scheme.name}</h3>
      <p className="text-xs text-gray-500 mb-3">{scheme.desc}</p>

      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Quick Eligibility Check</p>
      <div className="space-y-2 mb-3">
        {scheme.questions.map((q) => (
          <label key={q.key} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!answers[q.key]}
              onChange={() => toggle(q.key)}
              className="accent-primary"
            />
            <span className="text-xs text-gray-700">{q.q}</span>
          </label>
        ))}
      </div>

      <button
        onClick={() => setChecked(true)}
        className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-xl font-semibold"
      >
        Check Eligibility
      </button>

      {checked && (
        <div className={`mt-3 p-3 rounded-xl text-xs ${eligible ? "bg-[#FAF6EE] border border-green-200 text-green-800" : "bg-gray-50 border border-gray-200 text-gray-700"}`}>
          {eligible
            ? `✅ You may qualify for ${scheme.name}. Visit the official portal to apply.`
            : `ℹ️ You may not meet the basic criteria. Check the official portal for full eligibility details.`}
          <br />
          <span className="font-semibold">Note: This is a suggestion only. The app does not guarantee eligibility.</span>
        </div>
      )}

      <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center text-xs text-primary font-semibold hover:underline">
        Visit Official Portal →
      </a>
    </div>
  );
}

export default function Schemes() {
  return (
    <div className="min-h-screen bg-[#FAF6EE] pb-24">
      <div className="bg-primary text-white px-4 pt-10 pb-6 rounded-b-3xl">
        <h1 className="text-xl font-bold">🏛️ Government Schemes</h1>
        <p className="text-sm opacity-80 mt-1">Check eligibility and apply via official portals</p>
      </div>
      <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
        <p className="text-xs text-amber-800">ℹ️ This app only suggests schemes to check. It does not confirm eligibility. Always verify through the official government portal.</p>
      </div>
      <div className="mx-4 space-y-4">
        {SCHEMES.map((s) => <SchemeCard key={s.name} scheme={s} />)}
      </div>
    </div>
  );
}
