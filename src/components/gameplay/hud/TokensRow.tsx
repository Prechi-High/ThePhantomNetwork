"use client";

interface TokensRowProps {
  tokens: number;
  ranking: string; // e.g. "TOP 18%"
}

export function TokensRow({ tokens, ranking }: TokensRowProps) {
  return (
    <div className="flex items-center gap-[8px] px-[10px] py-[5px]">
      {/* Token icon + count */}
      <div className="flex items-center gap-[6px]">
        <span
          style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "rgba(168,85,247,0.7)",
            textTransform: "uppercase",
          }}
        >
          MY TOKENS
        </span>
      </div>
      <div className="flex items-center gap-[5px]">
        {/* token gem icon */}
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: "20px",
            height: "20px",
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            boxShadow: "0 0 8px rgba(168,85,247,0.6)",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="white" opacity="0.9" />
            <polygon points="12,6 18,9.5 18,14.5 12,18 6,14.5 6,9.5" fill="rgba(88,28,135,0.8)" />
          </svg>
        </div>
        <span
          style={{
            fontSize: "28px",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.01em",
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 0 15px rgba(255,255,255,0.2)",
          }}
        >
          {tokens}
        </span>
      </div>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "rgba(168,85,247,0.65)",
          letterSpacing: "0.04em",
          marginLeft: "2px",
        }}
      >
        RANKING: {ranking}
      </span>
    </div>
  );
}
