import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Hind, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { translateBootstrapScript } from "@/lib/i18n/google-translate";
import "./globals.css";

const hind = Hind({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
};

// `viewportFit: cover` is what makes env(safe-area-inset-bottom) non-zero on
// notched iPhones, so the tab bar clears the home indicator.
export const viewport: Viewport = {
  viewportFit: "cover",
};

/** Only the shared shell lives here: fonts, theme, language, toasts. The
 *  reader-facing chrome (masthead, hero, rails) is in `(site)/layout.tsx`
 *  and the newsroom chrome in `admin/layout.tsx`, so the two never mix. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" suppressHydrationWarning className={`${hind.variable} ${inter.variable}`}>
      <body className="antialiased">
        {/* Runs before hydration: puts the reader's stored language on Google's
            cookie so a page arrives already translated instead of flipping.
            Next hoists a beforeInteractive script into the document head. */}
        <Script id="translate-bootstrap" strategy="beforeInteractive">
          {translateBootstrapScript}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            {children}
            <Toaster position="top-right" richColors />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
