import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import WalletModal from "../components/WalletModal";
import { auth, profiles } from "../lib/supabaseClient";
import type { UserProfile } from "../lib/supabaseClient";

const COUNTRIES = ["France", "Belgique", "Suisse", "Canada", "Espagne", "Italie", "Allemagne", "Royaume-Uni", "Maroc", "Tunisie", "Sénégal", "Côte d'Ivoire", "Cameroun", "Portugal", "Pays-Bas", "Autre"];
const CASE_TYPES = ["Recouvrement de fonds crypto", "Obtention d'une licence boursière", "Trading & accès marchés", "Investissement & gestion d'actifs", "Compliance & audit réglementaire"];

const FLAG_MAP: Record<string, string> = {
  "France": "🇫🇷", "Belgique": "🇧🇪", "Suisse": "🇨🇭", "Canada": "🇨🇦",
  "Espagne": "🇪🇸", "Italie": "🇮🇹", "Allemagne": "🇩🇪", "Royaume-Uni": "🇬🇧",
  "Maroc": "🇲🇦", "Tunisie": "🇹🇳", "Sénégal": "🇸🇳", "Côte d'Ivoire": "🇨🇮",
  "Cameroun": "🇨🇲", "Portugal": "🇵🇹", "Pays-Bas": "🇳🇱", "Autre": "🌍",
};

interface FormData {
  firstName: string;
  lastName: string;
  country: string;
  password: string;
  phone: string;
  email: string;
  caseType: string;
  wallet: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showWallet, setShowWallet] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", country: "", password: "",
    phone: "", email: "", caseType: "", wallet: "",
  });

  const update = (k: keyof FormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canNext1 = form.firstName && form.lastName && form.country && form.password.length >= 6;
  const canNext2 = form.phone && form.email && form.caseType;

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const { data, error: signUpError } = await auth.signUp(form.email, form.password);
      if (signUpError) {
        setError(
          signUpError.message.includes("already registered")
            ? "Cet email est déjà utilisé. Connectez-vous à la place."
            : signUpError.message
        );
        setSaving(false);
        return;
      }
      const userId = data.user?.id;
      if (!userId) {
        setError("Erreur lors de la création du compte. Réessayez.");
        setSaving(false);
        return;
      }

      // Supabase email confirmation required → warn user
      if (!data.session) {
        setError("Un email de confirmation a été envoyé à " + form.email + ". Confirmez votre email puis connectez-vous.");
        setSaving(false);
        return;
      }

      const now = new Date();
      const dateStr = now.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
      const countryCode = (form.country || "XX").slice(0, 2).toUpperCase();
      const num = String(Math.floor(100000 + Math.random() * 900000));

      const newProfile: UserProfile = {
        id: userId,
        clientId: `CB-${countryCode}${num.slice(0, 6)}`,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        country: form.country || "Autre",
        flag: FLAG_MAP[form.country] || "🌍",
        plan: "Professionnel",
        status: "pending",
        kyc: "0",
        joinDate: dateStr,
        lastSeen: now.toISOString(),
        balance: 0,
        fundsAdded: 0,
        fundsWithdrawn: 0,
        pnl: 0,
        caseStatus: "open",
        caseAmount: 0,
        caseRef: `${countryCode}-${now.getFullYear()}-${num.slice(0, 4)}`,
        procedureStep: 1,
        notes: `Type de dossier: ${form.caseType}. Inscription gratuite — paiement à l'activation.`,
        comments: [],
        assignedAdvisor: "",
      };

      await profiles.set(userId, newProfile);
      setSaving(false);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2200);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all";
  const inputStyle = {
    border: "1.5px solid rgba(11,77,46,0.2)",
    background: "#fff",
    color: "#0A1F12",
    fontFamily: "var(--font-body)",
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ paddingTop: 64 }}>
        <div className="text-center fade-in-up">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ background: "rgba(16,201,106,0.15)" }}>
            ✅
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "#0A1F12", marginBottom: 8 }}>
            Dossier Ouvert avec Succès !
          </h2>
          <p style={{ color: "#6b8a72", fontSize: 14, marginBottom: 6 }}>Votre dossier est <strong>gratuit</strong> — le paiement sera demandé à l'activation de la procédure.</p>
          <p style={{ color: "#6b8a72", fontSize: 13 }}>Redirection vers votre dashboard…</p>
          <div className="mt-6 w-12 h-1.5 rounded-full mx-auto" style={{ background: "#10C96A", animation: "scan 2s ease forwards" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ paddingTop: 80 }}>
      <div className="w-full max-w-lg">
        {/* FREE badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold" style={{ background: "rgba(16,201,106,0.12)", color: "#0B4D2E", border: "1px solid rgba(16,201,106,0.25)" }}>
            🆓 Ouverture de dossier 100% GRATUITE
          </span>
          <p className="mt-2 text-xs" style={{ color: "#6b8a72" }}>Aucun paiement requis — vous payez uniquement si vous activez une procédure</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
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
                {s === 1 ? "Identité" : "Contact & Dossier"}
              </span>
              {s < 2 && <div className="flex-1 h-px" style={{ background: step > s ? "#0B4D2E" : "rgba(11,77,46,0.15)" }} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-7" style={{ background: "#F8FBF9" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "#0A1F12", marginBottom: 6 }}>
            {step === 1 ? "Ouvrir un Dossier Gratuit" : "Vos Coordonnées"}
          </h1>
          <p style={{ fontSize: 13, color: "#6b8a72", marginBottom: 24 }}>
            {step === 1 ? "Étape 1 / 2 — Informations personnelles" : "Étape 2 / 2 — Contact & type de dossier"}
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

              {/* Free info box */}
              <div className="rounded-xl p-3" style={{ background: "rgba(16,201,106,0.07)", border: "1px solid rgba(16,201,106,0.2)" }}>
                <p style={{ fontSize: 12, color: "#0B4D2E", fontWeight: 600 }}>🆓 Inscription gratuite</p>
                <p style={{ fontSize: 11, color: "#6b8a72", marginTop: 2 }}>Votre dossier sera ouvert immédiatement. Un conseiller vous contactera pour activer la procédure et discuter des options de paiement.</p>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)", color: "#f43f5e" }}>
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button className="btn-outline flex-1 py-3 rounded-xl text-sm" onClick={() => setStep(1)}>← Retour</button>
                <button
                  className="btn-primary flex-1 py-3 rounded-xl text-sm"
                  disabled={!canNext2 || saving}
                  style={{ opacity: (canNext2 && !saving) ? 1 : 0.5, cursor: (canNext2 && !saving) ? "pointer" : "not-allowed" }}
                  onClick={handleSubmit}
                >
                  {saving ? "Création du compte…" : "Ouvrir mon Dossier →"}
                </button>
              </div>

              <p className="text-center text-xs" style={{ color: "#6b8a72" }}>
                Déjà un compte ?{" "}
                <Link to="/login" style={{ color: "#0B4D2E", fontWeight: 600, textDecoration: "underline" }}>
                  Se connecter
                </Link>
              </p>
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
