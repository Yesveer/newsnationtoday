import { UsersView } from "@/components/admin/users/users-view";
import { PermissionGate } from "@/components/admin/permission-gate";

export const metadata = { title: "यूज़र मैनेजमेंट" };

/** An admin reaches this page to add a reporter to their desk. The view
 *  itself hides every administrator-only action, and the API refuses them
 *  regardless of what the page shows. */
export default function UsersPage() {
  return (
    <PermissionGate permission="users.create.reporter">
      <UsersView />
    </PermissionGate>
  );
}
