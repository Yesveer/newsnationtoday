import type { Metadata } from "next";
import { MonitorPlay } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "वॉच",
  description: `${siteConfig.name} लाइव टीवी — जल्द आ रहा है।`,
};

export default function WatchPage() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
      <MonitorPlay className="size-10 text-text-muted" />
      <h1 className="text-xl font-bold text-text">लाइव टीवी जल्द आ रहा है</h1>
      <p className="max-w-sm text-sm text-text-muted">
        हम लाइव स्ट्रीमिंग पर काम कर रहे हैं। तब तक हमारे ताज़ा वीडियो देखने के लिए वीडियो सेक्शन देखें।
      </p>
    </div>
  );
}
