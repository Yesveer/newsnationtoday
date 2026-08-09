export interface Author {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  role?: "reporter" | "editor" | "contributor";
  createdAt: string;
  updatedAt: string;
}
