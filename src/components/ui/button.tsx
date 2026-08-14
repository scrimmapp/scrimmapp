import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-pitch text-pitch-contrast hover:bg-pitch-strong shadow-sm",
  accent: "bg-gold text-gold-contrast hover:bg-gold-strong shadow-sm",
  secondary: "bg-surface text-ink border border-rule-2 hover:border-pitch/40 hover:bg-surface-2",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "bg-crit text-white hover:brightness-95",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-6 px-2 text-[12px] gap-1",
  md: "h-7 px-3 text-[12px] gap-1.5",
  lg: "h-8 px-4 text-[13px] gap-1.5",
};

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96, y: 0 }}
        transition={{ type: "spring", stiffness: 480, damping: 30 }}
        className={cn(
          "inline-flex items-center justify-center rounded-control font-bold uppercase tracking-wide transition-[background-color,box-shadow,border-color] duration-200 disabled:pointer-events-none disabled:opacity-50",
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
