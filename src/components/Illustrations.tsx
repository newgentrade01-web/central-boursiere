/* 2D animated illustration components — replace all Unsplash photos */

/* ── Forensics / Blockchain Analysis ── */
export function IllustrationForensics() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center" style={{ height: 300, background: "linear-gradient(135deg, #0A0F1C 0%, #0d1a2e 50%, #0A1F12 100%)" }}>
      <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        {/* Grid */}
        <defs>
          <pattern id="grid-f" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0L0 0L0 30" fill="none" stroke="rgba(16,201,106,0.08)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="glow-f" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(16,201,106,0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="blur-f">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <rect width="400" height="260" fill="url(#grid-f)" />
        <ellipse cx="200" cy="130" rx="160" ry="100" fill="url(#glow-f)" />

        {/* Chain nodes */}
        {[
          [60, 80], [140, 50], [220, 80], [300, 50], [360, 80],
          [60, 170], [140, 200], [220, 170], [300, 200], [360, 170],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="16" fill="rgba(10,15,28,0.8)" stroke="rgba(16,201,106,0.5)" strokeWidth="1.5"
              style={{ animation: `pulse-dot ${1.5 + i * 0.2}s ease-in-out infinite ${i * 0.1}s` }} />
            <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="rgba(16,201,106,0.9)" fontSize="8" fontFamily="monospace">
              {["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "AVAX", "DOT", "LINK", "UNI"][i]}
            </text>
          </g>
        ))}
        {/* Lines */}
        {[[60,80,140,50],[140,50,220,80],[220,80,300,50],[300,50,360,80],[60,170,140,200],[140,200,220,170],[220,170,300,200],[300,200,360,170],[60,80,60,170],[140,50,140,200],[220,80,220,170],[300,50,300,200],[360,80,360,170]].map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(16,201,106,0.2)" strokeWidth="1" strokeDasharray="4 2" />
        ))}

        {/* Moving green arrow — money flow */}
        <g style={{ animation: "float-a 3s ease-in-out infinite" }}>
          <polygon points="200,100 215,120 193,120" fill="#10C96A" opacity="0.9" />
          <rect x="196" y="120" width="8" height="28" fill="#10C96A" opacity="0.9" rx="2" />
        </g>

        {/* Magnifying glass */}
        <g style={{ animation: "char-walk 4s ease-in-out infinite", transformOrigin: "290px 130px" }}>
          <circle cx="290" cy="130" r="28" fill="none" stroke="#10C96A" strokeWidth="3" opacity="0.7" />
          <circle cx="290" cy="130" r="24" fill="rgba(16,201,106,0.06)" />
          <line x1="311" y1="151" x2="326" y2="166" stroke="#10C96A" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <circle cx="285" cy="124" r="4" fill="rgba(16,201,106,0.4)" style={{ animation: "pulse-dot 1s ease-in-out infinite" }} />
        </g>

        {/* Labels */}
        <text x="12" y="22" fill="rgba(16,201,106,0.6)" fontSize="9" fontFamily="monospace">BLOCKCHAIN FORENSICS</text>
        <text x="12" y="250" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">ON-CHAIN ANALYSIS · TRANSACTION TRACING · WALLET IDENTIFICATION</text>
      </svg>

      {/* Stat overlays */}
      <div className="absolute bottom-4 left-4 glass-dark rounded-xl px-3 py-2" style={{ backdropFilter: "blur(8px)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#10C96A" }}>$890M+</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>récupérés</div>
      </div>
      <div className="absolute top-4 right-4 glass-dark rounded-xl px-3 py-2">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#fff" }}>98.4%</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>taux succès</div>
      </div>
    </div>
  );
}

/* ── Legal / License scene ── */
export function IllustrationLegal() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center" style={{ height: 300, background: "linear-gradient(135deg, #0d1a2e 0%, #1a0d2e 50%, #0d1a2e 100%)" }}>
      <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="grid-l" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0L0 0 0 28" fill="none" stroke="rgba(59,130,246,0.07)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="glow-l" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,246,0.18)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="400" height="260" fill="url(#grid-l)" />
        <ellipse cx="200" cy="130" rx="150" ry="90" fill="url(#glow-l)" />

        {/* Central shield */}
        <g style={{ animation: "float-b 4s ease-in-out infinite", transformOrigin: "200px 130px" }}>
          <path d="M200 60 L240 80 L240 140 Q200 170 160 140 L160 80 Z" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.6)" strokeWidth="2" />
          <path d="M200 75 L230 90 L230 138 Q200 158 170 138 L170 90 Z" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
          <text x="200" y="118" textAnchor="middle" fill="rgba(139,92,246,0.9)" fontSize="22">⚖️</text>
          <text x="200" y="140" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8" fontFamily="monospace">LEGAL</text>
        </g>

        {/* Orbiting document icons */}
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 200 + 95 * Math.cos(rad);
          const cy = 130 + 65 * Math.sin(rad);
          const labels = ["FCA", "AMF", "SEC", "MiFID II", "CySEC"];
          const colors = ["#60A5FA", "#EF4444", "#F59E0B", "#10C96A", "#A78BFA"];
          return (
            <g key={i} style={{ animation: `float-${["a","b","c","d","a"][i]} ${3 + i * 0.3}s ease-in-out infinite ${i * 0.5}s` }}>
              <rect x={cx - 18} y={cy - 12} width="36" height="24" rx="6" fill="rgba(10,15,28,0.8)" stroke={colors[i]} strokeWidth="1.2" />
              <text x={cx} y={cy + 4} textAnchor="middle" fill={colors[i]} fontSize="7" fontWeight="bold" fontFamily="monospace">{labels[i]}</text>
            </g>
          );
        })}

        <text x="12" y="22" fill="rgba(139,92,246,0.6)" fontSize="9" fontFamily="monospace">LICENCES & COMPLIANCE</text>
        <text x="12" y="250" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">FCA · AMF · CYSEC · FINRA · SEC · MIFID II</text>
      </svg>
      <div className="absolute bottom-4 left-4 glass-dark rounded-xl px-3 py-2">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#A78BFA" }}>47+</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>licences délivrées</div>
      </div>
      <div className="absolute top-4 right-4 glass-dark rounded-xl px-3 py-2">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#fff" }}>6 semaines</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>délai FCA moy.</div>
      </div>
    </div>
  );
}

/* ── Security / Vault scene ── */
export function IllustrationSecurity() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center" style={{ height: 300, background: "linear-gradient(135deg, #0A1F12 0%, #0A0F1C 50%, #1a0d2e 100%)" }}>
      <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="grid-s" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0L0 0 0 28" fill="none" stroke="rgba(16,201,106,0.06)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="glow-s" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(16,201,106,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="400" height="260" fill="url(#grid-s)" />
        <ellipse cx="200" cy="130" rx="140" ry="90" fill="url(#glow-s)" />

        {/* Vault door */}
        <rect x="148" y="60" width="104" height="130" rx="8" fill="rgba(10,15,28,0.9)" stroke="rgba(16,201,106,0.4)" strokeWidth="2.5" />
        <rect x="158" y="70" width="84" height="110" rx="6" fill="rgba(10,15,28,0.7)" stroke="rgba(16,201,106,0.2)" strokeWidth="1" />
        {/* Vault wheel */}
        <g style={{ animation: "spin-slow 8s linear infinite", transformOrigin: "200px 130px" }}>
          <circle cx="200" cy="130" r="28" fill="none" stroke="rgba(16,201,106,0.6)" strokeWidth="2.5" />
          <circle cx="200" cy="130" r="8" fill="rgba(16,201,106,0.3)" stroke="#10C96A" strokeWidth="1.5" />
          {[0,60,120,180,240,300].map((deg, i) => {
            const r = deg * Math.PI / 180;
            return <line key={i} x1={200 + 8*Math.cos(r)} y1={130 + 8*Math.sin(r)} x2={200 + 26*Math.cos(r)} y2={130 + 26*Math.sin(r)} stroke="#10C96A" strokeWidth="2" strokeLinecap="round" opacity="0.7" />;
          })}
        </g>
        {/* Handle */}
        <rect x="224" y="126" width="18" height="8" rx="4" fill="rgba(16,201,106,0.5)" stroke="#10C96A" strokeWidth="1" />

        {/* Floating security badges */}
        {[[-110, -50, "ISO\n27001", "#10C96A"], [110, -50, "SOC 2\nType II", "#60A5FA"], [-110, 50, "AES-256", "#F59E0B"], [110, 50, "FIDO2\n2FA", "#A78BFA"]].map(([dx, dy, label, color], i) => (
          <g key={i} style={{ animation: `float-${["a","b","c","d"][i]} ${3.5 + i * 0.4}s ease-in-out infinite ${i * 0.6}s` }}>
            <rect x={200 + (dx as number) - 22} y={130 + (dy as number) - 14} width="44" height="28" rx="6"
              fill="rgba(10,15,28,0.85)" stroke={color as string} strokeWidth="1.2" />
            {(label as string).split("\n").map((l, j) => (
              <text key={j} x={200 + (dx as number)} y={130 + (dy as number) - 3 + j * 11} textAnchor="middle" fill={color as string} fontSize="7" fontWeight="bold" fontFamily="monospace">{l}</text>
            ))}
          </g>
        ))}

        <text x="12" y="22" fill="rgba(16,201,106,0.6)" fontSize="9" fontFamily="monospace">SÉCURITÉ INSTITUTIONNELLE</text>
        <text x="12" y="250" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="monospace">ISO 27001 · SOC 2 · AES-256 · COLD WALLET · LLOYD'S INSURANCE</text>
      </svg>
      <div className="absolute bottom-4 left-4 glass-dark rounded-xl px-3 py-2">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#10C96A" }}>$10M</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>couverture Lloyd's</div>
      </div>
      <div className="absolute top-4 right-4 glass-dark rounded-xl px-3 py-2">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#fff" }}>0 breach</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>historique</div>
      </div>
    </div>
  );
}

/* ── Hero animated background ── */
export function HeroAnimation() {
  return (
    <svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", position: "absolute", inset: 0, opacity: 0.35 }}>
      <defs>
        <radialGradient id="hg1" cx="30%" cy="40%" r="50%">
          <stop offset="0%" stopColor="rgba(16,201,106,0.3)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="hg2" cx="70%" cy="60%" r="40%">
          <stop offset="0%" stopColor="rgba(59,130,246,0.2)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="600" height="380" fill="url(#hg1)" />
      <rect width="600" height="380" fill="url(#hg2)" />
      {/* Candlestick chart */}
      {[40,60,35,70,55,80,65,90,75,100,85,70,95,80,110,90,75,100,85,120].map((h, i) => (
        <g key={i}>
          <rect x={20 + i * 28} y={280 - h} width="10" height={h} rx="1"
            fill={i % 2 === 0 ? "rgba(16,201,106,0.6)" : "rgba(239,68,68,0.5)"}
            style={{ animation: `float-${["a","b","c","d"][i % 4]} ${2 + (i % 3) * 0.5}s ease-in-out infinite ${i * 0.1}s` }} />
          <line x1={25 + i * 28} y1={280 - h - 8} x2={25 + i * 28} y2={280 - h}
            stroke={i % 2 === 0 ? "rgba(16,201,106,0.4)" : "rgba(239,68,68,0.3)"} strokeWidth="1.5" />
          <line x1={25 + i * 28} y1={280} x2={25 + i * 28} y2={280 + 8}
            stroke={i % 2 === 0 ? "rgba(16,201,106,0.4)" : "rgba(239,68,68,0.3)"} strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  );
}
