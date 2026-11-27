import React from "react";
import { NavLink } from "react-router-dom";
import { HomeIcon, ChartIcon, ScanIcon, BagIcon, UserIcon } from "./Icons.jsx";

const NAV = [
  { label: "Home", path: "/", render: (a) => <HomeIcon active={a} /> },
  { label: "Mandi", path: "/mandi", render: () => <ChartIcon /> },
  { label: "Scan", path: "/scan", render: () => <ScanIcon /> },
  { label: "Market", path: "/market", render: (a) => <BagIcon active={a} /> },
  { label: "Profile", path: "/profile", render: (a) => <UserIcon active={a} /> },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E6DFD1] z-50"
    >
      <ul className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {NAV.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[48px] rounded-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] ${
                  isActive ? "text-[#166534]" : "text-[#5C665A] hover:text-[#1C241B]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.render(isActive)}
                  <span className="caption-4 mt-1">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
