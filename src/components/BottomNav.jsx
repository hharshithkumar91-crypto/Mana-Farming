import React from "react";
import { NavLink } from "react-router-dom";

const NAV = [
  { label: "Home", path: "/", icon: "🏠" },
  { label: "Mandi", path: "/mandi", icon: "📊" },
  { label: "Scan", path: "/scan", icon: "🔬" },
  { label: "Market", path: "/market", icon: "🛒" },
  { label: "Advisor", path: "/advisor", icon: "🌾" },
  { label: "Schemes", path: "/schemes", icon: "🏛️" },
  { label: "Profile", path: "/profile", icon: "👤" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <ul className="flex justify-around px-1 py-1">
        {NAV.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 text-center rounded-xl mx-0.5 transition ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:text-primary"
                }`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium leading-none">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
