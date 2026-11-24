import React from "react";

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow z-10 flex items-center h-14 px-4 md:px-6">
      {/* Location */}
      <div className="flex items-center text-sm text-gray-600 mr-4">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" />
        </svg>
        <span>Village</span>
      </div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search wheat, fertilizer, tractor parts"
        className="flex-1 py-1 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      />
      {/* Cart */}
      <button className="ml-4 text-gray-600 hover:text-primary">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7a1 1 0 00.9 1.5h12.9M7 13l4 8" />
        </svg>
      </button>
    </header>
  );
}
