'use client';

import { cn } from '@/lib/utils';
import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

/**
 * Dialog root component - manages open/closed state
 */
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

/**
 * Dialog content overlay and container
 */
export interface DialogContentProps {
  children: ReactNode;
  className?: string;
  closeButton?: boolean;
}

export function DialogContent({
  children,
  className,
  closeButton = true,
}: DialogContentProps) {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('DialogContent must be used within Dialog');
  }

  const { open, setOpen } = context;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className={cn(
                'relative w-full max-w-sm rounded-2xl bg-phantom-surface border border-phantom-border p-6',
                'shadow-lg',
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {closeButton && (
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 p-1 text-phantom-muted hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Dialog header
 */
export interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

/**
 * Dialog title
 */
export interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-bold text-white', className)}>
      {children}
    </h2>
  );
}

/**
 * Dialog description/body
 */
export interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function DialogDescription({
  children,
  className,
}: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-phantom-muted', className)}>
      {children}
    </p>
  );
}

/**
 * Dialog footer
 */
export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn('mt-6 flex items-center justify-end gap-3', className)}
    >
      {children}
    </div>
  );
}
