"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppData } from "@/lib/app-data";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Board" },
  { href: "/calendar", label: "Season Calendar" },
  { href: "/venues", label: "Venues" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const { unreadCount } = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 text-[11px] font-bold uppercase tracking-wider text-ink-2 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-ink",
                pathname === link.href && "text-pitch",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/inbox"
            className={cn(
              "relative flex items-center gap-1.5 transition-colors hover:text-ink",
              pathname === "/inbox" && "text-pitch",
            )}
          >
            Inbox
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-pill bg-crit px-1 text-[9px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/profile"
            className="hidden rounded-pill bg-pitch px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-pitch-contrast shadow-sm transition-transform hover:scale-[1.03] active:scale-95 sm:inline-flex"
          >
            Coach Profile
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-control border border-rule-2 text-ink lg:hidden"
          >
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-rule bg-paper px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-ink-2 lg:hidden">
          {[...links, { href: "/inbox", label: "Inbox" }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-control px-3 py-2 transition-colors hover:bg-surface-2 hover:text-ink",
                pathname === link.href && "bg-pitch-bg text-pitch-ink",
              )}
            >
              {link.label}
              {link.href === "/inbox" && unreadCount > 0 && (
                <span className="ml-2 rounded-pill bg-crit px-1.5 py-0.5 text-[9px] text-white">{unreadCount}</span>
              )}
            </Link>
          ))}
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-control bg-pitch px-3 py-2 text-center text-pitch-contrast"
          >
            Coach Profile
          </Link>
        </nav>
      )}
    </header>
  );
}
