import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MonthlyPoint = { month: string; invoiced: number; collected: number };

type Props = { data: MonthlyPoint[] };

export function RevenueCollectionsChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs Collections</CardTitle>
        <CardDescription>Invoiced amount compared to payments received</CardDescription>
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
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="invoiced"
              name="Invoiced"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="collected"
              name="Collected"
              stroke="#64748b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
