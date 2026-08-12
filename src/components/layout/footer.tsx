import Link from "next/link";
import { Logo } from "@/components/logo";

const columns = [
  {
    heading: "Platform",
    links: [
      { href: "/", label: "Scrimmage Board" },
      { href: "/calendar", label: "Season Calendar" },
      { href: "/venues", label: "Venue Directory" },
    ],
  },
  {
    heading: "Coach",
    links: [
      { href: "/inbox", label: "Inbox" },
      { href: "/profile", label: "Coach Profile" },
    ],
  },
  {
    heading: "About",
    links: [
      { href: "/about", label: "About ScrimmApp" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-rule bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs space-y-3">
          <Logo />
          <p className="text-sm text-ink-2">
            The scrimmage marketplace and season planner for Rec, Club, and High School soccer programs.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {columns.map((col) => (
            <div key={col.heading} className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{col.heading}</p>
              <ul className="space-y-2 text-sm text-ink-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-pitch">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-rule px-4 py-4 text-center text-[11px] text-muted">
        © {new Date().getFullYear()} ScrimmApp. Built for coaches, by coaches.
      </div>
    </footer>
  );
}
