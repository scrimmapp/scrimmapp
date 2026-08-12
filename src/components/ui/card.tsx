import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-card border border-rule bg-surface shadow-sm",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";
