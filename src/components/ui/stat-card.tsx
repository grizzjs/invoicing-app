import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Card, CardContent } from "./card";

export type TrendDirection = "up" | "down" | "neutral";

export type TrendProp = {
  label: string;
  direction: TrendDirection;
};

type StatCardProp = {
  label: string;
  value: number | string;
  trend?: TrendProp;
  /** When true, "up" is good (green); when false, "up" is bad (red). Default: true */
  positiveDirection?: boolean;
};

export function StatCard({
  label,
  value,
  trend,
  positiveDirection = true,
}: StatCardProp) {
  let colorClass = "text-muted-foreground";
  let Icon = TrendingUpIcon;

  if (trend) {
    if (trend.direction === "neutral") {
      colorClass = "text-muted-foreground";
      Icon = TrendingUpIcon;
    } else {
      const isGood = positiveDirection
        ? trend.direction === "up"
        : trend.direction === "down";
      colorClass = isGood ? "text-green-600" : "text-red-500";
      Icon = trend.direction === "up" ? TrendingUpIcon : TrendingDownIcon;
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          {trend && (
            <span className={`text-sm font-semibold flex items-center gap-0.5 ${colorClass}`}>
              {trend.label}
              <Icon size={14} />
            </span>
          )}
        </div>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
