/** Newsroom roles. The whole portal's visibility and actions derive from these. */
export type UserRole = "administrator" | "admin" | "reporter";

export type UserStatus = "active" | "invited" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  /** Beat / desk the person writes for, e.g. "खेल". */
  desk?: string;
  phone?: string;
  joinedAt: string;
  lastActiveAt: string;
  storiesCount: number;
}

/** Editorial workflow. A reporter can only push a story up to `in_review`;
 *  moving it to `scheduled`/`published` is an admin action. */
export type NewsStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "scheduled"
  | "published"
  | "rejected"
  | "archived";

export type NewsType = "article" | "video" | "photo";

export interface ReviewComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  body: string;
  createdAt: string;
  resolved?: boolean;
}

export interface StatusEvent {
  id: string;
  status: NewsStatus;
  byName: string;
  byRole: UserRole;
  at: string;
  note?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  categorySlug: string;
  topic?: string;
  type: NewsType;
  status: NewsStatus;
  authorId: string;
  authorName: string;
  tags: string[];
  isBreaking: boolean;
  isFeatured: boolean;
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  /** Set when a reporter asks for their own story to be removed. */
  deleteRequested?: boolean;
  deleteReason?: string;
  comments: ReviewComment[];
  history: StatusEvent[];
  seo: { metaTitle?: string; metaDescription?: string; keywords?: string };
}

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLog {
  id: string;
  at: string;
  actorName: string;
  actorRole: UserRole;
  /** Machine-ish verb, e.g. "news.published" — grouped in the UI by prefix. */
  action: string;
  description: string;
  target: string;
  ip: string;
  severity: AuditSeverity;
}

export interface DeletionRequest {
  id: string;
  newsId: string;
  newsTitle: string;
  requestedByName: string;
  requestedByRole: UserRole;
  reason: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  decidedByName?: string;
  decidedAt?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  sizeLabel: string;
  dimensions: string;
  uploadedByName: string;
  uploadedAt: string;
  usedInCount: number;
}
