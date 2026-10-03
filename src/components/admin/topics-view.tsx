"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { TopicIconBadge } from "@/components/admin/topic-icon-badge";
import { CategoryIconPicker } from "@/components/admin/category-icon-picker";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

const emptyDraft = { slug: "", name: "", nameEn: "", badge: "", color: "#FF5C00", iconUrl: "" };

/** The sub-sections inside a category — states under राज्य, countries under
 *  विदेश, sports under खेल. Everything here writes straight to the database,
 *  and the public category page renders exactly this list. */
export function TopicsView() {
  const { t, language } = useAdminLang();
  const [counts, setCounts] = useState<Record<string, number>>({});

  const [categories, setCategories] = useState<api.AdminCategory[]>([]);
  const [category, setCategory] = useState("rajya");
  const [topics, setTopics] = useState<api.AdminTopic[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(
    async (slug: string) => {
      try {
        const [allCategories, listed] = await Promise.all([api.listCategories(), api.listTopics(slug)]);
        return {
          categories: allCategories,
          topics: listed.topics,
          counts: listed.counts,
          error: null as string | null,
        };
      } catch (apiError) {
        return {
          categories: [] as api.AdminCategory[],
          topics: [] as api.AdminTopic[],
          counts: {} as Record<string, number>,
          error:
            apiError instanceof ApiError
              ? apiError.message
              : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
        };
      }
    },
    [t],
  );

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchAll(category);
      if (!active) return;
      setCategories(result.categories);
      setTopics(result.topics);
      setCounts(result.counts);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchAll, category]);

  const reload = async () => {
    setLoading(true);
    const result = await fetchAll(category);
    setCategories(result.categories);
    setTopics(result.topics);
    setCounts(result.counts);
    setError(result.error);
    setLoading(false);
  };

  const report = (apiError: unknown, fallback: string) =>
    toast.error(apiError instanceof ApiError ? apiError.message : fallback);

  const patch = async (topic: api.AdminTopic, values: Partial<api.AdminTopic>) => {
    setTopics((current) => current.map((item) => (item.id === topic.id ? { ...item, ...values } : item)));
    try {
      await api.updateTopic(topic.id, values);
    } catch (apiError) {
      report(apiError, t("बदलाव सेव नहीं हुआ", "Could not save the change"));
      void reload();
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const next = [...topics];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setTopics(next);
    try {
      await api.reorderTopics(category, next.map((item) => item.id));
    } catch (apiError) {
      report(apiError, t("क्रम सेव नहीं हुआ", "Could not save the order"));
      void reload();
    }
  };

  const create = async () => {
    setSaving(true);
    setDraftErrors({});
    try {
      await api.createTopic({
        categorySlug: category,
        slug: draft.slug.trim(),
        name: draft.name.trim(),
        nameEn: draft.nameEn.trim() || draft.name.trim(),
        badge: draft.badge.trim(),
        color: draft.color,
        iconUrl: draft.iconUrl,
        visible: true,
      });
      setOpen(false);
      setDraft(emptyDraft);
      toast.success(t("टॉपिक जुड़ गया", "Topic added"), {
        description: t("वेबसाइट के इस सेक्शन में तुरंत दिख जाएगा।", "It shows on that section of the site right away."),
      });
      await reload();
    } catch (apiError) {
      if (apiError instanceof ApiError) {
        setDraftErrors(apiError.fields ?? {});
        toast.error(apiError.message);
      } else {
        toast.error(t("टॉपिक नहीं बना", "Could not create the topic"));
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (topic: api.AdminTopic) => {
    try {
      await api.deleteTopic(topic.id);
      toast.success(t("टॉपिक हटाया गया", "Topic removed"));
      await reload();
    } catch (apiError) {
      report(apiError, t("टॉपिक नहीं हटा", "Could not remove the topic"));
    }
  };

  const visible = topics.filter((topic) =>
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
          <>
            <Button variant="outline" size="sm" disabled={loading} onClick={() => void reload()}>
              <IconRefresh className="size-4" /> {t("रिफ्रेश", "Refresh")}
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              <IconPlus className="size-4" /> {t("नया टॉपिक", "New topic")}
            </Button>
          </>
        }
      />

      {error ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {categories.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                {t(item.name, item.nameEn)}
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

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((topic, index) => (
            <Card key={topic.id} className="gap-0 py-0">
              <CardContent className="flex items-center gap-3 p-3">
                {/* No custom logo? Show what the site shows — the state's map
                    outline, the flag, or the built-in icon. */}
                <CategoryIconPicker
                  iconUrl={topic.iconUrl}
                  color={topic.color}
                  label={topic.name}
                  onChange={(iconUrl) => void patch(topic, { iconUrl })}
                  fallback={<TopicIconBadge topic={{ ...topic, badge: topic.badge ?? "", iconUrl: undefined }} />}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <Input
                    value={language === "en" ? topic.nameEn : topic.name}
                    onChange={(event) =>
                      void patch(
                        topic,
                        language === "en" ? { nameEn: event.target.value } : { name: event.target.value },
                      )
                    }
                    className="h-8"
                  />
                  <p className="truncate text-[11px] text-text-muted">
                    <code>/{topic.categorySlug}?topic={topic.slug}</code> · {counts[topic.slug] ?? 0}{" "}
                    {t("खबरें", "stories")}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-9 sm:size-6"
                    disabled={index === 0 || query !== ""}
                    onClick={() => void move(index, -1)}
                    aria-label={t("ऊपर", "Move up")}
                  >
                    <IconArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-9 sm:size-6"
                    disabled={index === visible.length - 1 || query !== ""}
                    onClick={() => void move(index, 1)}
                    aria-label={t("नीचे", "Move down")}
                  >
                    <IconArrowDown className="size-3.5" />
                  </Button>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Switch
                    checked={topic.visible}
                    onCheckedChange={(checked) => void patch(topic, { visible: checked })}
                    aria-label={t("दिखाएं", "Visible")}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    aria-label={t("हटाएं", "Remove")}
                    onClick={() => void remove(topic)}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && visible.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-text-muted">
            {t("इस कैटेगरी में कोई टॉपिक नहीं मिला।", "No topics in this category yet.")}
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("नया टॉपिक", "New topic")}</DialogTitle>
            <DialogDescription>
              {t(
                "यह उसी कैटेगरी में जुड़ेगा जो ऊपर चुनी है, और वेबसाइट पर तुरंत दिखेगा।",
                "It joins the category selected above and appears on the site right away.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-border p-2.5">
              <TopicIconBadge
                topic={{
                  slug: draft.slug,
                  name: draft.name,
                  nameEn: draft.nameEn,
                  badge: draft.badge,
                  color: draft.color,
                  iconUrl: draft.iconUrl,
                }}
              />
              <CategoryIconPicker
                iconUrl={draft.iconUrl}
                color={draft.color}
                label={draft.name || t("नया टॉपिक", "New topic")}
                onChange={(iconUrl) => setDraft({ ...draft, iconUrl })}
              />
              <p className="text-[11.5px] text-text-muted">
                {t("लोगो पर क्लिक करके अपलोड कीजिए।", "Click the logo to upload one.")}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="topic-name">{t("नाम", "Name")}</Label>
              <Input
                id="topic-name"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder={t("जैसे: गोवा", "e.g. Goa")}
              />
              {draftErrors.name ? <p className="text-[11.5px] text-destructive">{draftErrors.name}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic-name-en">{t("नाम (English)", "Name (English)")}</Label>
              <Input
                id="topic-name-en"
                value={draft.nameEn}
                onChange={(event) => setDraft({ ...draft, nameEn: event.target.value })}
                placeholder="Goa"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="topic-slug">{t("स्लग", "Slug")}</Label>
                <Input
                  id="topic-slug"
                  value={draft.slug}
                  onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                  placeholder="goa"
                  className="font-mono text-[13px]"
                />
                {draftErrors.slug ? <p className="text-[11.5px] text-destructive">{draftErrors.slug}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topic-badge">{t("बैज", "Badge")}</Label>
                <Input
                  id="topic-badge"
                  value={draft.badge}
                  onChange={(event) => setDraft({ ...draft, badge: event.target.value })}
                  placeholder="GA / 🇮🇳"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic-color">{t("रंग", "Colour")}</Label>
              <Input
                id="topic-color"
                value={draft.color}
                onChange={(event) => setDraft({ ...draft, color: event.target.value })}
                className="font-mono text-[13px]"
              />
              {draftErrors.color ? <p className="text-[11.5px] text-destructive">{draftErrors.color}</p> : null}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("रद्द करें", "Cancel")}
            </Button>
            <Button disabled={saving} onClick={() => void create()}>
              {saving ? t("जुड़ रहा है…", "Adding…") : t("जोड़ें", "Add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
