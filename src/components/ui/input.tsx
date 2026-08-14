import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

const controlClasses =
  "w-full rounded-control border border-rule-2 bg-surface px-2 py-1 text-[13px] text-ink placeholder:text-muted transition-colors focus:border-pitch focus:outline-none focus:ring-2 focus:ring-pitch/15";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(controlClasses, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(controlClasses, "cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22%236e7c68%22 stroke-width=%221.6%22><path d=%22M5 7.5l5 5 5-5%22/></svg>')] bg-[length:11px] bg-[right_0.5rem_center] bg-no-repeat pr-6", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(controlClasses, "resize-none", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 rounded-[4px] border border-rule-2 bg-surface accent-pitch",
        className,
      )}
      {...props}
    />
  );
}
