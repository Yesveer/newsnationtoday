import type { Metadata } from "next";
import { getAllArticles } from "@/lib/data/get-articles";
import { SearchClient } from "@/components/search/search-client";

export const metadata: Metadata = { title: "खोजें" };

export default async function SearchPage() {
  const articles = await getAllArticles();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SearchClient articles={articles} />
    </div>
  );
}
