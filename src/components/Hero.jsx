import React from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

export default function Hero() {
  return (
    <section className="bg-primary text-white py-16 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Farm smarter, earn better</h1>
      <p className="text-lg md:text-xl mb-6">
        Sell produce, get AI crop advice, and track live mandi prices, all in one app.
      </p>
      <button className="inline-flex items-center bg-secondary hover:bg-secondary/80 text-white font-semibold py-2 px-6 rounded-full transition">
        Start free
        <ArrowRightIcon className="w-5 h-5 ml-2" />
      </button>
    </section>
  );
}
