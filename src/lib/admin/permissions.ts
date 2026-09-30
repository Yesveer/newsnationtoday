import type { UserRole } from "@/types/admin";

/** Everything the portal can gate on. Keep this list flat — the Go backend
 *  will hand back the same strings per session, so the UI needs no changes. */
export type Permission =
  | "news.create"
  | "news.edit.own"
  | "news.edit.any"
  | "news.review"
  | "news.publish"
  | "news.delete.request"
  | "news.delete"
  | "media.upload"
  | "media.delete"
  | "categories.manage"
  | "appearance.manage"
  | "settings.manage"
  | "users.manage"
  | "audit.view";

const reporterPermissions: Permission[] = [
  "news.create",
  "news.edit.own",
  "news.delete.request",
  "media.upload",
];

const adminPermissions: Permission[] = [
  ...reporterPermissions,
  "news.edit.any",
  "news.review",
  "news.publish",
  "news.delete",
  "media.delete",
  "categories.manage",
  "appearance.manage",
  "settings.manage",
];

const administratorPermissions: Permission[] = [
  ...adminPermissions,
  "users.manage",
  "audit.view",
];

export const rolePermissions: Record<UserRole, Permission[]> = {
  reporter: reporterPermissions,
  admin: adminPermissions,
  administrator: administratorPermissions,
};

export function can(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function canAny(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => can(role, permission));
}

export const roleLabels: Record<
  UserRole,
  { name: string; nameEn: string; description: string; descriptionEn: string }
> = {
  administrator: {
    name: "एडमिनिस्ट्रेटर",
    nameEn: "Administrator",
    description: "यूज़र मैनेजमेंट और ऑडिट लॉग समेत पूरा नियंत्रण",
    descriptionEn: "Full control, including user management and audit logs",
  },
  admin: {
    name: "एडमिन",
    nameEn: "Admin",
    description: "न्यूज़ रिव्यू, पब्लिश और पूरी वेबसाइट का कस्टमाइज़ेशन",
    descriptionEn: "Review and publish news, and customise the whole website",
  },
  reporter: {
    name: "रिपोर्टर",
    nameEn: "Reporter",
    description: "खबर और वीडियो जोड़ें — रिव्यू और पब्लिश एडमिन करेगा",
    descriptionEn: "Add stories and videos — an admin reviews and publishes",
  },
};
