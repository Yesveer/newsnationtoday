"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IconDownload, IconId } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { siteConfig } from "@/config/site";
import type { AdminUser } from "@/types/admin";

/** The company ID card.
 *
 *  Drawn as one SVG that is both what you see and what you download — a
 *  separate "export" renderer would drift from the preview sooner or later.
 *  The photo is inlined as a data URL first, because a canvas that has drawn
 *  a cross-origin image refuses to hand back a PNG.
 */
const WIDTH = 640;
const HEIGHT = 1000;

/** The masthead mark, same file the site header uses. */
const LOGO_URL = "/logo-nnt.png";
const LOGO_ASPECT = 900 / 301;

const ROLE_LABEL: Record<string, { hi: string; en: string }> = {
  administrator: { hi: "एडमिनिस्ट्रेटर", en: "Administrator" },
  admin: { hi: "एडमिन", en: "Admin" },
  reporter: { hi: "रिपोर्टर", en: "Reporter" },
};

/** Fetches an image and turns it into a data URL. Returns null if the host
 *  will not allow it — the card then falls back to initials. */
async function inlineImage(url?: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (blob.size > 2 * 1024 * 1024) return null;
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSvg({
  user,
  brand,
  photo,
  logo,
  roleLabel,
  issued,
}: {
  user: AdminUser;
  brand: string;
  photo: string | null;
  logo: string | null;
  roleLabel: string;
  issued: string;
}): string {
  const initial = escapeXml(user.name.slice(0, 1).toUpperCase());

  // No bands, no blocks of colour: the logo sits on plain white and is the
  // only strong thing on the card. Everything else is ink and hairlines, the
  // way a printed press card reads.
  const INK = "#111827";
  const MUTED = "#8a94a6";
  const HAIRLINE = "#e5e7eb";
  const PANEL = "#f7f8fa";
  // The newsroom's red, used only where a press card earns it: the PRESS
  // line, the rule under the mark, the emergency bar and the bottom edge.
  // Nothing sits behind the logo.
  const PRESS = "#d81e2c";

  const row = (label: string, value: string, x: number, y: number) => `
    <text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="17" fill="${MUTED}"
      letter-spacing="0.1em">${escapeXml(label.toUpperCase())}</text>
    <text x="${x}" y="${y + 31}" font-family="Inter, Arial, sans-serif" font-size="24"
      font-weight="600" fill="${INK}">${escapeXml(value || "—")}</text>`;

  const photoBlock = photo
    ? `<clipPath id="pic"><rect x="238" y="288" width="164" height="196" rx="14"/></clipPath>
       <image href="${photo}" x="238" y="288" width="164" height="196"
         preserveAspectRatio="xMidYMid slice" clip-path="url(#pic)"/>
       <rect x="238" y="288" width="164" height="196" rx="14" fill="none"
         stroke="${HAIRLINE}" stroke-width="2"/>`
    : `<rect x="238" y="288" width="164" height="196" rx="14" fill="${PANEL}"
         stroke="${HAIRLINE}" stroke-width="2"/>
       <text x="320" y="416" text-anchor="middle" font-family="Inter, Arial, sans-serif"
         font-size="78" font-weight="700" fill="#c3cad5">${initial}</text>`;

  // Bigger, and straight onto the card — nothing behind it.
  const logoHeight = 78;
  const logoWidth = Math.round(logoHeight * LOGO_ASPECT);
  const logoBlock = logo
    ? `<image href="${logo}" x="${(WIDTH - logoWidth) / 2}" y="48" width="${logoWidth}"
         height="${logoHeight}" preserveAspectRatio="xMidYMid meet"/>`
    : `<text x="320" y="106" text-anchor="middle" font-family="Inter, Arial, sans-serif"
         font-size="34" font-weight="700" fill="${INK}">${escapeXml(brand)}</text>`;

  // Who to call if something happens in the field — the reason a press card
  // is worth carrying at all.
  const contact = user.emergencyContact;
  const contactName = [contact?.name, contact?.relation].filter(Boolean).join(" · ");
  const emergencyBlock = `
    <rect x="48" y="818" width="544" height="112" rx="12" fill="${PANEL}"/>
    <rect x="48" y="818" width="6" height="112" rx="3" fill="${PRESS}"/>
    <text x="78" y="854" font-family="Inter, Arial, sans-serif" font-size="16" fill="${MUTED}"
      font-weight="700" letter-spacing="0.12em">EMERGENCY CONTACT</text>
    <text x="78" y="886" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="600"
      fill="${INK}">${escapeXml(contactName || "—")}</text>
    <text x="78" y="914" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="700"
      fill="${INK}" letter-spacing="0.02em">${escapeXml(contact?.phone || "—")}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect x="1" y="1" width="${WIDTH - 2}" height="${HEIGHT - 2}" rx="28" fill="#ffffff"
    stroke="${HAIRLINE}" stroke-width="2"/>
  ${logoBlock}
  <rect x="276" y="146" width="88" height="4" rx="2" fill="${PRESS}"/>
  <text x="320" y="190" text-anchor="middle" font-family="Inter, Arial, sans-serif"
    font-size="15" font-weight="700" fill="${PRESS}"
    letter-spacing="0.3em">PRESS IDENTITY CARD</text>
  <line x1="48" y1="224" x2="592" y2="224" stroke="${HAIRLINE}" stroke-width="2"/>
  ${photoBlock}
  <text x="320" y="548" text-anchor="middle" font-family="Inter, Arial, sans-serif"
    font-size="36" font-weight="700" fill="${INK}">${escapeXml(user.name)}</text>
  <text x="320" y="582" text-anchor="middle" font-family="Inter, Arial, sans-serif"
    font-size="18" font-weight="700" fill="${PRESS}"
    letter-spacing="0.16em">${escapeXml(roleLabel.toUpperCase())}</text>
  <text x="320" y="614" text-anchor="middle" font-family="Inter, Arial, sans-serif"
    font-size="16" fill="${MUTED}">${escapeXml(brand)}</text>
  <line x1="48" y1="652" x2="592" y2="652" stroke="${HAIRLINE}" stroke-width="2"/>
  ${row("Employee ID", user.employeeId ?? "", 48, 694)}
  ${row("Phone", user.phone ?? "", 330, 694)}
  ${row("Blood group", user.bloodGroup ?? "", 48, 770)}
  ${row("Valid from", issued, 330, 770)}
  ${emergencyBlock}
  <text x="48" y="966" font-family="Inter, Arial, sans-serif" font-size="14" fill="${MUTED}">
    ${escapeXml(user.email)}</text>
  <text x="592" y="966" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="14"
    fill="${MUTED}">${escapeXml("Property of " + brand)}</text>
  <clipPath id="card"><rect x="1" y="1" width="${WIDTH - 2}" height="${HEIGHT - 2}" rx="28"/></clipPath>
  <rect x="0" y="${HEIGHT - 10}" width="${WIDTH}" height="10" fill="${PRESS}" clip-path="url(#card)"/>
</svg>`;
}

export function DigitalIdCard({ user }: { user: AdminUser }) {
  const { t, language } = useAdminLang();
  const [photo, setPhoto] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const brand = siteConfig.name;
  const roleLabel = t(
    ROLE_LABEL[user.role]?.hi ?? user.role,
    ROLE_LABEL[user.role]?.en ?? user.role,
  );
  const issued = new Date(user.joinedAt).toLocaleDateString(
    language === "en" ? "en-IN" : "hi-IN",
    { day: "numeric", month: "short", year: "numeric" },
  );

  useEffect(() => {
    let active = true;
    void inlineImage(user.avatarUrl).then((data) => {
      if (active) setPhoto(data);
    });
    return () => {
      active = false;
    };
  }, [user.avatarUrl]);

  // The masthead mark, inlined for the same reason as the photo: a canvas
  // that has drawn a linked image will not hand back a PNG.
  useEffect(() => {
    let active = true;
    void inlineImage(LOGO_URL).then((data) => {
      if (active) setLogo(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const svg = buildSvg({ user, brand, photo, logo, roleLabel, issued });

  const download = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const image = new Image();
      // The SVG already carries the photo inline, so nothing here is
      // cross-origin and the canvas stays exportable.
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("render failed"));
        image.src = url;
      });

      // Twice the drawn size, so the card is crisp when printed or zoomed.
      const canvas = document.createElement("canvas");
      canvas.width = WIDTH * 2;
      canvas.height = HEIGHT * 2;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("no canvas");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${(user.employeeId || user.name).replace(/\s+/g, "-")}-id-card.png`;
      link.click();
      toast.success(t("आईडी कार्ड डाउनलोड हो गया", "ID card downloaded"));
    } catch {
      toast.error(t("कार्ड नहीं बन पाया", "Could not build the card"));
    } finally {
      setDownloading(false);
    }
  }, [svg, user.employeeId, user.name, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2 text-base font-bold">
          <IconId className="size-4" /> {t("कंपनी डिजिटल आईडी", "Company digital ID")}
        </CardTitle>
        <CardDescription>
          {t(
            "आपका पहचान पत्र — इसे डाउनलोड करके फ़ील्ड पर दिखा सकते हैं।",
            "Your identity card — download it to carry on assignment.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div
          className="mx-auto w-full max-w-[280px] overflow-hidden rounded-xl border border-border shadow-sm [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
          // The same SVG that gets downloaded, so the preview cannot lie.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <Button variant="outline" size="sm" disabled={downloading} onClick={() => void download()}>
          <IconDownload className="size-4" />
          {downloading ? t("बन रहा है…", "Preparing…") : t("PNG डाउनलोड करें", "Download PNG")}
        </Button>
        {!user.employeeId ? (
          <p className="text-[11px] text-text-muted">
            {t(
              "कर्मचारी आईडी अभी नहीं है — एडमिनिस्ट्रेटर से कहिए।",
              "No employee ID yet — ask an administrator.",
            )}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
