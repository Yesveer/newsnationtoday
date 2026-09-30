"use client";

import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { roleLabels, type Permission } from "@/lib/admin/permissions";

/** Client-side guard for a whole page. The Go backend will enforce the same
 *  rule server-side; this only keeps the UI honest. */
export function PermissionGate({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { can, role } = useAdminSession();
  const { t, language } = useAdminLang();

  if (can(permission)) return <>{children}</>;

  return (
    <Card className="mx-auto mt-10 max-w-md text-center">
      <CardContent className="flex flex-col items-center gap-3 pt-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-muted">
          <IconLock className="size-6 text-text-muted" stroke={1.6} />
        </span>
        <h2 className="font-display text-lg font-bold">
          {t("इस पेज की अनुमति नहीं है", "You don’t have access to this page")}
        </h2>
        <p className="text-sm text-text-muted">
          {language === "en" ? (
            <>
              You are signed in as <strong>{roleLabels[role].nameEn}</strong>. This section isn’t
              available for your role — please contact an administrator.
            </>
          ) : (
            <>
              आप <strong>{roleLabels[role].name}</strong> के तौर पर लॉग इन हैं। यह सेक्शन आपके रोल के लिए
              उपलब्ध नहीं है — एडमिनिस्ट्रेटर से संपर्क करें।
            </>
          )}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-1">
          <Link href="/admin">{t("डैशबोर्ड पर वापस", "Back to dashboard")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
