import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import WalletModal from "../components/WalletModal";
import CentralLogo from "../components/CentralLogo";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/supabaseClient";

// ── helpers ───────────────────────────────────────────────────────────────────
const genHistory = (base: number, n = 30) =>
  Array.from({ length: n }, (_, i) => {
    const drift = (Math.random() - 0.46) * base * 0.04;
    base = Math.max(base * 0.5, base + drift);
    const d = new Date(); d.setDate(d.getDate() - (n - i));
    return { date: d.toLocaleDateString("fr-FR", { month: "short", day: "numeric" }), value: Math.round(base) };
  });

const LIVE_PRICES: Record<string, { price: number; change: number }> = {
  BTC: { price: 67420, change: 2.34 }, ETH: { price: 3842, change: 1.12 },
  BNB: { price: 412, change: -0.43 }, SOL: { price: 168, change: 3.21 },
  ADA: { price: 0.82, change: -1.08 }, AVAX: { price: 41.2, change: 0.87 },
  Or: { price: 2318, change: 0.34 }, Argent: { price: 27.4, change: -0.21 },
  "S&P500": { price: 5248, change: 0.67 }, Nasdaq: { price: 18420, change: 1.44 },
};

const ASSET_GROUPS = {
  Crypto: ["BTC", "ETH", "BNB", "SOL", "ADA", "AVAX"],
  Commodités: ["Or", "Argent"],
  Indices: ["S&P500", "Nasdaq"],
};

// ── palette ───────────────────────────────────────────────────────────────────
const P = {
  emerald: "#10C96A", forest: "#0B4D2E", navy: "#0A0F1C",
  blue: "#3B82F6", violet: "#8B5CF6", amber: "#F59E0B",
  rose: "#F43F5E", cyan: "#06B6D4", slate: "#64748B",
};

// ── sidebar config ────────────────────────────────────────────────────────────
const SIDEBAR_SECTIONS = [
  {
    label: "PRINCIPAL",
    items: [
      { id: "overview",    icon: "🏠", label: "Overview",         color: P.emerald },
      { id: "mycase",      icon: "📁", label: "My Case",          color: P.blue },
      { id: "liveprocedure", icon: "🔴", label: "LIVE Procedure", color: P.rose },
    ],
  },
  {
    label: "MARCHÉS",
    items: [
      { id: "livetrading", icon: "📈", label: "Live Trading",     color: P.emerald },
      { id: "buycrypto",   icon: "💰", label: "Buy Crypto",       color: P.amber },
      { id: "sellcrypto",  icon: "💸", label: "Sell Crypto",      color: P.rose },
      { id: "exchange",    icon: "🔄", label: "Exchange Crypto",  color: P.cyan },
      { id: "bottrader",   icon: "🤖", label: "Bot Trader",       color: P.violet },
    ],
  },
  {
    label: "SERVICES",
    items: [
      { id: "portfolio",   icon: "💼", label: "Portfolio",        color: P.blue },
      { id: "treasury",    icon: "🏦", label: "Trésorerie",       color: P.amber },
      { id: "insurance",   icon: "🛡️", label: "Assurance",        color: P.violet },
      { id: "certificates",icon: "🎓", label: "Certificates",     color: P.emerald },
      { id: "blockchain",  icon: "⛓️", label: "Blockchain Account", color: P.cyan },
      { id: "licenses",    icon: "📋", label: "Licences",         color: P.blue },
      { id: "legal",       icon: "⚖️", label: "Legal Department", color: P.slate },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { id: "chat",        icon: "💬", label: "Chat with Support", color: P.emerald },
      { id: "advisor",     icon: "👤", label: "Advisor",           color: P.amber },
      { id: "contact",     icon: "📞", label: "Contact Us",        color: P.blue },
    ],
  },
  {
    label: "COMPTE",
    items: [
      { id: "security",    icon: "🔐", label: "Security & Billing", color: P.violet },
      { id: "account",     icon: "⚙️", label: "Account",           color: P.slate },
    ],
  },
];

const ALL_TABS = SIDEBAR_SECTIONS.flatMap((s) => s.items);

function tabColor(id: string) {
  return ALL_TABS.find((t) => t.id === id)?.color ?? P.emerald;
}

// ── stat card ─────────────────────────────────────────────────────────────────
function Stat({ icon, label, value, sub, color = P.emerald }: { icon: string; label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: color + "18", color }}>Live</span>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── tabs ──────────────────────────────────────────────────────────────────────
function TabOverview({ onNavigate, userProfile }: { onNavigate: (tab: string) => void; userProfile?: { firstName?: string; lastName?: string; balance?: number; caseAmount?: number; procedureStep?: number; caseRef?: string; status?: string } | null }) {
  const userName = userProfile ? `${userProfile.firstName ?? ""} ${userProfile.lastName ?? ""}`.trim() || "Client" : "Client";
  const isNewClient = !userProfile || (userProfile.balance ?? 0) === 0;
  const balance = userProfile?.balance ?? 0;
  const caseAmount = userProfile?.caseAmount ?? 0;

  const portfolioData = genHistory(balance || 100);
  const weekData = isNewClient
    ? [{ day: "Lun", val: 0 }, { day: "Mar", val: 0 }, { day: "Mer", val: 0 }, { day: "Jeu", val: 0 }, { day: "Ven", val: 0 }, { day: "Sam", val: 0 }, { day: "Dim", val: 0 }]
    : [{ day: "Lun", val: 81200 }, { day: "Mar", val: 83400 }, { day: "Mer", val: 80100 }, { day: "Jeu", val: 84900 }, { day: "Ven", val: 86200 }, { day: "Sam", val: 85400 }, { day: "Dim", val: 87340 }];

  const timeline = [
    { label: "Dossier Ouvert", done: true },
    { label: "Forensics", done: !isNewClient },
    { label: "Procédure Légale", done: false, active: !isNewClient },
    { label: "Négociation", done: false },
    { label: "Recouvrement", done: false },
  ];
  const activities = isNewClient
    ? [
        { icon: "✅", text: "Dossier ouvert — en attente d'un conseiller", time: "À l'instant", color: P.emerald },
        { icon: "📋", text: "Inscription confirmée — dossier gratuit", time: "À l'instant", color: P.blue },
      ]
    : [
        { icon: "✅", text: "Étape Forensics complétée", time: "2h", color: P.emerald },
        { icon: "📋", text: "Rapport d'analyse on-chain reçu", time: "5h", color: P.blue },
        { icon: "💬", text: "Message de Me. Leclerc", time: "1j", color: P.slate },
        { icon: "🔒", text: "Connexion — Paris, France", time: "2j", color: P.slate },
      ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <CentralLogo size={40} darkBg={true} />
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#fff" }}>Tableau de Bord</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Bienvenue, {userName} · {isNewClient ? "Dossier en attente" : "Plan Professionnel"}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: P.emerald, display: "inline-block" }} />
          <span style={{ fontSize: 11, color: P.emerald, fontWeight: 600 }}>Plateforme opérationnelle</span>
        </div>
      </div>

      {/* New client banner */}
      {isNewClient && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(59,130,246,0.1)", border: "1.5px solid rgba(59,130,246,0.25)" }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>📋</span>
          <div className="flex-1">
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>Dossier ouvert — En attente d'activation</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Un conseiller Centrale Boursière va prendre contact avec vous dans les 24h pour activer votre procédure. L'inscription est <strong style={{ color: P.emerald }}>gratuite</strong>.</p>
          </div>
          <button onClick={() => onNavigate("chat")} className="px-3 py-1.5 rounded-lg text-xs font-bold shrink-0" style={{ background: P.blue, color: "#fff" }}>
            Contacter →
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon="📁" label="Statut Dossier" value={isNewClient ? "En attente" : "En cours"} sub={isNewClient ? "Activation requise" : "Étape 3/5"} color={P.blue} />
        <Stat icon="💰" label="En Recouvrement" value={caseAmount > 0 ? `$${caseAmount.toLocaleString()}` : "$0"} sub={isNewClient ? "À définir" : "USDT · FR-0391"} color={P.emerald} />
        <Stat icon="📊" label="Portfolio" value={balance > 0 ? `$${balance.toLocaleString()}` : "$0.00"} sub={isNewClient ? "Aucun dépôt" : "+12.4% ce mois"} color={P.amber} />
        <Stat icon="📋" label="Licences" value={isNewClient ? "0 / 3" : "1 / 3"} sub={isNewClient ? "Non démarrées" : "FCA active"} color={P.violet} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Ajouter Crypto", icon: "➕", color: P.emerald, id: "buycrypto" },
          { label: "Retrait Crypto", icon: "➖", color: P.rose, id: "sellcrypto" },
          { label: "Échanger", icon: "🔄", color: P.cyan, id: "exchange" },
          { label: "Bot Trader", icon: "🤖", color: P.violet, id: "bottrader" },
        ].map((a) => (
          <button key={a.id} onClick={() => onNavigate(a.id)}
            className="rounded-xl py-3 flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95"
            style={{ background: a.color + "14", border: `1px solid ${a.color}30`, cursor: "pointer" }}>
            <span style={{ fontSize: 20 }}>{a.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: a.color }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 12 }}>Portfolio 30j</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={portfolioData}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} interval={7} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#0A0F1C", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }} formatter={(v) => [`$${Number(v ?? 0).toLocaleString("fr-FR")}`, "Portfolio"]} />
              <Area type="monotone" dataKey="value" stroke={P.emerald} strokeWidth={2} fill={P.emerald} fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 12 }}>Performance semaine</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weekData}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#0A0F1C", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }} formatter={(v) => [`$${Number(v ?? 0).toLocaleString("fr-FR")}`, ""]} />
              <Bar dataKey="val" fill={P.blue} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Case timeline */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 14 }}>Dossier #{userProfile?.caseRef ?? "—"}</p>
        <div className="flex items-center flex-wrap gap-0">
          {timeline.map((t, i) => (
            <div key={t.label} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: t.done ? P.emerald : t.active ? P.blue + "30" : "rgba(255,255,255,0.08)", color: t.done ? "#fff" : t.active ? P.blue : "rgba(255,255,255,0.3)", border: t.active ? `2px solid ${P.blue}` : "none" }}>
                  {t.done ? "✓" : i + 1}
                </div>
                <span className="mt-1 text-center px-1" style={{ fontSize: 9, color: t.done ? P.emerald : t.active ? P.blue : "rgba(255,255,255,0.3)", fontWeight: t.active ? 700 : 400 }}>{t.label}</span>
              </div>
              {i < timeline.length - 1 && (
                <div className="flex-1 h-0.5 mb-5 mx-1" style={{ background: t.done ? P.emerald + "60" : "rgba(255,255,255,0.08)" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 12 }}>Activité Récente</p>
        {activities.map((a, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
            <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{a.text}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>il y a {a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabMyCase() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "Me. Leclerc", time: "Hier 14:32", text: "Bonjour, nous avons finalisé le rapport d'analyse forensics. Les fonds sont localisés sur 3 exchanges. Nous engageons les procédures légales." },
    { from: "You", time: "Hier 15:10", text: "Thank you. When can we expect a result?" },
    { from: "Me. Leclerc", time: "Hier 15:45", text: "Based on our analysis, 10 to 18 days for the injunction procedure. Estimated recovery rate: 92–100%." },
  ]);
  const steps = [
    { label: "On-Chain Forensics", date: "12 Aug 2026", done: true, color: P.emerald },
    { label: "Analysis Report", date: "14 Aug 2026", done: true, color: P.emerald },
    { label: "Legal Procedure", date: "Ongoing", done: false, active: true, color: P.blue },
    { label: "Negotiation", date: "Est. Aug 25", done: false, color: P.slate },
    { label: "Recovery", date: "Est. Sept 5", done: false, color: P.slate },
  ];
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#fff" }}>Case #FR-2026-0391</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Opened Aug 10, 2026 · Crypto Recovery</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(245,158,11,0.15)", color: P.amber }}>⏳ Step 3/5 — Legal</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: P.emerald, background: P.emerald + "12", padding: "4px 10px", borderRadius: 8 }}>$48,200 USDT</span>
          </div>
        </div>
        <div className="mt-3 px-3 py-2 rounded-xl" style={{ background: "rgba(16,201,106,0.08)", border: "1px solid rgba(16,201,106,0.15)" }}>
          <p style={{ fontSize: 12, color: P.emerald, fontWeight: 600 }}>📊 Estimated recovery: 92–100% · Estimated timeline: 10–18 days</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 14 }}>Detailed Timeline</p>
        <div className="relative space-y-4 pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          {steps.map((s) => (
            <div key={s.label} className="relative">
              <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full" style={{ background: s.done ? P.emerald : s.active ? P.blue : "rgba(255,255,255,0.1)", border: s.active ? `2px solid ${P.blue}` : "none" }} />
              <p style={{ fontWeight: 600, fontSize: 14, color: s.done ? "#fff" : s.active ? P.blue : "rgba(255,255,255,0.4)" }}>{s.label}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{s.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Docs */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff" }}>Documents</p>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: P.blue + "18", color: P.blue, border: `1px solid ${P.blue}30` }}>+ Add Evidence</button>
        </div>
        {["Forensics Report — 14.08.2026.pdf ✅", "Transaction screenshots ✅", "Fraudulent exchange history ✅", "Sworn statement ⏳"].map((d, i) => (
          <div key={i} className="flex items-center gap-2 py-2.5" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
            <span>📄</span><span className="flex-1">{d}</span>
            <button style={{ fontSize: 11, color: P.blue }}>⬇</button>
          </div>
        ))}
      </div>

      {/* Legal chat */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 12 }}>Legal Messaging</p>
        <div className="space-y-3 mb-4" style={{ maxHeight: 220, overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "You" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-xs px-3 py-2.5 rounded-xl" style={{ background: m.from === "You" ? P.blue + "25" : "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, border: m.from === "You" ? `1px solid ${P.blue}30` : "1px solid rgba(255,255,255,0.06)" }}>
                {m.from !== "You" && <p style={{ fontSize: 10, fontWeight: 700, color: P.emerald, marginBottom: 3 }}>{m.from} · {m.time}</p>}
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
            placeholder="Write a message…" value={msg} onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && msg.trim()) { setMessages((p) => [...p, { from: "You", time: "Now", text: msg }]); setMsg(""); } }} />
          <button className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: P.blue, color: "#fff" }}
            onClick={() => { if (msg.trim()) { setMessages((p) => [...p, { from: "You", time: "Now", text: msg }]); setMsg(""); } }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function TabLiveTrading() {
  const [asset, setAsset] = useState("BTC");
  const [group, setGroup] = useState<keyof typeof ASSET_GROUPS>("Crypto");
  const [period, setPeriod] = useState("30j");
  const [prices, setPrices] = useState({ ...LIVE_PRICES });
  const [tradeModal, setTradeModal] = useState(false);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("1");
  const chartData = genHistory(prices[asset]?.price ?? 1000, period === "1j" ? 24 : period === "7j" ? 7 : 30);

  useEffect(() => {
    const t = setInterval(() => {
      setPrices((p) => {
        const n = { ...p };
        Object.keys(n).forEach((k) => { const d = (Math.random() - 0.5) * n[k].price * 0.002; n[k] = { price: Math.max(0.01, n[k].price + d), change: n[k].change + (Math.random() - 0.5) * 0.1 }; });
        return n;
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const total = (parseFloat(qty) || 0) * (prices[asset]?.price ?? 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {Object.keys(ASSET_GROUPS).map((g) => (
          <button key={g} onClick={() => { setGroup(g as keyof typeof ASSET_GROUPS); setAsset(ASSET_GROUPS[g as keyof typeof ASSET_GROUPS][0]); }}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold"
            style={{ background: group === g ? P.emerald : "rgba(255,255,255,0.07)", color: group === g ? "#0A0F1C" : "rgba(255,255,255,0.6)" }}>
            {g}
          </button>
        ))}
        <button onClick={() => setTradeModal(true)} className="ml-auto px-4 py-1.5 rounded-lg text-sm font-bold" style={{ background: P.emerald, color: "#0A0F1C" }}>
          📈 Open Trade
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ASSET_GROUPS[group].map((a) => {
          const p = prices[a]; const up = (p?.change ?? 0) >= 0;
          return (
            <button key={a} onClick={() => setAsset(a)} className="rounded-xl p-3 text-left"
              style={{ background: asset === a ? P.emerald + "18" : "rgba(255,255,255,0.04)", border: `1.5px solid ${asset === a ? P.emerald : "rgba(255,255,255,0.07)"}` }}>
              <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#fff", fontSize: 13 }}>{a}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: P.emerald, marginTop: 2 }}>${p?.price > 1 ? p.price.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : p?.price.toFixed(4)}</p>
              <p style={{ fontSize: 10, color: up ? P.emerald : P.rose }}>{up ? "▲" : "▼"} {Math.abs(p?.change ?? 0).toFixed(2)}%</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#fff", fontSize: 17 }}>{asset}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: P.emerald, marginLeft: 10 }}>
              ${prices[asset]?.price > 1 ? prices[asset].price.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : prices[asset]?.price.toFixed(4)}
            </span>
            <span style={{ fontSize: 12, color: (prices[asset]?.change ?? 0) >= 0 ? P.emerald : P.rose, marginLeft: 8 }}>
              {(prices[asset]?.change ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(prices[asset]?.change ?? 0).toFixed(2)}%
            </span>
          </div>
          <div className="flex gap-1">
            {["1j", "7j", "30j"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ background: period === p ? P.blue : "rgba(255,255,255,0.07)", color: period === p ? "#fff" : "rgba(255,255,255,0.5)" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180} key={asset}>
          <AreaChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 5)} />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "#0A0F1C", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }} formatter={(v) => [`$${Number(v ?? 0).toLocaleString("fr-FR")}`, asset]} />
            <Area type="monotone" dataKey="value" stroke={P.emerald} strokeWidth={2} fill={P.emerald} fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {tradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,15,28,0.8)", backdropFilter: "blur(4px)" }} onClick={() => setTradeModal(false)}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#fff", fontSize: 17 }}>Open Trade</p>
              <button onClick={() => setTradeModal(false)} style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>✕</button>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setSide("buy")} className="flex-1 py-2 rounded-lg text-sm font-bold" style={{ background: side === "buy" ? P.emerald : "rgba(255,255,255,0.07)", color: side === "buy" ? "#0A0F1C" : "rgba(255,255,255,0.5)" }}>Buy</button>
              <button onClick={() => setSide("sell")} className="flex-1 py-2 rounded-lg text-sm font-bold" style={{ background: side === "sell" ? P.rose : "rgba(255,255,255,0.07)", color: side === "sell" ? "#fff" : "rgba(255,255,255,0.5)" }}>Sell</button>
            </div>
            <div className="space-y-3">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Asset</label>
                <select className="w-full px-3 py-2 rounded-xl text-sm mt-1 outline-none" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} value={asset} onChange={(e) => setAsset(e.target.value)}>
                  {Object.keys(LIVE_PRICES).map((a) => <option key={a} style={{ background: "#0d1117" }}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Quantity</label>
                <input type="number" className="w-full px-3 py-2 rounded-xl text-sm mt-1 outline-none" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} value={qty} onChange={(e) => setQty(e.target.value)} />
              </div>
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="flex justify-between text-xs mb-1"><span style={{ color: "rgba(255,255,255,0.4)" }}>Market price</span><span style={{ fontFamily: "var(--font-mono)", color: P.emerald }}>${prices[asset]?.price.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between text-xs mb-1"><span style={{ color: "rgba(255,255,255,0.4)" }}>Fee (0.1%)</span><span style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.4)" }}>${(total * 0.001).toFixed(2)}</span></div>
                <div className="flex justify-between text-xs pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontWeight: 700, color: "#fff" }}>Total</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: P.emerald }}>${(total * 1.001).toFixed(2)}</span>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: side === "buy" ? P.emerald : P.rose, color: side === "buy" ? "#0A0F1C" : "#fff" }} onClick={() => setTradeModal(false)}>
                {side === "buy" ? "Confirm Buy" : "Confirm Sell"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabBuyCrypto() {
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("500");
  const [method, setMethod] = useState("card");
  const usdValue = (parseFloat(amount) || 0) / (LIVE_PRICES[asset]?.price ?? 1);
  return (
    <div className="space-y-4 max-w-lg">
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 16 }}>➕ Ajouter / Acheter Crypto</p>
        <div className="space-y-4">
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>Actif</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {["BTC", "ETH", "USDT", "BNB", "SOL", "ADA"].map((a) => (
                <button key={a} onClick={() => setAsset(a)} className="rounded-xl py-2 text-sm font-bold"
                  style={{ background: asset === a ? P.amber + "20" : "rgba(255,255,255,0.05)", color: asset === a ? P.amber : "rgba(255,255,255,0.5)", border: `1px solid ${asset === a ? P.amber + "40" : "rgba(255,255,255,0.07)"}` }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>Montant (USD)</label>
            <input type="number" className="w-full px-4 py-3 rounded-xl text-base font-mono mt-1 outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
              value={amount} onChange={(e) => setAmount(e.target.value)} />
            <p style={{ fontSize: 11, color: P.amber, marginTop: 4 }}>≈ {usdValue.toFixed(8)} {asset}</p>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>Méthode de paiement</label>
            <div className="space-y-2 mt-2">
              {[{ id: "card", label: "💳 Visa / Mastercard" }, { id: "sepa", label: "🏦 Virement SEPA" }, { id: "wallet", label: "🔗 Wallet Crypto" }].map((m) => (
                <label key={m.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer"
                  style={{ background: method === m.id ? P.amber + "12" : "rgba(255,255,255,0.04)", border: `1px solid ${method === m.id ? P.amber + "30" : "rgba(255,255,255,0.07)"}` }}>
                  <input type="radio" checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-amber-400" />
                  <span style={{ fontSize: 13, color: "#fff" }}>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="w-full py-3 rounded-xl font-bold text-base" style={{ background: P.emerald, color: "#0A0F1C" }}>
            Acheter {asset} →
          </button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>🔒 256-bit SSL · PCI DSS Compliant</p>
        </div>
      </div>
    </div>
  );
}

function TabSellCrypto() {
  const [asset, setAsset] = useState("BTC");
  const [qty, setQty] = useState("0.01");
  const total = (parseFloat(qty) || 0) * (LIVE_PRICES[asset]?.price ?? 0);
  return (
    <div className="space-y-4 max-w-lg">
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 16 }}>➖ Retrait / Vendre Crypto</p>
        <div className="space-y-4">
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>Actif à vendre</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {["BTC", "ETH", "SOL", "BNB", "ADA", "AVAX"].map((a) => (
                <button key={a} onClick={() => setAsset(a)} className="rounded-xl py-2 text-sm font-bold"
                  style={{ background: asset === a ? P.rose + "20" : "rgba(255,255,255,0.05)", color: asset === a ? P.rose : "rgba(255,255,255,0.5)", border: `1px solid ${asset === a ? P.rose + "40" : "rgba(255,255,255,0.07)"}` }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>Quantité</label>
            <input type="number" className="w-full px-4 py-3 rounded-xl text-base font-mono mt-1 outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
              value={qty} onChange={(e) => setQty(e.target.value)} />
            <p style={{ fontSize: 11, color: P.rose, marginTop: 4 }}>≈ ${total.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} USD</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.15)" }}>
            <p style={{ fontSize: 12, color: P.rose, fontWeight: 600 }}>⚠️ Vérifiez le montant avant confirmation. Les transactions crypto sont irréversibles.</p>
          </div>
          <button className="w-full py-3 rounded-xl font-bold text-base" style={{ background: P.rose, color: "#fff" }}>
            Vendre {asset} →
          </button>
        </div>
      </div>
    </div>
  );
}

function TabExchange() {
  const [from, setFrom] = useState("BTC");
  const [to, setTo] = useState("ETH");
  const [amt, setAmt] = useState("0.1");
  const rate = (LIVE_PRICES[from]?.price ?? 1) / (LIVE_PRICES[to]?.price ?? 1);
  const received = (parseFloat(amt) || 0) * rate;
  return (
    <div className="space-y-4 max-w-lg">
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#fff", marginBottom: 16 }}>🔄 Échanger des Actifs</p>
        <div className="space-y-3">
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>De</label>
            <div className="flex items-center gap-3 mt-1">
              <select className="flex-1 text-sm font-bold outline-none bg-transparent" style={{ color: "#fff" }} value={from} onChange={(e) => setFrom(e.target.value)}>
                {Object.keys(LIVE_PRICES).map((a) => <option key={a} style={{ background: "#0d1117" }}>{a}</option>)}
              </select>
              <input type="number" className="w-28 text-right text-sm font-mono outline-none bg-transparent" style={{ color: P.cyan }} value={amt} onChange={(e) => setAmt(e.target.value)} />
            </div>
          </div>
          <div className="text-center text-xl" style={{ color: P.cyan }}>⇅</div>
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Vers</label>
            <div className="flex items-center gap-3 mt-1">
              <select className="flex-1 text-sm font-bold outline-none bg-transparent" style={{ color: "#fff" }} value={to} onChange={(e) => setTo(e.target.value)}>
                {Object.keys(LIVE_PRICES).map((a) => <option key={a} style={{ background: "#0d1117" }}>{a}</option>)}
              </select>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: P.emerald }}>{received.toFixed(6)}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs px-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>Rate: 1 {from} = {rate.toFixed(4)} {to}</span>
            <span>Fee: 0.15%</span>
          </div>
          <button className="w-full py-3 rounded-xl font-bold" style={{ background: P.cyan, color: "#0A0F1C" }}>
            Confirmer l'Échange →
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBotTrader() {
  const [botActive, setBotActive] = useState(false);
  const botData = genHistory(87340, 14);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 28 }}>🤖</span>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff" }}>Central Bot Trader</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Algorithme DCA + Grid · Backtested 98.2% accuracy</p>
            </div>
          </div>
          <button onClick={() => setBotActive(!botActive)} className="w-14 h-7 rounded-full relative transition-all" style={{ background: botActive ? P.emerald : "rgba(255,255,255,0.15)" }}>
            <span className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all" style={{ left: botActive ? "32px" : "4px" }} />
          </button>
        </div>
        {botActive && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(16,201,106,0.1)", border: "1px solid rgba(16,201,106,0.2)" }}>
            <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: P.emerald, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: P.emerald, fontWeight: 600 }}>Bot actif — Trading automatisé en cours</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{ label: "P&L Total", val: "+$4,230", color: P.emerald }, { label: "Trades", val: "847", color: P.blue }, { label: "Win Rate", val: "73.2%", color: P.violet }, { label: "Drawdown", val: "-2.1%", color: P.rose }].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 12 }}>Performance Bot (14j)</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={botData}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} interval={3} />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "#0A0F1C", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }} formatter={(v) => [`$${Number(v ?? 0).toLocaleString("fr-FR")}`, "Bot"]} />
            <Line type="monotone" dataKey="value" stroke={P.violet} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TabPortfolio() {
  const [showWallet, setShowWallet] = useState(false);
  const [wallet, setWallet] = useState("");
  const holdings = [
    { asset: "BTC", qty: 0.342, avg: 58200, color: P.amber },
    { asset: "ETH", qty: 2.14, avg: 3100, color: P.blue },
    { asset: "SOL", qty: 12.5, avg: 132, color: P.violet },
    { asset: "Or", qty: 0.5, avg: 2180, color: P.amber },
  ].map((h) => {
    const cur = LIVE_PRICES[h.asset]?.price ?? h.avg;
    return { ...h, current: cur, value: cur * h.qty, pnl: (cur - h.avg) * h.qty, pnlPct: (cur / h.avg - 1) * 100 };
  });
  const total = holdings.reduce((s, h) => s + h.value, 0);
  const pieData = holdings.map((h) => ({ name: h.asset, value: Math.round(h.value) }));
  const perfData = genHistory(total * 0.88, 30);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Valeur Totale</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: P.emerald }}>${total.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}</p>
          <p style={{ fontSize: 12, color: P.emerald }}>▲ +12.4% ce mois</p>
        </div>
        {wallet ? (
          <div className="text-right">
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Wallet connecté</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: P.cyan }}>{wallet.slice(0, 8)}…{wallet.slice(-6)}</p>
            <button onClick={() => setWallet("")} style={{ fontSize: 11, color: P.rose }}>Déconnecter</button>
          </div>
        ) : (
          <button className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: P.blue + "18", color: P.blue, border: `1px solid ${P.blue}30` }} onClick={() => setShowWallet(true)}>
            🔗 Connect Wallet
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 8 }}>Allocation</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={`cell-${i}`} fill={[P.amber, P.blue, P.violet, P.cyan][i % 4]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0A0F1C", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }} formatter={(v) => [`$${Number(v ?? 0).toLocaleString("fr-FR")}`, ""]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 8 }}>Performance 30j</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={perfData}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} interval={7} />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#0A0F1C", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }} formatter={(v) => [`$${Number(v ?? 0).toLocaleString("fr-FR")}`, "Portfolio"]} />
              <Line type="monotone" dataKey="value" stroke={P.blue} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                {["Asset", "Qty", "Avg Price", "Current", "P&L", "Value"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left" style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={h.asset} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full" style={{ background: h.color }} /><span style={{ fontWeight: 700, color: "#fff" }}>{h.asset}</span></div></td>
                  <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.6)" }}>{h.qty}</td>
                  <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.4)" }}>${h.avg.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: P.emerald }}>${h.current.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3"><span style={{ color: h.pnl >= 0 ? P.emerald : P.rose, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{h.pnl >= 0 ? "+" : ""}{h.pnl.toFixed(0)} ({h.pnlPct.toFixed(1)}%)</span></td>
                  <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#fff" }}>${h.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showWallet && <WalletModal onClose={() => setShowWallet(false)} onConnect={(a) => { setWallet(a); setShowWallet(false); }} />}
    </div>
  );
}

function TabLiveProcedure() {
  const [pct] = useState(58);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: "rgba(244,63,94,0.08)", border: "1.5px solid rgba(244,63,94,0.3)" }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="w-3 h-3 rounded-full pulse-dot" style={{ background: P.rose, display: "inline-block" }} />
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#fff" }}>🔴 LIVE Procedure</p>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Votre procédure de recouvrement est en cours en temps réel. Suivez chaque étape ici.</p>
      </div>
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex justify-between mb-2">
          <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>Progression globale</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: P.emerald, fontSize: 14 }}>{pct}%</span>
        </div>
        <div className="h-3 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${P.forest}, ${P.emerald})`, transition: "width 1s ease" }} />
        </div>
      </div>
      {[
        { step: "Dépôt du dossier", status: "done", time: "10 août 09:14", note: "Dossier enregistré, référence FR-2026-0391 attribuée." },
        { step: "Analyse Forensics", status: "done", time: "12 août 14:22", note: "47 transactions tracées sur 3 blockchains. Fonds localisés." },
        { step: "Saisine juridique", status: "active", time: "15 août 10:05", note: "Demande d'injonction déposée auprès FCA. Réponse attendue sous 72h." },
        { step: "Gel des actifs", status: "pending", time: "En attente", note: "Activation dès confirmation de l'injonction." },
        { step: "Restitution", status: "pending", time: "Estimé : 2 sept.", note: "Virement vers votre compte dans les 48h suivant le gel." },
      ].map((s, i) => (
        <div key={i} className="rounded-xl p-4 flex gap-3" style={{ background: s.status === "active" ? "rgba(244,63,94,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${s.status === "active" ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.05)"}` }}>
          <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: s.status === "done" ? P.emerald : s.status === "active" ? P.rose : "rgba(255,255,255,0.1)", color: s.status === "pending" ? "rgba(255,255,255,0.3)" : "#fff" }}>
            {s.status === "done" ? "✓" : i + 1}
          </div>
          <div>
            <p style={{ fontWeight: 600, color: s.status === "pending" ? "rgba(255,255,255,0.35)" : "#fff", fontSize: 14 }}>{s.step}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{s.time}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{s.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabInsurance() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="flex items-center gap-3 mb-3">
          <span style={{ fontSize: 28 }}>🛡️</span>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#fff" }}>Assurance Actifs Digitaux</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Lloyd's of London · Couverture jusqu'à $10M</p>
          </div>
          <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold" style={{ background: P.emerald + "15", color: P.emerald }}>Active ✓</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "Couverture max.", val: "$10,000,000" }, { label: "Prime annuelle", val: "0.4% / an" }, { label: "Assureur", val: "Lloyd's · Beazley" }, { label: "Actifs couverts", val: "Tous crypto + NFT" }].map((s) => (
            <div key={s.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#fff", fontSize: 13 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>
      {[{ name: "Vol / Hack", status: "Couvert", limit: "$10M" }, { name: "Perte de clés", status: "Couvert", limit: "$5M" }, { name: "Défaillance exchange", status: "Couvert", limit: "$2M" }, { name: "Erreur smart contract", status: "Couvert", limit: "$1M" }].map((c, i) => (
        <div key={i} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{c.name}</span>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: P.emerald }}>{c.limit}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: P.emerald + "15", color: P.emerald }}>{c.status}</span>
          </div>
        </div>
      ))}
      <Link to="/register" className="block text-center py-3 rounded-xl font-bold text-sm" style={{ background: P.violet, color: "#fff" }}>
        Augmenter la couverture →
      </Link>
    </div>
  );
}

function TabCertificates() {
  return (
    <div className="space-y-4">
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#fff" }}>Mes Certificats</p>
      {[
        { name: "Certificat Trading Niveau 1", status: "obtained", date: "Jan 2026", score: "94/100", color: P.emerald },
        { name: "Certificat Trading Niveau 2", status: "in_progress", date: "En cours", progress: 67, color: P.blue },
        { name: "CFA Prep Program", status: "not_started", date: "Non commencé", color: P.amber },
        { name: "CME Certified Partner", status: "obtained", date: "Mar 2026", score: "88/100", color: P.violet },
      ].map((c, i) => (
        <div key={i} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}25` }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{c.name}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{c.date}</p>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: c.color + "18", color: c.color }}>
              {c.status === "obtained" ? `✓ ${c.score}` : c.status === "in_progress" ? "En cours" : "Non commencé"}
            </span>
          </div>
          {c.status === "in_progress" && (
            <div>
              <div className="h-1.5 rounded-full mb-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full" style={{ width: `${c.progress}%`, background: c.color }} />
              </div>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{c.progress}% complété</p>
            </div>
          )}
          {c.status === "obtained" && (
            <button className="text-xs font-semibold mt-2 px-3 py-1.5 rounded-lg" style={{ background: c.color + "15", color: c.color, border: `1px solid ${c.color}30` }}>
              ⬇ Télécharger le certificat
            </button>
          )}
          {c.status === "not_started" && (
            <Link to="/register" className="inline-block text-xs font-semibold mt-2 px-3 py-1.5 rounded-lg" style={{ background: c.color + "15", color: c.color }}>
              Commencer →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

function TabBlockchain() {
  const [showWallet, setShowWallet] = useState(false);
  const [wallet, setWallet] = useState("0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b");
  return (
    <div className="space-y-4">
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#fff" }}>Compte Blockchain</p>
      <div className="rounded-2xl p-5" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Adresse Wallet principale</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: P.cyan, wordBreak: "break-all" }}>{wallet}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={() => navigator.clipboard.writeText(wallet)} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: P.cyan + "15", color: P.cyan }}>📋 Copier</button>
          <button onClick={() => setShowWallet(true)} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>🔄 Changer</button>
        </div>
      </div>
      {[{ chain: "Ethereum (ERC-20)", bal: "2.14 ETH", usd: "$8,222", color: P.blue }, { chain: "Bitcoin", bal: "0.342 BTC", usd: "$23,057", color: P.amber }, { chain: "BNB Smart Chain", bal: "12.5 BNB", usd: "$5,150", color: P.amber }, { chain: "Solana", bal: "25.0 SOL", usd: "$4,200", color: P.violet }].map((c) => (
        <div key={c.chain} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <p style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>{c.chain}</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: c.color, marginTop: 1 }}>{c.bal}</p>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: P.emerald }}>{c.usd}</p>
        </div>
      ))}
      {showWallet && <WalletModal onClose={() => setShowWallet(false)} onConnect={(a) => { setWallet(a); setShowWallet(false); }} />}
    </div>
  );
}

function TabLegal() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.2)" }}>
        <div className="flex items-center gap-3 mb-2">
          <span style={{ fontSize: 26 }}>⚖️</span>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff" }}>Legal Department</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Maître Leclerc & Associates · Spécialisés crypto & finance</p>
          </div>
        </div>
      </div>
      {[
        { title: "Injonction FCA en cours", status: "active", color: P.amber, desc: "Demande déposée le 15/08/2026. Réponse attendue 72h." },
        { title: "Plainte Interpol déposée", status: "done", color: P.emerald, desc: "Référence INTERPOL-2026-FR-0391. Confirmée le 13/08." },
        { title: "Coordination avec Binance", status: "active", color: P.blue, desc: "Demande de gel de compte soumise. En attente de confirmation." },
      ].map((p) => (
        <div key={p.title} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${p.color}25` }}>
          <div className="flex items-center justify-between mb-1">
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{p.title}</p>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: p.color + "15", color: p.color }}>{p.status === "done" ? "✓ Complété" : "En cours"}</span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{p.desc}</p>
        </div>
      ))}
      <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 8 }}>Équipe Juridique</p>
        {[{ name: "Me. Sophie Leclerc", role: "Avocate principale · Crypto Law", email: "legal@centralboursiere.com" }, { name: "Me. Thomas Morin", role: "Droit international · Compliance", email: "compliance@centralboursiere.com" }].map((a) => (
          <div key={a.name} className="flex items-center gap-3 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: P.slate + "30", color: "#fff" }}>{a.name[3]}</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, color: "#fff" }}>{a.name}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{a.role}</p>
            </div>
            <a href={`mailto:${a.email}`} className="ml-auto text-xs" style={{ color: P.blue }}>✉</a>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabChat() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "Support", time: "Just now", text: "Bonjour ! Je suis votre agent de support Centrale Boursière. Comment puis-je vous aider aujourd'hui ?" },
  ]);
  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 200px)", minHeight: 400 }}>
      <div className="rounded-t-2xl p-4 flex items-center gap-3" style={{ background: "rgba(16,201,106,0.08)", border: "1px solid rgba(16,201,106,0.2)", borderBottom: "none" }}>
        <span className="w-2.5 h-2.5 rounded-full pulse-dot" style={{ background: P.emerald, display: "inline-block" }} />
        <p style={{ fontWeight: 700, color: "#fff" }}>Chat with Support</p>
        <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.4)" }}>Temps de réponse moyen: &lt; 2 min</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "You" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-sm px-3 py-2.5 rounded-xl" style={{ background: m.from === "You" ? P.emerald + "20" : "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, border: m.from === "You" ? `1px solid ${P.emerald}25` : "1px solid rgba(255,255,255,0.07)" }}>
              {m.from !== "You" && <p style={{ fontSize: 10, fontWeight: 700, color: P.emerald, marginBottom: 3 }}>Support Central · {m.time}</p>}
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-b-2xl p-3 flex gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "none" }}>
        <input className="flex-1 px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
          placeholder="Écrivez un message…" value={msg} onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && msg.trim()) { setMessages((p) => [...p, { from: "You", time: "Now", text: msg }]); setMsg(""); } }} />
        <button className="px-4 py-2 rounded-xl font-bold text-sm" style={{ background: P.emerald, color: "#0A0F1C" }}
          onClick={() => { if (msg.trim()) { setMessages((p) => [...p, { from: "You", time: "Now", text: msg }]); setMsg(""); } }}>
          →
        </button>
      </div>
    </div>
  );
}

function TabAdvisor() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>ML</div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#fff" }}>Maître Sophie Leclerc</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Conseillère Financière · Spécialiste Recouvrement</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: P.emerald, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: P.emerald, fontWeight: 600 }}>Disponible maintenant</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <a href="tel:+33142000000" className="rounded-xl p-4 flex flex-col items-center gap-2 text-center" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <span style={{ fontSize: 24 }}>📞</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: P.blue }}>Appeler</span>
        </a>
        <a href="https://wa.me/33142000000" className="rounded-xl p-4 flex flex-col items-center gap-2 text-center" style={{ background: "rgba(16,201,106,0.1)", border: "1px solid rgba(16,201,106,0.2)" }}>
          <span style={{ fontSize: 24 }}>💬</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: P.emerald }}>WhatsApp</span>
        </a>
      </div>
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 10 }}>Disponibilité</p>
        {["Lun–Ven: 09h–19h", "Sam: 10h–16h", "Urgences 24/7 (VIP)"].map((s, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <span style={{ color: P.emerald, fontSize: 12 }}>●</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabContact() {
  return (
    <div className="space-y-4 max-w-lg">
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#fff" }}>Contact Us</p>
      {[{ icon: "✉️", label: "General", email: "contact@centralboursiere.com", color: P.blue }, { icon: "⚖️", label: "Legal", email: "legal@centralboursiere.com", color: P.slate }, { icon: "💰", label: "Recovery", email: "recovery@centralboursiere.com", color: P.emerald }].map((c) => (
        <a key={c.label} href={`mailto:${c.email}`} className="rounded-xl px-4 py-3.5 flex items-center gap-4 block" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}25`, textDecoration: "none" }}>
          <span style={{ fontSize: 22 }}>{c.icon}</span>
          <div>
            <p style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>{c.label}</p>
            <p style={{ fontSize: 12, color: c.color }}>{c.email}</p>
          </div>
        </a>
      ))}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 12 }}>Envoyer un message</p>
        <div className="space-y-3">
          {["Objet", "Message"].map((f) => (
            f === "Message" ?
              <textarea key={f} placeholder={f} rows={4} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} /> :
              <input key={f} placeholder={f} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
          ))}
          <button className="w-full py-2.5 rounded-xl font-bold text-sm" style={{ background: P.blue, color: "#fff" }}>Envoyer →</button>
        </div>
      </div>
    </div>
  );
}

function TabSecurity() {
  const [twofa, setTwofa] = useState(true);
  const [tab, setTab] = useState<"sec" | "billing">("sec");
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        {(["sec", "billing"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: tab === t ? P.violet : "rgba(255,255,255,0.07)", color: tab === t ? "#fff" : "rgba(255,255,255,0.5)" }}>
            {t === "sec" ? "🔐 Sécurité" : "💳 Facturation"}
          </button>
        ))}
      </div>
      {tab === "sec" && (
        <div className="space-y-3">
          <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div>
              <p style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>2FA Authentication</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Google Authenticator / SMS</p>
            </div>
            <button onClick={() => setTwofa(!twofa)} className="w-12 h-6 rounded-full relative" style={{ background: twofa ? P.emerald : "rgba(255,255,255,0.15)" }}>
              <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: twofa ? "26px" : "4px" }} />
            </button>
          </div>
          {[{ icon: "🛡️", label: "KYC Verified", val: "Level 2 ✓", color: P.emerald }, { icon: "📱", label: "Session active", val: "Paris, FR — Chrome", color: P.blue }].map((s) => (
            <div key={s.label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div className="flex-1">
                <p style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: s.color }}>{s.val}</p>
              </div>
            </div>
          ))}
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 10 }}>Changer le mot de passe</p>
            {["Mot de passe actuel", "Nouveau", "Confirmer"].map((f) => (
              <input key={f} type="password" placeholder={f} className="w-full px-3 py-2 rounded-xl text-sm mb-2 outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
            ))}
            <button className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: P.violet, color: "#fff" }}>Mettre à jour</button>
          </div>
        </div>
      )}
      {tab === "billing" && (
        <div className="space-y-3">
          <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div>
              <p style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>Plan Professionnel</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Prochain: 23 sept. 2026</p>
            </div>
            <Link to="/register" className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: P.emerald + "18", color: P.emerald }}>Upgrader</Link>
          </div>
          {[{ icon: "💳", label: "Visa **** 4242", sub: "Expire 09/28" }, { icon: "₮", label: "USDT Wallet", sub: "0x1a2b…c3d4" }].map((m) => (
            <div key={m.label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <div className="flex-1">
                <p style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>{m.label}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{m.sub}</p>
              </div>
              <button style={{ fontSize: 11, color: P.rose }}>Supprimer</button>
            </div>
          ))}
          <button className="w-full py-2.5 rounded-xl text-sm font-bold border" style={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }}>+ Ajouter méthode</button>
        </div>
      )}
    </div>
  );
}

function TabAccount() {
  const [showWallet, setShowWallet] = useState(false);
  const [wallet, setWallet] = useState("");
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${P.navy}, ${P.forest})` }}>JD</div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#fff" }}>Jean Dupont</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>jean.dupont@email.com · Plan Professionnel</p>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold mt-1 inline-block" style={{ background: P.emerald + "15", color: P.emerald }}>KYC Level 2 ✓</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[["Prénom", "Jean"], ["Nom", "Dupont"], ["Email", "jean.dupont@email.com"], ["Téléphone", "+33 6 12 34 56 78"], ["Pays", "France"], ["Fuseau", "UTC+2"]].map(([l, v]) => (
            <div key={l}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>{l?.toUpperCase()}</label>
              <input className="w-full px-3 py-2 rounded-xl text-sm mt-1 outline-none" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: "#fff" }} defaultValue={v} />
            </div>
          ))}
        </div>
        <button className="mt-4 px-5 py-2 rounded-xl text-sm font-bold" style={{ background: P.emerald, color: "#0A0F1C" }}>Sauvegarder</button>
      </div>
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 10 }}>Wallet Multi-Protocoles</p>
        {wallet ? (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: P.cyan + "10", border: `1px solid ${P.cyan}25` }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: P.cyan }}>{wallet.slice(0, 10)}…{wallet.slice(-8)}</span>
            <button onClick={() => setWallet("")} style={{ fontSize: 11, color: P.rose }}>Déconnecter</button>
          </div>
        ) : (
          <button className="w-full py-2.5 rounded-xl text-sm font-bold" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }} onClick={() => setShowWallet(true)}>
            🔗 Connecter un Wallet
          </button>
        )}
        {showWallet && <WalletModal onClose={() => setShowWallet(false)} onConnect={(a) => { setWallet(a); setShowWallet(false); }} />}
      </div>
    </div>
  );
}

function TabLicenses() {
  const licenses = [
    { name: "FCA", country: "🇬🇧 Royaume-Uni", status: "Obtenue", ref: "FR-2026-0847", color: P.emerald, pct: 100 },
    { name: "AMF", country: "🇫🇷 France", status: "En cours", ref: "FR-2025-PEND", color: P.amber, pct: 65 },
    { name: "CySEC", country: "🇨🇾 Chypre", status: "En attente", ref: "CY-PEND-2026", color: P.slate, pct: 0 },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#fff" }}>Mes Licences</p>
        <Link to="/licences" className="px-4 py-1.5 rounded-lg text-xs font-bold" style={{ background: P.blue + "18", color: P.blue }}>+ Demander</Link>
      </div>
      {licenses.map((l) => (
        <div key={l.name} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${l.color}25` }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff" }}>{l.name} · {l.country}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{l.ref}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: l.color + "18", color: l.color }}>{l.status}</span>
          </div>
          {l.pct > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                <span>Progression</span><span>{l.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full" style={{ width: `${l.pct}%`, background: l.color }} />
              </div>
            </div>
          )}
          {l.status === "Obtenue" && (
            <button className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: l.color + "15", color: l.color }}>⬇ Télécharger certificat</button>
          )}
        </div>
      ))}
    </div>
  );
}

function TabTreasury() {
  const txs = [
    { type: "Dépôt", asset: "USDT", amount: "+$5,000", date: "20 Aug", color: P.emerald },
    { type: "Retrait", asset: "ETH", amount: "-$1,200", date: "18 Aug", color: P.rose },
    { type: "Échange", asset: "BTC→ETH", amount: "$3,400", date: "16 Aug", color: P.cyan },
    { type: "Commission", asset: "Frais", amount: "-$12.40", date: "15 Aug", color: P.slate },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Balance totale</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: P.amber }}>$87,340</p>
          <p style={{ fontSize: 11, color: P.emerald }}>▲ +12.4%</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "rgba(16,201,106,0.08)", border: "1px solid rgba(16,201,106,0.2)" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>P&L ce mois</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: P.emerald }}>+$9,234</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>vs mois dernier</p>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>Transactions récentes</p>
        </div>
        {txs.map((t, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: t.color + "15" }}>
              {t.type === "Dépôt" ? "⬇" : t.type === "Retrait" ? "⬆" : t.type === "Échange" ? "🔄" : "💸"}
            </div>
            <div className="flex-1">
              <p style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>{t.type} · {t.asset}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{t.date}</p>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: t.color, fontSize: 13 }}>{t.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user?.email ?? "Client";

  const handleLogout = async () => {
    setSidebarOpen(false);
    await auth.signOut();
    navigate("/login");
  };

  const tabComponents: Record<string, React.ReactElement> = {
    overview: <TabOverview onNavigate={setActiveTab} userProfile={profile} />,
    mycase: <TabMyCase />,
    livetrading: <TabLiveTrading />,
    buycrypto: <TabBuyCrypto />,
    sellcrypto: <TabSellCrypto />,
    exchange: <TabExchange />,
    bottrader: <TabBotTrader />,
    portfolio: <TabPortfolio />,
    treasury: <TabTreasury />,
    insurance: <TabInsurance />,
    certificates: <TabCertificates />,
    blockchain: <TabBlockchain />,
    licenses: <TabLicenses />,
    legal: <TabLegal />,
    liveprocedure: <TabLiveProcedure />,
    chat: <TabChat />,
    advisor: <TabAdvisor />,
    contact: <TabContact />,
    security: <TabSecurity />,
    account: <TabAccount />,
  };

  const activeItem = ALL_TABS.find((t) => t.id === activeTab);

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 64px)", paddingTop: 64, background: "#060D14" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 z-40 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ width: 224, background: "#0A0F1C", borderRight: "1px solid rgba(255,255,255,0.06)", overflowY: "auto" }}
      >
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <CentralLogo size={36} darkBg={true} />
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#fff", letterSpacing: "-0.01em" }}>CENTRALE</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>BOURSIÈRE · DASHBOARD</p>
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 py-4 px-3 space-y-4">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-2 mb-1.5" style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em" }}>
                {section.label}
              </p>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all mb-0.5"
                  style={{
                    background: activeTab === item.id ? item.color + "18" : "transparent",
                    color: activeTab === item.id ? item.color : "rgba(255,255,255,0.45)",
                    fontWeight: activeTab === item.id ? 600 : 400,
                    fontSize: 13,
                    borderLeft: `2px solid ${activeTab === item.id ? item.color : "transparent"}`,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                  {item.id === "liveprocedure" && (
                    <span className="ml-auto w-2 h-2 rounded-full pulse-dot" style={{ background: P.rose, display: "inline-block", flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-red-500/10"
            style={{ color: "rgba(244,63,94,0.7)", fontSize: 13, fontWeight: 600 }}
          >
            <span>🚪</span>
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 lg:ml-56">

        {/* Top bar */}
        <div className="sticky top-16 z-20 px-5 py-3 flex items-center gap-3" style={{ background: "rgba(6,13,20,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button className="lg:hidden p-1.5 rounded-lg" style={{ color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)" }} onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <span style={{ fontSize: 16, marginLeft: 4 }}>{activeItem?.icon}</span>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#fff" }}>{activeItem?.label}</p>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:block text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
              {displayName}
            </span>
            <button onClick={() => setActiveTab("chat")} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: P.emerald + "15", color: P.emerald }}>
              💬 Support
            </button>
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "rgba(244,63,94,0.1)", color: P.rose }}>
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="p-5 lg:p-6" style={{ maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
          <div className="lg:ml-0" style={{ marginLeft: 0 }}>
            {tabComponents[activeTab] ?? <TabOverview onNavigate={setActiveTab} userProfile={profile} />}
          </div>
        </div>
      </div>
    </div>
  );
}
