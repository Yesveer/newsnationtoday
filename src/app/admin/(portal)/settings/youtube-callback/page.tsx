import { YouTubeCallback } from "@/components/admin/youtube-callback";
import { PermissionGate } from "@/components/admin/permission-gate";

export const metadata = { title: "YouTube" };

/** Where Google sends the administrator back after the consent screen.
 *  The one-time code lands here as a query parameter and is exchanged for a
 *  refresh token by the API — the code never goes anywhere else. */
export default function YouTubeCallbackPage() {
  return (
    <PermissionGate permission="settings.manage">
      <YouTubeCallback />
    </PermissionGate>
  );
}
