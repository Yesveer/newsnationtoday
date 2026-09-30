"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/components/admin/admin-session";
import * as api from "@/lib/api/admin";

/** Live counts for the sidebar pills: stories waiting to be reviewed, and
 *  delete requests waiting for a decision. Only fetched for roles that can
 *  actually act on them. */
export function useSidebarBadges(): { review: number; requests: number } {
  const { can } = useAdminSession();
  const [badges, setBadges] = useState({ review: 0, requests: 0 });

  const fetchBadges = useCallback(async () => {
    if (!can("news.review")) return { review: 0, requests: 0 };
    const [queue, requests] = await Promise.all([
      api.listNews({ status: "in_review", limit: 1 }).catch(() => null),
      api.listDeleteRequests().catch(() => null),
    ]);
    return { review: queue?.total ?? 0, requests: requests?.length ?? 0 };
  }, [can]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchBadges();
      if (active) setBadges(result);
    })();
    return () => {
      active = false;
    };
  }, [fetchBadges]);

  return badges;
}
