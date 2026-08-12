import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import brandLogo from "../../../public/brand/scrimmapp-logo-source.jpeg";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5">
      <Card className="space-y-3 p-5 text-center">
        <div className="flex justify-center">
          <div className="w-24 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <Image src={brandLogo} alt="ScrimmApp" className="h-auto w-full" priority />
          </div>
        </div>
        <h1 className="font-display text-xl font-extrabold tracking-tight text-ink md:text-2xl">About ScrimmApp</h1>
        <p className="text-xs leading-relaxed text-ink-2">
          ScrimmApp was built by soccer coaches to eliminate the frustrating scramble for pre-season
          friendlies. Instead of endless text threads and Facebook groups, ScrimmApp is a dedicated
          classifieds marketplace where coaches can match, verify pitch time, and lock in games seamlessly.
        </p>
        <Link
          href="/"
          className="inline-block rounded-control bg-pitch px-5 py-2 text-[11px] font-black uppercase tracking-widest text-pitch-contrast hover:brightness-105"
        >
          Return to the board
        </Link>
      </Card>
    </div>
  );
}
