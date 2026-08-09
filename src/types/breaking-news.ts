export interface BreakingNewsItem {
  id: string;
  text: string;
  href?: string;
  priority: number;
  isActive: boolean;
  startsAt: string;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
