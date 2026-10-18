import type { Metadata } from "next";
import { getReelArticles } from "@/lib/data/get-articles";
import { ReelsFeed } from "@/components/reels/reels-feed";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "वीडियो",
  description: `${siteConfig.name} की खबरें रील में — स्क्रॉल कीजिए और देखिए।`,
};

export default async function VideosPage() {
  const articles = await getReelArticles();

  if (articles.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="border-b border-border pb-3 text-2xl font-bold text-text">वीडियो</h1>
        <p className="text-text-muted">फ़िलहाल कोई रील उपलब्ध नहीं है।</p>
      </div>
    );
  }

  // Edge to edge on a phone, a centred card on a desktop — which is where
  // both Shorts and Instagram land, because a 9:16 clip stretched across a
  // wide screen is mostly empty black.
  return (
    <div className="-mx-4 sm:mx-auto sm:w-full sm:max-w-[520px]">
      <ReelsFeed articles={articles} />
    </div>
  );
}
