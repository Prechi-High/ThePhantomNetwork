import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  /** Extra bottom pad for bottom nav (default true) */
  withNav?: boolean;
}

/** Mobile-first shell — max width, 8pt padding, no dashboard clutter */
export function PageShell({ children, className, withNav = true }: PageShellProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-lg px-4 py-6",
        withNav && "pb-28",
        className
      )}
    >
      {children}
    </div>
  );
}
