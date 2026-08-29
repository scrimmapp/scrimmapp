"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";

type Coach = { name: string; initials: string; teamName: string };

const links = [
  { href: "/board", label: "Board" },
  { href: "/posts", label: "My Posts" },
  { href: "/calendar", label: "Season Calendar" },
  { href: "/venues", label: "Venues" },
  { href: "/about", label: "About" },
];

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-8 items-center rounded-full px-3 transition-colors",
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

export function Navbar({ coach, unreadCount }: { coach: Coach | null; unreadCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isLoggedIn = coach !== null;

  async function handleMobileLogout() {
    setOpen(false);
    await signOutAction();
    // Hard navigation: see the comment in login/page.tsx for why router.push() isn't reliable here.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="flex h-12 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/board" onClick={() => setOpen(false)} className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 text-[12px] font-bold uppercase tracking-wider lg:flex">
          {links.map((link) => (
            <span key={link.href} className="group relative">
              <NavItem href={link.href} label={link.label} active={pathname === link.href} />
            </span>
          ))}
          <span className="group relative">
            <Link
              href="/inbox"
              className={cn(
                "relative flex h-8 items-center gap-1.5 rounded-full px-3 transition-colors",
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
                <span className="relative flex h-3.5 min-w-3.5 items-center justify-center rounded-pill bg-crit px-1 text-[10px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </span>
        </nav>

        <div className="flex items-center gap-2.5">
          {coach ? (
            <div className="hidden sm:block">
              <ProfileMenu coach={coach} />
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="flex h-8 items-center px-2 text-[12px] font-bold uppercase tracking-wider text-ink-2 transition-colors hover:text-ink"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="flex h-8 items-center rounded-pill bg-pitch px-3 text-[11px] font-extrabold uppercase tracking-wider text-pitch-contrast shadow-sm transition-transform hover:scale-[1.04] active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-8 w-8 items-center justify-center rounded-control border border-rule-2 text-ink lg:hidden"
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
            className="overflow-hidden border-t border-rule bg-paper text-[13px] font-bold uppercase tracking-wide text-ink-2 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-2">
              {[...links, { href: "/inbox", label: "Inbox" }, { href: "/profile", label: "Profile" }].map((link) => (
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
                    <span className="ml-2 rounded-pill bg-crit px-1.5 py-0.5 text-[11px] text-white">{unreadCount}</span>
                  )}
                </Link>
              ))}
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleMobileLogout}
                  className="mt-1 rounded-control border border-rule-2 px-3 py-2 text-left text-crit"
                >
                  Log out
                </button>
              ) : (
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
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
