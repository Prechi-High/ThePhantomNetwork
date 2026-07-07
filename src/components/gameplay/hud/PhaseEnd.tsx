'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameplayEvents } from '@/hooks/useGameplayEvents';
import { GAMEPLAY_EVENTS } from '@/lib/events/eventTypes';

interface PhaseEndProps {
  phaseNumber: number;
  eliminationCount?: number;
  summary?: string;
  onComplete: () => void;
}

export function PhaseEnd({
  phaseNumber,
  eliminationCount,
  summary,
  onComplete,
}: PhaseEndProps) {
  const { emit } = useGameplayEvents();

  useEffect(() => {
    // Emit event for sound system
    emit(GAMEPLAY_EVENTS.PHASE.COMPLETED, {
      phaseNumber,
      eliminationCount,
    });

    // Auto-complete after animation
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [phaseNumber, eliminationCount, emit, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          zIndex: 1000,
          backdropFilter: 'blur(6px)',
        }}
      >
        {/* Center card */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
          style={{
            background: 'linear-gradient(135deg, #2d5a2d 0%, #1a3a1a 100%)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '40px 60px',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(34,197,94,0.3)',
          }}
        >
          {/* Completion message */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring' }}
            style={{
              fontSize: '44px',
              fontWeight: 900,
              color: '#22c55e',
              textShadow: '0 0 25px rgba(34,197,94,0.5)',
              marginBottom: '8px',
              letterSpacing: '0.1em',
            }}
          >
            PHASE COMPLETE
          </motion.h1>

          {/* Elimination info */}
          {eliminationCount !== undefined && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.8)',
                marginTop: '8px',
              }}
            >
              {eliminationCount} players eliminated
            </motion.p>
          )}

          {/* Custom summary */}
          {summary && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: '13px',
                color: 'rgba(34,197,94,0.7)',
                marginTop: '12px',
                fontStyle: 'italic',
              }}
            >
              {summary}
            </motion.p>
          )}
        </motion.div>

        {/* Confetti effect */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`confetti-${i}`}
            initial={{
              x: (Math.random() - 0.5) * 400,
              y: -50,
              opacity: 1,
            }}
            animate={{
              x: (Math.random() - 0.5) * 200,
              y: window.innerHeight + 50,
              opacity: 0,
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 0.3,
              ease: 'easeIn',
            }}
            style={{
              position: 'fixed',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                background: ['#22c55e', '#86efac', '#10b981'][Math.floor(Math.random() * 3)],
                borderRadius: '50%',
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
