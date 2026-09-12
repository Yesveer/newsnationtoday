import type { Metadata, Viewport } from "next";
import { Hind, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { Masthead } from "@/components/layout/masthead";
import { HeroSection } from "@/components/home/hero-section";
import { TrendingChips } from "@/components/home/trending-chips";
import { getHeroArticles } from "@/lib/data/get-articles";
import { CategorySidebar } from "@/components/layout/category-sidebar";
import { TrendingWidget } from "@/components/layout/sidebar-widgets/trending-widget";
import { VideoWidget } from "@/components/layout/sidebar-widgets/video-widget";
import { RailFooter } from "@/components/layout/sidebar-widgets/rail-footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/config/site";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const heroArticles = await getHeroArticles();

  return (
    <html lang="hi" suppressHydrationWarning className={`${hind.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] antialiased lg:pb-0">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <Masthead />
            <HeroSection articles={heroArticles} />
            <div className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
              <CategorySidebar className="hidden lg:block" />
              <main className="min-w-0">
                <TrendingChips />
                {children}
              </main>
              <aside className="hidden xl:block">
                <div className="sticky top-16 flex flex-col gap-5">
                  <TrendingWidget />
                  <VideoWidget />
                  <RailFooter />
                </div>
              </aside>
            </div>
            <Footer className="xl:hidden" />
            <MobileTabBar />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
