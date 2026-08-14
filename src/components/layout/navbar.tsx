"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppData } from "@/lib/app-data";
import { cn } from "@/lib/cn";

const links = [
  { href: "/board", label: "Board" },
  { href: "/calendar", label: "Season Calendar" },
  { href: "/venues", label: "Venues" },
  { href: "/about", label: "About" },
  { href: "/profile", label: "Profile" },
];

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-full px-2.5 py-1 transition-colors",
        active ? "text-pitch-contrast" : "text-ink-2 hover:text-ink",
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-full bg-pitch"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      {!active && (
        <span className="absolute inset-0 scale-95 rounded-full bg-surface-2 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100" />
      )}
      <span className="relative">{label}</span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { unreadCount } = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-11 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/board" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 text-[10px] font-bold uppercase tracking-wider lg:flex">
          {links.map((link) => (
            <span key={link.href} className="group relative">
              <NavItem href={link.href} label={link.label} active={pathname === link.href} />
            </span>
          ))}
          <span className="group relative">
            <Link
              href="/inbox"
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors",
                pathname === "/inbox" ? "text-pitch-contrast" : "text-ink-2 hover:text-ink",
              )}
            >
              {pathname === "/inbox" && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-full bg-pitch"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {pathname !== "/inbox" && (
                <span className="absolute inset-0 scale-95 rounded-full bg-surface-2 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100" />
              )}
              <span className="relative">Inbox</span>
              {unreadCount > 0 && (
                <span className="relative flex h-3.5 min-w-3.5 items-center justify-center rounded-pill bg-crit px-1 text-[8px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden text-[10px] font-bold uppercase tracking-wider text-ink-2 transition-colors hover:text-ink sm:inline-flex"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-pill bg-pitch px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-pitch-contrast shadow-sm transition-transform hover:scale-[1.04] active:scale-95 sm:inline-flex"
          >
            Sign Up
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-7 w-7 items-center justify-center rounded-control border border-rule-2 text-ink lg:hidden"
          >
            <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-rule bg-paper text-[11px] font-bold uppercase tracking-wide text-ink-2 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-2">
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
              <div className="mt-1 flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-control border border-rule-2 px-3 py-2 text-center text-ink-2"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-control bg-pitch px-3 py-2 text-center text-pitch-contrast"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
