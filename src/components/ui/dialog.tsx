"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[92%] max-w-lg rounded-card border border-rule bg-surface p-0 text-ink shadow-lg backdrop:bg-ink/50 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-rule px-5 py-3">
        <h3 className="font-display text-base font-bold tracking-tight">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="flex h-7 w-7 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
