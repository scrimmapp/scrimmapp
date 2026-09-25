"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2, Mail, MessageCircle, MessageSquare, Link2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

// No brand icon ships in this lucide-react version, so Facebook gets a small inline mark
// rather than pulling in a whole icon pack for one glyph.
function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

export function ShareMenu({
  url,
  title,
  iconOnly,
  className,
}: {
  url: string;
  title: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const showToast = useToast();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shareText = `${title} · find scrimmages on ScrimmApp`;
  const links: { key: string; label: string; icon: ReactNode; href: string; external: boolean }[] = [
    {
      key: "facebook",
      label: "Facebook",
      icon: <FacebookIcon size={14} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      external: true,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle size={14} strokeWidth={2.2} />,
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      external: true,
    },
    {
      key: "email",
      label: "Email",
      icon: <Mail size={14} strokeWidth={2.2} />,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`,
      external: false,
    },
    {
      key: "text",
      label: "Text message",
      icon: <MessageSquare size={14} strokeWidth={2.2} />,
      href: `sms:?body=${encodeURIComponent(`${shareText} ${url}`)}`,
      external: false,
    },
  ];

  async function handleCopyLink() {
    await navigator.clipboard?.writeText(url);
    showToast("Link copied");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={(e) => {
          // Cards wrap this in a Link to the listing detail page; stop that navigation from
          // also firing when the share button itself is tapped.
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Share this listing"
        aria-expanded={open}
        className={
          iconOnly
            ? "flex h-7 w-7 items-center justify-center rounded-full border border-rule-2 bg-surface/90 text-ink-2 shadow-sm backdrop-blur transition-colors hover:bg-surface-2"
            : "flex items-center gap-1.5 rounded-control border border-rule-2 bg-paper px-2 py-1 text-[12px] font-bold text-ink-2 transition-colors hover:bg-surface-2"
        }
      >
        <Share2 size={13} strokeWidth={2.2} />
        {!iconOnly && "Share"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: "spring", stiffness: 460, damping: 32 }}
            className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-card border border-rule bg-surface p-1.5 shadow-lg"
          >
            {links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="flex items-center gap-2 rounded-control px-2.5 py-2 text-[12px] font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                {l.icon}
                {l.label}
              </a>
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopyLink();
              }}
              className="flex w-full items-center gap-2 rounded-control px-2.5 py-2 text-left text-[12px] font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Link2 size={14} strokeWidth={2.2} />
              Copy link
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
