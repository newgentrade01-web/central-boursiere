import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import WalletModal from "./WalletModal";
import CentralLogo from "./CentralLogo";
import { loadContent } from "../lib/content";

interface NavbarProps {
  walletAddress?: string;
  onWalletConnect?: (addr: string) => void;
}

export default function Navbar({ walletAddress, onWalletConnect }: NavbarProps) {
  const [showWallet, setShowWallet] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [branding, setBranding] = useState(() => loadContent().branding);
  useEffect(() => {
    const h = () => setBranding(loadContent().branding);
    window.addEventListener("cb-content-updated", h);
    return () => window.removeEventListener("cb-content-updated", h);
  }, []);

  const links = [
    { label: "Services", href: "/#services" },
    { label: "Licences", href: "/licences" },
    { label: "Recouvrement", href: "/#comment-ca-marche" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Blog", href: "/#blog" },
    { label: "FAQ", href: "/#faq" },
  ];

  return (
    <>
      <nav className="glass-nav fixed top-0 left-0 right-0 z-40" style={{ height: 64 }}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {branding.logoUrl
              ? <img src={branding.logoUrl} alt="logo" className="h-9 w-9 rounded-full object-contain" />
              : <CentralLogo size={38} darkBg={false} />
            }
            <div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#0A0F1C", letterSpacing: "-0.01em" }}>{branding.navbarTitle || "CENTRALE"}</span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 9, color: "#6b8a72", display: "block", letterSpacing: "0.14em", marginTop: -3 }}>{branding.navbarSubtitle || "BOURSIÈRE"}</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5 flex-1 ml-2">
            {links.map((l) => (
              <Link key={l.label} to={l.href} className="px-3 py-1.5 rounded-lg text-sm transition-all hover:bg-gray-50"
                style={{ color: "#0A0F1C", fontWeight: 500, fontSize: 13 }}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 ml-auto shrink-0">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(16,201,106,0.1)", color: "#0B4D2E", border: "1px solid rgba(16,201,106,0.22)" }}>
              ● FCA Regulated
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(10,15,28,0.06)", color: "#0A0F1C", border: "1px solid rgba(10,15,28,0.09)" }}>
              ISO 27001
            </span>
            {walletAddress ? (
              <span className="px-3 py-1.5 rounded-lg text-xs" style={{ fontFamily: "var(--font-mono)", background: "rgba(16,201,106,0.08)", color: "#0B4D2E", border: "1px solid rgba(16,201,106,0.18)" }}>
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            ) : (
              <button onClick={() => setShowWallet(true)} className="btn-outline px-4 py-1.5 rounded-lg text-sm">Connect Wallet</button>
            )}
            <Link to="/register" className="btn-emerald px-4 py-1.5 rounded-lg text-sm">Ouvrir un Dossier →</Link>
          </div>

          <button className="lg:hidden ml-auto p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <div className="space-y-1.5">
              <span className={`block h-0.5 bg-gray-800 transition-all ${mobileOpen ? "w-5 rotate-45 translate-y-2" : "w-5"}`} />
              <span className={`block h-0.5 bg-gray-800 transition-all ${mobileOpen ? "opacity-0 w-5" : "w-5"}`} />
              <span className={`block h-0.5 bg-gray-800 transition-all ${mobileOpen ? "w-5 -rotate-45 -translate-y-2" : "w-5"}`} />
            </div>
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden px-4 pb-4 pt-1 space-y-0.5" style={{ background: "rgba(255,255,255,0.97)", borderTop: "1px solid rgba(10,15,28,0.06)" }}>
            {links.map((l) => (
              <Link key={l.label} to={l.href} className="block px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: "#0A0F1C" }} onClick={() => setMobileOpen(false)}>{l.label}</Link>
            ))}
            <div className="flex gap-2 pt-3">
              <button onClick={() => setShowWallet(true)} className="btn-outline flex-1 py-2.5 rounded-lg text-sm">Connect Wallet</button>
              <Link to="/register" className="btn-emerald flex-1 py-2.5 rounded-lg text-sm text-center">Ouvrir Dossier</Link>
            </div>
          </div>
        )}
      </nav>
      {showWallet && (
        <WalletModal onClose={() => setShowWallet(false)} onConnect={(addr) => { onWalletConnect?.(addr); setShowWallet(false); }} />
      )}
    </>
  );
}
