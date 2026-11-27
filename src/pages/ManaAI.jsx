import React, { useState, useRef } from "react";
import { getLang } from "../i18n";

const KNOWLEDGE_BASE = [
  {
    keywords: ["paddy", "rice", "వరి"],
    en: "For Paddy (Rice): Use clay or loamy soil in Kharif. Maintain 2-5 cm standing water during vegetative stage. Apply NPK 120:60:40 kg/ha in 3 splits. Watch for Brown Planthopper and Blast.",
    te: "వరి సాగు కోసం: ఖరీఫ్‌లో బంకమట్టి లేదా లోమీ నేల అనుకూలం. పెరుగుదల దశలో 2-5 సెం.మీ నీరు నిల్వ ఉంచండి. ఎకరాకు సిఫార్సు చేసిన NPK ఎరువులను 3 దశల్లో వేయండి.",
  },
  {
    keywords: ["cotton", "పత్తి"],
    en: "For Cotton: Black cotton soil is ideal. Space plants 90x45 cm. Watch for Pink Bollworm and Whitefly; use pheromone traps (4-5/acre) before spraying.",
    te: "పత్తి సాగు కోసం: నల్లరేగడి నేల ఉత్తమం. మొక్కల మధ్య 90x45 సెం.మీ దూరం ఉంచండి. గులాబీ రంగు పురుగు నివారణకు ఎకరాకు 4-5 లింగాకర్షక బుట్టలు పెట్టండి.",
  },
  {
    keywords: ["chilli", "మిర్చి", "mirchi"],
    en: "For Chilli: Needs well-drained loamy or black soil. Avoid waterlogging. Watch for Thrips and Leaf Curl; neem oil (3 ml/L) helps at early stage.",
    te: "మిర్చి సాగు కోసం: నీరు నిలవని లోమీ లేదా నల్లరేగడి నేల మంచిది. తామర పురుగులు మరియు ఆకు ముడత కోసం ప్రారంభ దశలో వేప నూనె (లీటరుకు 3 మి.లీ) పిచికారీ చేయండి.",
  },
  {
    keywords: ["fertilizer", "urea", "dap", "npk", "ఎరువు"],
    en: "Fertilizer tip: Do a soil test before applying Urea or DAP. Split Nitrogen into 2-3 doses instead of all at once to reduce leaching and save 15-20% cost.",
    te: "ఎరువుల సూచన: యూరియా లేదా DAP వేసే ముందు మట్టి పరీక్ష చేయించండి. నత్రజనిని ఒకేసారి కాకుండా 2-3 దశల్లో వేస్తే ఖర్చు 15-20% తగ్గుతుంది.",
  },
  {
    keywords: ["water", "irrigation", "drip", "నీరు", "నీటి"],
    en: "Irrigation tip: Irrigate early morning or evening to cut evaporation. Drip irrigation saves 40-50% water for vegetables, chilli, and cotton.",
    te: "నీటి పారుదల సూచన: ఉదయం లేదా సాయంత్రం నీరు పెట్టండి. కూరగాయలు, మిర్చి, పత్తికి బిందు సేద్యం (డ్రిప్) ద్వారా 40-50% నీరు ఆదా అవుతుంది.",
  },
  {
    keywords: ["scheme", "pm-kisan", "loan", "insurance", "పథకం"],
    en: "Key schemes: PM-KISAN (₹6,000/yr), PM Fasal Bima Yojana (crop insurance), and Kisan Credit Card (low-interest farm credit). Open the Schemes tab to check portals.",
    te: "ముఖ్య పథకాలు: PM-KISAN (సంవత్సరానికి ₹6,000), పంటల బీమా (PMFBY), కిసాన్ క్రెడిట్ కార్డ్ (KCC). వివరాల కోసం 'పథకాలు' ట్యాబ్ చూడండి.",
  },
];

function getReply(text, lang) {
  const q = text.toLowerCase();
  const match = KNOWLEDGE_BASE.find((item) => item.keywords.some((k) => q.includes(k)));
  if (match) return lang === "te" ? match.te : match.en;
  return lang === "te"
    ? "మీ ప్రశ్నకు ధన్యవాదాలు. దయచేసి పంట పేరు (వరి, పత్తి, మిర్చి), ఎరువులు, నీటి పారుదల లేదా పథకాల గురించి అడగండి. క్లిష్ట సమస్యల కోసం మీ స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి."
    : "Thanks for asking! Try asking about a crop (Paddy, Cotton, Chilli), fertilizers, irrigation, or government schemes. For complex field issues, please consult your local Agriculture Officer.";
}

export default function ManaAI() {
  const [lang, setLang] = useState(getLang());
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text:
        getLang() === "te"
          ? "నమస్కారం! నేను మన AI వ్యవసాయ సహాయకుడిని. పంటలు, ఎరువులు, నీటి పారుదల లేదా పథకాల గురించి తెలుగులో లేదా ఇంగ్లీష్‌లో అడగండి."
          : "Namaste! I am Mana AI, your farming assistant. Ask about crops, fertilizers, irrigation, or schemes in English or Telugu.",
    },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "te" ? "te-IN" : "en-IN";
    window.speechSynthesis.speak(utter);
  };

  const send = async (textToSend) => {
    const query = (textToSend ?? input).trim();
    if (!query) return;
    setMessages((m) => [...m, { role: "user", text: query }]);
    setInput("");

    let reply = getReply(query, lang);
    const apiBase = import.meta.env.VITE_API_URL;
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/v1/ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: query, lang }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reply) reply = data.reply;
        }
      } catch {
        // Fallback to local agronomy knowledge base
      }
    }

    setMessages((m) => [...m, { role: "ai", text: reply }]);
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your question.");
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = lang === "te" ? "te-IN" : "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      send(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const quickPrompts =
    lang === "te"
      ? ["వరి సాగు సలహా", "పత్తిలో పురుగు నివారణ", "ఎరువుల ఖర్చు తగ్గించడం ఎలా?", "ప్రభుత్వ పథకాలు"]
      : ["Paddy cultivation tips", "Cotton pest control", "How to save fertilizer cost?", "Government schemes"];

  return (
    <div className="min-h-screen bg-[#FAF6EE] pb-24 flex flex-col">
      <div className="bg-primary text-white px-4 pt-10 pb-5 rounded-b-3xl flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">🤖 Mana AI Assistant</h1>
          <p className="text-xs opacity-80 mt-0.5">Voice & text farming guidance (EN / తెలుగు)</p>
        </div>
        <div className="flex space-x-1">
          {["en", "te"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                lang === l ? "bg-white text-primary" : "bg-white/20 text-white"
              }`}
            >
              {l === "en" ? "EN" : "తె"}
            </button>
          ))}
        </div>
      </div>

      {/* Quick prompts */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto pb-1">
        {quickPrompts.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="whitespace-nowrap bg-white border border-green-200 text-primary text-xs px-3 py-1.5 rounded-full font-medium shadow-sm"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 mt-3 space-y-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                m.role === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-white text-gray-800 border border-green-100 rounded-bl-sm"
              }`}
            >
              <p className="leading-relaxed">{m.text}</p>
              {m.role === "ai" && (
                <button
                  onClick={() => speak(m.text)}
                  className="mt-2 text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                >
                  🔊 {lang === "te" ? "వినండి" : "Listen"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-md border border-green-100 p-2 flex items-center gap-2">
          <button
            onClick={toggleVoice}
            title="Voice input"
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition ${
              listening ? "bg-red-500 text-white animate-pulse" : "bg-[#FAF6EE] text-primary"
            }`}
          >
            🎤
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={lang === "te" ? "తెలుగు లేదా ఇంగ్లీష్‌లో అడగండి…" : "Ask about crops, pests, schemes…"}
            className="flex-1 text-sm outline-none px-2"
          />
          <button
            onClick={() => send()}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800"
          >
            Send
          </button>
        </div>
        <p className="text-[11px] text-gray-400 text-center mt-2">
          General agronomy guidance only. Confirm critical decisions with an Agriculture Officer.
        </p>
      </div>
    </div>
  );
}
