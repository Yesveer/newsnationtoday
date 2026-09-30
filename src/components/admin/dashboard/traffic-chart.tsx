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
  stories: { label: "Stories", color: "var(--accent)" },
} satisfies ChartConfig;

export function TrafficChart({ data }: { data: { date: string; views: number; stories: number }[] }) {
  const { t, language } = useAdminLang();
  const locale = language === "en" ? "en-IN" : "hi-IN";

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-base font-bold">
          {t("ट्रैफ़िक — पिछले 14 दिन", "Traffic — last 14 days")}
        </CardTitle>
        <CardDescription>
          {t(
            "नमूना ग्राफ़ — रोज़ाना व्यूज़ ट्रैक होना अभी बाकी है। कुल व्यूज़ असली हैं।",
            "Sample trend — per-day tracking is not recorded yet. The totals above are real.",
          )}
        </CardDescription>
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
              tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
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
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
