import { CategoriesView } from "@/components/admin/categories-view";
import { PermissionGate } from "@/components/admin/permission-gate";
import { getNewsItems } from "@/lib/data/admin/get-admin-data";

export const metadata = { title: "कैटेगरी" };

export default async function CategoriesPage() {
  const items = await getNewsItems();
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.categorySlug] = (acc[item.categorySlug] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PermissionGate permission="categories.manage">
      <CategoriesView counts={counts} />
    </PermissionGate>
  );
}
