import { TopicsView } from "@/components/admin/topics-view";
import { PermissionGate } from "@/components/admin/permission-gate";

export const metadata = { title: "टॉपिक हब" };

export default function TopicsPage() {
  return (
    <PermissionGate permission="categories.manage">
      <TopicsView />
    </PermissionGate>
  );
}
