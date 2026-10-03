import type { Permission } from "@/lib/admin/permissions";

export interface AdminNavItem {
  href: string;
  label: string;
  labelEn: string;
  /** Tabler icon name, resolved in `components/admin/admin-icon.tsx`. */
  icon: string;
  /** Item is hidden unless the signed-in role has at least one of these. */
  permissions?: Permission[];
  badgeKey?: "review" | "requests";
}

export interface AdminNavGroup {
  label: string;
  labelEn: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "न्यूज़रूम",
    labelEn: "Newsroom",
    items: [
      { href: "/admin", label: "डैशबोर्ड", labelEn: "Dashboard", icon: "dashboard" },
      { href: "/admin/news", label: "सभी खबरें", labelEn: "All news", icon: "news" },
      { href: "/admin/news/new", label: "नई खबर", labelEn: "New story", icon: "plus", permissions: ["news.create"] },
      {
        href: "/admin/review",
        label: "रिव्यू क्यू",
        labelEn: "Review queue",
        icon: "review",
        permissions: ["news.review"],
        badgeKey: "review",
      },
      { href: "/admin/videos", label: "वीडियो", labelEn: "Videos", icon: "video" },
      { href: "/admin/media", label: "मीडिया लाइब्रेरी", labelEn: "Media", icon: "photo" },
    ],
  },
  {
    label: "वेबसाइट",
    labelEn: "Website",
    items: [
      { href: "/admin/appearance", label: "अपीयरेंस", labelEn: "Appearance", icon: "palette", permissions: ["appearance.manage"] },
      { href: "/admin/categories", label: "कैटेगरी", labelEn: "Categories", icon: "category", permissions: ["categories.manage"] },
      { href: "/admin/topics", label: "टॉपिक हब", labelEn: "Topic hubs", icon: "topics", permissions: ["categories.manage"] },
      { href: "/admin/settings", label: "साइट सेटिंग्स", labelEn: "Site settings", icon: "settings", permissions: ["settings.manage"] },
    ],
  },
  {
    label: "प्रशासन",
    labelEn: "Administration",
    items: [
      {
        href: "/admin/requests",
        label: "अप्रूवल रिक्वेस्ट",
        labelEn: "Approvals",
        icon: "approval",
        permissions: ["news.delete", "news.review"],
        badgeKey: "requests",
      },
      { href: "/admin/users", label: "यूज़र मैनेजमेंट", labelEn: "Users", icon: "users", permissions: ["users.create.reporter"] },
      { href: "/admin/audit-logs", label: "ऑडिट लॉग", labelEn: "Audit logs", icon: "audit", permissions: ["audit.view"] },
    ],
  },
];
