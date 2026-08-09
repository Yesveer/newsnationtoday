import { getActiveBreakingNews } from "@/lib/data/get-breaking-news";
import { TickerBar } from "@/components/layout/ticker-bar";

export async function BreakingTicker() {
  const items = await getActiveBreakingNews();
  if (items.length === 0) return null;

  return <TickerBar items={items} />;
}
