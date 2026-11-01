import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type StatusEntry = { name: string; value: number; pct: number };

type Props = { data: StatusEntry[]; total: number };

const COLORS = ["#cbd5e1", "#94a3b8", "#64748b", "#475569"];

function formatK(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}

export function DeliveryStatusChart({ data, total }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Status</CardTitle>
        <CardDescription>Breakdown of deliveries by current status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [`${formatK(v)} (${data.find(d => d.name === name)?.pct ?? 0}%)`, name]}
                  contentStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">{formatK(total)}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-1.5 text-sm flex-1">
            {data.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-sm shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <span className="font-medium tabular-nums">
                  {formatK(entry.value)} ({entry.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
