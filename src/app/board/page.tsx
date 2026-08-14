import { AnimatedHero } from "@/components/board/animated-hero";
import { PostListingForm } from "@/components/board/post-listing-form";
import { BoardSection } from "@/components/board/board-section";

export default function BoardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-2.5 px-4 py-1.5">
      <AnimatedHero />
      <PostListingForm />
      <BoardSection />
    </div>
  );
}
