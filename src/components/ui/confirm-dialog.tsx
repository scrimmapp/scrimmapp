"use client";

import type { ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  confirming = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  confirming?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="space-y-3">
        <p className="text-[13px] text-ink-2">{description}</p>
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1 normal-case" onClick={onClose}>
            Never mind
          </Button>
          <Button type="button" variant="danger" className="flex-[2]" onClick={onConfirm} disabled={confirming}>
            {confirming ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
