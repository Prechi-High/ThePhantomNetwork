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
  fill:        string;   // background gradient
  label:       string;
  sublabel:    string;
  labelColor:  string;
  sublabelColor: string;
  icon:        string;   // SVG/emoji icon key
}> = {
  ACQUIRE: {
    fill:         "radial-gradient(ellipse at 50% 0%, #7a5520 0%, #4a3010 40%, #2a1a08 100%)",
    label:        "ACQUIRE",
    sublabel:     "+1 TOK",
    labelColor:   "#e8b84b",
    sublabelColor:"#c4952a",
    icon:         "coin",
  },
  DISCOVER: {
    fill:         "radial-gradient(ellipse at 50% 0%, #1a2d4a 0%, #0f1e35 40%, #080e1a 100%)",
    label:        "DISCOVER",
    sublabel:     "+0.5 TOK",
    labelColor:   "#7ab3d4",
    sublabelColor:"#4a80a0",
    icon:         "magnify",
  },
  VOID: {
    fill:         "radial-gradient(ellipse at 50% 0%, #111418 0%, #0a0c10 40%, #050608 100%)",
    label:        "VOID",
    sublabel:     "0 TOK",
    labelColor:   "#8a8e96",
    sublabelColor:"#5a5e66",
    icon:         "vortex",
  },
  ADVANCE: {
    fill:         "radial-gradient(ellipse at 50% 0%, #1a2a40 0%, #0f1c30 40%, #080e1a 100%)",
    label:        "ADVANCE",
    sublabel:     "+3 TOK",
    labelColor:   "#7ab3d4",
    sublabelColor:"#4a80a0",
    icon:         "chevrons",
  },
  STEAL: {
    fill:         "radial-gradient(ellipse at 50% 0%, #5a1a1a 0%, #3a0f0f 40%, #1a0808 100%)",
    label:        "STEAL",
    sublabel:     "",
    labelColor:   "#d45050",
    sublabelColor:"#a03030",
    icon:         "hook",
  },
};

// ── SVG icon components ────────────────────────────────────────────────────

function CoinIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <circle cx="19" cy="19" r="17" fill="url(#coinGrad)" stroke="#8a6020" strokeWidth="1.5"/>
      <circle cx="19" cy="19" r="13" fill="url(#coinInner)" stroke="#6a4a10" strokeWidth="1"/>
      <text x="19" y="24" textAnchor="middle" fontSize="14" fontWeight="900" fill="#3a2008" fontFamily="serif">$</text>
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

function ChevronsIcon() {
  return (
    <svg width="52" height="36" viewBox="0 0 52 36" fill="none">
      {/* Three chevron arrows, steel-blue, 3D embossed look */}
      {[0, 16, 32].map((ox, i) => (
        <g key={i} opacity={1 - i * 0.15}>
          <path d={`M${ox + 2} 4 L${ox + 12} 18 L${ox + 2} 32`} stroke="#5080a8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d={`M${ox + 2} 4 L${ox + 12} 18 L${ox + 2} 32`} stroke="#3a6080" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d={`M${ox + 2} 4 L${ox + 12} 18 L${ox + 2} 32`} stroke="#7aaad0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
        </g>
      ))}
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

const SEGMENT_ICONS: Record<string, React.ReactNode> = {
  coin:     <CoinIcon />,
  magnify:  <MagnifyIcon />,
  vortex:   <VortexIcon />,
  chevrons: <ChevronsIcon />,
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

// ── Gear-tooth ring SVG (center hub decoration) ───────────────────────────

function GearRing({ size }: { size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.42;
  const teeth = 24;
  const toothH = size * 0.035;
  const toothW = (2 * Math.PI * r / teeth) * 0.55;

  const teeth_paths: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + (r - toothH) * Math.cos(angle - toothW / r / 2);
    const y1 = cy + (r - toothH) * Math.sin(angle - toothW / r / 2);
    const x2 = cx + r * Math.cos(angle - toothW / r / 2);
    const y2 = cy + r * Math.sin(angle - toothW / r / 2);
    const x3 = cx + r * Math.cos(angle + toothW / r / 2);
    const y3 = cy + r * Math.sin(angle + toothW / r / 2);
    const x4 = cx + (r - toothH) * Math.cos(angle + toothW / r / 2);
    const y4 = cy + (r - toothH) * Math.sin(angle + toothW / r / 2);
    teeth_paths.push(`M${x1},${y1} L${x2},${y2} L${x3},${y3} L${x4},${y4} Z`);
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Outer bronze ring */}
      <circle cx={cx} cy={cy} r={r + toothH + 1} fill="none" stroke="#8a6820" strokeWidth="2"/>
      {/* Teeth */}
      {teeth_paths.map((d, i) => (
        <path key={i} d={d} fill={i % 2 === 0 ? "#7a5818" : "#6a4a10"} stroke="#5a3a08" strokeWidth="0.5"/>
      ))}
      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={r - toothH - 2} fill="#0a0a0c" stroke="#5a4010" strokeWidth="1.5"/>
    </svg>
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
        rotate: currentRotationRef.current + finalRotation,
        transition: { duration: spinDuration / 1000, ease: EASING.SPIN_EASE },
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

      {/* ── Outer drop shadow ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-8px",
          boxShadow: "0 0 60px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      {/* ── Outermost thick bronze ring ── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-7px",
          background: "conic-gradient(from 0deg, #3a2808, #7a5018, #c8901a, #8a6010, #5a3808, #c07010, #4a3008, #9a6818, #3a2808)",
          borderRadius: "50%",
          zIndex: 1,
        }}
      />
      {/* Bronze ring inner bevel */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-3px",
          background: "conic-gradient(from 0deg, #1a1008, #3a2010, #201408, #2a1808, #1a1008)",
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
          background: "#0a0806",
          willChange: "transform",
          zIndex: 3,
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

              {/* Subtle leather texture overlay */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v1H0zm2 2h1v1H2z' fill='rgba(0,0,0,0.15)'/%3E%3C/svg%3E\")",
                  backgroundSize: "4px 4px",
                  opacity: 0.6,
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
                      textShadow: `1px 1px 2px rgba(0,0,0,0.9), 0 0 8px ${design.labelColor}60`,
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

              {/* Gold divider line at segment edge */}
              <div
                className="absolute inset-0 origin-center pointer-events-none"
                style={{ transform: `rotate(${endAngle}deg)` }}
              >
                <div
                  className="absolute top-0 left-1/2"
                  style={{
                    width: "2px",
                    height: "50%",
                    background: "linear-gradient(180deg, #a07020 0%, #d4a030 30%, #8a5a10 70%, transparent 100%)",
                    boxShadow: "0 0 3px rgba(180,130,40,0.5)",
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Center hole — pure black opening */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width:  "22%",
            height: "22%",
            background: "#000",
            zIndex: 10,
          }}
        />
      </motion.div>

      {/* ── Center gear-tooth hub (sits on top of wheel, does NOT rotate) ── */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: hubSize, height: hubSize, zIndex: Z.CENTER_HUB }}
      >
        <GearRing size={hubSize} />
        {/* Black void in center */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width:  "56%",
            height: "56%",
            background: "radial-gradient(circle, #050505 60%, #0f0a05 100%)",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.9)",
          }}
        />
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
          {/* Bronze needle */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "9px solid transparent",
              borderRight: "9px solid transparent",
              borderTop: "28px solid #c89020",
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))",
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
              borderTop: "14px solid rgba(255,220,80,0.35)",
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
