"use client";

import { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image as TiptapImage } from "@tiptap/extension-image";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBlockquote,
  IconBold,
  IconClearFormatting,
  IconCode,
  IconItalic,
  IconLink,
  IconLinkOff,
  IconList,
  IconListNumbers,
  IconMinus,
  IconPhoto,
  IconStrikethrough,
  IconUnderline,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { cn } from "@/lib/cn";

/** Colours a desk actually uses in a story — a short list beats a full picker,
 *  and the custom swatch is there for the one time it isn't enough. */
const TEXT_COLORS = [
  { name: "डिफ़ॉल्ट", nameEn: "Default", value: "" },
  { name: "लाल", nameEn: "Red", value: "#d81e2c" },
  { name: "नारंगी", nameEn: "Orange", value: "#e2600a" },
  { name: "हरा", nameEn: "Green", value: "#17803d" },
  { name: "नीला", nameEn: "Blue", value: "#1d4ed8" },
  { name: "बैंगनी", nameEn: "Purple", value: "#7c3aed" },
  { name: "स्लेटी", nameEn: "Grey", value: "#6b7280" },
];

const HIGHLIGHTS = ["#fff3a3", "#ffd9d6", "#d4f5dd", "#d9e8ff", "#f0dcff"];

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // onMouseDown, not onClick: clicking a button blurs the editor first and
      // the command then has no selection to act on.
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors",
        "hover:bg-surface-muted hover:text-text disabled:pointer-events-none disabled:opacity-40",
        active && "bg-accent/15 text-accent",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-border" />;
}

function LinkControl({ editor, t }: { editor: Editor; t: (hi: string, en: string) => string }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");

  const apply = () => {
    const url = href.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const safe = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href: safe }).run();
    }
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setHref(editor.getAttributes("link").href ?? "");
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          title={t("लिंक", "Link")}
          aria-label={t("लिंक", "Link")}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors",
            "hover:bg-surface-muted hover:text-text",
            editor.isActive("link") && "bg-accent/15 text-accent",
          )}
        >
          <IconLink className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="flex flex-col gap-2">
          <Label className="text-[12px]">{t("लिंक का पता", "Link address")}</Label>
          <Input
            value={href}
            onChange={(event) => setHref(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                apply();
              }
            }}
            placeholder="https://…"
            className="text-[13px]"
          />
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setOpen(false);
              }}
            >
              <IconLinkOff className="size-4" /> {t("हटाएं", "Remove")}
            </Button>
            <Button type="button" size="sm" onClick={apply}>
              {t("लगाएं", "Apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ColorControl({ editor, t }: { editor: Editor; t: (hi: string, en: string) => string }) {
  const current = (editor.getAttributes("textStyle").color as string | undefined) ?? "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={t("रंग", "Colour")}
          aria-label={t("रंग", "Colour")}
          className="flex size-8 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
        >
          <span className="text-[12px] leading-none font-bold">A</span>
          <span
            className="block h-1 w-4 rounded-full border border-border"
            style={{ backgroundColor: current || "currentColor" }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60" align="start">
        <div className="flex flex-col gap-3">
          <div>
            <Label className="text-[12px]">{t("लिखाई का रंग", "Text colour")}</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.nameEn}
                  type="button"
                  title={t(color.name, color.nameEn)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    if (color.value) editor.chain().focus().setColor(color.value).run();
                    else editor.chain().focus().unsetColor().run();
                  }}
                  className={cn(
                    "size-6 rounded-full border border-border transition-transform hover:scale-110",
                    current === color.value && "ring-2 ring-accent ring-offset-1 ring-offset-surface",
                  )}
                  style={{
                    backgroundColor: color.value || "transparent",
                    backgroundImage: color.value
                      ? undefined
                      : "linear-gradient(135deg, transparent 45%, var(--border) 45%, var(--border) 55%, transparent 55%)",
                  }}
                />
              ))}
              <label
                className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-dashed border-border text-[10px] text-text-muted"
                title={t("कोई और रंग", "Custom colour")}
              >
                +
                <input
                  type="color"
                  className="sr-only"
                  onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
                />
              </label>
            </div>
          </div>

          <div>
            <Label className="text-[12px]">{t("हाइलाइट", "Highlight")}</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {HIGHLIGHTS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    editor.chain().focus().toggleHighlight({ color }).run();
                  }}
                  className="size-6 rounded-full border border-border transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                type="button"
                title={t("हाइलाइट हटाएं", "Clear highlight")}
                onMouseDown={(event) => {
                  event.preventDefault();
                  editor.chain().focus().unsetHighlight().run();
                }}
                className="flex size-6 items-center justify-center rounded-full border border-dashed border-border text-[11px] text-text-muted"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** The story editor.
 *
 *  Writes HTML, which is what the public article page renders — so what the
 *  reporter lays out here is what a reader gets. The same `.news-prose` styles
 *  are used on both sides, so the editor is a real preview rather than an
 *  approximation. */
export function RichTextEditor({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const { t } = useAdminLang();
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    // Next.js renders this on the server first; rendering the document there
    // too produces a hydration mismatch.
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TiptapImage.configure({ HTMLAttributes: { class: "rounded-lg" } }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "news-prose min-h-[320px] px-4 py-3 focus:outline-none",
        // The chrome is translated by the page widget; the story must not be.
        translate: "no",
      },
    },
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      // Tiptap's "empty" is still a paragraph tag — report it as empty so the
      // required-field check behaves the way the writer expects.
      onChange(instance.isEmpty ? "" : html);
    },
  });

  // Content set from outside (loading a saved story, switching articles).
  useEffect(() => {
    if (!editor) return;
    const incoming = value || "";
    if (incoming !== editor.getHTML() && (incoming !== "" || !editor.isEmpty)) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
    // Only the incoming value and the editor instance — reacting to the
    // editor's own HTML would fight the writer on every keystroke.
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const insertImage = useCallback(
    (url: string, alt: string) => {
      editor?.chain().focus().setImage({ src: url, alt }).run();
      setPickerOpen(false);
    },
    [editor],
  );

  if (!editor) {
    return <div className="h-[380px] animate-pulse rounded-lg border border-border bg-surface-muted/50" />;
  }

  const blockValue = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : editor.isActive("heading", { level: 4 })
        ? "h4"
        : "p";

  const setBlock = (next: string) => {
    const chain = editor.chain().focus();
    if (next === "p") chain.setParagraph().run();
    else chain.setHeading({ level: Number(next.slice(1)) as 2 | 3 | 4 }).run();
  };

  const words = editor.getText().trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface",
        "focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/15",
        disabled && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-muted/40 px-2 py-1.5">
        <ToolbarButton
          label={t("वापस", "Undo")}
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <IconArrowBackUp className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("आगे", "Redo")}
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <IconArrowForwardUp className="size-4" />
        </ToolbarButton>

        <Divider />

        <Select value={blockValue} onValueChange={setBlock}>
          <SelectTrigger size="sm" className="h-8 w-[132px] border-0 bg-transparent text-[13px] shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">{t("सामान्य टेक्स्ट", "Normal text")}</SelectItem>
            <SelectItem value="h2">
              <span className="text-[15px] font-bold">{t("बड़ा शीर्षक", "Heading 1")}</span>
            </SelectItem>
            <SelectItem value="h3">
              <span className="text-[14px] font-bold">{t("मध्यम शीर्षक", "Heading 2")}</span>
            </SelectItem>
            <SelectItem value="h4">
              <span className="text-[13px] font-semibold">{t("छोटा शीर्षक", "Heading 3")}</span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Divider />

        <ToolbarButton
          label={t("बोल्ड", "Bold")}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <IconBold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("इटैलिक", "Italic")}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <IconItalic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("अंडरलाइन", "Underline")}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <IconUnderline className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("काट कर", "Strikethrough")}
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <IconStrikethrough className="size-4" />
        </ToolbarButton>

        <ColorControl editor={editor} t={t} />

        <Divider />

        <ToolbarButton
          label={t("बुलेट लिस्ट", "Bullet list")}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <IconList className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("नंबर लिस्ट", "Numbered list")}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <IconListNumbers className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("कोट", "Quote")}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <IconBlockquote className="size-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label={t("बाएं", "Align left")}
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <IconAlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("बीच में", "Align centre")}
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <IconAlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("दाएं", "Align right")}
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <IconAlignRight className="size-4" />
        </ToolbarButton>

        <Divider />

        <LinkControl editor={editor} t={t} />
        <ToolbarButton label={t("इमेज डालें", "Insert image")} onClick={() => setPickerOpen(true)}>
          <IconPhoto className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("लाइन", "Divider")}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <IconMinus className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("कोड", "Code")}
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <IconCode className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t("फ़ॉर्मैटिंग हटाएं", "Clear formatting")}
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          <IconClearFormatting className="size-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between border-t border-border px-4 py-1.5 text-[11px] text-text-muted">
        <span>
          {editor.isEmpty
            ? (placeholder ?? t("पूरी खबर यहाँ लिखिए…", "Write the full story here…"))
            : t(
                `${words} शब्द · लगभग ${Math.max(1, Math.round(words / 200))} मिनट का पाठ`,
                `${words} words · about ${Math.max(1, Math.round(words / 200))} min read`,
              )}
        </span>
        <span>{t("शब्द चुनकर फ़ॉर्मैट करें", "Select text to format it")}</span>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        kind="news"
        onSelect={(selected) => insertImage(selected.url, selected.name)}
      />
    </div>
  );
}
