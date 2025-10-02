import { jsx as _jsx } from "react/jsx-runtime";
import { useToast } from "./use-toast";
import { Toast } from "./toast";
export function Toaster() {
    const { toasts } = useToast();
    return (_jsx("div", { className: "fixed top-4 right-4 z-50 flex flex-col gap-2", children: toasts.map((t) => (_jsx(Toast, { ...t }, t.id))) }));
}
