import type { LucideIcon } from "lucide-react";

export default function StatsCard({ title, value, delta, icon: Icon }:{
  title: string; value: string | number; delta?: string; icon: LucideIcon;
}) {
  return (
    <div className="border rounded-xl bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
          {delta && <p className="text-xs text-emerald-700 mt-1">{delta}</p>}
        </div>
        <div className="p-2 rounded-lg bg-emerald-50">
          <Icon className="h-5 w-5 text-emerald-700" />
        </div>
      </div>
    </div>
  );
}
