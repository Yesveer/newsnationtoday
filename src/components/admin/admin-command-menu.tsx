"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { adminNavGroups } from "@/config/admin-nav.config";
import { canAny } from "@/lib/admin/permissions";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { AdminIcon } from "@/components/admin/admin-icon";

/** ⌘K palette over the portal's own pages. Story/user search joins it once
 *  the backend can answer a query. */
export function AdminCommandMenu({
  trigger,
  mobileTrigger,
}: {
  trigger: ReactNode;
  mobileTrigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { role } = useAdminSession();
  const { t } = useAdminLang();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {mobileTrigger ? <span onClick={() => setOpen(true)}>{mobileTrigger}</span> : null}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("क्विक सर्च", "Quick search")}
        description={t("पेज या एक्शन खोजें", "Find a page or action")}
      >
        <CommandInput placeholder={t("पेज, खबर या एक्शन खोजें…", "Search pages, news or actions…")} />
        <CommandList>
          <CommandEmpty>{t("कुछ नहीं मिला।", "Nothing found.")}</CommandEmpty>
          {adminNavGroups.map((group, index) => {
            const items = group.items.filter(
              (item) => !item.permissions || canAny(role, item.permissions),
            );
            if (items.length === 0) return null;
            return (
              <div key={group.label}>
                {index > 0 ? <CommandSeparator /> : null}
                <CommandGroup heading={t(group.label, group.labelEn)}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${item.label} ${item.labelEn}`}
                      onSelect={() => go(item.href)}
                    >
                      <AdminIcon name={item.icon} className="size-4" />
                      <span>{t(item.label, item.labelEn)}</span>
                      <span className="ml-auto text-[11px] text-text-muted">
                        {t(item.labelEn, item.label)}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
