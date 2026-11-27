import React from "react";
import { NavLink } from "react-router-dom";

const NAV = [
  {
    label: "Home",
    path: "/",
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 1.8 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z" />
      </svg>
    ),
  },
  {
    label: "Mandi",
    path: "/mandi",
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 15l4-4 3 3 5-6" />
      </svg>
    ),
  },
  {
    label: "Scan",
    path: "/scan",
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V5a1 1 0 011-1h3m8 0h3a1 1 0 011 1v3m0 8v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M7 12h10" />
      </svg>
    ),
  },
  {
    label: "Market",
    path: "/market",
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12l1 13H5L6 7zm3 0V5a3 3 0 016 0v2" />
      </svg>
    ),
  },
  {
    label: "Profile",
    path: "/profile",
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.9}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0H5z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-50">
      <ul className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {NAV.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[48px] transition-transform active:scale-90 ${
                  isActive ? "text-primary" : "text-stone-400 hover:text-stone-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.icon(isActive)}
                  <span className={`text-[11px] mt-0.5 ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
