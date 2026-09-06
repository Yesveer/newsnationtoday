import type { Metadata } from "next";
import { Hind, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { Masthead } from "@/components/layout/masthead";
import { HeroSection } from "@/components/home/hero-section";
import { TrendingChips } from "@/components/home/trending-chips";
import { getHeroArticles } from "@/lib/data/get-articles";
import { CategorySidebar } from "@/components/layout/category-sidebar";
import { AdSlot } from "@/components/layout/sidebar-widgets/ad-slot";
import { TrendingWidget } from "@/components/layout/sidebar-widgets/trending-widget";
import { VideoWidget } from "@/components/layout/sidebar-widgets/video-widget";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const heroArticles = await getHeroArticles();

  return (
    <html lang="hi" suppressHydrationWarning className={`${hind.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
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
              <aside className="hidden flex-col gap-6 xl:flex">
                <AdSlot />
                <TrendingWidget />
                <VideoWidget />
                <AdSlot />
              </aside>
            </div>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
