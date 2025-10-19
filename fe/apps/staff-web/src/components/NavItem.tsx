import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type Props = { label: string; to: string; icon: LucideIcon };

export default function NavItem({ label, to, icon: Icon }: Props) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
          isActive
            ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
            : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
