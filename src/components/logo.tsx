import Image from "next/image";
import { cn } from "@/lib/cn";
import brandMark from "../../public/brand/scrimmapp-mark.png";

const sizes = {
  sm: { box: "h-7", radius: "rounded-lg", text: "text-base", gap: "gap-1.5", pad: "p-1" },
  md: { box: "h-8", radius: "rounded-lg", text: "text-base", gap: "gap-2", pad: "p-1" },
  lg: { box: "h-12", radius: "rounded-2xl", text: "text-xl", gap: "gap-2.5", pad: "p-1.5" },
};

export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: keyof typeof sizes;
}) {
  const s = sizes[size];
  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <span
        className={cn(
          "relative flex aspect-[1034/700] shrink-0 items-center justify-center bg-white shadow-sm ring-1 ring-black/5",
          s.box,
          s.radius,
          s.pad,
        )}
      >
        <Image src={brandMark} alt="ScrimmApp" fill sizes="120px" className="object-contain p-[6%]" priority />
      </span>
      {showWordmark && (
        <span className={cn("font-display font-extrabold tracking-tight", s.text)}>
          <span className="text-brand-green">Scrimm</span>
          <span className="text-navy-ink">App</span>
        </span>
      )}
    </span>
  );
}
