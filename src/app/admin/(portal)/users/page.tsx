import { UsersView } from "@/components/admin/users/users-view";
import { PermissionGate } from "@/components/admin/permission-gate";

export const metadata = { title: "यूज़र मैनेजमेंट" };

export default function UsersPage() {
  return (
    <PermissionGate permission="users.manage">
      <UsersView />
    </PermissionGate>
  );
}
