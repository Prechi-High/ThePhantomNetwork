"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import type { SpinOutcome } from "@/types/gameplay";
import { WHEEL_CONFIG, SPIN_TIMINGS, EASING } from "@/config/spinConfig";
import { getTargetRotation, getTickInterval, Z } from "./config";
import { spinAudio } from "./SpinAudioController";

interface SpinAnimatorProps {
  isSpinning: boolean;
  outcome: SpinOutcome | null;
  onSpinComplete: () => void;
}

// ── Segment visual design (matches reference image exactly) ───────────────

const SEGMENT_DESIGN: Record<SpinOutcome, {
  fill:        string;
  label:       string;
  sublabel:    string;
  labelColor:  string;
  sublabelColor: string;
  icon:        string;
  accentGlow:  string;
}> = {
  ACQUIRE: {
    fill:         "radial-gradient(ellipse at 50% 15%, rgba(234,179,8,0.35) 0%, rgba(20,12,4,0.95) 55%, rgba(8,4,2,0.98) 100%)",
    label:        "ACQUIRE",
    sublabel:     "+1 TOK",
    labelColor:   "#fcd34d",
    sublabelColor:"#ca8a04",
    icon:         "coin",
    accentGlow:   "rgba(234,179,8,0.5)",
  },
  DISCOVER: {
    fill:         "radial-gradient(ellipse at 50% 15%, rgba(59,130,246,0.35) 0%, rgba(8,16,32,0.95) 55%, rgba(4,8,16,0.98) 100%)",
    label:        "DISCOVER",
    sublabel:     "+0.5 TOK",
    labelColor:   "#93c5fd",
    sublabelColor:"#3b82f6",
    icon:         "magnify",
    accentGlow:   "rgba(59,130,246,0.45)",
  },
  VOID: {
    fill:         "radial-gradient(ellipse at 50% 15%, rgba(107,114,128,0.2) 0%, rgba(12,12,16,0.95) 55%, rgba(4,4,8,0.98) 100%)",
    label:        "VOID",
    sublabel:     "0 TOK",
    labelColor:   "#9ca3af",
    sublabelColor:"#6b7280",
    icon:         "vortex",
    accentGlow:   "rgba(107,114,128,0.25)",
  },
  ADVANCE: {
    fill:         "radial-gradient(ellipse at 50% 15%, rgba(245,158,11,0.4) 0%, rgba(24,16,4,0.95) 55%, rgba(8,4,2,0.98) 100%)",
    label:        "ADVANCE",
    sublabel:     "+3 TOK",
    labelColor:   "#fbbf24",
    sublabelColor:"#d97706",
    icon:         "crown",
    accentGlow:   "rgba(245,158,11,0.55)",
  },
  STEAL: {
    fill:         "radial-gradient(ellipse at 50% 15%, rgba(239,68,68,0.35) 0%, rgba(24,8,8,0.95) 55%, rgba(8,2,2,0.98) 100%)",
    label:        "STEAL",
    sublabel:     "",
    labelColor:   "#f87171",
    sublabelColor:"#dc2626",
    icon:         "hook",
    accentGlow:   "rgba(239,68,68,0.5)",
  },
};

// ── SVG icon components ────────────────────────────────────────────────────

function CoinIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <circle cx="19" cy="19" r="17" fill="url(#coinGrad)" stroke="#8a6020" strokeWidth="1.5"/>
      <circle cx="19" cy="19" r="13" fill="url(#coinInner)" stroke="#6a4a10" strokeWidth="1"/>
      <text x="19" y="24" textAnchor="middle" fontSize="13" fontWeight="900" fill="#1a0a00" fontFamily="serif">P</text>
      <defs>
        <radialGradient id="coinGrad" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#f0c040"/>
          <stop offset="50%" stopColor="#c89020"/>
          <stop offset="100%" stopColor="#8a5a10"/>
        </radialGradient>
        <radialGradient id="coinInner" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#d4a030"/>
          <stop offset="100%" stopColor="#a07020"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

function MagnifyIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="15" cy="15" r="10" fill="url(#glassGrad)" stroke="#8a9aaa" strokeWidth="2"/>
      <circle cx="15" cy="15" r="7" fill="rgba(30,50,80,0.3)" stroke="#6a8090" strokeWidth="1"/>
      <circle cx="12" cy="12" r="2.5" fill="rgba(200,220,255,0.5)"/>
      <line x1="23" y1="23" x2="32" y2="32" stroke="#8a9aaa" strokeWidth="3" strokeLinecap="round"/>
      <line x1="23" y1="23" x2="32" y2="32" stroke="#606878" strokeWidth="1.5" strokeLinecap="round"/>
      <defs>
        <radialGradient id="glassGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#b0c8d8"/>
          <stop offset="60%" stopColor="#708898"/>
          <stop offset="100%" stopColor="#405060"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

function VortexIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 20 C20 20 26 14 26 20 C26 26 20 30 14 26 C8 22 10 14 16 12 C22 10 28 12 30 18 C32 24 28 32 22 34" stroke="#707880" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M20 20 C20 20 24 16 24 20 C24 24 20 27 16 24 C13 22 14 17 17 15 C20 13 24 14 25 18" stroke="#505860" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M20 20 C20 20 22 18 22 20 C22 22 20 23.5 18 22 C16.5 21 17 18.5 18.5 18" stroke="#383e48" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  );
}

function HookIcon() {
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
      {/* Chain link at top */}
      <ellipse cx="18" cy="6" rx="6" ry="4" stroke="#888" strokeWidth="2.5" fill="none"/>
      <ellipse cx="18" cy="6" rx="3.5" ry="2" stroke="#aaa" strokeWidth="1" fill="none"/>
      {/* Shaft */}
      <line x1="18" y1="10" x2="18" y2="28" stroke="#909090" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="18" y1="10" x2="18" y2="28" stroke="#c0c0c0" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Hook curve */}
      <path d="M18 28 C18 28 18 38 10 38 C6 38 4 34 6 30 C7 28 10 27 12 29" stroke="#909090" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M18 28 C18 28 18 38 10 38 C6 38 4 34 6 30 C7 28 10 27 12 29" stroke="#c8c8c8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Hook tip */}
      <path d="M12 29 L10 31" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
      <path d="M6 28 L34 28 L32 14 L26 20 L20 8 L14 20 L8 14 Z" fill="url(#crownGrad)" stroke="#d97706" strokeWidth="1.2"/>
      <rect x="6" y="28" width="28" height="5" rx="1" fill="#ca8a04" stroke="#92400e" strokeWidth="0.8"/>
      <defs>
        <linearGradient id="crownGrad" x1="20" y1="8" x2="20" y2="28">
          <stop offset="0%" stopColor="#fcd34d"/>
          <stop offset="100%" stopColor="#ca8a04"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

const SEGMENT_ICONS: Record<string, React.ReactNode> = {
  coin:     <CoinIcon />,
  magnify:  <MagnifyIcon />,
  vortex:   <VortexIcon />,
  crown:    <CrownIcon />,
  hook:     <HookIcon />,
};

// ── Arc path builder ───────────────────────────────────────────────────────

function buildArcPath(startAngle: number, endAngle: number): string {
  const r = 50;
  const pts: string[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + (endAngle - startAngle) * (i / steps);
    const rad = (a - 90) * (Math.PI / 180);
    pts.push(`${50 + r * Math.cos(rad)}% ${50 + r * Math.sin(rad)}%`);
  }
  return pts.join(", ");
}

function PhantomHub({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, #7c3aed 0%, #4c1d95 45%, #1e0a3c 100%)",
        border: "2px solid rgba(168,85,247,0.6)",
        boxShadow: "0 0 24px rgba(168,85,247,0.55), inset 0 0 16px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: size * 0.42,
          fontWeight: 900,
          color: "#e9d5ff",
          textShadow: "0 0 12px rgba(168,85,247,0.9)",
          lineHeight: 1,
        }}
      >
        P
      </span>
    </div>
  );
}

// ── Main SpinAnimator ──────────────────────────────────────────────────────

export function SpinAnimator({ isSpinning, outcome, onSpinComplete }: SpinAnimatorProps) {
  const wheelControls  = useAnimation();
  const pointerControls = useAnimation();
  const currentRotationRef = useRef(0);
  const tickTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSpinning || !outcome) return;

    const finalRotation = getTargetRotation(outcome);
    const spinDuration  = SPIN_TIMINGS.SPIN_DURATION;
    const startTime     = Date.now();

    spinAudio.playSpinStart();

    // Pointer wiggle
    pointerControls.start({
      rotate: [0, -8, 8, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: spinDuration / 1000, ease: "easeInOut" },
    });

    // Tick loop
    const scheduleTick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= spinDuration) return;
      spinAudio.playPointerTick();
      tickTimerRef.current = setTimeout(scheduleTick, getTickInterval(elapsed, spinDuration));
    };
    tickTimerRef.current = setTimeout(scheduleTick, 100);

    const brakeTimer = setTimeout(() => spinAudio.playSpinSlowdown(), SPIN_TIMINGS.SLOWDOWN_START);

    wheelControls
      .start({
        rotate: [
          currentRotationRef.current,
          currentRotationRef.current + finalRotation * 0.92,
          currentRotationRef.current + finalRotation,
        ],
        transition: {
          duration: spinDuration / 1000,
          times: [0, 0.78, 1],
          ease: ["easeIn", "linear", EASING.SPIN_EASE],
        },
      })
      .then(() => {
        if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
        spinAudio.playSpinStop();
        pointerControls.start({
          rotate: [0, -15, 7, -3, 1, 0],
          transition: { duration: 0.45, ease: "easeOut" },
        });
        currentRotationRef.current = (currentRotationRef.current + finalRotation) % 360;
        onSpinComplete();
      });

    return () => {
      if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
      clearTimeout(brakeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, outcome]);

  const hubSize = 88; // px — size of center hub area

  return (
    <div className="relative w-full h-full select-none" style={{ zIndex: Z.WHEEL_BODY }}>

      {/* ── Purple neon outer glow ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-10px",
          boxShadow: "0 0 40px rgba(168,85,247,0.45), 0 0 80px rgba(88,28,135,0.25)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      {/* ── Neon purple ring ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-6px",
          background: "conic-gradient(from 0deg, #581c87, #a855f7, #7c3aed, #c084fc, #7c3aed, #581c87)",
          borderRadius: "50%",
          zIndex: 1,
          opacity: 0.9,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-2px",
          background: "radial-gradient(circle, rgba(15,8,30,0.95) 60%, rgba(3,1,8,1) 100%)",
          borderRadius: "50%",
          zIndex: 2,
        }}
      />

      {/* ── Rotating wheel body ── */}
      <motion.div
        animate={wheelControls}
        initial={{ rotate: 0 }}
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: "#0f0820",
          willChange: "transform",
          zIndex: 3,
          border: "1px solid rgba(168,85,247,0.25)",
        }}
      >
        {/* Render 5 segments */}
        {WHEEL_CONFIG.SEGMENT_ORDER.map((segment, index) => {
          const design = SEGMENT_DESIGN[segment];
          const segAngle = WHEEL_CONFIG.SEGMENT_ANGLE; // 72°
          // Center segment at top (0°) → offset by -segAngle/2
          const startAngle = index * segAngle - segAngle / 2;
          const endAngle   = (index + 1) * segAngle - segAngle / 2;
          const centerAngle = index * segAngle; // rotation for label positioning

          return (
            <div
              key={segment}
              className="absolute inset-0"
              style={{ clipPath: `polygon(50% 50%, ${buildArcPath(startAngle, endAngle)})` }}
            >
              {/* Textured fill */}
              <div
                className="absolute inset-0"
                style={{ background: design.fill }}
              />

              {/* Subtle grid overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, rgba(168,85,247,0.06) 0%, transparent 40%)",
                  opacity: 0.8,
                }}
              />

              {/* Label + sublabel + icon */}
              <div
                className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${centerAngle}deg)` }}
              >
                <div
                  className="flex flex-col items-center"
                  style={{
                    transform: `translateY(-30%) rotate(-${centerAngle}deg)`,
                    gap: 3,
                  }}
                >
                  {/* Label */}
                  <span
                    style={{
                      fontFamily: "'Arial Black', 'Impact', sans-serif",
                      fontSize: "clamp(10px, 1.8vw, 15px)",
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      color: design.labelColor,
                      textShadow: `0 0 10px ${design.accentGlow}, 1px 1px 2px rgba(0,0,0,0.9)`,
                      lineHeight: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {design.label}
                  </span>

                  {/* Sub-label (token value) */}
                  {design.sublabel && (
                    <span
                      style={{
                        fontFamily: "'Arial', sans-serif",
                        fontSize: "clamp(8px, 1.2vw, 11px)",
                        fontWeight: 700,
                        color: design.sublabelColor,
                        textShadow: "1px 1px 1px rgba(0,0,0,0.9)",
                        lineHeight: 1,
                      }}
                    >
                      {design.sublabel}
                    </span>
                  )}

                  {/* 3D Icon */}
                  <div style={{ marginTop: 4, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}>
                    {SEGMENT_ICONS[design.icon]}
                  </div>
                </div>
              </div>

              {/* Purple divider line at segment edge */}
              <div
                className="absolute inset-0 origin-center pointer-events-none"
                style={{ transform: `rotate(${endAngle}deg)` }}
              >
                <div
                  className="absolute top-0 left-1/2"
                  style={{
                    width: "1.5px",
                    height: "50%",
                    background: "linear-gradient(180deg, rgba(168,85,247,0.9) 0%, rgba(124,58,237,0.5) 50%, transparent 100%)",
                    boxShadow: "0 0 4px rgba(168,85,247,0.6)",
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Center cutout for static hub */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width:  "24%",
            height: "24%",
            background: "transparent",
            zIndex: 10,
          }}
        />
      </motion.div>

      {/* ── Static Phantom P hub ── */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ zIndex: Z.CENTER_HUB }}
      >
        <PhantomHub size={hubSize} />
      </div>

      {/* ── Pointer needle (top center, does NOT rotate) ── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ top: "-2px", zIndex: Z.NEEDLE }}
      >
        <motion.div
          animate={pointerControls}
          initial={{ rotate: 0 }}
          style={{ transformOrigin: "50% 90%" }}
        >
          {/* Outer shadow */}
          <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "30px solid rgba(0,0,0,0.5)", filter: "blur(2px)", position: "absolute", top: 1, left: 1 }} />
          {/* Purple needle */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "9px solid transparent",
              borderRight: "9px solid transparent",
              borderTop: "28px solid #a855f7",
              filter: "drop-shadow(0 0 8px rgba(168,85,247,0.8))",
              position: "relative",
            }}
          />
          {/* Bright highlight on needle */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: "14px solid rgba(233,213,255,0.45)",
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
