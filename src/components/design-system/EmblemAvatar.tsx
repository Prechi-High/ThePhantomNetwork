import Image from "next/image";
import { cn } from "@/lib/utils";

interface EmblemAvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  emblem?: boolean;
  className?: string;
}

const sizes = { sm: 40, md: 56, lg: 72 };

export function EmblemAvatar({ src, alt, size = "md", emblem, className }: EmblemAvatarProps) {
  const px = sizes[size];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full border-2",
        emblem ? "border-legacy-gold/50" : "border-legacy-border",
        className
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image src={src} alt={alt} width={px} height={px} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-legacy-surface text-xs font-bold text-legacy-muted">
          {alt.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
