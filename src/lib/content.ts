// ── Centrale Boursière · Content Store ────────────────────────────────────────

export interface UserComment {
  id: string;
  text: string;
  date: string;
  author: string;
  authorRole: string;
}

export interface UserAccount {
  id: string;
  clientId: string;         // CB-XXXXXXXX
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  flag: string;
  plan: "Professionnel" | "Avancé" | "VIP Institutionnel";
  status: "active" | "inactive" | "pending" | "suspended";
  kyc: "0" | "1" | "2" | "3";
  joinDate: string;
  lastSeen: string;
  balance: number;
  fundsAdded: number;
  fundsWithdrawn: number;
  pnl: number;
  caseStatus: "none" | "open" | "forensics" | "legal" | "negotiation" | "recovered" | "closed";
  caseAmount: number;
  caseRef: string;
  procedureStep: number;
  notes: string;
  comments: UserComment[];
  assignedAdvisor: string;  // staff id or ""
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "super_admin" | "admin" | "advisor";
  department: string;
  active: boolean;
  joinDate: string;
  notes: string;
}

export interface FloatCard {
  icon: string;
  title: string;
  val: string;
  sub: string;
  accent: string;
}

export interface SiteContent {
  hero: {
    badge: string;
    title1: string;
    title2: string;
    title3: string;
    subtitle: string;
    cta1: string;
    cta2: string;
  };
  stats: {
    dossiers: number;
    recovered: number;
    countries: number;
    successRate: number;
  };
  services: {
    icon: string;
    title: string;
    desc: string;
    tag: string;
    color: string;
  }[];
  pricing: {
    name: string;
    price: string;
    badge: string | null;
    featured: boolean;
    features: string[];
    cta: string;
  }[];
  faq: { q: string; a: string }[];
  reviews: { name: string; country: string; stars: number; text: string; amount: string }[];
  blog: { title: string; date: string; readTime: string; tag: string; accent: string; emoji: string; bg: string }[];
  partners: string[];
  company: {
    name: string;
    tagline: string;
    email_contact: string;
    email_legal: string;
    email_recovery: string;
    disclaimer: string;
    fca_number: string;
    trustpilot_score: string;
    trustpilot_count: string;
  };
  // Super-admin only: company legal structure
  companyStructure: {
    legalName: string;
    legalForm: string;
    siret: string;
    capital: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    ceoName: string;
    ceoEmail: string;
    departments: { name: string; head: string; headId: string; size: number }[];
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
    badges: string[];
  };
  branding: {
    logoUrl: string;
    primaryColor: string;
    accentColor: string;
    navbarTitle: string;
    navbarSubtitle: string;
  };
  floatCards: [FloatCard, FloatCard, FloatCard, FloatCard];
  users: UserAccount[];
  staff: StaffMember[];
}

// ── Default staff ─────────────────────────────────────────────────────────────
export const DEFAULT_STAFF: StaffMember[] = [
  { id: "s1", firstName: "Sophie", lastName: "Leclerc", email: "s.leclerc@centralboursiere.com", phone: "+33 1 23 45 67 89", role: "super_admin", department: "Direction", active: true, joinDate: "1 janv. 2026", notes: "Directrice générale" },
  { id: "s2", firstName: "Antoine", lastName: "Bernard", email: "a.bernard@centralboursiere.com", phone: "+33 1 23 45 67 90", role: "admin", department: "Opérations", active: true, joinDate: "15 janv. 2026", notes: "Responsable opérations" },
  { id: "s3", firstName: "Marie", lastName: "Rousseau", email: "m.rousseau@centralboursiere.com", phone: "+33 1 23 45 67 91", role: "advisor", department: "Recouvrement", active: true, joinDate: "1 fév. 2026", notes: "Conseillère senior recouvrement" },
  { id: "s4", firstName: "Paul", lastName: "Laurent", email: "p.laurent@centralboursiere.com", phone: "+33 1 23 45 67 92", role: "advisor", department: "Légal", active: true, joinDate: "10 fév. 2026", notes: "Conseiller juridique" },
];

// ── Default users (enhanced) ──────────────────────────────────────────────────
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: "u1", clientId: "CB-FR391001", firstName: "Jean", lastName: "Dupont",
    email: "jean.dupont@email.com", phone: "+33 6 12 34 56 78",
    country: "France", flag: "🇫🇷", plan: "Professionnel",
    status: "active", kyc: "2", joinDate: "10 août 2026", lastSeen: "il y a 2h",
    balance: 87340, fundsAdded: 95000, fundsWithdrawn: 8000, pnl: 9234,
    caseStatus: "legal", caseAmount: 48200, caseRef: "FR-2026-0391", procedureStep: 3,
    notes: "Client prioritaire", comments: [
      { id: "c1", text: "Dossier en cours d'instruction légale. Documents reçus.", date: "2 sept. 2026", author: "Marie Rousseau", authorRole: "advisor" },
    ], assignedAdvisor: "s3",
  },
  {
    id: "u2", clientId: "CB-BE214002", firstName: "Sofia", lastName: "Kowalski",
    email: "sofia.k@gmail.com", phone: "+32 4 87 65 43 21",
    country: "Belgique", flag: "🇧🇪", plan: "Avancé",
    status: "active", kyc: "2", joinDate: "5 juil. 2026", lastSeen: "il y a 1j",
    balance: 142800, fundsAdded: 160000, fundsWithdrawn: 20000, pnl: 18400,
    caseStatus: "recovered", caseAmount: 87400, caseRef: "BE-2026-0214", procedureStep: 5,
    notes: "", comments: [
      { id: "c2", text: "Recouvrement complet confirmé. Client très satisfait.", date: "28 août 2026", author: "Paul Laurent", authorRole: "advisor" },
    ], assignedAdvisor: "s4",
  },
  {
    id: "u3", clientId: "CB-CH087003", firstName: "Marc", lastName: "Dubois",
    email: "marc.d@finance.ch", phone: "+41 79 123 45 67",
    country: "Suisse", flag: "🇨🇭", plan: "VIP Institutionnel",
    status: "active", kyc: "3", joinDate: "1 janv. 2026", lastSeen: "il y a 3h",
    balance: 512000, fundsAdded: 600000, fundsWithdrawn: 88000, pnl: 74200,
    caseStatus: "recovered", caseAmount: 230000, caseRef: "CH-2026-0087", procedureStep: 5,
    notes: "VIP — priorité absolue", comments: [
      { id: "c3", text: "Client VIP. Suivi hebdomadaire requis. Contrat renouvelé.", date: "1 sept. 2026", author: "Sophie Leclerc", authorRole: "super_admin" },
    ], assignedAdvisor: "s2",
  },
  {
    id: "u4", clientId: "CB-PT512004", firstName: "Ana", lastName: "Lima",
    email: "ana.lima@outlook.pt", phone: "+351 91 234 56 78",
    country: "Portugal", flag: "🇵🇹", plan: "Professionnel",
    status: "active", kyc: "1", joinDate: "20 août 2026", lastSeen: "il y a 5j",
    balance: 23400, fundsAdded: 25000, fundsWithdrawn: 1600, pnl: 1200,
    caseStatus: "forensics", caseAmount: 15000, caseRef: "PT-2026-0512", procedureStep: 2,
    notes: "", comments: [], assignedAdvisor: "s3",
  },
  {
    id: "u5", clientId: "CB-DE701005", firstName: "Thomas", lastName: "Schneider",
    email: "t.schneider@web.de", phone: "+49 151 234 56789",
    country: "Allemagne", flag: "🇩🇪", plan: "Avancé",
    status: "pending", kyc: "0", joinDate: "29 août 2026", lastSeen: "il y a 2j",
    balance: 0, fundsAdded: 0, fundsWithdrawn: 0, pnl: 0,
    caseStatus: "open", caseAmount: 32000, caseRef: "DE-2026-0701", procedureStep: 1,
    notes: "KYC en attente", comments: [
      { id: "c4", text: "Documents KYC demandés par email le 30 août. Relance nécessaire.", date: "30 août 2026", author: "Antoine Bernard", authorRole: "admin" },
    ], assignedAdvisor: "s4",
  },
  {
    id: "u6", clientId: "CB-FR102006", firstName: "Isabelle", lastName: "Martin",
    email: "i.martin@laposte.fr", phone: "+33 6 98 76 54 32",
    country: "France", flag: "🇫🇷", plan: "Professionnel",
    status: "inactive", kyc: "2", joinDate: "3 mars 2026", lastSeen: "il y a 30j",
    balance: 8200, fundsAdded: 10000, fundsWithdrawn: 1800, pnl: -420,
    caseStatus: "closed", caseAmount: 5000, caseRef: "FR-2026-0102", procedureStep: 0,
    notes: "Compte inactif — relancer", comments: [], assignedAdvisor: "",
  },
];

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    badge: "Plateforme agréée · 12,400+ dossiers traités",
    title1: "Récupérez Vos Fonds.",
    title2: "Tradez en Conformité.",
    title3: "Protégez Votre Capital.",
    subtitle: "Plateforme réglementée FCA — recouvrement de fonds crypto, licences boursières internationales, et accès aux marchés globaux. $890M+ récupérés dans 47 pays.",
    cta1: "Ouvrir un Dossier Gratuit →",
    cta2: "Voir le Dashboard",
  },
  stats: { dossiers: 12400, recovered: 890, countries: 47, successRate: 984 },
  services: [
    { icon: "🔍", title: "Recouvrement de Fonds Crypto", desc: "Analyse blockchain forensics, traçage de transactions on-chain, coordination avec les exchanges et autorités. Taux de succès 98.4%.", tag: "98.4% succès", color: "#10C96A" },
    { icon: "⚖️", title: "Département Légal", desc: "Avocats spécialisés crypto & finance internationale. Plaintes, injonctions judiciaires, représentation FCA, AMF, SEC.", tag: "Certifiés", color: "#3B82F6" },
    { icon: "📋", title: "Licences Boursières", desc: "Obtention FCA, AMF, CySEC, MiFID II, FINRA — accompagnement de la demande à l'agrément officiel.", tag: "FCA · AMF · CySEC", color: "#8B5CF6" },
    { icon: "🎓", title: "Certifications Trading", desc: "Programmes certifiants reconnus. Partenaire officiel CFA Institute et CMT Association. Niveau 1, 2, 3.", tag: "CFA Partner", color: "#F59E0B" },
    { icon: "🛡️", title: "Assurance Actifs Digitaux", desc: "Couverture complète jusqu'à $10M. Partenariat Lloyd's of London. Vol, hack, perte de clés.", tag: "Lloyd's · $10M", color: "#EF4444" },
    { icon: "✅", title: "Compliance & Autorisation", desc: "Audit réglementaire, KYC/AML, structure légale. ISO 27001 et SOC 2 Type II.", tag: "ISO 27001 · SOC 2", color: "#10C96A" },
  ],
  pricing: [
    { name: "Professionnel", price: "$1,000", badge: null, featured: false, features: ["Recouvrement illimité", "Licences FCA / AMF incluses", "Assurance actifs $1M", "Accès marchés live multi-actifs", "Graphiques avancés multi-timeframes", "Gestionnaire de compte dédié"], cta: "Choisir ce plan" },
    { name: "Avancé", price: "$2,899", badge: "Nouveau · Recommandé", featured: true, features: ["Tout le plan Professionnel +", "Licences FCA + AMF + CySEC incluses", "Assurance actifs $5M (Lloyd's)", "Accès Bloomberg Terminal", "Équipe légale dédiée", "Rapport forensics prioritaire 48h", "Accès marchés US + EU + Asia", "Conseiller personnel assigné"], cta: "Choisir ce plan" },
    { name: "VIP Institutionnel", price: "$5,000", badge: null, featured: false, features: ["Tout le plan Avancé +", "Département légal exclusif 24/7", "Toutes licences internationales", "Assurance actifs $10M (Lloyd's)", "Email pro direct + WhatsApp", "Gestionnaire de compte 24/7", "Accès API trading institutionnel"], cta: "Contacter l'équipe VIP" },
  ],
  faq: [
    { q: "Comment fonctionne le processus de recouvrement ?", a: "Notre processus débute par une analyse forensique complète de la blockchain. Notre équipe juridique engage ensuite les démarches légales auprès des exchanges, des autorités régulatrices et des juridictions compétentes. En moyenne, nos dossiers sont résolus en moins de 30 jours avec un taux de succès de 98.4%." },
    { q: "Quels types de fraudes pouvez-vous traiter ?", a: "Escroqueries Pig Butchering, faux exchanges, rug pulls DeFi, hacks de wallets, faux investissements crypto, arnaques romantiques liées aux cryptos, schémas de Ponzi tokenisés, et fraudes par phishing." },
    { q: "Combien de temps dure une procédure de recouvrement ?", a: "60% de nos dossiers sont résolus en moins de 30 jours. Les cas multi-juridictions peuvent prendre 45 à 90 jours." },
    { q: "Quelles licences pouvez-vous obtenir pour moi ?", a: "FCA (Royaume-Uni), AMF (France), CySEC (Chypre/Europe), FINRA (USA), SEC (USA), MiFID II (Europe), ainsi que les certifications ISO 27001 et SOC 2." },
    { q: "Mes informations personnelles sont-elles sécurisées ?", a: "Nous sommes certifiés ISO 27001 et SOC 2 Type II. Vos données sont chiffrées AES-256, stockées sur des serveurs européens conformes RGPD, avec 2FA obligatoire." },
  ],
  reviews: [
    { name: "Pierre M.", country: "🇫🇷", stars: 5, text: "J'ai récupéré €87,400 en 19 jours après une arnaque. L'équipe était exceptionnelle.", amount: "€87,400 récupérés" },
    { name: "Sofia K.", country: "🇧🇪", stars: 5, text: "Licence FCA en 6 semaines, processus impeccable, équipe très réactive.", amount: "Licence FCA obtenue" },
    { name: "Marc D.", country: "🇨🇭", stars: 5, text: "Mon portefeuille de $230,000 avait disparu après un hack. Récupéré intégralement.", amount: "$230,000 récupérés" },
    { name: "Ana L.", country: "🇵🇹", stars: 4, text: "Suivi en temps réel sur le dashboard très rassurant. Service professionnel.", amount: "Compliance obtenue" },
  ],
  blog: [
    { title: "Comment récupérer des fonds crypto après une escroquerie en 2026", date: "15 août 2026", readTime: "12 min", tag: "Recouvrement", accent: "#10C96A", emoji: "🔍", bg: "linear-gradient(135deg,#0A1F12,#0A0F1C)" },
    { title: "Guide complet pour obtenir sa licence FCA de trader en 2026", date: "8 août 2026", readTime: "9 min", tag: "Licences", accent: "#60A5FA", emoji: "📋", bg: "linear-gradient(135deg,#0d1a2e,#1a0d2e)" },
    { title: "Les meilleures stratégies pour protéger ses actifs digitaux", date: "1 août 2026", readTime: "7 min", tag: "Sécurité", accent: "#A78BFA", emoji: "🛡️", bg: "linear-gradient(135deg,#1a0d2e,#0A1F12)" },
  ],
  partners: ["FCA", "AMF", "SEC", "FINRA", "CySEC", "MiFID II", "ISO 27001", "TrustPilot", "Binance", "Coinbase", "Kraken", "NYSE", "Nasdaq", "CME Group", "Bloomberg", "Reuters", "Lloyd's of London"],
  company: {
    name: "Centrale Boursière",
    tagline: "Plateforme réglementée FCA pour le recouvrement de fonds crypto, les licences boursières et la gestion d'actifs institutionnels.",
    email_contact: "contact@centralboursiere.com",
    email_legal: "legal@centralboursiere.com",
    email_recovery: "recovery@centralboursiere.com",
    disclaimer: "Centrale Boursière est une plateforme réglementée fournissant des services de recouvrement d'actifs, de conformité réglementaire et d'accès aux marchés financiers. Les performances passées ne garantissent pas les résultats futurs.",
    fca_number: "FR-2026-0847",
    trustpilot_score: "4.8",
    trustpilot_count: "2,847",
  },
  companyStructure: {
    legalName: "Centrale Boursière SAS",
    legalForm: "Société par Actions Simplifiée",
    siret: "882 345 678 00012",
    capital: "500,000 €",
    address: "12 Rue de la Bourse",
    city: "75002 Paris",
    country: "France",
    phone: "+33 1 23 45 67 89",
    ceoName: "Sophie Leclerc",
    ceoEmail: "s.leclerc@centralboursiere.com",
    departments: [
      { name: "Recouvrement & Forensics", head: "Marie Rousseau", headId: "s3", size: 8 },
      { name: "Juridique & Compliance", head: "Paul Laurent", headId: "s4", size: 5 },
      { name: "Trading & Marchés", head: "Antoine Bernard", headId: "s2", size: 4 },
      { name: "Support Client", head: "—", headId: "", size: 3 },
    ],
  },
  cta: {
    title: "Votre Capital Mérite une Protection Institutionnelle",
    subtitle: "Rejoignez 12,400+ clients qui nous font confiance. Consultation initiale gratuite.",
    button: "Ouvrir Votre Dossier Gratuitement →",
    badges: ["🔒 SSL 256-bit", "🇬🇧 FCA Regulated", "⭐ 4.8/5 TrustPilot", "🛡️ ISO 27001"],
  },
  branding: {
    logoUrl: "",
    primaryColor: "#0A0F1C",
    accentColor: "#10C96A",
    navbarTitle: "CENTRAL",
    navbarSubtitle: "BOURSIÈRE",
  },
  floatCards: [
    { icon: "✅", title: "Dossier Récupéré", val: "$48,200 USDT", sub: "14 jours · FR-2026-0391", accent: "#10C96A" },
    { icon: "📋", title: "Licence FCA", val: "#FR-2026-0847", sub: "Active · Royaume-Uni", accent: "#60A5FA" },
    { icon: "₿", title: "BTC Live", val: "$67,420", sub: "▲ 2.34%", accent: "#F59E0B" },
    { icon: "🛡️", title: "Assurance Lloyd's", val: "$10M Max", sub: "Lloyd's · Couverture 100%", accent: "#A78BFA" },
  ],
  users: DEFAULT_USERS,
  staff: DEFAULT_STAFF,
};

const STORAGE_KEY = "cb_site_content";

export function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTENT;
    const p = JSON.parse(raw) as Partial<SiteContent>;
    return {
      ...DEFAULT_CONTENT,
      ...p,
      users: (p.users ?? DEFAULT_USERS).map((u: UserAccount) => {
        return {
          ...u,
          clientId: u.clientId || "",
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          phone: u.phone || "",
          comments: u.comments || [],
          assignedAdvisor: u.assignedAdvisor || "",
        };
      }),
      staff: p.staff ?? DEFAULT_STAFF,
      companyStructure: { ...DEFAULT_CONTENT.companyStructure, ...(p.companyStructure ?? {}) },
      floatCards: p.floatCards ?? DEFAULT_CONTENT.floatCards,
      branding: { ...DEFAULT_CONTENT.branding, ...(p.branding ?? {}) },
    };
  } catch {
    return DEFAULT_CONTENT;
  }
}

import { db } from "./supabaseClient";

// ── Merge helper ──────────────────────────────────────────────────────────────
function mergeContent(p: Partial<SiteContent>): SiteContent {
  return {
    ...DEFAULT_CONTENT,
    ...p,
    users: (p.users ?? DEFAULT_USERS).map((u: UserAccount) => ({
      ...u,
      clientId: u.clientId || "",
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      phone: u.phone || "",
      comments: u.comments || [],
      assignedAdvisor: u.assignedAdvisor || "",
    })),
    staff: p.staff ?? DEFAULT_STAFF,
    companyStructure: { ...DEFAULT_CONTENT.companyStructure, ...(p.companyStructure ?? {}) },
    floatCards: p.floatCards ?? DEFAULT_CONTENT.floatCards,
    branding: { ...DEFAULT_CONTENT.branding, ...(p.branding ?? {}) },
  };
}

// ── Sync Supabase → localStorage ──────────────────────────────────────────────
export async function syncFromSupabase(): Promise<SiteContent> {
  try {
    const remote = await db.getContent() as Partial<SiteContent> | null;
    if (remote && Object.keys(remote).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      window.dispatchEvent(new Event("cb-content-updated"));
      return mergeContent(remote);
    }
  } catch { /* fall through */ }
  return loadContent();
}

export async function saveContent(content: SiteContent): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new Event("cb-content-updated"));
  try {
    await db.putContent(content as unknown as object);
  } catch { /* localStorage saved, Supabase best-effort */ }
}

export async function resetContent(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("cb-content-updated"));
  await db.putContent(DEFAULT_CONTENT as unknown as object).catch(() => {});
}
