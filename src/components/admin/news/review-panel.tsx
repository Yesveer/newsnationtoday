"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconCheck, IconMessage2, IconPencil, IconX } from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RoleBadge } from "@/components/admin/role-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import { formatRelative } from "@/lib/admin/format";
import type { NewsItem, ReviewComment } from "@/types/admin";

/** The review conversation between a reporter and the desk. Comments are kept
 *  in local state until the API exists, so the flow can be demoed end-to-end. */
export function ReviewPanel({
  item,
  onChanged,
}: {
  item: NewsItem;
  /** Bubbles the updated story up so the editor above re-renders with it. */
  onChanged?: (item: NewsItem) => void;
}) {
  const { can } = useAdminSession();
  const { t } = useAdminLang();
  const [comments, setComments] = useState<ReviewComment[]>(item.comments);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const report = (error: unknown) =>
    toast.error(
      error instanceof ApiError ? error.message : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
    );

  const addComment = async (body: string) => {
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error(t("पहले कमेंट लिखिए", "Write a comment first"));
      return;
    }
    setBusy(true);
    try {
      const updated = await api.addNewsComment(item.id, trimmed);
      setComments(updated.comments);
      setDraft("");
      toast.success(t("कमेंट जोड़ दिया गया", "Comment added"));
      onChanged?.(updated);
    } catch (error) {
      report(error);
    } finally {
      setBusy(false);
    }
  };

  /** Approve, ask for changes or reject — the note travels with the decision
   *  and shows up in the reporter's comment thread. */
  const decide = async (status: api.NewsStatus, message: string, fallbackNote?: string) => {
    setBusy(true);
    try {
      const updated = await api.changeNewsStatus(item.id, status, draft.trim() || fallbackNote);
      setComments(updated.comments);
      setDraft("");
      toast.success(message);
      onChanged?.(updated);
    } catch (error) {
      report(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <IconMessage2 className="size-4 text-accent" /> {t("रिव्यू और कमेंट", "Review and comments")}
            </CardTitle>
            <CardDescription>
              {t("एडमिन यहीं बदलाव मांगता है, रिपोर्टर यहीं जवाब देता है।", "The desk asks for changes here; the reporter replies here.")}
            </CardDescription>
          </div>
          <StatusBadge status={item.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <ol className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-2.5">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-[11px]">{comment.authorName.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 rounded-lg border border-border bg-surface-muted/50 px-3 py-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12.5px] font-semibold text-text">{comment.authorName}</span>
                  <RoleBadge role={comment.authorRole} size="xs" />
                  <span className="text-[11px] text-text-muted">{formatRelative(comment.createdAt)}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-text">{comment.body}</p>
              </div>
            </li>
          ))}
          {comments.length === 0 ? (
            <li className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-text-muted">
              {t("अभी कोई रिव्यू कमेंट नहीं।", "No review comments yet.")}
            </li>
          ) : null}
        </ol>

        <div className="flex flex-col gap-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder={
              can("news.review")
                ? t("बदलाव या फ़ीडबैक लिखिए…", "Write feedback or the changes you want…")
                : t("एडमिन को जवाब दीजिए…", "Reply to the desk…")
            }
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void addComment(draft)}>
              <IconMessage2 className="size-4" /> {t("कमेंट जोड़ें", "Add comment")}
            </Button>
            {can("news.review") ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  onClick={() => void decide("published", t("खबर अप्रूव और पब्लिश कर दी गई", "Story approved and published"))}
                >
                  <IconCheck className="size-4" /> {t("अप्रूव और पब्लिश", "Approve and publish")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() =>
                    void decide(
                      "changes_requested",
                      t("बदलाव मांगे गए", "Changes requested"),
                      t("कृपया ये बदलाव कीजिए।", "Please make these changes."),
                    )
                  }
                >
                  <IconPencil className="size-4" /> {t("बदलाव मांगें", "Ask for changes")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  disabled={busy}
                  onClick={() =>
                    void decide(
                      "rejected",
                      t("खबर रिजेक्ट कर दी गई", "Story rejected"),
                      t("यह खबर रिजेक्ट की जाती है।", "This story is rejected."),
                    )
                  }
                >
                  <IconX className="size-4" /> {t("रिजेक्ट", "Reject")}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-[12px] font-semibold tracking-wide text-text-muted uppercase">{t("हिस्ट्री", "History")}</p>
          <ol className="relative flex flex-col gap-3 border-l border-border pl-4">
            {item.history.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-accent" />
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={event.status} />
                  <span className="text-[12px] text-text-muted">
                    {event.byName} · {formatRelative(event.at)}
                  </span>
                </div>
                {event.note ? <p className="mt-0.5 text-[12.5px] text-text">{event.note}</p> : null}
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
