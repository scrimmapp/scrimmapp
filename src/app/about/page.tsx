import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import brandLogo from "../../../public/brand/scrimmapp-logo-source.jpeg";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4">
      <Card className="space-y-2 p-4 text-center">
        <div className="flex justify-center">
          <div className="w-20 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <Image src={brandLogo} alt="ScrimmApp" className="h-auto w-full" priority />
          </div>
        </div>
        <h1 className="font-display text-base font-extrabold tracking-tight text-ink md:text-lg">About ScrimmApp</h1>
        <p className="text-[11px] leading-relaxed text-ink-2">
          ScrimmApp was built by soccer coaches to eliminate the frustrating scramble for pre-season
          friendlies. Instead of endless text threads and Facebook groups, ScrimmApp is a dedicated
          classifieds marketplace where coaches can match, verify pitch time, and lock in games seamlessly.
        </p>
        <Link
          href="/board"
          className="inline-block rounded-control bg-pitch px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-pitch-contrast hover:brightness-105"
        >
          Return to the board
        </Link>
      </Card>
    </div>
  );
}
