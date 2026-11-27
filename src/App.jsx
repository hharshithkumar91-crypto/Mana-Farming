import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Mandi = lazy(() => import("./pages/Mandi.jsx"));
const Scan = lazy(() => import("./pages/Scan.jsx"));
const Market = lazy(() => import("./pages/Market.jsx"));
const Advisor = lazy(() => import("./pages/Advisor.jsx"));
const Schemes = lazy(() => import("./pages/Schemes.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const ManaAI = lazy(() => import("./pages/ManaAI.jsx"));
const Profit = lazy(() => import("./pages/Profit.jsx"));
const Farm = lazy(() => import("./pages/Farm.jsx"));

function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF6EE] p-4 space-y-4">
      <div className="h-14 bg-[#F3EDE0] rounded-2xl skeleton-pulse" />
      <div className="h-44 bg-[#F3EDE0] rounded-2xl skeleton-pulse" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-36 bg-[#F3EDE0] rounded-2xl skeleton-pulse" />
        <div className="h-36 bg-[#F3EDE0] rounded-2xl skeleton-pulse" />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center p-6 text-center">
      <div className="bg-white border border-[#E6DFD1] rounded-2xl p-6 max-w-sm w-full">
        <p className="caption-3 text-[#D97706] uppercase tracking-wider">Page 404</p>
        <h1 className="heading-5 text-[#1C241B] mt-2">Page not found</h1>
        <p className="body-6 text-[#5C665A] mt-2">
          The screen you opened does not exist in Mana Farming.
        </p>
        <Link
          to="/"
          className="inline-block mt-4 button-md bg-[#166534] text-white py-2 px-3 rounded-xl"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/Mana-Farming">
      <div className="max-w-md mx-auto relative min-h-screen bg-[#FAF6EE]">
        <main id="main-content">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mandi" element={<Mandi />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/market" element={<Market />} />
              <Route path="/advisor" element={<Advisor />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ai" element={<ManaAI />} />
              <Route path="/profit" element={<Profit />} />
              <Route path="/farm" element={<Farm />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
