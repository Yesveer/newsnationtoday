import { AppearanceView } from "@/components/admin/appearance/appearance-view";
import { PermissionGate } from "@/components/admin/permission-gate";

export const metadata = { title: "अपीयरेंस" };

export default function AppearancePage() {
  return (
    <PermissionGate permission="appearance.manage">
      <AppearanceView />
    </PermissionGate>
  );
}
