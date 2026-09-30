"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/data/get-site-config";

/** Carries the newsroom's live configuration to the client components that
 *  render the chrome. The value is read on the server once per request, so the
 *  first paint already matches what the admin saved. */
const SiteSettingsContext = createContext<SiteSettings | null>(null);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  return <SiteSettingsContext value={settings}>{children}</SiteSettingsContext>;
}

export function useSiteSettings(): SiteSettings {
  const settings = useContext(SiteSettingsContext);
  if (!settings) {
    throw new Error("useSiteSettings must be used inside SiteSettingsProvider");
  }
  return settings;
}
