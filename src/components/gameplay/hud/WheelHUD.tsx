'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameplayStore } from '@/stores/useGameplayStore';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { OutcomeReveal } from './OutcomeReveal';

interface WheelSegment {
  id: number;
  name: string;
  value: number;
  color: string;
  icon: string;
  position: number; // degrees
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  {
    id: 1,
    name: 'ADVANCE',
    value: 3,
    color: '#22C55E',
    icon: '⬆️',
    position: 0,
  },
  {
    id: 2,
    name: 'ACQUIRE',
    value: 1,
    color: '#3B82F6',
    icon: '⭐',
    position: 72,
  },
  {
    id: 3,
    name: 'DISCOVER',
    value: 0.5,
    color: '#A855F7',
    icon: '🔮',
    position: 144,
  },
  {
    id: 4,
    name: 'STEAL',
    value: 0,
    color: '#DC2626',
    icon: '💥',
    position: 216,
  },
  {
    id: 5,
    name: 'VOID',
    value: 0,
    color: '#6B7280',
    icon: 'Ø',
    position: 288,
  },
];

export function WheelHUD({ subSessionId }: { subSessionId: string }) {
  const { lastOutcome, tokens } = useGameplayStore((s) => ({
    lastOutcome: s.lastOutcome,
    tokens: s.tokens,
  }));

  const { connected } = useRealtimeSession(subSessionId);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [showOutcomeReveal, setShowOutcomeReveal] = useState(false);

  // Spin wheel for 8 seconds then wait for backend outcome
  const handleSpinClick = async () => {
    if (isSpinning || !connected) return;

    try {
      // Request spin from backend
      const response = await fetch('/api/gameplay/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subSessionId }),
      });

      if (!response.ok) return;

      const { spinId } = await response.json();

      // Start spinning animation (8 seconds)
      setIsSpinning(true);
      const randomRotation = 720 + Math.random() * 360; // 720° + random offset
      setWheelRotation((prev) => prev + randomRotation);

      // After 8 seconds, wheel stops
      // Backend will emit spin_result event with outcome
      // which updates lastOutcome via useRealtimeSession
    } catch (error) {
      console.error('Failed to initiate spin:', error);
    }
  };

  // When outcome arrives from backend, show reveal animation
  useEffect(() => {
    if (lastOutcome && isSpinning) {
      setIsSpinning(false);
      setShowOutcomeReveal(true);
    }
  }, [lastOutcome, isSpinning]);

  if (!connected) {
    return (
      <div className="wheel-hud flex flex-col items-center justify-center p-6">
        <div className="text-red-500 text-center">Connecting to game...</div>
      </div>
    );
  }

  return (
    <div className="wheel-hud flex flex-col items-center justify-center gap-6 p-6">
      {/* Wheel Container */}
      <div className="relative w-80 h-80">
        <motion.svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className="absolute inset-0"
          animate={{ rotate: isSpinning ? wheelRotation : wheelRotation }}
          transition={{
            duration: isSpinning ? 8 : 0.3,
            ease: isSpinning ? 'easeOut' : 'easeOut',
          }}
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <defs>
            <linearGradient id="wheelBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle cx="160" cy="160" r="155" fill="url(#wheelBg)" stroke="#FCD34D" strokeWidth="3" />

          {/* Wheel segments */}
          {WHEEL_SEGMENTS.map((segment, index) => {
            const startAngle = segment.position;
            const endAngle = startAngle + 72;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = 160 + 130 * Math.cos(startRad);
            const y1 = 160 + 130 * Math.sin(startRad);
            const x2 = 160 + 130 * Math.cos(endRad);
            const y2 = 160 + 130 * Math.sin(endRad);

            return (
              <g key={segment.id}>
                {/* Segment slice */}
                <path
                  d={`M 160 160 L ${x1} ${y1} A 130 130 0 0 1 ${x2} ${y2} Z`}
                  fill={segment.color}
                  stroke="#000"
                  strokeWidth="2"
                  opacity="0.8"
                />

                {/* Segment label */}
                <g
                  transform={`translate(160, 160) rotate(${startAngle + 36})`}
                  textAnchor="middle"
                >
                  <text
                    x="0"
                    y="90"
                    fontSize="14"
                    fontWeight="bold"
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {segment.name}
                  </text>
                  <text
                    x="0"
                    y="110"
                    fontSize="16"
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {segment.icon}
                  </text>
                  {segment.value > 0 && (
                    <text
                      x="0"
                      y="130"
                      fontSize="12"
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontWeight="bold"
                    >
                      +{segment.value}
                    </text>
                  )}
                </g>
              </g>
            );
          })}

          {/* Center circle */}
          <circle cx="160" cy="160" r="40" fill="#1F2937" stroke="#FCD34D" strokeWidth="2" />
          <circle cx="160" cy="160" r="35" fill="#0F172A" />
        </motion.svg>

        {/* Pointer at top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-yellow-400" />
        </div>
      </div>

      {/* Current tokens display */}
      <div className="text-center">
        <div className="text-sm text-gray-400">Current Tokens</div>
        <div className="text-3xl font-black text-yellow-400">
          {tokens !== null ? tokens.toFixed(1) : '—'}
        </div>
      </div>

      {/* Spin button */}
      <motion.button
        onClick={handleSpinClick}
        disabled={isSpinning || !connected || tokens === null}
        whileHover={{ scale: isSpinning ? 1 : 1.1 }}
        whileTap={{ scale: isSpinning ? 1 : 0.95 }}
        className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
          isSpinning || !connected || tokens === null
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
        }`}
      >
        {isSpinning ? 'SPINNING...' : 'SPIN'}
      </motion.button>

      {/* Outcome reveal animation */}
      {showOutcomeReveal && lastOutcome && (
        <OutcomeReveal
          outcome={lastOutcome.type}
          amount={lastOutcome.value}
          onComplete={() => {
            setShowOutcomeReveal(false);
          }}
        />
      )}
    </div>
  );
}
