import { TopicsView } from "@/components/admin/topics-view";
import { PermissionGate } from "@/components/admin/permission-gate";
import { getNewsItems } from "@/lib/data/admin/get-admin-data";

export const metadata = { title: "टॉपिक हब" };

export default async function TopicsPage() {
  const items = await getNewsItems();
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    if (item.topic) acc[item.topic] = (acc[item.topic] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PermissionGate permission="categories.manage">
      <TopicsView counts={counts} />
    </PermissionGate>
  );
}
