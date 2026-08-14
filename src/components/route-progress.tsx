"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const startedAt = useRef(0);

  // Start the bar the instant a same-app link is clicked. This fires
  // before Next.js has swapped any content, so it's felt immediately.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || anchor.target === "_blank") return;
      if (href === window.location.pathname) return;
      startedAt.current = Date.now();
      setActive(true);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Once the pathname actually changes, the new page has arrived. Hold the
  // bar for a minimum felt duration, then complete it.
  useEffect(() => {
    if (!active) return;
    const elapsed = Date.now() - startedAt.current;
    const minHold = Math.max(180 - elapsed, 0);
    const timer = setTimeout(() => setActive(false), minHold);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <AnimatePresence>
        {active && (
          <motion.div
            key="bar"
            className="h-full bg-gradient-to-r from-pitch via-gold to-pitch bg-[length:200%_100%] shadow-[0_0_8px_var(--gold)]"
            initial={{ width: "0%", opacity: 1 }}
            animate={{
              width: "82%",
              backgroundPosition: ["0% 0%", "100% 0%"],
              transition: { width: { duration: 0.5, ease: "easeOut" }, backgroundPosition: { duration: 0.7, repeat: Infinity, ease: "linear" } },
            }}
            exit={{ width: "100%", opacity: 0, transition: { width: { duration: 0.15 }, opacity: { duration: 0.25, delay: 0.1 } } }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
