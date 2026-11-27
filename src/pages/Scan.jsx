import React, { useState } from "react";

const DISEASES = [
  {
    name: "Leaf Blight",
    confidence: 87,
    treatment: ["Remove infected leaves immediately.", "Apply copper-based fungicide.", "Improve field drainage.", "Avoid overhead irrigation."],
    products: ["Copper Oxychloride 50% WP", "Mancozeb 75% WP"],
  },
  {
    name: "Powdery Mildew",
    confidence: 79,
    treatment: ["Spray sulfur-based fungicide.", "Prune affected parts.", "Improve air circulation around plants."],
    products: ["Sulphur 80% WP", "Triadimefon 25% WP"],
  },
  {
    name: "Bacterial Wilt",
    confidence: 61,
    treatment: ["Remove and destroy infected plants.", "Rotate crops for 2 seasons.", "Use resistant varieties next cycle."],
    products: ["Streptomycin Sulphate + Tetracycline HCI"],
  },
];

const LOW_CONFIDENCE_THRESHOLD = 65;

export default function Scan() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleScan = () => {
    if (!image) return;
    setScanning(true);
    // Simulated model call — replace with real ONNX/API endpoint
    setTimeout(() => {
      const r = DISEASES[Math.floor(Math.random() * DISEASES.length)];
      setResult(r);
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] pb-24">
      <div className="bg-primary text-white px-4 pt-10 pb-6 rounded-b-3xl">
        <h1 className="text-xl font-bold">🔬 Disease Scanner</h1>
        <p className="text-sm opacity-80 mt-1">Upload a leaf photo for AI diagnosis</p>
      </div>

      <div className="mx-4 mt-4 space-y-4">
        {/* Upload area */}
        <label className="block bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-primary transition">
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {preview ? (
            <img src={preview} alt="Leaf" className="mx-auto max-h-48 rounded-xl object-contain" />
          ) : (
            <>
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm text-gray-500">Tap to upload leaf photo</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10 MB</p>
            </>
          )}
        </label>

        {image && (
          <button
            onClick={handleScan}
            disabled={scanning}
            className="w-full bg-primary text-white rounded-2xl py-3 font-semibold text-sm hover:bg-green-800 transition disabled:opacity-60"
          >
            {scanning ? "Analysing leaf…" : "Scan for Disease"}
          </button>
        )}

        {result && (
          <>
            {result.confidence < LOW_CONFIDENCE_THRESHOLD ? (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <h3 className="font-semibold text-orange-800 text-sm mb-1">⚠️ Low Confidence Result</h3>
                <p className="text-xs text-orange-700">
                  The AI confidence is only <strong>{result.confidence}%</strong> — too low to provide a reliable diagnosis. Please send this photo to your local Agriculture Extension Officer for expert advice.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{result.name}</h3>
                    <p className="text-xs text-gray-500">Likely disease detected</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{result.confidence}%</p>
                    <p className="text-xs text-gray-400">Confidence</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Treatment Steps</p>
                  <ul className="space-y-1">
                    {result.treatment.map((t, i) => (
                      <li key={i} className="flex items-start text-xs text-gray-700">
                        <span className="w-5 h-5 flex-shrink-0 bg-primary/10 rounded-full text-primary font-bold flex items-center justify-center mr-2 mt-0.5">{i + 1}</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Recommended Products</p>
                  <div className="flex flex-wrap gap-2">
                    {result.products.map((p) => (
                      <span key={p} className="text-xs bg-green-100 text-green-700 rounded-full px-3 py-1">{p}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-800">⚠️ AI diagnosis is for guidance only. Confirm with a certified agronomist before applying any treatment.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
