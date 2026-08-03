import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListRowProps {
  title: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  className?: string;
}

export function ListRow({ title, subtitle, href, onClick, trailing, className }: ListRowProps) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{title}</p>
        {subtitle && <p className="truncate text-xs text-legacy-muted">{subtitle}</p>}
      </div>
      {trailing ?? (href ? <ChevronRight className="h-4 w-4 shrink-0 text-legacy-muted" /> : null)}
    </>
  );

  const cls = cn(
    "flex w-full items-center gap-3 rounded-xl border border-legacy-border bg-legacy-card px-4 py-3 text-left transition-colors hover:bg-legacy-surface-hover",
    className
  );

  if (href) {
    return <Link href={href} className={cls}>{inner}</Link>;
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
