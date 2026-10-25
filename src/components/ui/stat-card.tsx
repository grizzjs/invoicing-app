import { Card, CardContent } from "./card";

type StatCardProp = {
  label: string;
  value: number;
};
export function StatCard({ label, value }: StatCardProp) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
