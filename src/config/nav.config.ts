export interface UtilityLink {
  key: string;
  label: string;
  href: string;
}

/** Primary utility row in the masthead (icon + label), mapped to icons locally by `key`. */
export const utilityLinks: UtilityLink[] = [
  { key: "home", label: "होम", href: "/" },
  { key: "search", label: "सर्च", href: "/search" },
  { key: "videos", label: "वीडियो", href: "/videos" },
  { key: "watch", label: "वॉच", href: "/watch" },
];

/** Secondary links — shown inline on wide screens, folded into the mobile drawer otherwise. */
export const secondaryLinks: UtilityLink[] = [
  { key: "faq", label: "FAQ", href: "/faq" },
  { key: "feedback", label: "Feedback", href: "/contact" },
];
