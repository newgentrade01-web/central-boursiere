import centralPng from "@/imports/central.png";

interface Props {
  size?: number;
  darkBg?: boolean;
  className?: string;
  showRing?: boolean;
}

export default function CentralLogo({ size = 36, darkBg = false, className = "", showRing = true }: Props) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#ffffff",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: showRing
          ? darkBg
            ? "1.5px solid rgba(16,201,106,0.45)"
            : "1.5px solid rgba(11,77,46,0.18)"
          : "none",
        boxShadow: darkBg
          ? "0 0 0 3px rgba(16,201,106,0.12)"
          : "0 1px 6px rgba(10,15,28,0.1)",
        overflow: "hidden",
      }}
    >
      <img
        src={centralPng}
        alt="Central Boursière"
        style={{
          width: size * 0.88,
          height: size * 0.88,
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}
