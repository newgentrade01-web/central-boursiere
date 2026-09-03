import { useState } from "react";

interface WalletModalProps {
  onClose: () => void;
  onConnect: (address: string) => void;
}

const wallets = [
  { name: "MetaMask", icon: "🦊", desc: "Extension navigateur" },
  { name: "WalletConnect", icon: "🔗", desc: "QR Code multi-wallets" },
  { name: "Coinbase Wallet", icon: "🔵", desc: "Wallet Coinbase" },
  { name: "Ledger", icon: "🔐", desc: "Hardware wallet" },
  { name: "Trust Wallet", icon: "🛡️", desc: "Mobile wallet" },
];

export default function WalletModal({ onClose, onConnect }: WalletModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (name: string) => {
    setConnecting(name);
    setTimeout(() => {
      const addr = "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b";
      onConnect(addr);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,31,18,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl w-full max-w-md p-6 fade-in-up"
        style={{ background: "#F8FBF9" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#0A1F12" }}>
            Connecter un Wallet
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>
        <div className="space-y-2">
          {wallets.map((w) => (
            <button
              key={w.name}
              onClick={() => handleConnect(w.name)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border card-hover text-left"
              style={{ borderColor: "rgba(11,77,46,0.15)", background: "#fff" }}
            >
              <span className="text-2xl">{w.icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: "#0A1F12", fontSize: 14 }}>{w.name}</div>
                <div style={{ fontSize: 12, color: "#6b8a72" }}>{w.desc}</div>
              </div>
              {connecting === w.name && (
                <div className="ml-auto">
                  <div className="w-5 h-5 border-2 rounded-full border-t-transparent" style={{ borderColor: "#10C96A", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="mt-4 text-center" style={{ fontSize: 11, color: "#6b8a72" }}>
          🔒 256-bit SSL · Vos clés ne quittent jamais votre wallet
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
