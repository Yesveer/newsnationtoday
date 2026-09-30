"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { categoriesConfig } from "@/config/categories.config";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { accentAt } from "@/lib/admin/tone";

const chartConfig = { views: { label: "Views" } } satisfies ChartConfig;

export function CategoryChart({ data }: { data: { category: string; views: number }[] }) {
  const { t } = useAdminLang();
  // Single colour: the bar's shade steps down with its rank, so the chart
  // reads as one palette instead of a rainbow.
  const rows = data.map((row, index) => {
    const config = categoriesConfig.find((item) => item.slug === row.category);
    return {
      name: config ? t(config.name, config.nameEn) : row.category,
      views: row.views,
      fill: accentAt(Math.max(30, 100 - index * 12)),
    };
  });

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-base font-bold">{t("टॉप कैटेगरी", "Top categories")}</CardTitle>
        <CardDescription>{t("किस सेक्शन पर सबसे ज़्यादा पढ़ा गया", "Which section gets read the most")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 12 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={86}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="views" radius={[0, 6, 6, 0]} barSize={18} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
