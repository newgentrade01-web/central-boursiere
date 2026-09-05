import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Ticker from "../components/Ticker";
import CentralLogo from "../components/CentralLogo";
import { IllustrationForensics, IllustrationLegal, IllustrationSecurity } from "../components/Illustrations";
import { loadContent, type SiteContent } from "../lib/content";

function useContent() {
  const [c, setC] = useState<SiteContent>(loadContent);
  useEffect(() => {
    const handler = () => setC(loadContent());
    window.addEventListener("cb-content-updated", handler);
    return () => window.removeEventListener("cb-content-updated", handler);
  }, []);
  return c;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useCountUp(target: number, trigger: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let current = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(current));
    }, 16);
    return () => clearInterval(t);
  }, [trigger, target, duration]);
  return val;
}

// ── Animated 2D Character ─────────────────────────────────────────────────────
function AnimChar({ step, visible }: { step: number; visible: boolean }) {
  const emotions = ["😊", "🔍", "⚖️", "📋", "💰"];
  const colors = ["#10C96A", "#3B82F6", "#8B5CF6", "#F59E0B", "#10C96A"];
  return (
    <div className="relative flex flex-col items-center" style={{ width: 80 }}>
      {visible && (
        <>
          {/* Body */}
          <div
            style={{
              animation: "char-walk 1s ease-in-out infinite",
              fontSize: 36,
              lineHeight: 1,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
            }}
          >
            {emotions[step]}
          </div>
          {/* Shadow */}
          <div style={{ width: 28, height: 6, background: "rgba(0,0,0,0.08)", borderRadius: "50%", marginTop: 4 }} />
        </>
      )}
    </div>
  );
}

// Full animated character SVG for the main guide
function GuideCharacter({ active, emotion }: { active: boolean; emotion: string }) {
  return (
    <div style={{ width: 64, height: 80, position: "relative" }}>
      <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        {/* Head */}
        <circle cx="32" cy="14" r="11" fill="#FBBF24" stroke="#0A0F1C" strokeWidth="1.5" />
        <circle cx="27" cy="13" r="1.5" fill="#0A0F1C" />
        <circle cx="37" cy="13" r="1.5" fill="#0A0F1C" />
        <path d={active ? "M27 18 Q32 22 37 18" : "M27 17 Q32 20 37 17"} stroke="#0A0F1C" strokeWidth="1.5" strokeLinecap="round" />
        {/* Hair */}
        <path d="M21 10 Q32 2 43 10" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
        {/* Body */}
        <rect x="22" y="26" width="20" height="26" rx="4" fill="#0A0F1C" />
        {/* Collar */}
        <path d="M28 26 L32 32 L36 26" fill="#10C96A" />
        {/* Left arm */}
        <line
          x1="22" y1="30" x2="12" y2="42"
          stroke="#FBBF24" strokeWidth="4" strokeLinecap="round"
          style={{ transformOrigin: "22px 30px", animation: active ? "arm-swing 0.8s ease-in-out infinite" : "none" }}
        />
        {/* Right arm */}
        <line
          x1="42" y1="30" x2="52" y2="42"
          stroke="#FBBF24" strokeWidth="4" strokeLinecap="round"
          style={{ transformOrigin: "42px 30px", animation: active ? "arm-swing 0.8s ease-in-out infinite reverse" : "none" }}
        />
        {/* Legs */}
        <line
          x1="28" y1="52" x2="24" y2="70"
          stroke="#1F2937" strokeWidth="5" strokeLinecap="round"
          style={{ transformOrigin: "28px 52px", animation: active ? "leg-swing 0.8s ease-in-out infinite" : "none" }}
        />
        <line
          x1="36" y1="52" x2="40" y2="70"
          stroke="#1F2937" strokeWidth="5" strokeLinecap="round"
          style={{ transformOrigin: "36px 52px", animation: active ? "leg-swing 0.8s ease-in-out infinite reverse" : "none" }}
        />
        {/* Shoes */}
        <ellipse cx="24" cy="72" rx="6" ry="3" fill="#0A0F1C" />
        <ellipse cx="40" cy="72" rx="6" ry="3" fill="#0A0F1C" />
      </svg>
      {/* Emotion bubble */}
      {emotion && (
        <div
          style={{
            position: "absolute",
            top: -14,
            right: -14,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            animation: "bounce-in 0.5s ease both",
          }}
        >
          {emotion}
        </div>
      )}
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: "🔍", title: "Recouvrement de Fonds Crypto", desc: "Analyse blockchain forensics, traçage de transactions on-chain, coordination avec les exchanges et autorités. Taux de succès 98.4%.", tag: "98.4% succès", color: "#10C96A" },
  { icon: "⚖️", title: "Département Légal", desc: "Avocats spécialisés crypto & finance internationale. Plaintes, injonctions judiciaires, représentation FCA, AMF, SEC.", tag: "Certifiés", color: "#3B82F6" },
  { icon: "📋", title: "Licences Boursières", desc: "Obtention FCA, AMF, CySEC, MiFID II, FINRA — accompagnement de la demande à l'agrément officiel.", tag: "FCA · AMF · CySEC", color: "#8B5CF6" },
  { icon: "🎓", title: "Certifications Trading", desc: "Programmes certifiants reconnus. Partenaire officiel CFA Institute et CMT Association. Niveau 1, 2, 3.", tag: "CFA Partner", color: "#F59E0B" },
  { icon: "🛡️", title: "Assurance Actifs Digitaux", desc: "Couverture complète jusqu'à $10M. Partenariat Lloyd's of London. Vol, hack, perte de clés.", tag: "Lloyd's · $10M", color: "#EF4444" },
  { icon: "✅", title: "Compliance & Autorisation", desc: "Audit réglementaire, KYC/AML, structure légale. ISO 27001 et SOC 2 Type II.", tag: "ISO 27001 · SOC 2", color: "#10C96A" },
];

const HOW_STEPS = [
  {
    step: 1, icon: "📝", emotion: "😊",
    title: "Créez votre compte",
    desc: "Inscription gratuite en 3 minutes. Renseignez vos informations personnelles, le type de dossier et vos coordonnées. Aucun engagement requis.",
    detail: "Prénom · Nom · Pays · Type de dossier",
    color: "#10C96A",
    bg: "rgba(16,201,106,0.08)",
  },
  {
    step: 2, icon: "📂", emotion: "🔍",
    title: "Ouvrez votre dossier",
    desc: "Décrivez votre situation : montant en jeu, type de fraude, exchanges impliqués. Téléversez vos preuves et documents.",
    detail: "Documents · Preuves · Historique",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
  },
  {
    step: 3, icon: "🔬", emotion: "🔎",
    title: "Analyse Forensics",
    desc: "Notre équipe blockchain trace les fonds sur toutes les chaînes. Identification des exchanges, wallets et entités impliquées.",
    detail: "On-chain · Multi-blockchain · Rapports",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
  },
  {
    step: 4, icon: "⚖️", emotion: "📜",
    title: "Procédure Légale",
    desc: "Nos avocats engagent les démarches : injonctions, gel d'actifs, coopération internationale avec FCA, Interpol, et les exchanges.",
    detail: "Injonctions · Gel actifs · Interpol",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
  },
  {
    step: 5, icon: "💰", emotion: "🎉",
    title: "Recouvrement",
    desc: "Vos fonds sont restitués directement sur votre compte. Délai moyen : 14–30 jours. Taux de succès : 98.4%.",
    detail: "Délai moy. 14–30j · 98.4% succès",
    color: "#10C96A",
    bg: "rgba(16,201,106,0.08)",
  },
];

const CROSS_LOGOS = {
  top:    [{ name: "FCA", flag: "🇬🇧", color: "#1e40af" }, { name: "AMF", flag: "🇫🇷", color: "#dc2626" }],
  right:  [{ name: "Bloomberg", flag: "🖥️", color: "#F59E0B" }, { name: "Nasdaq", flag: "📊", color: "#3B82F6" }],
  bottom: [{ name: "Binance", flag: "₿", color: "#F59E0B" }, { name: "Coinbase", flag: "🔵", color: "#3B82F6" }],
  left:   [{ name: "Lloyd's", flag: "🛡️", color: "#7C3AED" }, { name: "Interpol", flag: "🌐", color: "#dc2626" }],
  tl:     { name: "CySEC", flag: "🇨🇾", color: "#10C96A" },
  tr:     { name: "FINRA", flag: "🇺🇸", color: "#dc2626" },
  bl:     { name: "Kraken", flag: "🐙", color: "#7C3AED" },
  br:     { name: "NYSE", flag: "🏛️", color: "#1e40af" },
};

const LICENSE_BADGES = [
  { name: "FCA", full: "Financial Conduct Authority", flag: "🇬🇧", bg: "#1e3a5f", accent: "#fff", num: "FR-2026-0847" },
  { name: "AMF", full: "Autorité des Marchés Financiers", flag: "🇫🇷", bg: "#1a1a2e", accent: "#10C96A", num: "FR-2025-1203" },
  { name: "CySEC", full: "Cyprus Securities Commission", flag: "🇨🇾", bg: "#1f3d2a", accent: "#10C96A", num: "CY-384/2025" },
  { name: "MiFID II", full: "Markets in Financial Instruments", flag: "🇪🇺", bg: "#1c2b4a", accent: "#60A5FA", num: "EU-MiFID-0112" },
  { name: "FINRA", full: "Financial Industry Reg. Auth.", flag: "🇺🇸", bg: "#2d1f1f", accent: "#EF4444", num: "US-8847231" },
  { name: "SEC", full: "Securities & Exchange Commission", flag: "🇺🇸", bg: "#1a1a2e", accent: "#60A5FA", num: "IA-9921" },
  { name: "ISO 27001", full: "Information Security Certified", flag: "🔐", bg: "#1f2937", accent: "#10C96A", num: "ISO-CB-2025" },
  { name: "SOC 2", full: "Type II Certified", flag: "🏅", bg: "#2d1f3a", accent: "#8B5CF6", num: "SOC2-II-2025" },
  { name: "Lloyd's", full: "Lloyd's of London · $10M Cover", flag: "🛡️", bg: "#3a1f2d", accent: "#F59E0B", num: "LLP-0034" },
  { name: "TrustPilot", full: "4.8★ · 2,847 avis vérifiés", flag: "⭐", bg: "#1a2d1a", accent: "#10C96A", num: "4.8 / 5.0" },
  { name: "CFA Partner", full: "CFA Institute Official Partner", flag: "🎓", bg: "#1c2b1c", accent: "#10C96A", num: "CFA-CB-2025" },
  { name: "CME", full: "CME Group Certified Partner", flag: "📊", bg: "#1e2a3a", accent: "#60A5FA", num: "CME-2026" },
];

const REVIEWS = [
  { name: "Pierre M.", country: "🇫🇷", stars: 5, text: "J'ai récupéré €87,400 en 19 jours après une arnaque. L'équipe était exceptionnelle.", amount: "€87,400 récupérés" },
  { name: "Sofia K.", country: "🇧🇪", stars: 5, text: "Licence FCA en 6 semaines, processus impeccable, équipe très réactive.", amount: "Licence FCA obtenue" },
  { name: "Marc D.", country: "🇨🇭", stars: 5, text: "Mon portefeuille de $230,000 avait disparu après un hack. Récupéré intégralement.", amount: "$230,000 récupérés" },
  { name: "Ana L.", country: "🇵🇹", stars: 4, text: "Suivi en temps réel sur le dashboard très rassurant. Service professionnel.", amount: "Compliance obtenue" },
];

const FAQS = [
  { q: "Comment fonctionne le processus de recouvrement ?", a: "Notre processus débute par une analyse forensique complète de la blockchain. Notre équipe juridique engage ensuite les démarches légales auprès des exchanges, des autorités régulatrices et des juridictions compétentes. En moyenne, nos dossiers sont résolus en moins de 30 jours avec un taux de succès de 98.4%." },
  { q: "Quels types de fraudes pouvez-vous traiter ?", a: "Escroqueries Pig Butchering, faux exchanges, rug pulls DeFi, hacks de wallets, faux investissements crypto, arnaques romantiques liées aux cryptos, schémas de Ponzi tokenisés, et fraudes par phishing. Nous avons traité plus de 12,400 dossiers dans 47 pays." },
  { q: "Combien de temps dure une procédure de recouvrement ?", a: "60% de nos dossiers sont résolus en moins de 30 jours. Les cas multi-juridictions peuvent prendre 45 à 90 jours. Une consultation initiale gratuite permet d'estimer le délai pour votre situation." },
  { q: "Quelles licences pouvez-vous obtenir pour moi ?", a: "FCA (Royaume-Uni), AMF (France), CySEC (Chypre/Europe), FINRA (USA), SEC (USA), MiFID II (Europe), ainsi que les certifications ISO 27001 et SOC 2. Chaque licence a ses propres exigences — notre équipe vous guide étape par étape." },
  { q: "Mes informations personnelles sont-elles sécurisées ?", a: "Nous sommes certifiés ISO 27001 et SOC 2 Type II. Vos données sont chiffrées AES-256, stockées sur des serveurs européens conformes RGPD, avec 2FA obligatoire. Historique : zéro violation de données." },
  { q: "Puis-je trader sans licence préalable ?", a: "Oui, nous proposons un accès en mode démonstration sans licence. Pour le trading réel, nous vous aidons à obtenir la licence appropriée selon votre profil et pays de résidence." },
  { q: "Quelles cryptomonnaies sont disponibles ?", a: "BTC, ETH, BNB, SOL, ADA, AVAX, XRP, et plus de 50 autres cryptos, ainsi que commodités (Or, Argent, Pétrole) et indices (S&P500, Nasdaq, CAC40, DAX)." },
  { q: "Comment connecter mon wallet ?", a: "Nous supportons MetaMask, WalletConnect, Coinbase Wallet, Ledger et Trust Wallet. La connexion se fait via notre modal sécurisé — vos clés privées ne quittent jamais votre appareil." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Visa/Mastercard, virement SEPA, USDT, BTC, ETH, PayPal, Apple Pay et Google Pay. Tous les paiements sont sécurisés 256-bit SSL et conformes PCI DSS." },
  { q: "Comment suivre l'avancement de mon dossier ?", a: "Votre tableau de bord affiche en temps réel la timeline détaillée (Forensics → Légal → Négociation → Recouvrement), les documents soumis, les prochaines étapes, et une messagerie directe avec l'équipe juridique." },
];

const PRICING = [
  {
    name: "Professionnel",
    price: "$1,000",
    featured: false,
    badge: null,
    features: [
      "Recouvrement illimité",
      "Licences FCA / AMF incluses",
      "Assurance actifs $1M",
      "Accès marchés live multi-actifs",
      "Graphiques avancés multi-timeframes",
      "Gestionnaire de compte dédié",
    ],
    cta: "Choisir ce plan",
  },
  {
    name: "Avancé",
    price: "$2,899",
    featured: true,
    badge: "Nouveau · Recommandé",
    features: [
      "Tout le plan Professionnel +",
      "Licences FCA + AMF + CySEC incluses",
      "Assurance actifs $5M (Lloyd's)",
      "Accès Bloomberg Terminal",
      "Équipe légale dédiée",
      "Rapport forensics prioritaire 48h",
      "Accès marchés US + EU + Asia",
      "Conseiller personnel assigné",
    ],
    cta: "Choisir ce plan",
  },
  {
    name: "VIP Institutionnel",
    price: "$5,000",
    featured: false,
    badge: null,
    features: [
      "Tout le plan Avancé +",
      "Département légal exclusif 24/7",
      "Toutes licences internationales",
      "Assurance actifs $10M (Lloyd's)",
      "Email pro direct + WhatsApp",
      "Gestionnaire de compte 24/7",
      "Accès API trading institutionnel",
    ],
    cta: "Contacter l'équipe VIP",
  },
];

const BLOG_POSTS = [
  { title: "Comment récupérer des fonds crypto après une escroquerie en 2026", date: "15 août 2026", readTime: "12 min", tag: "Recouvrement", accent: "#10C96A", emoji: "🔍", bg: "linear-gradient(135deg,#0A1F12,#0A0F1C)" },
  { title: "Guide complet pour obtenir sa licence FCA de trader en 2026", date: "8 août 2026", readTime: "9 min", tag: "Licences", accent: "#60A5FA", emoji: "📋", bg: "linear-gradient(135deg,#0d1a2e,#1a0d2e)" },
  { title: "Les meilleures stratégies pour protéger ses actifs digitaux", date: "1 août 2026", readTime: "7 min", tag: "Sécurité", accent: "#A78BFA", emoji: "🛡️", bg: "linear-gradient(135deg,#1a0d2e,#0A1F12)" },
];

const PARTNERS = ["FCA", "AMF", "SEC", "FINRA", "CySEC", "MiFID II", "ISO 27001", "TrustPilot", "Binance", "Coinbase", "Kraken", "NYSE", "Nasdaq", "CME Group", "Bloomberg", "Reuters", "Lloyd's of London"];

// ── Sub-components ────────────────────────────────────────────────────────────
function Stats({ stats }: { stats: { dossiers: number; recovered: number; countries: number; successRate: number } }) {
  const { ref, visible } = useInView(0.3);
  const d = useCountUp(stats.dossiers, visible);
  const r = useCountUp(stats.recovered, visible);
  const p = useCountUp(stats.countries, visible);
  const t = useCountUp(stats.successRate, visible);
  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-14 px-4">
      {[
        { val: `${d.toLocaleString("fr-FR")}+`, label: "Dossiers Traités" },
        { val: `$${r}M+`, label: "Récupérés" },
        { val: p.toString(), label: "Pays Couverts" },
        { val: `${(t / 10).toFixed(1)}%`, label: "Taux de Succès" },
      ].map((s) => (
        <div key={s.label} className="text-center">
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,44px)", fontWeight: 700, color: "#0A0F1C" }}>{s.val}</div>
          <div style={{ fontSize: 12, color: "#6b8a72", fontWeight: 500, marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(10,15,28,0.09)", background: "#fff" }}>
      <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpen(!open)}>
        <span style={{ fontWeight: 600, color: "#0A0F1C", fontSize: 14 }}>{q}</span>
        <span style={{ color: "#10C96A", fontSize: 20, fontWeight: 700, flexShrink: 0, marginLeft: 16, transition: "transform 0.3s", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
      </button>
      <div className="accordion-body" style={{ maxHeight: open ? 280 : 0, padding: open ? "0 20px 16px" : "0 20px" }}>
        <p style={{ fontSize: 13, lineHeight: 1.75, color: "#4a6b52" }}>{a}</p>
      </div>
    </div>
  );
}

// ── Cross / Partnership Section ───────────────────────────────────────────────
function CrossSection() {
  const { ref, visible } = useInView(0.2);

  const LogoNode = ({ name, flag, color, size = 56 }: { name: string; flag: string; color: string; size?: number }) => (
    <Link to="/register">
      <div
        className="glass-card license-badge flex flex-col items-center justify-center rounded-2xl cursor-pointer"
        style={{ width: size, height: size, borderColor: color + "30", background: "rgba(255,255,255,0.85)" }}
      >
        <span style={{ fontSize: size * 0.36 }}>{flag}</span>
        <span style={{ fontSize: size * 0.16, fontWeight: 700, color, marginTop: 2, lineHeight: 1 }}>{name}</span>
      </div>
    </Link>
  );

  return (
    <section className="py-20 px-4 overflow-hidden" style={{ background: "#0A0F1C" }} ref={ref}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3.5vw,40px)", fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            Un Réseau d'Autorité Mondial
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Centrale Boursière est connectée aux principaux régulateurs, exchanges et assureurs mondiaux</p>
        </div>

        {/* Scattered network — logos spread across banner, clear of centre */}
        <div className="relative w-full" style={{ minHeight: 320 }}>

          {/* ── Left column ── */}
          <div className={`absolute left-0 top-4 flex flex-col gap-5 transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <LogoNode name="FCA" flag="🇬🇧" color="#60A5FA" size={52} />
            <LogoNode name="AMF" flag="🇫🇷" color="#EF4444" size={48} />
            <LogoNode name="CySEC" flag="🇨🇾" color="#10C96A" size={44} />
          </div>

          {/* ── Left-centre column ── */}
          <div className={`absolute left-[14%] top-12 hidden sm:flex flex-col gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "0.15s" }}>
            <LogoNode name="Interpol" flag="🌐" color="#EF4444" size={46} />
            <LogoNode name="Lloyd's" flag="🛡️" color="#8B5CF6" size={44} />
          </div>

          {/* ── Right-centre column ── */}
          <div className={`absolute right-[14%] top-12 hidden sm:flex flex-col gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "0.2s" }}>
            <LogoNode name="Bloomberg" flag="🖥️" color="#F59E0B" size={46} />
            <LogoNode name="Binance" flag="₿" color="#F59E0B" size={44} />
          </div>

          {/* ── Right column ── */}
          <div className={`absolute right-0 top-4 flex flex-col gap-5 transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`} style={{ transitionDelay: "0.1s" }}>
            <LogoNode name="FINRA" flag="🇺🇸" color="#EF4444" size={52} />
            <LogoNode name="Nasdaq" flag="📊" color="#60A5FA" size={48} />
            <LogoNode name="NYSE" flag="🏛️" color="#60A5FA" size={44} />
          </div>

          {/* ── Bottom spread ── */}
          <div className={`absolute bottom-0 left-0 right-0 flex justify-between px-[6%] transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "0.35s" }}>
            <LogoNode name="Kraken" flag="🐙" color="#8B5CF6" size={44} />
            <LogoNode name="Coinbase" flag="🔵" color="#60A5FA" size={44} />
            <LogoNode name="SEC" flag="🇺🇸" color="#10C96A" size={44} />
            <LogoNode name="Kraken" flag="🐙" color="#8B5CF6" size={0} />
          </div>

          {/* ── Centre — logo only, no crowding ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link to="/register" className="pointer-events-auto">
              <div
                className="flex flex-col items-center justify-center rounded-3xl cursor-pointer"
                style={{
                  width: 80, height: 80,
                  background: "linear-gradient(135deg, #10C96A, #0B4D2E)",
                  boxShadow: visible ? "0 0 50px rgba(16,201,106,0.35)" : "none",
                  transition: "box-shadow 0.8s ease 0.4s",
                  border: "2px solid rgba(16,201,106,0.5)",
                }}
              >
                <CentralLogo size={50} darkBg={true} showRing={false} />
              </div>
            </Link>
          </div>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
          CLIQUEZ SUR N'IMPORTE QUEL PARTENAIRE POUR OUVRIR UN DOSSIER
        </p>
      </div>
    </section>
  );
}

// ── Step-by-step animated guide ───────────────────────────────────────────────
function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll<HTMLDivElement>("[data-step]"));
    const observers: IntersectionObserver[] = [];
    cards.forEach((card) => {
      const idx = Number(card.dataset.step);
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveStep(idx);
      }, { threshold: 0.5 });
      obs.observe(card);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section id="comment-ca-marche" className="py-20 px-4" style={{ background: "#fff" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(16,201,106,0.1)", color: "#0B4D2E", border: "1px solid rgba(16,201,106,0.25)" }}>
            Comment ça marche
          </span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 700, color: "#0A0F1C", marginTop: 12, marginBottom: 8 }}>
            De l'Inscription au Recouvrement
          </h2>
          <p style={{ color: "#6b8a72", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
            5 étapes simples, guidées par notre équipe. Notre personnage vous accompagne tout au long du processus.
          </p>
        </div>

        {/* Progress track */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {HOW_STEPS.map((s, i) => (
              <div key={s.step} className="flex items-center">
                <button
                  onClick={() => setActiveStep(i)}
                  className="flex flex-col items-center gap-1 px-2"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                    style={{
                      background: i <= activeStep ? s.color : "rgba(10,15,28,0.08)",
                      color: i <= activeStep ? "#fff" : "#6b8a72",
                      transform: i === activeStep ? "scale(1.15)" : "scale(1)",
                      boxShadow: i === activeStep ? `0 0 0 4px ${s.color}25` : "none",
                    }}
                  >
                    {i < activeStep ? "✓" : s.step}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: i <= activeStep ? s.color : "#6b8a72", whiteSpace: "nowrap" }}>
                    {s.title.split(" ").slice(0, 2).join(" ")}
                  </span>
                </button>
                {i < HOW_STEPS.length - 1 && (
                  <div
                    className="mb-4"
                    style={{
                      width: 40,
                      height: 2,
                      background: i < activeStep ? HOW_STEPS[i + 1].color : "rgba(10,15,28,0.08)",
                      borderRadius: 2,
                      transition: "background 0.5s ease",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6" ref={containerRef}>
          {HOW_STEPS.map((s, i) => (
            <div
              key={s.step}
              data-step={i}
              className={`glass-card rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer ${i === activeStep ? "ring-2" : ""}`}
              style={{
                border: i === activeStep ? `2px solid ${s.color}` : "1px solid rgba(10,15,28,0.08)",
                background: i === activeStep ? s.bg : "#fff",
                boxShadow: i === activeStep ? `0 8px 40px ${s.color}18` : "none",
              }}
              onClick={() => setActiveStep(i)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6">
                {/* Step number + character */}
                <div className="flex items-center gap-4 shrink-0">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold"
                    style={{ background: s.color, color: "#fff", fontFamily: "var(--font-mono)" }}
                  >
                    {s.step.toString().padStart(2, "0")}
                  </div>
                  {i === activeStep && (
                    <div style={{ animation: "bounce-in 0.4s ease both" }}>
                      <GuideCharacter active={i === activeStep} emotion={s.emotion} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#0A0F1C" }}>{s.title}</h3>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#4a6b52", marginBottom: i === activeStep ? 12 : 0 }}>{s.desc}</p>
                  {i === activeStep && (
                    <div
                      className="flex items-center gap-2"
                      style={{ animation: "fade-in-up 0.4s ease both" }}
                    >
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: s.color, background: s.color + "18", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                        {s.detail}
                      </span>
                      {i === HOW_STEPS.length - 1 ? (
                        <Link to="/register" className="ml-auto btn-emerald px-4 py-1.5 rounded-lg text-xs">
                          Commencer →
                        </Link>
                      ) : (
                        <button
                          className="ml-auto text-xs font-semibold px-4 py-1.5 rounded-lg"
                          style={{ color: s.color, background: s.color + "15", border: `1px solid ${s.color}30` }}
                          onClick={() => setActiveStep(Math.min(i + 1, HOW_STEPS.length - 1))}
                        >
                          Étape suivante →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar at bottom of active */}
              {i === activeStep && (
                <div style={{ height: 3, background: "rgba(10,15,28,0.06)" }}>
                  <div
                    style={{
                      height: "100%",
                      background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)`,
                      animation: "progress-bar 3s ease both",
                      "--target-width": "100%",
                    } as React.CSSProperties}
                    onAnimationEnd={() => setActiveStep((prev) => Math.min(prev + 1, HOW_STEPS.length - 1))}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center mt-10">
          <Link to="/register" className="btn-emerald px-8 py-3.5 rounded-xl inline-block text-base font-bold">
            Démarrer ma procédure gratuitement →
          </Link>
          <p style={{ fontSize: 12, color: "#6b8a72", marginTop: 8 }}>Sans engagement · Consultation gratuite · Résultats en 14–30j</p>
        </div>
      </div>
    </section>
  );
}

// ── License Badges ────────────────────────────────────────────────────────────
function LicencesSection() {
  const { ref, visible } = useInView(0.1);
  return (
    <section ref={ref} className="py-16 px-4" style={{ background: "#0A0F1C" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,38px)", fontWeight: 700, color: "#fff" }}>
            Licences & Certifications
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", marginTop: 8, fontSize: 14 }}>
            Nos accréditations officielles vérifiables. Cliquez sur un badge pour ouvrir un dossier.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {LICENSE_BADGES.map((b, i) => (
            <Link to="/register" key={b.name}>
              <div
                className="license-badge cursor-pointer flex flex-col items-center text-center rounded-2xl p-4 gap-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${b.accent}35`,
                  backdropFilter: "blur(10px)",
                  animation: visible ? `bounce-in 0.45s ease ${i * 0.06}s both` : "none",
                  opacity: visible ? undefined : 0,
                }}
              >
                {/* Badge shape inspired by certification badges */}
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width: 54, height: 54,
                    background: `linear-gradient(135deg, ${b.bg}, ${b.accent}22)`,
                    borderRadius: "14px",
                    border: `1.5px solid ${b.accent}50`,
                    boxShadow: `0 0 16px ${b.accent}18`,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{b.flag}</span>
                  {/* Star decoration */}
                  <span style={{ position: "absolute", top: -4, right: -4, fontSize: 10, color: b.accent }}>★</span>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: b.accent, lineHeight: 1 }}>{b.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.35 }}>{b.full}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>{b.num}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: b.accent, background: b.accent + "15", padding: "2px 8px", borderRadius: 20 }}>CERTIFIÉ ✓</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/licences" className="btn-outline-light px-6 py-2.5 rounded-xl text-sm inline-block">
            Voir toutes nos accréditations →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Main Landing ──────────────────────────────────────────────────────────────
export default function Landing() {
  const C = useContent();

  const FLOAT_POS = [
    { pos: "top-[72px] left-2 xl:left-12", cls: "float-a" },
    { pos: "top-[72px] right-2 xl:right-12", cls: "float-b" },
    { pos: "bottom-8 left-2 xl:left-12", cls: "float-c" },
    { pos: "bottom-8 right-2 xl:right-12", cls: "float-d" },
  ];
  const floatCards = C.floatCards.map((c, i) => ({ ...c, ...FLOAT_POS[i] }));

  return (
    <div style={{ paddingTop: 64 }}>
      <Ticker partners={C.partners} />

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden grid-strip-top"
        style={{ minHeight: "calc(100vh - 96px)", paddingBottom: 60 }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 55% at 50% 35%, rgba(16,201,106,0.06) 0%, transparent 70%)" }} />
        <div className="scan-line absolute left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(16,201,106,0.4), transparent)" }} />

        {/* Floating cards */}
        {floatCards.map((c) => (
          <Link to="/register" key={c.title}
            className={`glass-card ${c.cls} absolute rounded-xl px-3 py-2.5 z-0 cursor-pointer hidden xl:block`}
            style={{ width: 170, border: `1px solid ${c.accent}28`, boxShadow: `0 4px 20px ${c.accent}12` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <span style={{ fontSize: 14 }}>{c.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#6b8a72", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.title}</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#0A0F1C" }}>{c.val}</div>
            <div style={{ fontSize: 9, color: c.accent, marginTop: 1, fontWeight: 600 }}>{c.sub}</div>
          </Link>
        ))}

        <div className="relative z-20 max-w-4xl mx-auto fade-in-up">
          {/* Logo + badge */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {C.branding.logoUrl
              ? <img src={C.branding.logoUrl} alt={C.company.name} style={{ width: 52, height: 52, objectFit: "contain", borderRadius: "50%", border: "1.5px solid rgba(11,77,46,0.18)" }} />
              : <CentralLogo size={52} darkBg={false} />
            }
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(10,15,28,0.05)", border: "1px solid rgba(10,15,28,0.1)" }}>
              <span className="pulse-dot w-2 h-2 rounded-full" style={{ background: "#10C96A", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#0A0F1C" }}>{C.hero.badge}</span>
            </div>
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,5.5vw,66px)", fontWeight: 700, color: "#0A0F1C", lineHeight: 1.1, marginBottom: 18 }}>
            {C.hero.title1}<br />
            <span style={{ color: "#0B4D2E" }}>{C.hero.title2}</span><br />
            <span style={{ background: "linear-gradient(90deg, #0A0F1C 0%, #10C96A 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {C.hero.title3}
            </span>
          </h1>

          <p style={{ fontSize: "clamp(14px,1.8vw,18px)", color: "#4a6b52", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.7 }}>
            {C.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-emerald px-7 py-3.5 rounded-xl text-base">{C.hero.cta1}</Link>
            <Link to="/dashboard" className="btn-outline px-7 py-3.5 rounded-xl text-base">{C.hero.cta2}</Link>
          </div>
        </div>

        <Stats stats={C.stats} />
      </section>

      {/* ── PARTNERS BAND ── */}
      <div className="py-5 overflow-hidden relative" style={{ background: "#0A0F1C", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-center text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>
          RECONNU ET AGRÉÉ PAR LES RÉGULATEURS INTERNATIONAUX
        </p>
        <div className="overflow-hidden">
          <div className="ticker-track flex gap-10" style={{ width: "max-content" }}>
            {[...C.partners, ...C.partners].map((p, i) => (
              <span key={`p-${i}`} className="text-white font-semibold text-sm shrink-0 whitespace-nowrap opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRUST / TRUSTPILOT ── */}
      <section className="py-14 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} style={{ color: "#10C96A", fontSize: 20 }}>★</span>)}</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#0A0F1C" }}>{C.company.trustpilot_score} / 5</span>
          </div>
          <p style={{ color: "#6b8a72", fontSize: 13 }}>Excellent · {C.company.trustpilot_count} avis vérifiés TrustPilot</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {C.reviews.map((r) => (
            <Link to="/register" key={r.name}>
              <div className="glass-card card-hover rounded-2xl p-5 h-full" style={{ background: "#fff", cursor: "pointer" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">{[...Array(r.stars)].map((_, i) => <span key={i} style={{ color: "#10C96A", fontSize: 13 }}>★</span>)}</div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(16,201,106,0.1)", color: "#0B4D2E" }}>✓ Vérifié</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "#4a6b52", marginBottom: 12 }}>{r.text}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ background: "#0A0F1C" }}>{r.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0A0F1C" }}>{r.name} · {r.country}</div>
                    <div style={{ fontSize: 11, color: "#10C96A", fontFamily: "var(--font-mono)" }}>{r.amount}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-16 px-4" style={{ background: "#F8FBF9" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3.5vw,40px)", fontWeight: 700, color: "#0A0F1C" }}>
              Nos Services Réglementés
            </h2>
            <p style={{ color: "#6b8a72", marginTop: 8, fontSize: 14, maxWidth: 520, margin: "8px auto 0" }}>
              Une plateforme complète pour recouvrement, licences et gestion institutionnelle
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {C.services.map((s) => (
              <Link to="/register" key={s.title}>
                <div className="glass-card card-hover rounded-2xl p-6 h-full cursor-pointer" style={{ background: "#fff" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: s.color + "15" }}>{s.icon}</div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ml-2" style={{ background: s.color + "12", color: s.color }}>{s.tag}</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#0A0F1C", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: "#4a6b52" }}>{s.desc}</p>
                  <div className="mt-4 text-sm font-semibold" style={{ color: s.color }}>En savoir plus →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (animated guide) ── */}
      <HowItWorks />

      {/* ── CROSS NETWORK ── */}
      <CrossSection />

      {/* ── WHY CENTRAL ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3.5vw,40px)", fontWeight: 700, color: "#0A0F1C" }}>
              Pourquoi Centrale Boursière
            </h2>
          </div>
          {[
            {
              Illus: IllustrationForensics,
              tag: "Recouvrement Crypto", tagColor: "#10C96A",
              title: "Leader du Recouvrement Crypto en 2026",
              body: "En 2025, plus de $14 milliards ont été volés dans des escroqueries crypto — +38% vs 2024. Centrale Boursière s'est spécialisé dans la blockchain forensics : analyse on-chain, identification des wallets frauduleux, coordination avec les exchanges et les régulateurs FCA, AMF, SEC et Interpol. 12,400+ dossiers traités dans 47 pays, délai moyen de recouvrement inférieur à 30 jours.",
              stat: "$890M+ récupérés",
            },
            {
              Illus: IllustrationLegal,
              tag: "Licences Réglementaires", tagColor: "#3B82F6",
              title: "L'Accès aux Marchés par les Licences",
              body: "Toute activité boursière professionnelle requiert une licence réglementaire. En Europe, la directive MiFID II est incontournable. Au Royaume-Uni, la FCA. En France, l'AMF. Centrale Boursière vous accompagne dans l'intégralité du processus : analyse de votre profil, sélection de la juridiction optimale, préparation du dossier, dépôt et suivi. Délais moyens : 6 semaines FCA, 8 semaines AMF, 10 semaines CySEC.",
              stat: "47+ Licences délivrées",
            },
            {
              Illus: IllustrationSecurity,
              tag: "Sécurité Institutionnelle", tagColor: "#8B5CF6",
              title: "Sécurité & Assurance de Niveau Institutionnel",
              body: "Certifié ISO 27001 et SOC 2 Type II. Cold wallet multi-signature pour 97% des actifs, chiffrement AES-256, authentification 2FA + FIDO2, surveillance 24/7. Zéro violation de données depuis notre fondation. En partenariat avec Lloyd's of London : couverture jusqu'à $10M par portefeuille contre le vol, le hack et la perte de clés.",
              stat: "ISO 27001 · SOC 2 · Lloyd's",
            },
          ].map((block, idx) => (
            <div key={block.tag} className={`flex flex-col ${idx % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 lg:items-center mb-20`}>
              <div className="w-full lg:w-1/2">
                <block.Illus />
              </div>
              <div className="w-full lg:w-1/2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: block.tagColor + "15", color: block.tagColor, border: `1px solid ${block.tagColor}30` }}>{block.tag}</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,2.5vw,28px)", fontWeight: 700, color: "#0A0F1C", margin: "12px 0 14px", lineHeight: 1.25 }}>{block.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#4a6b52" }}>{block.body}</p>
                <Link to="/register" className="mt-5 inline-block btn-primary px-5 py-2.5 rounded-xl text-sm">
                  Ouvrir un dossier →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LICENCES & CERTS ── */}
      <LicencesSection />

      {/* ── PRICING ── */}
      <section id="tarifs" className="py-16 px-4" style={{ background: "#fff" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3.5vw,40px)", fontWeight: 700, color: "#0A0F1C" }}>
              Plans & Tarification
            </h2>
            <p style={{ color: "#6b8a72", marginTop: 8, fontSize: 14 }}>Sélectionnez le plan adapté à vos besoins</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {C.pricing.map((p) => (
              <div
                key={p.name}
                className={`card-hover rounded-2xl p-6 flex flex-col ${p.featured ? "relative" : ""}`}
                style={{
                  background: p.featured ? "#0A0F1C" : "#F8FBF9",
                  border: p.featured ? "2px solid #10C96A" : "1px solid rgba(10,15,28,0.1)",
                  boxShadow: p.featured ? "0 12px 50px rgba(10,15,28,0.25)" : undefined,
                  transform: p.featured ? "scale(1.02)" : undefined,
                }}
              >
                {p.badge && (
                  <div className="text-center mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#10C96A", color: "#0A0F1C" }}>⭐ {p.badge}</span>
                  </div>
                )}
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: p.featured ? "#fff" : "#0A0F1C", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 30, fontWeight: 700, color: p.featured ? "#10C96A" : "#0A0F1C", marginBottom: 16 }}>{p.price}</div>
                <ul className="space-y-2 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2" style={{ fontSize: 13, color: p.featured ? "rgba(255,255,255,0.8)" : "#4a6b52" }}>
                      <span style={{ color: "#10C96A", marginTop: 1, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`mt-6 block text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${p.featured ? "btn-emerald" : "btn-outline"}`}>
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3.5vw,40px)", fontWeight: 700, color: "#0A0F1C" }}>Questions Fréquentes</h2>
        </div>
        <div className="space-y-2">
          {C.faq.map((f) => <Accordion key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── BLOG ── */}
      <section id="blog" className="py-16 px-4" style={{ background: "#F8FBF9" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3.5vw,40px)", fontWeight: 700, color: "#0A0F1C" }}>Blog & Ressources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {C.blog.map((b) => (
              <Link to="/register" key={b.title}>
                <div className="glass-card card-hover rounded-2xl overflow-hidden h-full cursor-pointer" style={{ background: "#fff" }}>
                  {/* 2D animated blog header */}
                  <div className="w-full flex items-center justify-center relative" style={{ height: 160, background: b.bg }}>
                    <span style={{ fontSize: 56, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))", animation: "float-a 4s ease-in-out infinite" }}>{b.emoji}</span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: b.accent + "20", color: b.accent, border: `1px solid ${b.accent}30` }}>{b.tag}</span>
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ fontSize: 11, color: "#6b8a72" }}>{b.date} · {b.readTime}</span>
                    </div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#0A0F1C", marginBottom: 6, lineHeight: 1.35 }}>{b.title}</h3>
                    <div className="mt-3 text-sm font-semibold" style={{ color: b.accent }}>Lire la suite →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        className="py-20 px-4 text-center relative overflow-hidden grid-strip-dark"
        style={{ background: "#0A0F1C" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(16,201,106,0.1) 0%, transparent 70%)" }} />
        <div className="relative z-10">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            {C.branding.logoUrl
              ? <img src={C.branding.logoUrl} alt={C.company.name} style={{ width: 64, height: 64, objectFit: "contain", borderRadius: "50%", background: "#fff", border: "1.5px solid rgba(16,201,106,0.45)" }} />
              : <CentralLogo size={64} darkBg={true} />}
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px,4vw,50px)", fontWeight: 700, color: "#fff", marginBottom: 14 }}>
            {C.cta.title}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 30 }}>{C.cta.subtitle}</p>
          <Link to="/register" className="btn-emerald inline-block px-8 py-4 rounded-xl font-bold text-base">
            {C.cta.button}
          </Link>
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {C.cta.badges.map((b) => (
              <span key={b} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-14 px-4" style={{ background: "#060A12" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                {C.branding.logoUrl
                  ? <img src={C.branding.logoUrl} alt={C.company.name} style={{ width: 32, height: 32, objectFit: "contain", borderRadius: "50%", background: "#fff" }} />
                  : <CentralLogo size={32} darkBg={true} />}
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#fff" }}>{C.company.name}</span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>{C.company.tagline}</p>
              <div className="flex gap-1.5 mt-4">
                {["FCA", "AMF", "CySEC"].map((b) => (
                  <span key={b} className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(16,201,106,0.12)", color: "#10C96A", border: "1px solid rgba(16,201,106,0.2)" }}>{b}</span>
                ))}
              </div>
            </div>
            {[
              { title: "Plateforme", links: ["Dashboard", "Marchés Live", "Portfolio", "Licences", "Sécurité"] },
              { title: "Services", links: ["Recouvrement Crypto", "Département Légal", "Licences Boursières", "Assurance Actifs", "Compliance"] },
              { title: "Contact", links: [C.company.email_contact, C.company.email_legal, C.company.email_recovery] },
            ].map((col) => (
              <div key={col.title}>
                <h4 style={{ fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 12, letterSpacing: "0.08em" }}>{col.title.toUpperCase()}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link to="/register" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }} className="hover:text-white transition-colors">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", lineHeight: 1.8 }}>
              <strong style={{ color: "rgba(255,255,255,0.35)" }}>Avertissement légal :</strong> {C.company.disclaimer} Numéro d'enregistrement FCA : {C.company.fca_number}. © 2026 {C.company.name} — Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
