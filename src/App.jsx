import React from "react";
import TopBar from "./components/TopBar.jsx";
import Hero from "./components/Hero.jsx";
import Categories from "./components/Categories.jsx";
import BottomNav from "./components/BottomNav.jsx";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <TopBar />
      <main className="flex-1 pt-16 pb-16">
        <Hero />
        <Categories />
      </main>
      <BottomNav />
    </div>
  );
}
