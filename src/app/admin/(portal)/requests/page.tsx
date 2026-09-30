import { RequestsView } from "@/components/admin/requests-view";
import { PermissionGate } from "@/components/admin/permission-gate";

export const metadata = { title: "अप्रूवल रिक्वेस्ट" };

export default function RequestsPage() {
  return (
    <PermissionGate permission="news.review">
      <RequestsView />
    </PermissionGate>
  );
}
