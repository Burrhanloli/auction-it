import { LazyImage } from "@repo/ui/components/lazy-image";
import { cn } from "@repo/ui/lib/utils";
import { TrophyIcon } from "lucide-react";

export interface LogoProps {
  src?: string | null;
  className?: string;
  iconClassName?: string;
  alt?: string;
}

export function Logo({ src, className, iconClassName, alt = "Logo" }: LogoProps) {
  if (src) {
    return <LazyImage src={src} alt={alt} priority className={cn("object-cover", className)} />;
  }

  return <TrophyIcon className={cn("text-white", className, iconClassName)} />;
}
