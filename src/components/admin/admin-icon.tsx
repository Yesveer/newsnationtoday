import {
  IconAlertTriangle,
  IconCategory,
  IconChecklist,
  IconDashboard,
  IconFileText,
  IconGavel,
  IconHistory,
  IconPalette,
  IconPhoto,
  IconPlus,
  IconSettings,
  IconSitemap,
  IconUsers,
  IconVideo,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

type IconComponent = ComponentType<{ className?: string; stroke?: number }>;

const icons: Record<string, IconComponent> = {
  dashboard: IconDashboard,
  news: IconFileText,
  plus: IconPlus,
  review: IconChecklist,
  video: IconVideo,
  photo: IconPhoto,
  palette: IconPalette,
  category: IconCategory,
  topics: IconSitemap,
  settings: IconSettings,
  approval: IconGavel,
  users: IconUsers,
  audit: IconHistory,
};

export function AdminIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? IconAlertTriangle;
  return <Icon className={className} stroke={1.7} />;
}
