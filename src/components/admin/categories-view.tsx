"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IconAlertTriangle, IconArrowDown, IconArrowUp, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { CategoryIconPicker } from "@/components/admin/category-icon-picker";
import { categoryTopics } from "@/config/topics.config";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

/** Category list exactly as the public sidebar renders it — order, colour and
 *  the NEW badge are all editable here. */
export function CategoriesView({ counts }: { counts: Record<string, number> }) {
  const { t, language } = useAdminLang();
  // The live list from the database — the public site's navigation is built
  // from exactly these rows.
  const [rows, setRows] = useState<api.AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", nameEn: "", slug: "", color: "#FF5C00", iconUrl: "" });
  const [saving, setSaving] = useState(false);

  const fetchRows = useCallback(async () => {
    try {
      return { rows: await api.listCategories(), error: null as string | null };
    } catch (apiError) {
      return {
        rows: [] as api.AdminCategory[],
        error:
          apiError instanceof ApiError
            ? apiError.message
            : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
      };
    }
  }, [t]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchRows();
      if (!active) return;
      setRows(result.rows);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchRows]);

  const reload = async () => {
    setLoading(true);
    const result = await fetchRows();
    setRows(result.rows);
    setError(result.error);
    setLoading(false);
  };

  const report = (apiError: unknown, fallback: string) =>
    toast.error(apiError instanceof ApiError ? apiError.message : fallback);

  // Moving a row saves the new order straight away — the sidebar on the site
  // follows it.
  const move = async (index: number, direction: -1 | 1) => {
    const next = [...rows];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    try {
      await api.reorderCategories(next.map((row) => row.id));
    } catch (apiError) {
      report(apiError, t("क्रम सेव नहीं हुआ", "Could not save the order"));
      void reload();
    }
  };

  const patch = async (row: api.AdminCategory, values: Partial<api.AdminCategory>) => {
    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, ...values } : item)));
    try {
      await api.updateCategory(row.id, values);
    } catch (apiError) {
      report(apiError, t("बदलाव सेव नहीं हुआ", "Could not save the change"));
      void reload();
    }
  };

  const create = async () => {
    setSaving(true);
    try {
      await api.createCategory({
        name: form.name,
        nameEn: form.nameEn,
        slug: form.slug,
        color: form.color,
        iconUrl: form.iconUrl,
        isNew: false,
        visible: true,
      });
      setOpen(false);
      setForm({ name: "", nameEn: "", slug: "", color: "#FF5C00", iconUrl: "" });
      toast.success(t("कैटेगरी जोड़ दी गई", "Category added"));
      await reload();
    } catch (apiError) {
      report(apiError, t("कैटेगरी नहीं बनी", "Could not create the category"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: api.AdminCategory) => {
    try {
      await api.deleteCategory(row.id);
      toast.success(t("कैटेगरी हटाई गई", "Category removed"));
      await reload();
    } catch (apiError) {
      report(apiError, t("कैटेगरी नहीं हटी", "Could not remove the category"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("कैटेगरी", "Categories")}
        description={t(
          "वेबसाइट के साइड नेविगेशन और सेक्शन इन्हीं से बनते हैं — क्रम, रंग और बैज यहीं बदलिए।",
          "These drive the site's side navigation and sections — order, colour and badges all change here.",
        )}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <IconPlus className="size-4" /> {t("नई कैटेगरी", "New category")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("नई कैटेगरी जोड़ें", "Add a category")}</DialogTitle>
                <DialogDescription>
                  {t("यह तुरंत साइड नेविगेशन में दिखने लगेगी।", "It appears in the side navigation right away.")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-name">{t("नाम (हिंदी)", "Name (Hindi)")}</Label>
                  <Input
                    id="cat-name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder={t("जैसे: धर्म", "e.g. धर्म")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-name-en">{t("नाम (English)", "Name (English)")}</Label>
                  <Input
                    id="cat-name-en"
                    value={form.nameEn}
                    onChange={(event) => setForm({ ...form, nameEn: event.target.value })}
                    placeholder="e.g. Faith"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-slug">{t("स्लग", "Slug")}</Label>
                  <Input
                    id="cat-slug"
                    value={form.slug}
                    onChange={(event) => setForm({ ...form, slug: event.target.value })}
                    placeholder="dharm"
                    className="font-mono text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("लोगो", "Logo")}</Label>
                  <div className="flex items-center gap-3">
                    <CategoryIconPicker
                      iconUrl={form.iconUrl}
                      color={form.color}
                      label={form.name || t("नई कैटेगरी", "New category")}
                      onChange={(iconUrl) => setForm({ ...form, iconUrl })}
                    />
                    <p className="text-[11.5px] text-text-muted">
                      {t(
                        "लोगो पर क्लिक करके लिंक दीजिए या इमेज अपलोड कीजिए।",
                        "Click the logo to paste a link or upload an image.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cat-color">{t("रंग", "Colour")}</Label>
                  <Input
                    id="cat-color"
                    value={form.color}
                    onChange={(event) => setForm({ ...form, color: event.target.value })}
                    className="font-mono text-[13px]"
                  />
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
        }
      />

      {error ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {error}
        </p>
      ) : null}

      <Card className="gap-0 py-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16">{t("क्रम", "Order")}</TableHead>
                <TableHead className="w-16">{t("लोगो", "Logo")}</TableHead>
                <TableHead className="min-w-[200px]">{t("नाम", "Name")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("स्लग", "Slug")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("रंग", "Colour")}</TableHead>
                <TableHead className="hidden sm:table-cell text-right">{t("खबरें", "Stories")}</TableHead>
                <TableHead className="hidden xl:table-cell text-right">{t("टॉपिक", "Topics")}</TableHead>
                <TableHead className="text-center">NEW</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                      <TableCell colSpan={9}>
                        <Skeleton className="h-9 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              {!loading &&
                rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        disabled={index === 0}
                        className="size-9 sm:size-6"
                        onClick={() => void move(index, -1)}
                        aria-label={t("ऊपर", "Move up")}
                      >
                        <IconArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        disabled={index === rows.length - 1}
                        className="size-9 sm:size-6"
                        onClick={() => void move(index, 1)}
                        aria-label={t("नीचे", "Move down")}
                      >
                        <IconArrowDown className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CategoryIconPicker
                      iconUrl={row.iconUrl}
                      color={row.color}
                      label={row.name}
                      onChange={(iconUrl) => void patch(row, { iconUrl })}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                      <Input
                        value={t(row.name, row.nameEn)}
                        onChange={(event) =>
                          void patch(
                            row,
                            language === "en"
                              ? { nameEn: event.target.value }
                              : { name: event.target.value },
                          )
                        }
                        className="h-8 w-36"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <code className="text-[12px] text-text-muted">/{row.slug}</code>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Input
                      value={row.color}
                      onChange={(event) => void patch(row, { color: event.target.value })}
                      className="h-8 w-24 font-mono text-[12px]"
                    />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right text-[12.5px] tabular-nums text-text-muted">
                    {counts[row.slug] ?? 0}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-right text-[12.5px] tabular-nums text-text-muted">
                    {categoryTopics[row.slug]?.topics.length ?? 0}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={Boolean(row.isNew)}
                      onCheckedChange={(checked) => void patch(row, { isNew: checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      aria-label={t("डिलीट करें", "Delete")}
                      onClick={() => void remove(row)}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between gap-2 border-t p-3">
          <p className="text-[12px] text-text-muted">
            {t(
              "हर बदलाव तुरंत सेव होता है और वेबसाइट पर लागू हो जाता है।",
              "Every change saves immediately and goes live on the website.",
            )}
          </p>
          <Button variant="outline" size="sm" disabled={loading} onClick={() => void reload()}>
            <IconRefresh className="size-4" /> {t("रिफ्रेश", "Refresh")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
