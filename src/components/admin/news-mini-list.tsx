"use client";

import Image from "next/image";
import Link from "next/link";
import { IconEye, IconMessageCircle } from "@tabler/icons-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatCompact, formatRelative } from "@/lib/admin/format";
import type { NewsItem } from "@/types/admin";

export function NewsMiniList({ items, emptyText }: { items: NewsItem[]; emptyText: string }) {
  if (items.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-text-muted">{emptyText}</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/admin/news/${item.id}`}
            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/60"
          >
            <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface-muted">
              <Image src={item.coverImageUrl} alt="" fill className="object-cover" sizes="64px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-[13.5px] leading-snug font-medium text-text">
                {item.title}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                <StatusBadge status={item.status} />
                {item.authorName}
                <span>· {formatRelative(item.updatedAt)}</span>
                {item.comments.length > 0 ? (
                  <span className="inline-flex items-center gap-0.5">
                    <IconMessageCircle className="size-3" /> {item.comments.length}
                  </span>
                ) : null}
                {item.status === "published" ? (
                  <span className="inline-flex items-center gap-0.5">
                    <IconEye className="size-3" /> {formatCompact(item.views)}
                  </span>
                ) : null}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
