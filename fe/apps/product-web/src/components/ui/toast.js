import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
export function Toast({ title, description, variant = "default", }) {
    return (_jsx("div", { className: cn("pointer-events-auto relative flex w-full max-w-sm rounded-md border p-4 shadow-lg transition-all", variant === "destructive"
            ? "border-red-500 bg-red-50 text-red-700"
            : "border-gray-200 bg-white text-gray-900"), children: _jsxs("div", { className: "flex flex-col", children: [title && _jsx("div", { className: "font-semibold", children: title }), description && (_jsx("div", { className: "text-sm opacity-90", children: description }))] }) }));
}
