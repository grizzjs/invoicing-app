import { Progress } from "@/components/ui/progress";
import format from "@/lib/format-money";
import { Link } from "@tanstack/react-router";
import { SquareArrowOutUpRight } from "lucide-react";

type ProgressCardProp = {
  title: string;
  link?: string;
  value: number;
  total: number;
  verb: string;
  money?: boolean;
};
export function ProgressCard({
  title,
  value,
  total,
  verb,
  link,
  money = false,
}: ProgressCardProp) {
  return (
    <div className="grid gap-2 bg-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{title}</span>
        {link && (
          <Link to={link} target="_blank">
            <SquareArrowOutUpRight className="h-4 w-4 text-gray-500" />
          </Link>
        )}
      </div>
      <span className="text-2xl font-bold">
        {money ? format(value) : value}
      </span>
      <Progress value={(value / total) * 100} className="w-full max-w-md" />
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{`${((value / total) * 100).toFixed()}% ${verb}`}</span>
        <span>
          of {money ? format(total) : total} {money ? "" : "units"}
        </span>
      </div>
    </div>
  );
}
