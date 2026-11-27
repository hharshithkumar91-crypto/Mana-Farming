import React, { useState } from "react";

const INITIAL_LISTINGS = [
  { id: 1, title: "Fresh Tomatoes", seller: "Raju Farms, Guntur", price: 25, unit: "kg", category: "Produce", emoji: "🍅", stock: 500 },
  { id: 2, title: "Basmati Rice", seller: "Kumar Exports, Kurnool", price: 65, unit: "kg", category: "Grains", emoji: "🌾", stock: 2000 },
  { id: 3, title: "Groundnut Oil", seller: "Lakshmi Traders, Nellore", price: 160, unit: "litre", category: "Oil", emoji: "🫙", stock: 100 },
  { id: 4, title: "Cotton Seed", seller: "Green Agro, Warangal", price: 450, unit: "kg", category: "Seeds", emoji: "🌱", stock: 300 },
  { id: 5, title: "Chilli (Red Dry)", seller: "Spice Hub, Guntur", price: 220, unit: "kg", category: "Spices", emoji: "🌶️", stock: 150 },
  { id: 6, title: "Turmeric Powder", seller: "Organic Fields, Nizamabad", price: 180, unit: "kg", category: "Spices", emoji: "🟡", stock: 200 },
];

const CATEGORIES = ["All", "Produce", "Grains", "Seeds", "Spices", "Oil"];

export default function Market() {
  const [mode, setMode] = useState("buy"); // buy | sell | orders
  const [listings, setListings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_listings")) || INITIAL_LISTINGS; } catch { return INITIAL_LISTINGS; }
  });
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_orders")) || []; } catch { return []; }
  });
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [payment, setPayment] = useState("upi");
  const [newItem, setNewItem] = useState({ title: "", price: "", unit: "kg", category: "Produce", stock: "100", seller: "My Farm" });

  const saveListings = (next) => { setListings(next); localStorage.setItem("mf_listings", JSON.stringify(next)); };
  const saveOrders = (next) => { setOrders(next); localStorage.setItem("mf_orders", JSON.stringify(next)); };

  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id) => setCart((c) => { const n = { ...c }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = listings.find((l) => l.id === parseInt(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleCheckout = () => {
    if (!totalItems) return;
    const items = Object.entries(cart).map(([id, qty]) => {
      const item = listings.find((l) => l.id === parseInt(id));
      return { title: item?.title || "Item", qty, price: item?.price || 0 };
    });
    const order = {
      id: "ORD-" + String(Date.now()).slice(-5),
      items,
      total: totalPrice,
      payment: payment.toUpperCase(),
      status: "Placed",
      createdAt: new Date().toLocaleString("en-IN"),
    };
    saveOrders([order, ...orders]);
    setCart({});
    setCartOpen(false);
    setMode("orders");
  };

  const handleAddListing = (e) => {
    e.preventDefault();
    if (!newItem.title || !newItem.price) return;
    const item = {
      id: Date.now(),
      title: newItem.title,
      seller: newItem.seller || "My Farm",
      price: Number(newItem.price),
      unit: newItem.unit,
      category: newItem.category,
      emoji: "🌾",
      stock: Number(newItem.stock) || 50,
    };
    saveListings([item, ...listings]);
    setNewItem({ title: "", price: "", unit: "kg", category: "Produce", stock: "100", seller: "My Farm" });
    setMode("buy");
  };

  const updateOrderStatus = (id, status) => {
    saveOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const filtered = listings.filter((l) =>
    (category === "All" || l.category === category) &&
    (l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#FAF6EE] pb-24">
      <div className="bg-primary text-white px-4 pt-10 pb-5 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🛒 Mana Marketplace</h1>
            <p className="text-xs opacity-80 mt-0.5">Buy inputs & sell harvest directly</p>
          </div>
          <button onClick={() => setCartOpen(!cartOpen)} className="relative">
            <span className="text-2xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-xs text-black font-bold rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>
            )}
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mt-3">
          {[
            { id: "buy", label: "🛍️ Buy" },
            { id: "sell", label: "📦 Sell Produce" },
            { id: "orders", label: `📋 Orders (${orders.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                mode === tab.id ? "bg-white text-primary" : "bg-white/20 text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === "buy" && (
          <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 flex items-center">
            <span className="text-sm mr-2">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search produce, seeds, spices…"
              className="bg-transparent text-white placeholder-white/60 text-sm flex-1 outline-none"
            />
          </div>
        )}
      </div>

      {/* Cart panel */}
      {cartOpen && totalItems > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-md p-4 border border-primary/20">
          <h3 className="font-semibold text-gray-700 mb-3">Your Cart</h3>
          {Object.entries(cart).map(([id, qty]) => {
            const item = listings.find((l) => l.id === parseInt(id));
            return item ? (
              <div key={id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{item.emoji} {item.title} × {qty}</span>
                <span className="text-sm font-semibold text-primary">₹{(item.price * qty).toLocaleString("en-IN")}</span>
              </div>
            ) : null;
          })}
          <div className="flex gap-2 mt-3">
            {["upi", "cod"].map((p) => (
              <button
                key={p}
                onClick={() => setPayment(p)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border ${
                  payment === p ? "border-primary bg-[#FAF6EE] text-primary" : "border-gray-200 text-gray-500"
                }`}
              >
                {p === "upi" ? "📱 UPI" : "💵 Cash on Delivery"}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="font-bold text-gray-800">Total: ₹{totalPrice.toLocaleString("en-IN")}</span>
            <button onClick={handleCheckout} className="bg-primary text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-green-800 transition">
              Place Order
            </button>
          </div>
        </div>
      )}

      {mode === "buy" && (
        <>
          <div className="px-4 mt-3 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap text-xs px-3 py-1 rounded-full font-semibold ${
                  category === c ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mx-4 mt-3 grid grid-cols-2 gap-3">
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
        </>
      )}

      {mode === "sell" && (
        <form onSubmit={handleAddListing} className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-800">List Your Farm Produce</h2>
          <input required placeholder="Product name (e.g. Organic Paddy)" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input required type="number" placeholder="Price (₹)" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
            <select value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option value="kg">per kg</option>
              <option value="quintal">per quintal</option>
              <option value="litre">per litre</option>
            </select>
            <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
              {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Stock qty" value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          </div>
          <input placeholder="Farm / Seller name & Village" value={newItem.seller} onChange={(e) => setNewItem({ ...newItem, seller: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
          <button type="submit" className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-800">
            Publish Listing
          </button>
        </form>
      )}

      {mode === "orders" && (
        <div className="mx-4 mt-4 space-y-3">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">No orders placed yet.</div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-gray-800">{o.id}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-semibold">{o.status}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{o.items.map((i) => `${i.title} × ${i.qty}`).join(", ")}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-primary">₹{o.total.toLocaleString("en-IN")} · {o.payment}</span>
                  <select
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs"
                  >
                    {["Placed", "Confirmed", "Shipped", "Delivered"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
