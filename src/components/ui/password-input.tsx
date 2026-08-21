"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-8", className)} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
        >
          {visible ? <EyeOff size={14} strokeWidth={2.2} /> : <Eye size={14} strokeWidth={2.2} />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
