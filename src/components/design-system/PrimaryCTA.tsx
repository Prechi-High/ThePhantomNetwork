"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PrimaryCTAProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

export function PrimaryCTA({
  children,
  href,
  onClick,
  disabled,
  className,
  type = "button",
}: PrimaryCTAProps) {
  const cls = cn("w-full text-base font-bold uppercase tracking-wide", className);
  if (href && !disabled) {
    return (
      <Link href={href} className="block w-full" onClick={onClick}>
        <Button className={cls} disabled={disabled}>
          {children}
        </Button>
      </Link>
    );
  }
  return (
    <Button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}

export function SecondaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("text-sm font-medium text-legacy-blue hover:underline", className)}
    >
      {children}
    </Link>
  );
}
