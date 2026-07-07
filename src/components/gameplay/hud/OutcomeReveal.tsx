'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameplayEvents } from '@/hooks/useGameplayEvents';

interface OutcomeRevealProps {
  outcome: 'advance' | 'acquire' | 'discover' | 'steal' | 'void';
  amount?: number; // Tokens
  onComplete: () => void;
}

const outcomeConfigs = {
  advance: {
    title: 'ADVANCE',
    subtitle: '+3 Tokens',
    color: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.5)',
    bgGradient: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <path d="M7 16l5-5 5 5" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 4v12" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  acquire: {
    title: 'ACQUIRE',
    subtitle: '+1 Token',
    color: '#38bdf8',
    glowColor: 'rgba(56,189,248,0.5)',
    bgGradient: 'linear-gradient(135deg, #0c2d4e 0%, #051c2c 100%)',
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#38bdf8" opacity="0.2" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M12 8v8M8 12h8" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  discover: {
    title: 'DISCOVER',
    subtitle: '+0.5 Tokens',
    color: '#a78bfa',
    glowColor: 'rgba(167,139,250,0.5)',
    bgGradient: 'linear-gradient(135deg, #3f2c70 0%, #1e1346 100%)',
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.3" />
        <path d="M12 9v6M9 12h6" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 3v3M12 18v3" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  steal: {
    title: 'STEAL',
    subtitle: 'Attempt Theft',
    color: '#ef4444',
    glowColor: 'rgba(239,68,68,0.5)',
    bgGradient: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="1.5" fill="#ef4444" />
        <line x1="12" y1="12" x2="18" y2="6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="12" x2="18" y2="18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="12" x2="6" y2="6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="12" x2="6" y2="18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  void: {
    title: 'VOID',
    subtitle: 'No Reward',
    color: '#9ca3af',
    glowColor: 'rgba(156,163,175,0.3)',
    bgGradient: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#9ca3af" strokeWidth="1.5" opacity="0.5" />
        <line x1="8" y1="8" x2="16" y2="16" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="8" x2="8" y2="16" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
};

export function OutcomeReveal({ outcome, amount, onComplete }: OutcomeRevealProps) {
  const { emit } = useGameplayEvents();
  const config = outcomeConfigs[outcome];

  useEffect(() => {
    // Emit event for sound system
    emit(`spin.outcome.${outcome}`, { outcome, amount });

    // Auto-complete after animation
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [outcome, amount, emit, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Center card */}
        <motion.div
          className="relative rounded-lg overflow-hidden"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
          style={{
            background: config.bgGradient,
            border: `2px solid ${config.color}`,
            boxShadow: `0 0 40px ${config.glowColor}`,
            padding: '40px',
            textAlign: 'center',
            minWidth: '300px',
          }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
            style={{ marginBottom: '20px' }}
          >
            {config.icon}
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-4xl font-black"
            style={{
              color: config.color,
              textShadow: `0 0 20px ${config.glowColor}`,
              marginBottom: '8px',
              letterSpacing: '0.1em',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {config.title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            style={{
              color: config.color,
              fontSize: '18px',
              fontWeight: 700,
              opacity: 0.8,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {config.subtitle}
          </motion.p>

          {/* Glow pulse background */}
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{
              background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
              zIndex: -1,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
