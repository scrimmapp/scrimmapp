import { PostListingForm } from "@/components/board/post-listing-form";
import { BoardSection } from "@/components/board/board-section";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-4">
      <section className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-gold/30 bg-gold-bg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold-ink">
          Southern California · Rec, Club & High School
        </span>
        <h1 className="mt-2 font-display text-2xl font-extrabold leading-[1.15] tracking-tight text-ink sm:text-3xl">
          Find your next scrimmage before the whistle blows.
        </h1>
        <p className="mt-2 text-xs text-ink-2 md:text-sm">
          A classifieds marketplace for pre-season friendlies — post an open match window, filter by
          level and travel radius, and connect directly with the opposing coach.
        </p>
      </section>

      <PostListingForm />
      <BoardSection />
    </div>
  );
}
