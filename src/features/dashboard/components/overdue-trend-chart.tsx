import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MonthlyPoint = { month: string; amount: number };

type Props = { data: MonthlyPoint[] };

export function OverdueTrendChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue Trend</CardTitle>
        <CardDescription>Trend of overdue invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip
              formatter={(v: number) => `₱${(v / 1000).toFixed(0)}K`}
              contentStyle={{ fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              name="Overdue"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
