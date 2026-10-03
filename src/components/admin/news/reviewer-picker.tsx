"use client";

import { useState } from "react";
import { IconCheck, IconChevronDown, IconUserCheck, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RoleBadge } from "@/components/admin/role-badge";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { cn } from "@/lib/cn";
import type * as api from "@/lib/api/admin";

/** Who should look at this story.
 *
 *  More than one on purpose: a desk editor and a legal check can both be
 *  waiting on the same piece. Everyone picked is emailed and sees it in their
 *  queue; any admin can still act on it, and whoever does is the name that
 *  ends up credited. */
export function ReviewerPicker({
  reviewers,
  value,
  onChange,
  disabled,
}: {
  reviewers: api.Reviewer[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const { t } = useAdminLang();
  const [open, setOpen] = useState(false);

  const chosen = reviewers.filter((person) => value.includes(person.id));

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className="flex items-center gap-1.5 truncate">
              <IconUserCheck className="size-4 shrink-0 text-text-muted" />
              {chosen.length === 0
                ? t("कोई भी एडमिन", "Any admin")
                : t(`${chosen.length} लोग चुने`, `${chosen.length} selected`)}
            </span>
            <IconChevronDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={t("नाम खोजें…", "Search by name…")} />
            <CommandList>
              <CommandEmpty>{t("कोई नहीं मिला।", "Nobody found.")}</CommandEmpty>
              <CommandGroup>
                {reviewers.map((person) => {
                  const picked = value.includes(person.id);
                  return (
                    <CommandItem
                      key={person.id}
                      value={`${person.name} ${person.email}`}
                      onSelect={() => toggle(person.id)}
                      className="gap-2"
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded border",
                          picked ? "border-accent bg-accent text-white" : "border-border",
                        )}
                      >
                        {picked ? <IconCheck className="size-3" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{person.name}</span>
                      <RoleBadge role={person.role} size="xs" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {chosen.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {chosen.map((person) => (
            <li
              key={person.id}
              className="flex items-center gap-1 rounded-full bg-accent/10 py-0.5 pr-1 pl-2.5 text-[11.5px] font-medium text-accent"
            >
              {person.name}
              <button
                type="button"
                disabled={disabled}
                aria-label={t(`${person.name} को हटाएं`, `Remove ${person.name}`)}
                onClick={() => toggle(person.id)}
                className="flex size-4 items-center justify-center rounded-full hover:bg-accent/20"
              >
                <IconX className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
