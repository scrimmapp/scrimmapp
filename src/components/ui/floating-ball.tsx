function BallGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="text-ink-2">
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none">
        <polygon points="24,12 30,17 28,24 20,24 18,17" />
        <path d="M24 12 30 17 36 14" />
        <path d="M18 17 12 15" />
        <path d="M20 24 16 31" />
        <path d="M28 24 32 31" />
      </g>
    </svg>
  );
}

export const balls = [
  { top: "12%", left: "8%", size: 46, duration: 19, delay: 0 },
  { top: "68%", left: "4%", size: 30, duration: 24, delay: 2 },
  { top: "22%", left: "92%", size: 38, duration: 21, delay: 1 },
  { top: "78%", left: "88%", size: 26, duration: 26, delay: 3 },
  { top: "48%", left: "50%", size: 22, duration: 28, delay: 4 },
] as const;

export { BallGlyph };
