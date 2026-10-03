import { fetchTopics } from "@/lib/api/public";
import { categoryTopics } from "@/config/topics.config";
import type { Topic } from "@/config/topics.config";

/** A category's sub-topics, straight from the database — so adding a state or
 *  a sport in the admin portal changes the hub a reader sees. The bundled
 *  config is only a fallback for when the API is unreachable. */
export async function getTopicsForCategory(categorySlug: string): Promise<Topic[]> {
  const topics = await fetchTopics(categorySlug);
  if (topics.length > 0) return topics;
  return categoryTopics[categorySlug]?.topics ?? [];
}
