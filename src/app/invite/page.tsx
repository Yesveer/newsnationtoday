import type { Metadata } from "next";
import { Suspense } from "react";
import { AcceptInviteForm } from "@/components/admin/accept-invite-form";
import { TranslateBootstrap } from "@/components/i18n/translate-bootstrap";

export const metadata: Metadata = {
  title: "इनवाइट",
  robots: { index: false, follow: false },
};

/** Where an invited newsroom member sets their password. Public by design —
 *  the invite token is the credential. */
export default function AcceptInvitePage() {
  return (
    <>
      <Suspense>
        <AcceptInviteForm />
      </Suspense>
      <TranslateBootstrap />
    </>
  );
}
