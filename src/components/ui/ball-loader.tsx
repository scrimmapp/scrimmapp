"use client";

import { motion } from "motion/react";
import Image from "next/image";
import ballArt from "../../../public/brand/Ball.png";

export function BallLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative h-16 w-16">
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -22, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        >
          <motion.div
            animate={{ rotate: [-12, 12, -12] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
          >
            <Image src={ballArt} alt="" className="h-16 w-16 drop-shadow-md" priority />
          </motion.div>
        </motion.div>
        <motion.div
          className="absolute -bottom-1 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full bg-ink/15"
          animate={{ scaleX: [1, 0.55, 1], opacity: [0.5, 0.18, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        />
      </div>

      <div className="field-caption flex items-center gap-1 text-[13px] font-bold uppercase tracking-widest">
        <span>{label}</span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1 w-1 rounded-full bg-pitch"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
