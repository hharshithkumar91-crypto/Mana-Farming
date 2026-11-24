import React from "react";

const items = [
  { name: "Home", path: "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10", url: "/" },
  { name: "Mandi", path: "M3 3v18h18M7 16l4-4 3 2 5-6", url: "/mandi" },
  { name: "Scan", path: "M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M8 12h8", url: "/scan" },
  { name: "Advisor", path: "M21 15a3 3 0 01-3 3H8l-5 3V6a3 3 0 013-3h12a3 3 0 013 3v9zM8 10h8M8 14h5", url: "https://github.com/hharshithkumar91-crypto/Mana-Farming" },
  { name: "Orders", path: "M3 3h2l2 12h10l3-8H6M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z", url: "/orders" },
  // new items
  { name: "Profile", path: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z", url: "/profile" },
  { name: "Settings", path: "M12 1v2m0 18v2m9-9h2M1 12h2m15.36 6.36l1.42 1.42M4.22 4.22l1.42 1.42m0 12.72l-1.42 1.42M19.78 4.22l-1.42 1.42", url: "/settings" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md">
      <ul className="flex justify-between px-4 py-2">
        {items.map((item) => (
          <li key={item.name} className="flex-1 text-center">
            {item.url && item.url.startsWith('http') ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <button className="flex flex-col items-center mx-auto text-sm text-gray-600 hover:text-green-700">
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.path} />
                  </svg>
                  <span>{item.name}</span>
                </button>
              </a>
            ) : (
              <button className="flex flex-col items-center mx-auto text-sm text-gray-600 hover:text-green-700">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.path} />
                </svg>
                <span>{item.name}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
