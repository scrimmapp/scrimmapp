import { type ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="text-[8px] font-bold uppercase tracking-wider text-muted"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
