import * as React from "react";
import { cn } from "@/lib/utils";

export function Toast({
  title,
  description,
  variant = "default",
}: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full max-w-sm rounded-md border p-4 shadow-lg transition-all",
        variant === "destructive"
          ? "border-red-500 bg-red-50 text-red-700"
          : "border-gray-200 bg-white text-gray-900"
      )}
    >
      <div className="flex flex-col">
        {title && <div className="font-semibold">{title}</div>}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
    </div>
  );
}
