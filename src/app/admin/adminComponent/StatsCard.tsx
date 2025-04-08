import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  description: string;
}

export function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-gray-900 text-white p-3 rounded-lg">
            <Icon className="h-6 w-6" />
          </div>
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {change}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-bold">{value}</h3>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
        <p className="text-xs text-gray-400 mt-4">{description}</p>
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${
          trend === "up" ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>
    </Card>
  );
}
