import { ReviewQueueView } from "@/components/admin/news/review-queue-view";
import { PermissionGate } from "@/components/admin/permission-gate";

export const metadata = { title: "रिव्यू क्यू" };

export default function ReviewPage() {
  return (
    <PermissionGate permission="news.review">
      <ReviewQueueView />
    </PermissionGate>
  );
}
