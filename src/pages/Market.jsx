import React, { useState } from "react";

const LISTINGS = [
  { id: 1, title: "Fresh Tomatoes", seller: "Raju Farms, Guntur", price: 25, unit: "kg", category: "Produce", emoji: "🍅", stock: 500 },
  { id: 2, title: "Basmati Rice", seller: "Kumar Exports, Kurnool", price: 65, unit: "kg", category: "Grains", emoji: "🌾", stock: 2000 },
  { id: 3, title: "Groundnut Oil", seller: "Lakshmi Traders, Nellore", price: 160, unit: "litre", category: "Oil", emoji: "🫙", stock: 100 },
  { id: 4, title: "Cotton Seed", seller: "Green Agro, Warangal", price: 450, unit: "kg", category: "Seeds", emoji: "🌱", stock: 300 },
  { id: 5, title: "Chilli (Red Dry)", seller: "Spice Hub, Guntur", price: 220, unit: "kg", category: "Spices", emoji: "🌶️", stock: 150 },
  { id: 6, title: "Turmeric Powder", seller: "Organic Fields, Nizamabad", price: 180, unit: "kg", category: "Spices", emoji: "🟡", stock: 200 },
];

export default function Market() {
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");

  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id) => setCart((c) => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = LISTINGS.find((l) => l.id === parseInt(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const filtered = LISTINGS.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-green-50 pb-24">
      <div className="bg-primary text-white px-4 pt-10 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🛒 Marketplace</h1>
            <p className="text-xs opacity-80 mt-1">Direct farmer-to-buyer trading</p>
          </div>
          <button onClick={() => setCartOpen(!cartOpen)} className="relative">
            <span className="text-2xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-xs text-black font-bold rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>
            )}
          </button>
        </div>
        <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 flex items-center">
          <span className="text-sm mr-2">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search produce, seeds, spices…"
            className="bg-transparent text-white placeholder-white/60 text-sm flex-1 outline-none"
          />
        </div>
      </div>

      {/* Cart panel */}
      {cartOpen && totalItems > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-md p-4 border border-primary/20">
          <h3 className="font-semibold text-gray-700 mb-3">Your Cart</h3>
          {Object.entries(cart).map(([id, qty]) => {
            const item = LISTINGS.find((l) => l.id === parseInt(id));
            return item ? (
              <div key={id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{item.emoji} {item.title} × {qty}</span>
                <span className="text-sm font-semibold text-primary">₹{(item.price * qty).toLocaleString("en-IN")}</span>
              </div>
            ) : null;
          })}
          <div className="flex justify-between items-center mt-3">
            <span className="font-bold text-gray-800">Total: ₹{totalPrice.toLocaleString("en-IN")}</span>
            <button className="bg-primary text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-green-800 transition">Checkout (UPI/COD)</button>
          </div>
        </div>
      )}

      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm p-3 flex flex-col">
            <div className="text-3xl mb-2 text-center">{item.emoji}</div>
            <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
            <p className="text-xs text-gray-400 mb-1">{item.seller}</p>
            <p className="text-primary font-bold text-sm mt-auto">₹{item.price}/{item.unit}</p>
            <div className="flex items-center justify-between mt-2">
              {cart[item.id] ? (
                <div className="flex items-center space-x-2">
                  <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 bg-gray-100 rounded-full text-gray-700 font-bold text-xs flex items-center justify-center">−</button>
                  <span className="text-sm font-semibold">{cart[item.id]}</span>
                  <button onClick={() => addToCart(item.id)} className="w-6 h-6 bg-primary rounded-full text-white font-bold text-xs flex items-center justify-center">+</button>
                </div>
              ) : (
                <button onClick={() => addToCart(item.id)} className="bg-primary text-white text-xs px-3 py-1.5 rounded-xl font-semibold hover:bg-green-800 transition w-full">Add to Cart</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
