import { apiFetch, apiUpload, setAccessToken } from "@/lib/api/client";
import { notifySessionChanged } from "@/lib/api/session-flag";
import type {
  AdminUser,
  AuditLog,
  NewsItem,
  NewsStatus,
  UserAddress,
  UserEmergencyContact,
  UserIdentity,
  UserRole,
  UserStatus,
} from "@/types/admin";
import type { Permission } from "@/lib/admin/permissions";

/** The user shape the Go API returns. */
interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  desk?: string;
  phone?: string;
  avatarUrl?: string;
  storiesCount: number;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;

  altPhone?: string;
  reportingArea?: string;
  employeeId?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  address?: UserAddress;
  identity?: UserIdentity;
  emergencyContact?: UserEmergencyContact;
  identityMasked?: boolean;
}

/** The portal's own `AdminUser` calls it `joinedAt`; the API calls it
 *  `createdAt`. One mapping here keeps every component unchanged. */
export function toAdminUser(user: ApiUser): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    desk: user.desk,
    phone: user.phone,
    joinedAt: user.createdAt,
    lastActiveAt: user.lastActiveAt ?? user.createdAt,
    storiesCount: user.storiesCount,

    altPhone: user.altPhone,
    reportingArea: user.reportingArea,
    employeeId: user.employeeId,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    bio: user.bio,
    address: user.address,
    identity: user.identity,
    emergencyContact: user.emergencyContact,
    identityMasked: user.identityMasked,
  };
}

/** The optional half of a profile — everything an administrator or the person
 *  can fill in beyond name, email and role. */
export interface UserProfileInput {
  phone?: string;
  altPhone?: string;
  desk?: string;
  reportingArea?: string;
  employeeId?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  avatarUrl?: string;
  address?: UserAddress;
  identity?: UserIdentity;
  emergencyContact?: UserEmergencyContact;
}

interface SessionResponse {
  user: ApiUser;
  permissions: Permission[];
  accessToken: string;
}

export interface Session {
  user: AdminUser;
  permissions: Permission[];
}

export async function login(email: string, password: string): Promise<Session> {
  const data = await apiFetch<SessionResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  setAccessToken(data.accessToken);
  // The API just set the readable session cookie — tell any open menu.
  notifySessionChanged();
  return { user: toAdminUser(data.user), permissions: data.permissions };
}

export async function me(): Promise<Session> {
  const data = await apiFetch<{ user: ApiUser; permissions: Permission[] }>("/auth/me");
  return { user: toAdminUser(data.user), permissions: data.permissions };
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
    notifySessionChanged();
  }
}

export interface ProfileInput {
  name?: string;
  desk?: string;
  phone?: string;
  avatarUrl?: string;
}

/** Self-service profile edit — name, desk, phone and photo only. */
export async function updateProfile(input: ProfileInput): Promise<Session> {
  const data = await apiFetch<{ user: ApiUser; permissions: Permission[] }>("/auth/me", {
    method: "PATCH",
    body: input,
  });
  return { user: toAdminUser(data.user), permissions: data.permissions };
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}

export async function acceptInvite(token: string, password: string) {
  return apiFetch<{ message: string }>("/auth/accept-invite", {
    method: "POST",
    auth: false,
    body: { token, password },
  });
}

// ---- users (administrator only) -------------------------------------------

export interface ListUsersParams {
  search?: string;
  role?: UserRole | "";
  status?: UserStatus | "";
  page?: number;
  limit?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export async function listUsers(params: ListUsersParams = {}): Promise<Paged<AdminUser>> {
  const data = await apiFetch<{
    users: ApiUser[];
    meta: { total: number; page: number; limit: number };
  }>(`/users${toQuery({ ...params })}`);

  return {
    items: data.users.map(toAdminUser),
    total: data.meta.total,
    page: data.meta.page,
    limit: data.meta.limit,
  };
}

export interface CreateUserInput extends UserProfileInput {
  name: string;
  email: string;
  role: UserRole;
  /** Left empty, the API creates an invited account and returns an invite token. */
  password?: string;
}

export interface CreateUserResult {
  user: AdminUser;
  inviteToken?: string;
  inviteExpiresAt?: string;
  /** True when the API also emailed the invite or the password. */
  emailSent?: boolean;
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  const data = await apiFetch<{
    user: ApiUser;
    inviteToken?: string;
    inviteExpiresAt?: string;
    emailSent?: boolean;
  }>("/users", { method: "POST", body: input });

  return {
    user: toAdminUser(data.user),
    inviteToken: data.inviteToken,
    inviteExpiresAt: data.inviteExpiresAt,
    emailSent: data.emailSent,
  };
}

/** Full profile of one person — an administrator sees the real ID numbers here. */
export async function getUser(id: string): Promise<AdminUser> {
  const data = await apiFetch<{ user: ApiUser }>(`/users/${id}`);
  return toAdminUser(data.user);
}

export async function updateUser(id: string, input: UserProfileInput & { name?: string; email?: string }) {
  const data = await apiFetch<{ user: ApiUser }>(`/users/${id}`, { method: "PATCH", body: input });
  return toAdminUser(data.user);
}

export async function updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
  const data = await apiFetch<{ user: ApiUser }>(`/users/${id}/role`, { method: "PATCH", body: { role } });
  return toAdminUser(data.user);
}

export async function updateUserStatus(id: string, status: "active" | "suspended"): Promise<AdminUser> {
  const data = await apiFetch<{ user: ApiUser }>(`/users/${id}/status`, { method: "PATCH", body: { status } });
  return toAdminUser(data.user);
}

export async function resetUserPassword(id: string) {
  return apiFetch<{ message: string; temporaryPassword: string; emailSent?: boolean }>(
    `/users/${id}/reset-password`,
    { method: "POST" },
  );
}

export async function deleteUser(id: string) {
  return apiFetch<{ message: string }>(`/users/${id}`, { method: "DELETE" });
}

// ---- audit logs (administrator only) --------------------------------------

export interface ListAuditParams {
  search?: string;
  action?: string;
  severity?: string;
  page?: number;
  limit?: number;
}

export async function listAuditLogs(params: ListAuditParams = {}): Promise<Paged<AuditLog>> {
  const data = await apiFetch<{
    logs: AuditLog[];
    meta: { total: number; page: number; limit: number };
  }>(`/audit-logs${toQuery({ ...params })}`);

  return { items: data.logs, total: data.meta.total, page: data.meta.page, limit: data.meta.limit };
}

// ---- news -----------------------------------------------------------------

/** The newsroom types live in `@/types/admin`; the API speaks the same shape,
 *  so there is one definition, not two that drift apart. */
export type { NewsItem, NewsStatus } from "@/types/admin";

export interface NewsInput {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  coverImageAlt?: string;
  categorySlug: string;
  topic?: string;
  type: "article" | "video" | "photo";
  tags: string[];
  isBreaking: boolean;
  isFeatured: boolean;
  scheduledFor?: string;
  seo: { metaTitle?: string; metaDescription?: string; keywords?: string };
}

export interface ListNewsParams {
  search?: string;
  status?: NewsStatus | "";
  category?: string;
  type?: string;
  author?: string;
  page?: number;
  limit?: number;
}

export async function listNews(params: ListNewsParams = {}): Promise<Paged<NewsItem>> {
  const data = await apiFetch<{ news: NewsItem[]; meta: { total: number; page: number; limit: number } }>(
    `/news${toQuery({ ...params })}`,
  );
  return { items: data.news ?? [], total: data.meta.total, page: data.meta.page, limit: data.meta.limit };
}

export async function getNews(id: string): Promise<NewsItem> {
  const data = await apiFetch<{ news: NewsItem }>(`/news/${id}`);
  return data.news;
}

export async function createNews(input: NewsInput): Promise<NewsItem> {
  const data = await apiFetch<{ news: NewsItem }>("/news", { method: "POST", body: input });
  return data.news;
}

export async function updateNews(id: string, input: NewsInput): Promise<NewsItem> {
  const data = await apiFetch<{ news: NewsItem }>(`/news/${id}`, { method: "PATCH", body: input });
  return data.news;
}

/** The whole editorial workflow: submit, publish, reject, ask for changes. */
export async function changeNewsStatus(id: string, status: NewsStatus, note?: string): Promise<NewsItem> {
  const data = await apiFetch<{ news: NewsItem }>(`/news/${id}/status`, {
    method: "POST",
    body: { status, note: note ?? "" },
  });
  return data.news;
}

export async function addNewsComment(id: string, body: string): Promise<NewsItem> {
  const data = await apiFetch<{ news: NewsItem }>(`/news/${id}/comments`, { method: "POST", body: { body } });
  return data.news;
}

/** An admin deletes; a reporter's call files a request instead. */
export async function deleteNews(id: string, reason?: string) {
  return apiFetch<{ message?: string; news?: NewsItem }>(`/news/${id}`, {
    method: "DELETE",
    body: { reason: reason ?? "" },
  });
}

export async function listDeleteRequests(): Promise<NewsItem[]> {
  const data = await apiFetch<{ requests: NewsItem[] }>("/news/delete-requests");
  return data.requests ?? [];
}

export async function resolveDeleteRequest(id: string, approve: boolean) {
  return apiFetch<{ message?: string; news?: NewsItem }>(`/news/${id}/delete-request`, {
    method: "POST",
    body: { approve },
  });
}

export interface NewsStats {
  counts: Partial<Record<NewsStatus, number>>;
  totalViews: number;
  viewsByCategory: { category: string; views: number }[];
  activeUsers: number;
  reporters: number;
}

export async function getNewsStats(): Promise<NewsStats> {
  return apiFetch<NewsStats>("/news/stats");
}

// ---- categories -----------------------------------------------------------

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  color: string;
  /** Custom logo: a pasted link, or a small uploaded image as a data URL. */
  iconUrl?: string;
  order: number;
  isNew: boolean;
  visible: boolean;
}

export async function listCategories(): Promise<AdminCategory[]> {
  const data = await apiFetch<{ categories: AdminCategory[] }>("/categories");
  return data.categories ?? [];
}

export async function createCategory(input: Omit<AdminCategory, "id" | "order"> & { order?: number }) {
  const data = await apiFetch<{ category: AdminCategory }>("/categories", { method: "POST", body: input });
  return data.category;
}

export async function updateCategory(id: string, input: Partial<Omit<AdminCategory, "id" | "slug">>) {
  const data = await apiFetch<{ category: AdminCategory }>(`/categories/${id}`, { method: "PATCH", body: input });
  return data.category;
}

export async function deleteCategory(id: string) {
  return apiFetch<{ message: string }>(`/categories/${id}`, { method: "DELETE" });
}

export async function reorderCategories(ids: string[]): Promise<AdminCategory[]> {
  const data = await apiFetch<{ categories: AdminCategory[] }>("/categories/reorder", {
    method: "POST",
    body: { ids },
  });
  return data.categories ?? [];
}

// ---- topics (the sub-sections inside a category) --------------------------

export interface AdminTopic {
  id: string;
  categorySlug: string;
  slug: string;
  name: string;
  nameEn: string;
  badge?: string;
  color: string;
  iconUrl?: string;
  order: number;
  visible: boolean;
}

/** Topics plus how many stories sit behind each one, in a single call. */
export async function listTopics(
  category?: string,
): Promise<{ topics: AdminTopic[]; counts: Record<string, number> }> {
  const data = await apiFetch<{ topics: AdminTopic[]; counts?: Record<string, number> }>(
    `/topics${toQuery({ category })}`,
  );
  return { topics: data.topics ?? [], counts: data.counts ?? {} };
}

export async function createTopic(input: Omit<AdminTopic, "id" | "order"> & { order?: number }) {
  const data = await apiFetch<{ topic: AdminTopic }>("/topics", { method: "POST", body: input });
  return data.topic;
}

export async function updateTopic(id: string, input: Partial<Omit<AdminTopic, "id" | "slug" | "categorySlug">>) {
  const data = await apiFetch<{ topic: AdminTopic }>(`/topics/${id}`, { method: "PATCH", body: input });
  return data.topic;
}

export async function deleteTopic(id: string) {
  return apiFetch<{ message: string }>(`/topics/${id}`, { method: "DELETE" });
}

export async function reorderTopics(category: string, ids: string[]): Promise<AdminTopic[]> {
  const data = await apiFetch<{ topics: AdminTopic[] }>("/topics/reorder", {
    method: "POST",
    body: { category, ids },
  });
  return data.topics ?? [];
}

// ---- site configuration ---------------------------------------------------

export async function getSiteConfig<T>(): Promise<{ config: T; updatedAt?: string; updatedBy?: string }> {
  return apiFetch<{ config: T; updatedAt?: string; updatedBy?: string }>("/config");
}

export async function saveSiteConfig<T>(config: T): Promise<{ config: T; updatedAt: string }> {
  return apiFetch<{ config: T; updatedAt: string }>("/config", { method: "PUT", body: { config } });
}

export async function resetSiteConfig<T>(): Promise<{ config: T }> {
  return apiFetch<{ config: T }>("/config/reset", { method: "POST" });
}

// ---- email (SMTP) ---------------------------------------------------------

export interface NotifySettings {
  userInvited: boolean;
  passwordReset: boolean;
  storySubmitted: boolean;
  storyPublished: boolean;
  storyChanges: boolean;
  storyRejected: boolean;
  deleteRequest: boolean;
  accountStatus: boolean;
}

export interface SmtpSettings {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  /** Write-only: the API never returns the stored password. */
  password?: string;
  encryption: "none" | "starttls" | "tls";
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  portalUrl: string;
  notify: NotifySettings;
  hasPassword?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const data = await apiFetch<{ smtp: SmtpSettings }>("/settings/smtp");
  return data.smtp;
}

/** The exact fields the API accepts. Read-only extras a GET sends back
 *  (`hasPassword`, `updatedAt`, `updatedBy`) are dropped — the API rejects
 *  unknown fields. An empty password means "keep the stored one". */
function smtpBody(settings: SmtpSettings) {
  return {
    enabled: settings.enabled,
    host: settings.host ?? "",
    port: settings.port,
    username: settings.username ?? "",
    password: settings.password ?? "",
    encryption: settings.encryption,
    fromName: settings.fromName ?? "",
    fromEmail: settings.fromEmail ?? "",
    replyTo: settings.replyTo ?? "",
    portalUrl: settings.portalUrl ?? "",
    notify: settings.notify,
  };
}

export async function saveSmtpSettings(settings: SmtpSettings): Promise<SmtpSettings> {
  const data = await apiFetch<{ smtp: SmtpSettings }>("/settings/smtp", {
    method: "PUT",
    body: smtpBody(settings),
  });
  return data.smtp;
}

/** Sends one email with the settings as typed, before they are saved. */
export async function sendTestEmail(settings: SmtpSettings, to: string) {
  return apiFetch<{ message: string }>("/settings/smtp/test", {
    method: "POST",
    body: { ...smtpBody(settings), to },
  });
}

// ---- media library and file storage ---------------------------------------

export type AssetKind = "portal" | "news";

export interface MediaAsset {
  id: string;
  kind: AssetKind;
  name: string;
  url: string;
  publicId?: string;
  provider: "none" | "cloudinary";
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
  uploadedByName: string;
  createdAt: string;
}

export interface MediaUsage {
  [kind: string]: { files: number; bytes: number };
}

export async function listMedia(params: { kind?: AssetKind; search?: string; type?: string; limit?: number } = {}) {
  const data = await apiFetch<{
    assets: MediaAsset[];
    usage: MediaUsage;
    meta: { total: number; page: number; limit: number };
  }>(`/media${toQuery({ ...params })}`);
  return { items: data.assets ?? [], usage: data.usage ?? {}, total: data.meta.total };
}

/** Uploads one file. `kind` decides which storage profile it lands in:
 *  "portal" for logos and icons, "news" for story photos and video. */
export async function uploadMedia(file: File, kind: AssetKind = "portal"): Promise<MediaAsset> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  const data = await apiUpload<{ asset: MediaAsset }>("/media", form);
  return data.asset;
}

export async function deleteMedia(id: string) {
  return apiFetch<{ message: string }>(`/media/${id}`, { method: "DELETE" });
}

export interface StorageProfile {
  provider: "none" | "cloudinary";
  folder: string;
  cloudName: string;
  apiKey: string;
  /** Write-only: the API never returns the stored secret. */
  apiSecret?: string;
  maxUploadMb: number;
  hasSecret?: boolean;
}

export interface StorageSettings {
  portal: StorageProfile;
  news: StorageProfile;
}

export async function getStorageSettings(): Promise<{ storage: StorageSettings; usage: MediaUsage }> {
  return apiFetch<{ storage: StorageSettings; usage: MediaUsage }>("/settings/storage");
}

/** The exact fields the API accepts for a profile.
 *
 *  Spelled out rather than spread: the API rejects unknown fields, and what we
 *  hold in state carries read-only extras like `hasSecret` that came back from
 *  a GET. An empty `apiSecret` means "keep the one already stored". */
function storageProfileBody(profile: StorageProfile) {
  return {
    provider: profile.provider,
    folder: profile.folder ?? "",
    cloudName: profile.cloudName ?? "",
    apiKey: profile.apiKey ?? "",
    apiSecret: profile.apiSecret ?? "",
    maxUploadMb: profile.maxUploadMb,
  };
}

export async function saveStorageSettings(settings: StorageSettings): Promise<StorageSettings> {
  const data = await apiFetch<{ storage: StorageSettings }>("/settings/storage", {
    method: "PUT",
    body: {
      portal: storageProfileBody(settings.portal),
      news: storageProfileBody(settings.news),
    },
  });
  return data.storage;
}

/** Verifies one profile's credentials without uploading anything. */
export async function testStorage(kind: AssetKind, profile: StorageProfile) {
  return apiFetch<{ message: string }>("/settings/storage/test", {
    method: "POST",
    body: { kind, ...storageProfileBody(profile) },
  });
}
