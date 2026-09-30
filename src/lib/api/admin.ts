import { apiFetch, setAccessToken } from "@/lib/api/client";
import { notifySessionChanged } from "@/lib/api/session-flag";
import type { AdminUser, AuditLog, NewsItem, NewsStatus, UserRole, UserStatus } from "@/types/admin";
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
  };
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

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  desk?: string;
  phone?: string;
  /** Left empty, the API creates an invited account and returns an invite token. */
  password?: string;
}

export interface CreateUserResult {
  user: AdminUser;
  inviteToken?: string;
  inviteExpiresAt?: string;
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  const body: Record<string, string> = {
    name: input.name,
    email: input.email,
    role: input.role,
  };
  if (input.desk) body.desk = input.desk;
  if (input.phone) body.phone = input.phone;
  if (input.password) body.password = input.password;

  const data = await apiFetch<{ user: ApiUser; inviteToken?: string; inviteExpiresAt?: string }>("/users", {
    method: "POST",
    body,
  });
  return { user: toAdminUser(data.user), inviteToken: data.inviteToken, inviteExpiresAt: data.inviteExpiresAt };
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
  return apiFetch<{ message: string; temporaryPassword: string }>(`/users/${id}/reset-password`, {
    method: "POST",
  });
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
