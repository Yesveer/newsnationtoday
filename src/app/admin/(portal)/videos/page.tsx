import { NewsTableView } from "@/components/admin/news/news-table-view";

export const metadata = { title: "वीडियो" };

export default function AdminVideosPage() {
  return <NewsTableView onlyVideos />;
}
