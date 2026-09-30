import { ArticleEditor } from "@/components/admin/news/article-editor";
import { PermissionGate } from "@/components/admin/permission-gate";
import { mediaItems } from "@/data/admin/media";

export const metadata = { title: "नई खबर" };

export default function NewArticlePage() {
  return (
    <PermissionGate permission="news.create">
      {/* Media is still the sample library until file storage is wired up. */}
      <ArticleEditor media={mediaItems} />
    </PermissionGate>
  );
}
