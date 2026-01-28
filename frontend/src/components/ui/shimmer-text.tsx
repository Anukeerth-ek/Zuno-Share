import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerTextProps {
  text: string;
  className?: string;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({ text, className }) => {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r from-foreground via-primary/50 to-foreground bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer",
        className
      )}
    >
      {text}
    </span>
  );
};
