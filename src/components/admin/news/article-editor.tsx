"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  IconArrowUpRight,
  IconBolt,
  IconCalendarClock,
  IconChevronDown,
  IconDeviceFloppy,
  IconPhotoUp,
  IconSend,
  IconSparkles,
  IconStar,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ReviewPanel } from "@/components/admin/news/review-panel";
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import { categoriesConfig } from "@/config/categories.config";
import type { NewsItem } from "@/types/admin";
import { cn } from "@/lib/cn";

const makeEditorSchema = (t: (hi: string, en: string) => string) =>
  z.object({
    title: z
      .string()
      .min(
        8,
        t(
          "हेडलाइन कम से कम 8 अक्षर की होनी चाहिए",
          "The headline needs at least 8 characters",
        ),
      ),
    slug: z
      .string()
      .min(3, t("स्लग बहुत छोटा है", "That slug is too short"))
      .regex(
        /^[a-z0-9-]+$/,
        t(
          "सिर्फ़ छोटे अक्षर, अंक और डैश चलेंगे",
          "Only lowercase letters, digits and dashes",
        ),
      ),
    excerpt: z
      .string()
      .min(
        20,
        t(
          "सार कम से कम 20 अक्षर का हो",
          "The summary needs at least 20 characters",
        ),
      )
      .max(
        300,
        t(
          "सार 300 अक्षर से ज़्यादा न हो",
          "Keep the summary under 300 characters",
        ),
      ),
    body: z
      .string()
      .min(
        50,
        t(
          "खबर का मुख्य हिस्सा कम से कम 50 अक्षर का हो",
          "The story body needs at least 50 characters",
        ),
      ),
    coverImageUrl: z
      .string()
      .min(5, t("कवर इमेज ज़रूरी है", "A cover image is required")),
    categorySlug: z.string().min(1, t("कैटेगरी चुनें", "Pick a category")),
    topic: z.string().optional(),
    type: z.enum(["article", "video", "photo"]),
    tags: z.string().optional(),
    isBreaking: z.boolean(),
    isFeatured: z.boolean(),
    scheduledFor: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.string().optional(),
  });

type EditorValues = z.infer<ReturnType<typeof makeEditorSchema>>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function ArticleEditor({
  item,
  onSaved,
}: {
  item?: NewsItem;
  /** Lets the page refresh its copy after a save or a workflow change. */
  onSaved?: (item: NewsItem) => void;
}) {
  const { role, user, can } = useAdminSession();
  const { t } = useAdminLang();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isNew = !item;
  const isOwn = item ? item.authorId === user.id : true;
  const canEdit = isNew || can("news.edit.any") || isOwn;
  const canPublish = can("news.publish");

  const form = useForm<EditorValues>({
    resolver: zodResolver(makeEditorSchema(t)),
    defaultValues: {
      title: item?.title ?? "",
      slug: item?.slug ?? "",
      excerpt: item?.excerpt ?? "",
      body: item?.body ?? "",
      coverImageUrl: item?.coverImageUrl ?? "",
      categorySlug: item?.categorySlug ?? "desh",
      topic: item?.topic ?? "",
      type: item?.type ?? "article",
      tags: item?.tags.join(", ") ?? "",
      isBreaking: item?.isBreaking ?? false,
      isFeatured: item?.isFeatured ?? false,
      scheduledFor: item?.scheduledFor?.slice(0, 16) ?? "",
      metaTitle: item?.seo.metaTitle ?? "",
      metaDescription: item?.seo.metaDescription ?? "",
      keywords: item?.seo.keywords ?? "",
    },
  });

  const categorySlug = form.watch("categorySlug");
  const coverImageUrl = form.watch("coverImageUrl");
  const title = form.watch("title");
  // Topics are per category and live in the database, so the list refreshes
  // whenever the category changes.
  const [topicOptions, setTopicOptions] = useState<api.AdminTopic[]>([]);
  useEffect(() => {
    let active = true;
    void (async () => {
      const listed = await api.listTopics(categorySlug).catch(() => ({ topics: [], counts: {} }));
      if (active) setTopicOptions(listed.topics.filter((topic) => topic.visible));
    })();
    return () => {
      active = false;
    };
  }, [categorySlug]);

  /** Saves the form, then optionally moves the story along the workflow.
   *
   *  A new story is created first and then published, so "Publish" is one
   *  click even for something that does not exist yet. */
  const submit = (message: string, nextStatus?: api.NewsStatus) =>
    form.handleSubmit(
      async (values) => {
        setSaving(true);
        try {
          const payload: api.NewsInput = {
            title: values.title,
            slug: values.slug,
            excerpt: values.excerpt,
            body: values.body,
            coverImageUrl: values.coverImageUrl,
            categorySlug: values.categorySlug,
            topic: values.topic === "none" ? "" : (values.topic ?? ""),
            type: values.type,
            tags: (values.tags ?? "")
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            isBreaking: values.isBreaking,
            isFeatured: values.isFeatured,
            scheduledFor: values.scheduledFor || undefined,
            seo: {
              metaTitle: values.metaTitle,
              metaDescription: values.metaDescription,
              keywords: values.keywords,
            },
          };

          let saved = item ? await api.updateNews(item.id, payload) : await api.createNews(payload);
          if (nextStatus && nextStatus !== saved.status) {
            saved = await api.changeNewsStatus(saved.id, nextStatus);
          }

          toast.success(message);
          onSaved?.(saved);
          if (!item) {
            router.replace(`/admin/news/${saved.id}`);
          }
        } catch (error) {
          if (error instanceof ApiError) {
            // Field errors from the API land on the matching inputs.
            for (const [field, text] of Object.entries(error.fields ?? {})) {
              form.setError(field as keyof EditorValues, { message: text });
            }
            toast.error(error.message);
          } else {
            toast.error(t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."));
          }
        } finally {
          setSaving(false);
        }
      },
      () =>
        toast.error(t("कुछ फ़ील्ड अधूरे हैं", "Some fields need attention"), {
          description: t(
            "लाल दिख रहे फ़ील्ड ठीक कीजिए।",
            "Fix the fields marked in red.",
          ),
        }),
    )();

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <PageHeader
          title={
            isNew ? t("नई खबर", "New story") : t("खबर एडिट करें", "Edit story")
          }
          description={
            isNew
              ? t(
                  "खबर लिखिए, कवर इमेज लगाइए और रिव्यू के लिए भेज दीजिए।",
                  "Write the story, add a cover image, and send it for review.",
                )
              : t(
                  "बदलाव सेव करने पर रिव्यू स्टेटस अपडेट हो जाएगा।",
                  "Saving changes updates the review status.",
                )
          }
          actions={
            <>
              {item ? (
                <StatusBadge status={item.status} className="mr-1 h-7 px-2.5" />
              ) : null}
              {item ? (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/${item.categorySlug}/${item.slug}`}
                    target="_blank"
                  >
                    <IconArrowUpRight className="size-4" />{" "}
                    {t("साइट पर", "On site")}
                  </Link>
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canEdit || saving}
                onClick={() => submit(t("सेव हो गया", "Saved"))}
              >
                <IconDeviceFloppy className="size-4" />{" "}
                {saving ? t("सेव हो रहा है…", "Saving…") : t("सेव करें", "Save")}
              </Button>
              {canPublish ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={!canEdit || saving}
                  onClick={() =>
                    submit(t("खबर पब्लिश कर दी गई", "Story published"), "published")
                  }
                >
                  <IconSparkles className="size-4" />{" "}
                  {t("पब्लिश करें", "Publish")}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={!canEdit || saving}
                  onClick={() =>
                    submit(t("खबर रिव्यू के लिए भेज दी गई", "Sent for review"), "in_review")
                  }
                >
                  <IconSend className="size-4" />{" "}
                  {t("रिव्यू में भेजें", "Send for review")}
                </Button>
              )}
            </>
          }
        />

        {!canEdit ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-400">
            {t(
              "यह खबर किसी और रिपोर्टर की है — आप इसे सिर्फ़ पढ़ सकते हैं।",
              "This story belongs to another reporter — you can only read it.",
            )}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            <Card>
              <CardContent className="flex flex-col gap-4 pt-0">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("हेडलाइन", "Headline")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={!canEdit}
                          rows={2}
                          placeholder={t(
                            "खबर की हेडलाइन लिखिए…",
                            "Write the headline…",
                          )}
                          className="font-display resize-none text-lg leading-snug font-bold"
                          onBlur={() => {
                            if (!form.getValues("slug") && title) {
                              form.setValue("slug", slugify(title), {
                                shouldValidate: true,
                              });
                            }
                            field.onBlur();
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {t(
                          `${title.length}/120 अक्षर — 70 के अंदर सबसे अच्छा दिखता है।`,
                          `${title.length}/120 characters — under 70 reads best.`,
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("URL स्लग", "URL slug")}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-1.5">
                          <span className="hidden shrink-0 text-[12px] text-text-muted sm:inline">
                            /{categorySlug}/
                          </span>
                          <Input
                            {...field}
                            disabled={!canEdit}
                            placeholder="url-slug"
                            className="font-mono text-[13px]"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!canEdit}
                            onClick={() =>
                              form.setValue("slug", slugify(title), {
                                shouldValidate: true,
                              })
                            }
                          >
                            {t("ऑटो", "Auto")}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("सार (कार्ड पर दिखेगा)", "Summary (shown on cards)")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={!canEdit}
                          rows={3}
                          placeholder={t(
                            "दो-तीन लाइन में खबर का सार…",
                            "Two or three lines summarising the story…",
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("खबर", "Story")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={!canEdit}
                          rows={16}
                          placeholder={t(
                            "पूरी खबर यहाँ लिखिए…",
                            "Write the full story here…",
                          )}
                          className="leading-relaxed"
                        />
                      </FormControl>
                      <FormDescription>
                        {t(
                          `${field.value.trim().split(/\s+/).filter(Boolean).length} शब्द · लगभग ${Math.max(1, Math.round(field.value.trim().split(/\s+/).filter(Boolean).length / 200))} मिनट का पाठ`,
                          `${field.value.trim().split(/\s+/).filter(Boolean).length} words · about ${Math.max(1, Math.round(field.value.trim().split(/\s+/).filter(Boolean).length / 200))} min read`,
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card id="preview">
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">
                  {t("कवर इमेज", "Cover image")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-surface-muted">
                  {coverImageUrl ? (
                    <Image
                      src={coverImageUrl}
                      alt="कवर"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 100vw, 720px"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
                      <IconPhotoUp className="size-8" stroke={1.4} />
                      <p className="text-sm">
                        {t(
                          "कोई कवर इमेज नहीं चुनी गई",
                          "No cover image selected",
                        )}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canEdit}
                    onClick={() => setPickerOpen(true)}
                  >
                    <IconPhotoUp className="size-4" />{" "}
                    {t("मीडिया लाइब्रेरी से चुनें", "Pick from media library")}
                  </Button>
                  {coverImageUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!canEdit}
                      onClick={() => form.setValue("coverImageUrl", "")}
                    >
                      <IconX className="size-4" /> {t("हटाएं", "Remove")}
                    </Button>
                  ) : null}
                </div>
                <FormField
                  control={form.control}
                  name="coverImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!canEdit}
                          placeholder={t(
                            "या इमेज का URL पेस्ट कीजिए",
                            "Or paste an image URL",
                          )}
                          className="text-[13px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {item ? <ReviewPanel item={item} onChanged={onSaved} /> : null}
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">
                  {t("प्रकाशन", "Publishing")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-0">
                <FormField
                  control={form.control}
                  name="categorySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("कैटेगरी", "Category")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!canEdit}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesConfig.map((category) => (
                            <SelectItem
                              key={category.slug}
                              value={category.slug}
                            >
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {t(category.name, category.nameEn)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {topicOptions.length > 0 ? (
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("टॉपिक / सब-सेक्शन", "Topic / sub-section")}
                        </FormLabel>
                        <Select
                          value={field.value || "none"}
                          onValueChange={field.onChange}
                          disabled={!canEdit}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={t("कोई नहीं", "None")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-72">
                            <SelectItem value="none">
                              {t("कोई नहीं", "None")}
                            </SelectItem>
                            {topicOptions.map((topic) => (
                              <SelectItem key={topic.slug} value={topic.slug}>
                                {t(topic.name, topic.nameEn)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("फ़ॉर्मैट", "Format")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!canEdit}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="article">
                            {t("आर्टिकल", "Article")}
                          </SelectItem>
                          <SelectItem value="video">
                            {t("वीडियो", "Video")}
                          </SelectItem>
                          <SelectItem value="photo">
                            {t("फोटो स्टोरी", "Photo story")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("टैग", "Tags")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!canEdit}
                          placeholder={t(
                            "कॉमा से अलग करें",
                            "Separate with commas",
                          )}
                        />
                      </FormControl>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(field.value ?? "")
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-text-muted"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                  <FormField
                    control={form.control}
                    name="isBreaking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-1.5 text-[13px]">
                            <IconBolt className="size-3.5 text-live" />{" "}
                            {t("ब्रेकिंग न्यूज़", "Breaking news")}
                          </FormLabel>
                          <FormDescription className="text-[11px]">
                            {t(
                              "हेडर टिकर में सबसे ऊपर",
                              "Top of the header ticker",
                            )}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!canEdit || !canPublish}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-1.5 text-[13px]">
                            <IconStar className="size-3.5 text-amber-500" />{" "}
                            {t("हीरो में दिखाएं", "Show in hero")}
                          </FormLabel>
                          <FormDescription className="text-[11px]">
                            {t(
                              "होमपेज के बड़े स्लाइडर में",
                              "In the big homepage slider",
                            )}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!canEdit || !canPublish}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {canPublish ? (
                  <FormField
                    control={form.control}
                    name="scheduledFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <IconCalendarClock className="size-4" />{" "}
                          {t("शेड्यूल करें", "Schedule")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            disabled={!canEdit}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          {t(
                            "खाली छोड़ेंगे तो तुरंत पब्लिश होगी।",
                            "Leave empty to publish right away.",
                          )}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                ) : null}
              </CardContent>
            </Card>

            <Card className="gap-0">
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 text-left">
                  <span className="font-display text-base font-bold">SEO</span>
                  <IconChevronDown className="size-4 text-text-muted transition-transform data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="flex flex-col gap-3 pt-0">
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px]">
                            {t("मेटा टाइटल", "Meta title")}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px]">
                            {t("मेटा डिस्क्रिप्शन", "Meta description")}
                          </FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} disabled={!canEdit} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px]">
                            {t("कीवर्ड्स", "Keywords")}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {item && canEdit ? (
              <Card>
                <CardContent className="flex flex-col gap-2 pt-0">
                  <Label className="text-[13px] text-text-muted">
                    {t("खतरे का ज़ोन", "Danger zone")}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-destructive",
                      "hover:bg-destructive/10",
                    )}
                    onClick={() =>
                      toast.success(
                        can("news.delete")
                          ? t("खबर डिलीट की गई", "Story deleted")
                          : t(
                              "डिलीट रिक्वेस्ट एडमिन को भेजी गई",
                              "Delete request sent to an admin",
                            ),
                        {
                          description: t(
                            "बैकएंड जुड़ते ही यह लाइव हो जाएगा।",
                            "This goes live once the backend is connected.",
                          ),
                        },
                      )
                    }
                  >
                    <IconTrash className="size-4" />
                    {can("news.delete")
                      ? t("खबर डिलीट करें", "Delete story")
                      : t("डिलीट की रिक्वेस्ट भेजें", "Request delete")}
                  </Button>
                  {!can("news.delete") ? (
                    <p className="text-[11px] text-text-muted">
                      {t(
                        "रिपोर्टर सीधे डिलीट नहीं कर सकते — एडमिन के अप्रूवल के बाद ही खबर हटेगी।",
                        "Reporters can't delete directly — the story goes only after an admin approves.",
                      )}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        <MediaPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          kind="news"
          onSelect={(selected) => {
            form.setValue("coverImageUrl", selected.url, {
              shouldValidate: true,
            });
            setPickerOpen(false);
          }}
        />
        <p className="text-center text-[11px] text-text-muted">
          {t("लॉग इन", "Signed in")}: {user.name} · {t("रोल", "role")}: {role}
        </p>
      </form>
    </Form>
  );
}
