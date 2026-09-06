export type Language = "hi" | "en";

export const languages: { value: Language; label: string }[] = [
  { value: "hi", label: "हिंदी" },
  { value: "en", label: "English" },
];

/**
 * UI-chrome strings only (nav, account menu, sidebar, footer). Article content
 * itself stays in Hindi — the newsroom writes in Hindi, so switching language
 * here changes the interface, not the journalism.
 */
export const dictionary = {
  hi: {
    "nav.home": "होम",
    "nav.search": "सर्च",
    "nav.videos": "वीडियो",
    "nav.watch": "वॉच",
    "menu.account": "अकाउंट",
    "menu.guest": "आप लॉगिन नहीं हैं",
    "menu.login": "लॉगिन करें",
    "menu.theme": "थीम",
    "menu.theme.light": "लाइट",
    "menu.theme.dark": "डार्क",
    "menu.theme.system": "सिस्टम",
    "menu.language": "भाषा",
    "menu.faq": "सामान्य प्रश्न",
    "menu.feedback": "फ़ीडबैक",
    "sidebar.categories": "श्रेणियां",
    "sidebar.follow": "हमें फ़ॉलो करें",
    "label.trending": "ट्रेंडिंग",
    "label.breaking": "ब्रेकिंग",
    "label.live": "लाइव",
    "hero.topStories": "बड़ी खबरें",
    "hero.slide": "स्लाइड",
    "footer.about": "हमारे बारे में",
    "footer.contact": "संपर्क करें",
    "footer.advertise": "विज्ञापन दें",
    "footer.privacy": "गोपनीयता नीति",
    "footer.terms": "नियम व शर्तें",
    "footer.rights": "सर्वाधिकार सुरक्षित।",
    "drawer.close": "मेनू बंद करें",
    "drawer.open": "मेनू खोलें",
    "a11y.search": "खोजें",
  },
  en: {
    "nav.home": "Home",
    "nav.search": "Search",
    "nav.videos": "Videos",
    "nav.watch": "Watch",
    "menu.account": "Account",
    "menu.guest": "You are not signed in",
    "menu.login": "Login",
    "menu.theme": "Theme",
    "menu.theme.light": "Light",
    "menu.theme.dark": "Dark",
    "menu.theme.system": "System",
    "menu.language": "Language",
    "menu.faq": "FAQ",
    "menu.feedback": "Feedback",
    "sidebar.categories": "Categories",
    "sidebar.follow": "Follow us",
    "label.trending": "Trending",
    "label.breaking": "Breaking",
    "label.live": "LIVE",
    "hero.topStories": "Top Stories",
    "hero.slide": "Slide",
    "footer.about": "About us",
    "footer.contact": "Contact",
    "footer.advertise": "Advertise",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms & Conditions",
    "footer.rights": "All rights reserved.",
    "drawer.close": "Close menu",
    "drawer.open": "Open menu",
    "a11y.search": "Search",
  },
} as const;

export type TranslationKey = keyof (typeof dictionary)["hi"];
