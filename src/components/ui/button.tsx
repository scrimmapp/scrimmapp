import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-pitch text-pitch-contrast hover:bg-pitch-strong shadow-sm",
  accent:
    "bg-gold text-gold-contrast hover:bg-gold-strong shadow-sm",
  secondary:
    "bg-surface text-ink border border-rule-2 hover:bg-surface-2",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "bg-crit text-white hover:brightness-95",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[11px] gap-1.5",
  md: "h-9 px-3.5 text-xs gap-1.5",
  lg: "h-10 px-5 text-sm gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-control font-bold uppercase tracking-wide transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
