import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WalletModal from "../components/WalletModal";

const COUNTRIES = ["France", "Belgique", "Suisse", "Canada", "Espagne", "Italie", "Allemagne", "Royaume-Uni", "Maroc", "Tunisie", "Sénégal", "Côte d'Ivoire", "Cameroun", "Portugal", "Pays-Bas", "Autre"];
const CASE_TYPES = ["Recouvrement de fonds crypto", "Obtention d'une licence boursière", "Trading & accès marchés", "Investissement & gestion d'actifs", "Compliance & audit réglementaire"];

const PLANS = [
  { name: "Essentiel", price: "$250", badge: null },
  { name: "Standard", price: "$500", badge: null },
  { name: "Professionnel", price: "$1,000", badge: "Plus populaire" },
  { name: "VIP Institutionnel", price: "$5,000", badge: null },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Carte Visa / Mastercard", icon: "💳" },
  { id: "sepa", label: "Virement SEPA", icon: "🏦" },
  { id: "usdt", label: "USDT (TRC-20 / ERC-20)", icon: "₮" },
  { id: "btc", label: "Bitcoin (BTC)", icon: "₿" },
  { id: "eth", label: "Ethereum (ETH)", icon: "Ξ" },
  { id: "paypal", label: "PayPal", icon: "🅿" },
  { id: "apple", label: "Apple Pay / Google Pay", icon: "📱" },
];

interface FormData {
  firstName: string;
  lastName: string;
  country: string;
  password: string;
  phone: string;
  email: string;
  caseType: string;
  plan: string;
  payment: string;
  wallet: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showWallet, setShowWallet] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", country: "", password: "",
    phone: "", email: "", caseType: "",
    plan: "Professionnel", payment: "card", wallet: "",
  });

  const update = (k: keyof FormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canNext1 = form.firstName && form.lastName && form.country && form.password.length >= 6;
  const canNext2 = form.phone && form.email && form.caseType;

  const handleSubmit = () => {
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 2200);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all";
  const inputStyle = {
    border: "1.5px solid rgba(11,77,46,0.2)",
    background: "#fff",
    color: "#0A1F12",
    fontFamily: "var(--font-body)",
  };
  const focusRing = {
    "--tw-ring-color": "#10C96A",
  } as React.CSSProperties;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ paddingTop: 64 }}>
        <div className="text-center fade-in-up">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ background: "rgba(16,201,106,0.15)" }}>
            ✅
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "#0A1F12", marginBottom: 12 }}>
            Dossier Ouvert avec Succès !
          </h2>
          <p style={{ color: "#6b8a72", fontSize: 15 }}>Redirection vers votre dashboard…</p>
          <div className="mt-6 w-12 h-1.5 rounded-full mx-auto" style={{ background: "#10C96A", animation: "scan 2s ease forwards" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ paddingTop: 80 }}>
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                style={{
                  background: step >= s ? "#0B4D2E" : "rgba(11,77,46,0.1)",
                  color: step >= s ? "#fff" : "#6b8a72",
                }}
              >
                {step > s ? "✓" : s}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: step >= s ? "#0B4D2E" : "#6b8a72" }}>
                {s === 1 ? "Identité" : s === 2 ? "Contact" : "Plan & Paiement"}
              </span>
              {s < 3 && <div className="flex-1 h-px" style={{ background: step > s ? "#0B4D2E" : "rgba(11,77,46,0.15)" }} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-7" style={{ background: "#F8FBF9" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "#0A1F12", marginBottom: 6 }}>
            {step === 1 ? "Ouvrir un Dossier" : step === 2 ? "Vos Coordonnées" : "Plan & Paiement"}
          </h1>
          <p style={{ fontSize: 13, color: "#6b8a72", marginBottom: 24 }}>
            {step === 1 ? "Étape 1 / 3 — Informations personnelles" : step === 2 ? "Étape 2 / 3 — Contact & type de dossier" : "Étape 3 / 3 — Sélectionnez votre plan"}
          </p>

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#0B4D2E" }}>Prénom</label>
                  <input className={inputClass} style={inputStyle} placeholder="Jean" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#0B4D2E" }}>Nom</label>
                  <input className={inputClass} style={inputStyle} placeholder="Dupont" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#0B4D2E" }}>Pays de résidence</label>
                <select className={inputClass} style={inputStyle} value={form.country} onChange={(e) => update("country", e.target.value)}>
                  <option value="">Sélectionner un pays…</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#0B4D2E" }}>Mot de passe</label>
                <input type="password" className={inputClass} style={inputStyle} placeholder="Minimum 6 caractères" value={form.password} onChange={(e) => update("password", e.target.value)} />
              </div>
              <button
                className="btn-primary w-full py-3 rounded-xl text-sm mt-2"
                disabled={!canNext1}
                style={{ opacity: canNext1 ? 1 : 0.5, cursor: canNext1 ? "pointer" : "not-allowed" }}
                onClick={() => setStep(2)}
              >
                Continuer →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#0B4D2E" }}>Numéro de téléphone</label>
                <input className={inputClass} style={inputStyle} placeholder="+33 6 12 34 56 78" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#0B4D2E" }}>Adresse email</label>
                <input type="email" className={inputClass} style={inputStyle} placeholder="jean.dupont@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#0B4D2E" }}>Type de dossier</label>
                <select className={inputClass} style={inputStyle} value={form.caseType} onChange={(e) => update("caseType", e.target.value)}>
                  <option value="">Sélectionner le type…</option>
                  {CASE_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline flex-1 py-3 rounded-xl text-sm" onClick={() => setStep(1)}>← Retour</button>
                <button
                  className="btn-primary flex-1 py-3 rounded-xl text-sm"
                  disabled={!canNext2}
                  style={{ opacity: canNext2 ? 1 : 0.5, cursor: canNext2 ? "pointer" : "not-allowed" }}
                  onClick={() => setStep(3)}
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              {/* Plan selection */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#0B4D2E" }}>Sélectionner votre plan</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLANS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => update("plan", p.name)}
                      className="rounded-xl p-3 text-left transition-all"
                      style={{
                        border: `2px solid ${form.plan === p.name ? "#0B4D2E" : "rgba(11,77,46,0.15)"}`,
                        background: form.plan === p.name ? "rgba(11,77,46,0.06)" : "#fff",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0A1F12" }}>{p.name}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "#0B4D2E" }}>{p.price}</div>
                      {p.badge && <div className="mt-1 text-xs font-semibold" style={{ color: "#10C96A" }}>★ {p.badge}</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Connect wallet */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#0B4D2E" }}>Connecter un Wallet (optionnel)</label>
                {form.wallet ? (
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: "rgba(16,201,106,0.1)", border: "1.5px solid rgba(16,201,106,0.3)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#0B4D2E" }}>{form.wallet.slice(0, 8)}...{form.wallet.slice(-6)}</span>
                    <button onClick={() => update("wallet", "")} style={{ fontSize: 12, color: "#6b8a72" }}>Déconnecter</button>
                  </div>
                ) : (
                  <button onClick={() => setShowWallet(true)} className="btn-outline w-full py-2.5 rounded-xl text-sm">
                    + Connecter MetaMask / WalletConnect
                  </button>
                )}
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#0B4D2E" }}>Méthode de paiement</label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer" style={{ border: `1.5px solid ${form.payment === m.id ? "#0B4D2E" : "rgba(11,77,46,0.15)"}`, background: form.payment === m.id ? "rgba(11,77,46,0.05)" : "#fff" }}>
                      <input type="radio" name="payment" value={m.id} checked={form.payment === m.id} onChange={() => update("payment", m.id)} className="accent-green-800" />
                      <span>{m.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#0A1F12" }}>{m.label}</span>
                    </label>
                  ))}
                </div>

                {form.payment === "card" && (
                  <div className="mt-3 space-y-2 p-4 rounded-xl" style={{ background: "#fff", border: "1px solid rgba(11,77,46,0.1)" }}>
                    <input className={inputClass} style={inputStyle} placeholder="Numéro de carte" />
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClass} style={inputStyle} placeholder="MM / AA" />
                      <input className={inputClass} style={inputStyle} placeholder="CVV" />
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#10C96A" }}>🔒 256-bit SSL · PCI DSS Compliant</p>
                  </div>
                )}
                {form.payment === "sepa" && (
                  <div className="mt-3 space-y-2 p-4 rounded-xl" style={{ background: "#fff", border: "1px solid rgba(11,77,46,0.1)" }}>
                    <input className={inputClass} style={inputStyle} placeholder="IBAN (FR76 3000 6000 0112…)" />
                    <input className={inputClass} style={inputStyle} placeholder="BIC / SWIFT" />
                    <p className="text-xs mt-1" style={{ color: "#10C96A" }}>🔒 Virement sécurisé · SEPA Instant</p>
                  </div>
                )}
                {["usdt", "btc", "eth"].includes(form.payment) && (
                  <div className="mt-3 p-4 rounded-xl text-center" style={{ background: "#fff", border: "1px solid rgba(11,77,46,0.1)" }}>
                    <div className="w-24 h-24 mx-auto mb-2 rounded-lg flex items-center justify-center text-4xl" style={{ background: "rgba(11,77,46,0.06)" }}>
                      {form.payment === "usdt" ? "₮" : form.payment === "btc" ? "₿" : "Ξ"}
                    </div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#0B4D2E", wordBreak: "break-all" }}>
                      {form.payment === "usdt" ? "TRC-20: TXYZ1234abcdef5678901234567890cb" : form.payment === "btc" ? "1CentralBoursiere9xMpL7FmD4HVkqXZ" : "0xcb1234abcdef5678901234567890centralb"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#10C96A" }}>🔒 Adresse vérifiée · SSL 256-bit</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button className="btn-outline flex-1 py-3 rounded-xl text-sm" onClick={() => setStep(2)}>← Retour</button>
                <button className="btn-primary flex-1 py-3 rounded-xl text-sm" onClick={handleSubmit}>
                  Confirmer &amp; Ouvrir →
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: "#6b8a72" }}>
          🔒 Données chiffrées AES-256 · Conforme RGPD · Certifié ISO 27001
        </p>
      </div>

      {showWallet && (
        <WalletModal
          onClose={() => setShowWallet(false)}
          onConnect={(addr) => { update("wallet", addr); setShowWallet(false); }}
        />
      )}
    </div>
  );
}
