export interface Category {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  color?: string;
  /** Custom logo set in the admin portal — a link or an uploaded image. */
  iconUrl?: string;
  order: number;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}
