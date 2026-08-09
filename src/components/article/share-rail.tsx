"use client";

import { useState } from "react";
import { IconBrandFacebook, IconBrandX } from "@tabler/icons-react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/cn";

/** Plain inline share-icon row (Bhaskar has no sticky share rail — this sits directly under the headline/thumbnail). */
export function ShareRail({ url, title, size = "md", className }: { url: string; title: string; size?: "sm" | "md"; className?: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const box = size === "sm" ? "size-7" : "size-9";
  const icon = size === "sm" ? "size-3.5" : "size-4";

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const links = [
    { label: "Facebook पर शेयर करें", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: IconBrandFacebook },
    { label: "X पर शेयर करें", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, icon: IconBrandX },
  ];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {links.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className={cn(box, "flex items-center justify-center rounded-full text-text-muted transition-colors hover:text-accent")}
        >
          <Icon className={icon} />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="लिंक कॉपी करें"
        className={cn(box, "flex items-center justify-center rounded-full text-text-muted transition-colors hover:text-accent")}
      >
        {copied ? <Check className={cn(icon, "text-accent")} /> : <Link2 className={icon} />}
      </button>
    </div>
  );
}
