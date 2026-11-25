import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Mandi = lazy(() => import("./pages/Mandi.jsx"));
const Scan = lazy(() => import("./pages/Scan.jsx"));
const Market = lazy(() => import("./pages/Market.jsx"));
const Advisor = lazy(() => import("./pages/Advisor.jsx"));
const Schemes = lazy(() => import("./pages/Schemes.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">🌱</div>
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/Mana-Farming">
      <div className="max-w-md mx-auto relative min-h-screen">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mandi" element={<Mandi />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/market" element={<Market />} />
            <Route path="/advisor" element={<Advisor />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
