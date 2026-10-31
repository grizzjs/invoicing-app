import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MonthlyPoint = { month: string; new: number; shipped: number; delivered: number };

type Props = { data: MonthlyPoint[] };

export function DeliveryTimeChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Time</CardTitle>
        <CardDescription>Average delivery time by region</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="new" name="New" stroke="#cbd5e1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="shipped" name="Shipped" stroke="#94a3b8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#475569" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
