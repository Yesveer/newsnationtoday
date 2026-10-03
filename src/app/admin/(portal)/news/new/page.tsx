import { ArticleEditor } from "@/components/admin/news/article-editor";
import { PermissionGate } from "@/components/admin/permission-gate";

export const metadata = { title: "नई खबर" };

export default function NewArticlePage() {
  return (
    <PermissionGate permission="news.create">
      <ArticleEditor />
    </PermissionGate>
  );
}
