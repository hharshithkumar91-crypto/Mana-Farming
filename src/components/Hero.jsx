import React from "react";

export default function Hero() {
  return (
    <section className="bg-green-700 text-white py-16 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Farm smarter, earn better</h1>
      <p className="text-lg md:text-xl mb-6">
        Sell produce, get AI crop advice, and track live mandi prices, all in one app.
      </p>
      <button className="inline-flex items-center bg-green-500 hover:bg-green-400 text-white font-semibold py-2 px-6 rounded-full transition">
        Start free
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </section>
  );
}
