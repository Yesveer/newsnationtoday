import type { ReactNode } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { accentAt, toneTileStyle } from "@/lib/admin/tone";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  trend?: number;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      {/* Two of these sit side by side on a phone, so the icon drops above the
          text rather than stealing half the width, and the label is allowed to
          wrap instead of truncating to nothing. */}
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-start sm:gap-3 sm:p-4">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10"
          style={toneTileStyle()}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] leading-snug font-medium text-text-muted sm:truncate sm:text-[12.5px]">
            {label}
          </p>
          <p className="font-display text-xl leading-tight font-bold tracking-tight text-text tabular-nums sm:text-2xl">
            {value}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            {typeof trend === "number" ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-semibold",
                  trend >= 0 ? "text-accent" : "text-text-muted",
                )}
              >
                {trend >= 0 ? (
                  <IconTrendingUp className="size-3.5" stroke={2} />
                ) : (
                  <IconTrendingDown className="size-3.5" stroke={2} />
                )}
                {Math.abs(Math.round(trend))}%
              </span>
            ) : null}
            {hint ? (
              <span className="truncate text-[10.5px] text-text-muted sm:text-[11px]">{hint}</span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="h-1 w-full" style={{ backgroundColor: accentAt(18) }}>
        <div className="h-full w-2/3 bg-accent" />
      </div>
    </Card>
  );
}
