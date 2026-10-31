import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MonthlyPoint = { month: string; count: number };

type Props = { data: MonthlyPoint[] };

export function PurchaseOrdersOverviewChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Orders Overview</CardTitle>
        <CardDescription>Number of purchase orders created</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip
              formatter={(v: number) => [v, "Orders"]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="count" name="Orders" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
