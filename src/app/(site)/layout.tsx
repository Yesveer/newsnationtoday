import { Masthead } from "@/components/layout/masthead";
import { HeroSection } from "@/components/home/hero-section";
import { TrendingChips } from "@/components/home/trending-chips";
import { getHeroArticles } from "@/lib/data/get-articles";
import { getCategories } from "@/lib/data/get-categories";
import { getSiteSettings } from "@/lib/data/get-site-config";
import { CategorySidebar } from "@/components/layout/category-sidebar";
import { TrendingWidget } from "@/components/layout/sidebar-widgets/trending-widget";
import { VideoWidget } from "@/components/layout/sidebar-widgets/video-widget";
import { RailFooter } from "@/components/layout/sidebar-widgets/rail-footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { Footer } from "@/components/layout/footer";
import { TranslateBootstrap } from "@/components/i18n/translate-bootstrap";
import { SiteSettingsProvider } from "@/components/site/site-settings-provider";
import { ThemeTokens } from "@/components/site/theme-tokens";
import { cn } from "@/lib/cn";

/** Reader-facing chrome. Everything under `(site)` gets it; `/admin` does not.
 *
 *  What renders here — the hero, the rail widgets, the dock — is whatever the
 *  newsroom switched on in the admin portal's Appearance screen. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, heroArticles, categories] = await Promise.all([
    getSiteSettings(),
    getHeroArticles(),
    getCategories(),
  ]);

  const { hero, homepage, rail, mobileDock } = settings;
  const showRail = rail.trendingWidget || rail.videoWidget || rail.footerInRail;

  return (
    <SiteSettingsProvider settings={settings}>
      <ThemeTokens settings={settings} />
      <div
        className={cn(
          "flex min-h-screen flex-col",
          mobileDock.enabled && "pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0",
        )}
      >
        <Masthead />
        {hero.enabled ? <HeroSection articles={heroArticles.slice(0, hero.slideCount)} /> : null}
        <div
          className={cn(
            "mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8",
            showRail && "xl:grid-cols-[260px_minmax(0,1fr)_300px]",
          )}
        >
          <CategorySidebar className="hidden lg:block" categories={categories} />
          <main className="min-w-0">
            {homepage.trendingChips ? <TrendingChips /> : null}
            {children}
          </main>
          {showRail ? (
            <aside className="hidden xl:block">
              <div className="sticky top-16 flex flex-col gap-5">
                {rail.trendingWidget ? <TrendingWidget /> : null}
                {rail.videoWidget ? <VideoWidget /> : null}
                {rail.footerInRail ? <RailFooter /> : null}
              </div>
            </aside>
          ) : null}
        </div>
        <Footer className={cn(rail.footerInRail && "xl:hidden")} />
        {mobileDock.enabled ? <MobileTabBar /> : null}
        <TranslateBootstrap />
      </div>
    </SiteSettingsProvider>
  );
}
