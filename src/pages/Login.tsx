import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../lib/supabaseClient";
import CentralLogo from "../components/CentralLogo";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all";
  const inputStyle = {
    border: "1.5px solid rgba(11,77,46,0.2)",
    background: "#fff",
    color: "#0A1F12",
    fontFamily: "var(--font-body)",
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      const { error: err } = await auth.signIn(email, password);
      if (err) {
        if (err.message.includes("Invalid login") || err.message.includes("invalid_credentials")) {
          setError("Email ou mot de passe incorrect.");
        } else if (err.message.includes("Email not confirmed")) {
          setError("Votre email n'est pas confirmé. Vérifiez votre boîte mail ou demandez un renvoi.");
        } else {
          setError(err.message);
        }
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ paddingTop: 80 }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <CentralLogo size={56} darkBg={false} />
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#0A1F12", marginTop: 16 }}>
            Connexion à votre Espace
          </h1>
          <p style={{ fontSize: 13, color: "#6b8a72", marginTop: 4 }}>
            Accédez à votre dashboard Centrale Boursière
          </p>
        </div>

        <form onSubmit={handleLogin} className="glass-card rounded-2xl p-7 space-y-4" style={{ background: "#F8FBF9" }}>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0B4D2E" }}>
              Adresse email
            </label>
            <input
              type="email"
              className={inputClass}
              style={inputStyle}
              placeholder="jean.dupont@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0B4D2E" }}>
              Mot de passe
            </label>
            <input
              type="password"
              className={inputClass}
              style={inputStyle}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)", color: "#f43f5e" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full py-3 rounded-xl text-sm font-semibold mt-2"
            disabled={loading || !email || !password}
            style={{ opacity: loading || !email || !password ? 0.5 : 1 }}
          >
            {loading ? "Connexion en cours…" : "Se connecter →"}
          </button>

          <div className="text-center pt-2">
            <p style={{ fontSize: 13, color: "#6b8a72" }}>
              Pas encore de compte ?{" "}
              <Link to="/register" style={{ color: "#0B4D2E", fontWeight: 600, textDecoration: "underline" }}>
                Ouvrir un dossier gratuit
              </Link>
            </p>
          </div>
        </form>

        <p className="text-center mt-4 text-xs" style={{ color: "#6b8a72" }}>
          🔒 Données chiffrées AES-256 · Conforme RGPD · Certifié ISO 27001
        </p>
      </div>
    </div>
  );
}
