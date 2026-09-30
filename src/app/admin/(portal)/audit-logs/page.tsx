import { AuditLogsView } from "@/components/admin/audit-logs-view";
import { PermissionGate } from "@/components/admin/permission-gate";

export const metadata = { title: "ऑडिट लॉग" };

export default function AuditLogsPage() {
  return (
    <PermissionGate permission="audit.view">
      <AuditLogsView />
    </PermissionGate>
  );
}
