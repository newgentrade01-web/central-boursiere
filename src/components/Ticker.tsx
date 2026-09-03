import { useEffect, useState } from "react";

const BASE_PRICES: Record<string, number> = {
  "BTC": 67420, "ETH": 3842, "BNB": 412, "SOL": 168, "ADA": 0.82,
  "XRP": 0.61, "Or": 2318, "Argent": 27.4, "Pétrole": 78.3,
  "S&P500": 5248, "CAC40": 8102, "Nasdaq": 18420,
};

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

export default function Ticker({ partners }: { partners?: string[] }) {
  const [items, setItems] = useState<TickerItem[]>(
    Object.entries(BASE_PRICES).map(([symbol, price]) => ({
      symbol,
      price,
      change: (Math.random() - 0.48) * 3,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => {
          const delta = (Math.random() - 0.5) * item.price * 0.003;
          const newPrice = Math.max(0.01, item.price + delta);
          const change = item.change + (Math.random() - 0.5) * 0.1;
          return { ...item, price: newPrice, change };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const fmtPrice = (p: number) =>
    p > 1000 ? p.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) :
    p > 1 ? p.toFixed(2) : p.toFixed(4);

  const doubled = [...items, ...items];

  return (
    <div
      className="w-full overflow-hidden py-2.5 relative"
      style={{ background: "#0B4D2E", borderTop: "1px solid rgba(255,255,255,0.1)" }}
    >
      <p
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-xs font-semibold"
        style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
      >
        LIVE
      </p>
      <div className="ticker-track flex gap-8 pl-16" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span
            key={`${item.symbol}-${i}`}
            className="flex items-center gap-1.5 shrink-0"
            style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
          >
            <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{item.symbol}</span>
            <span style={{ color: "#fff", fontWeight: 500 }}>${fmtPrice(item.price)}</span>
            <span style={{ color: item.change >= 0 ? "#10C96A" : "#ff6b6b", fontWeight: 500 }}>
              {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}%
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
