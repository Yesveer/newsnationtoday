"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAdminLang } from "@/components/admin/use-admin-lang";

const chartConfig = {
  views: { label: "व्यूज़", color: "var(--accent)" },
  stories: { label: "खबरें", color: "var(--text-muted)" },
} satisfies ChartConfig;

export function TrafficChart({
  data,
  trackingSince,
}: {
  data: { date: string; views: number; stories: number }[];
  /** The first day views were recorded. Days before it are blank because
   *  nothing was counted then, not because nobody was reading. */
  trackingSince?: string;
}) {
  const { t, language } = useAdminLang();
  const locale = language === "en" ? "en-IN" : "hi-IN";

  const totalViews = data.reduce((sum, point) => sum + point.views, 0);
  const totalStories = data.reduce((sum, point) => sum + point.stories, 0);
  const sinceLabel = trackingSince
    ? new Date(trackingSince).toLocaleDateString(locale, { day: "numeric", month: "long" })
    : "";

  const description = !trackingSince
    ? t(
        "व्यूज़ गिनना अभी शुरू हुआ है — पहली रीडिंग आते ही ग्राफ़ भरना शुरू हो जाएगा।",
        "View counting has just started — the line fills in as readers arrive.",
      )
    : t(
        `${sinceLabel} से गिनती चालू है · इन 14 दिनों में ${totalViews.toLocaleString("en-IN")} व्यूज़, ${totalStories} खबरें`,
        `Counting since ${sinceLabel} · ${totalViews.toLocaleString("en-IN")} views and ${totalStories} stories in these 14 days`,
      );

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-base font-bold">
          {t("ट्रैफ़िक — पिछले 14 दिन", "Traffic — last 14 days")}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <AreaChart data={data} margin={{ left: 4, right: 8, top: 4 }}>
            <defs>
              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleDateString(locale, { day: "numeric", month: "short" })
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              allowDecimals={false}
              tickFormatter={(value: number) =>
                value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value as string).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "long",
                    })
                  }
                />
              }
            />
            <Area
              dataKey="views"
              type="monotone"
              stroke="var(--color-views)"
              strokeWidth={2}
              fill="url(#fillViews)"
            />
            <Area
              dataKey="stories"
              type="monotone"
              stroke="var(--color-stories)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              fill="none"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
