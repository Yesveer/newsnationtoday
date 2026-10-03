import { UserDetailView } from "@/components/admin/users/user-detail-view";
import { PermissionGate } from "@/components/admin/permission-gate";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionGate permission="users.manage">
      <UserDetailView id={id} />
    </PermissionGate>
  );
}
