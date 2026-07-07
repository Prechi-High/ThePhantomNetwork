'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameplayEvents } from '@/hooks/useGameplayEvents';
import { GAMEPLAY_EVENTS } from '@/lib/events/eventTypes';

interface PhaseIntroProps {
  phaseNumber: number;
  phaseName: string;
  phaseDescription?: string;
  onComplete: () => void;
}

export function PhaseIntro({
  phaseNumber,
  phaseName,
  phaseDescription,
  onComplete,
}: PhaseIntroProps) {
  const { emit } = useGameplayEvents();

  useEffect(() => {
    // Emit event for sound system
    emit(GAMEPLAY_EVENTS.PHASE.STARTED, { phaseNumber, phaseName });

    // Auto-complete after animation
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [phaseNumber, phaseName, emit, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          backdropFilter: 'blur(6px)',
        }}
      >
        {/* Center card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -50 }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 20,
          }}
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f0d27 100%)',
            border: '2px solid #a78bfa',
            borderRadius: '12px',
            padding: '60px 80px',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(167,139,250,0.3)',
          }}
        >
          {/* Phase label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'rgba(167,139,250,0.6)',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            PHASE {phaseNumber}
          </motion.div>

          {/* Phase name */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            style={{
              fontSize: '48px',
              fontWeight: 900,
              color: '#c084fc',
              textShadow: '0 0 30px rgba(192,132,252,0.5)',
              marginBottom: '12px',
              letterSpacing: '0.05em',
            }}
          >
            {phaseName}
          </motion.h1>

          {/* Phase description */}
          {phaseDescription && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                marginTop: '8px',
                maxWidth: '400px',
              }}
            >
              {phaseDescription}
            </motion.p>
          )}
        </motion.div>

        {/* Glow background */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'radial-gradient(circle at center, rgba(167,139,250,0.2) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
