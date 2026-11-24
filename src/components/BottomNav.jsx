import React from "react";
import { HomeIcon, ChartBarIcon, CameraIcon, ChatBubbleBottomCenterTextIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

const items = [
  { name: "Home", icon: HomeIcon },
  { name: "Mandi", icon: ChartBarIcon },
  { name: "Scan", icon: CameraIcon },
  { name: "Advisor", icon: ChatBubbleBottomCenterTextIcon, url: "https://github.com/<USERNAME>/<REPO>" },
  { name: "Orders", icon: ShoppingBagIcon },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md">
      <ul className="flex justify-between px-4 py-2">
        {items.map((it) => (
          <li key={it.name} className="flex-1 text-center">
            {it.url ? (
              <a href={it.url} target="_blank" rel="noopener noreferrer">
                <button className="flex flex-col items-center text-sm text-gray-600 hover:text-primary">
                  <it.icon className="w-6 h-6 mb-1" />
                  <span>{it.name}</span>
                </button>
              </a>
            ) : (
              <button className="flex flex-col items-center text-sm text-gray-600 hover:text-primary">
                <it.icon className="w-6 h-6 mb-1" />
                <span>{it.name}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
