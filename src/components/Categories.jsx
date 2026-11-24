// Categories component with inline SVG icons (no external heroicons import)
import React from "react";

const categories = [
  { name: "Seeds", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5 5L20 7" /></svg>
  ) },
  { name: "Fertilizers", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h12M6 12h12M6 16h12" /></svg>
  ) },
  { name: "Pesticides", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  ) },
  { name: "Tools", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" /></svg>
  ) },
  { name: "Produce", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" strokeWidth={2} /></svg>
  ) },
  { name: "Dairy", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
  ) },
];

export default function Categories() {
  return (
    <section className="px-4 py-6 bg-bg-primary">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((cat) => (
          <button key={cat.name} className="flex items-center space-x-2 bg-primary/10 text-primary rounded-full px-4 py-2 hover:bg-primary/20 transition">
            {cat.icon}
            <span className="font-medium">{cat.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
