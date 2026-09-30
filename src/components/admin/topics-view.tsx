"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { TopicIconBadge } from "@/components/admin/topic-icon-badge";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { categoriesConfig } from "@/config/categories.config";
import { categoryTopics } from "@/config/topics.config";

/** The sub-topic hubs behind राज्य / विदेश / खेल and every other category. */
export function TopicsView({ counts }: { counts: Record<string, number> }) {
  const { t } = useAdminLang();
  const [category, setCategory] = useState("rajya");
  const [query, setQuery] = useState("");

  const hub = categoryTopics[category];
  const topics = (hub?.topics ?? []).filter((topic) =>
    `${topic.name} ${topic.nameEn} ${topic.slug}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("टॉपिक हब", "Topic hubs")}
        description={t(
          "हर कैटेगरी के अंदर के सब-सेक्शन — राज्य, देश, खेल वगैरह। वेबसाइट पर इन्हीं के टाइल बनते हैं।",
          "The sub-sections inside each category — states, countries, sports. These become the tiles on the site.",
        )}
        actions={
          <Button
            size="sm"
            onClick={() =>
              toast.success(t("नया टॉपिक जोड़ें", "Add a topic"), {
                description: t("बैकएंड जुड़ते ही यह फ़ॉर्म सेव करेगा।", "This form saves once the backend is connected."),
              })
            }
          >
            <IconPlus className="size-4" /> {t("नया टॉपिक", "New topic")}
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {categoriesConfig.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                {t(item.name, item.nameEn)}
                <span className="ml-1 text-[11px] text-text-muted">
                  ({categoryTopics[item.slug]?.topics.length ?? 0})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("टॉपिक खोजें…", "Search topics…")}
            className="h-9 pl-8"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {topics.map((topic) => (
          <Card key={topic.slug} className="gap-0 py-0">
            <CardContent className="flex items-center gap-3 p-3">
              <TopicIconBadge topic={topic} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-text">{t(topic.name, topic.nameEn)}</p>
                <p className="truncate text-[11.5px] text-text-muted">
                  <code>/{category}/{topic.slug}</code> · {counts[topic.slug] ?? 0} {t("खबरें", "stories")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                aria-label={t("हटाएं", "Remove")}
                onClick={() => toast.success(t("टॉपिक हटाया गया", "Topic removed"))}
              >
                <IconTrash className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {topics.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-text-muted">
            {t("इस कैटेगरी में कोई टॉपिक नहीं मिला।", "No topics in this category yet.")}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
