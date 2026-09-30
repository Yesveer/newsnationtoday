"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAdminAuth } from "@/components/admin/admin-session";
import { siteConfig } from "@/config/site";

/** Keeps the portal shell off the screen until the API says who you are, and
 *  sends you to the login page when it says nobody. */
export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = pathname && pathname !== "/admin" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [status, router, pathname]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg">
        <span className="relative block h-10 w-28 animate-pulse">
          <Image src="/logo-nnt.png" alt={siteConfig.name} fill className="object-contain" sizes="112px" />
        </span>
        <span className="text-[12.5px] text-text-muted">
          {status === "loading" ? "सेशन जांचा जा रहा है…" : "लॉगिन पेज पर ले जा रहे हैं…"}
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
