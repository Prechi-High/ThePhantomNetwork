"use client";

import { MotionCard } from "@/components/motion/MotionCard";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverable?: boolean;
}

export function Card(props: CardProps) {
  return <MotionCard {...props} />;
}
