import { ArticleEditorPage } from "@/components/admin/news/article-editor-page";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ArticleEditorPage id={id} />;
}
