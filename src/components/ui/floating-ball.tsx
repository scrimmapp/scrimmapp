function BallGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="text-white">
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none">
        <line x1="27.09" y1="19.75" x2="36.05" y2="7.42" />
        <line x1="29" y1="25.63" x2="43.5" y2="30.33" />
        <line x1="24" y1="29.26" x2="24" y2="44.5" />
        <line x1="19" y1="25.63" x2="4.5" y2="30.33" />
        <line x1="20.91" y1="19.75" x2="11.95" y2="7.42" />
      </g>
      <polygon
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
        points="24,17.5 30.18,21.99 27.82,29.26 20.18,29.26 17.82,21.99"
      />
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
