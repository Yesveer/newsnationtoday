import { SettingsView } from "@/components/admin/settings-view";
import { PermissionGate } from "@/components/admin/permission-gate";

export const metadata = { title: "साइट सेटिंग्स" };

export default function SettingsPage() {
  return (
    <PermissionGate permission="settings.manage">
      <SettingsView />
    </PermissionGate>
  );
}
