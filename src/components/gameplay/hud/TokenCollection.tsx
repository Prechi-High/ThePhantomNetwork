'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameplayEvents } from '@/hooks/useGameplayEvents';

interface TokenCollectionProps {
  amount: number;
  onComplete: () => void;
}

interface TokenParticle {
  id: string;
}

export function TokenCollection({ amount, onComplete }: TokenCollectionProps) {
  const { emit } = useGameplayEvents();

  // Generate particles (max 10 for visual clarity)
  const particleCount = Math.min(amount, 10);
  const particles: TokenParticle[] = Array.from({ length: particleCount }, (_, i) => ({
    id: `token-${i}`,
  }));

  useEffect(() => {
    // Auto-complete after animation
    const timer = setTimeout(() => {
      // Emit event for sound system
      emit('tokens.collected', { amount });
      onComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [amount, emit, onComplete]);

  return (
    <AnimatePresence>
      <div
        className="fixed pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 999,
        }}
      >
        {particles.map((particle, i) => (
          <motion.div
            key={particle.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: window.innerWidth - 80, // Token counter position (right side)
              y: -window.innerHeight / 2 + 60, // Token counter position (top)
              opacity: 0,
              scale: 0.5,
            }}
            transition={{
              duration: 1,
              delay: i * 0.05, // Stagger particles
              ease: 'easeInOut',
            }}
            className="absolute"
          >
            {/* Token particle */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" fill="url(#tokenGrad)" stroke="#fbbf24" strokeWidth="1" />
              <path d="M12 8v8M8 12h8" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="tokenGrad" x1="12" y1="3" x2="12" y2="21">
                  <stop stopColor="#fcd34d" />
                  <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
