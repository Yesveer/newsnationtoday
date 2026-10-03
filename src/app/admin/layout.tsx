import type { Metadata } from "next";
import { AdminAuthProvider } from "@/components/admin/admin-session";
import { TranslateBootstrap } from "@/components/i18n/translate-bootstrap";
import { ExactWording } from "@/components/admin/exact-wording";

export const metadata: Metadata = {
  title: { default: "एडमिन पोर्टल", template: "%s | एडमिन पोर्टल" },
  robots: { index: false, follow: false },
};

/** Everything under /admin is behind the session provider. Signing in happens
 *  at `/login`, outside this tree, so the portal itself is never reachable
 *  without an authenticated session. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      {/* Hindi and English are the portal's own words; nothing should
          machine-translate them. See ExactWording for why that also fixes
          controls re-rendering under a translator. */}
      <ExactWording>{children}</ExactWording>
      {/* Hindi and English come from the portal's own dictionary, word for
          word. Every other language is machine-translated, chrome included. */}
      <TranslateBootstrap skipLanguages={["hi", "en"]} />
    </AdminAuthProvider>
  );
}
