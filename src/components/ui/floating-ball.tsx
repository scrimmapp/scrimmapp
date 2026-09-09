import Image from "next/image";
import ballArt from "../../../public/brand/Ball.png";

// Real soccer ball artwork (Javi, Sep 2026), replacing the earlier line-art glyph.
function BallGlyph({ size }: { size: number }) {
  return <Image src={ballArt} alt="" width={size} height={size} />;
}

export const balls = [
  { top: "12%", left: "8%", size: 46, duration: 19, delay: 0 },
  { top: "68%", left: "4%", size: 30, duration: 24, delay: 2 },
  { top: "22%", left: "92%", size: 38, duration: 21, delay: 1 },
  { top: "78%", left: "88%", size: 26, duration: 26, delay: 3 },
  { top: "48%", left: "50%", size: 22, duration: 28, delay: 4 },
] as const;

export { BallGlyph };
