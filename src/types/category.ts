export interface Category {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  color?: string;
  order: number;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}
