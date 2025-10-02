import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet } from "react-router-dom";
export default function AccountLayout() {
    const item = (to, label) => (_jsx(NavLink, { to: to, end: true, className: ({ isActive }) => [
            "block rounded-md px-3 py-2 text-sm transition-colors",
            isActive
                ? "bg-teal-50 text-teal-700 font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
        ].join(" "), children: label }));
    return (_jsxs("main", { className: "flex-1 mx-auto w-full max-w-7xl px-35 pb-20 pt- bg-gre", children: [_jsx("h2", { className: "font-semibold my-5 text-3xl text-[#246f67]", children: "Th\u00F4ng tin c\u00E1 nh\u00E2n" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-4 md:gap-6", children: [_jsxs("aside", { className: "border p-3 md:p-4 bg-white h-max", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Thi\u1EBFt l\u1EADp" }), _jsxs("nav", { className: "space-y-1", children: [item("profile", "Thông tin cá nhân"), item("account", "Tài khoản"), item("social", "Liên kết mạng xã hội")] })] }), _jsx("div", { className: "bg-white p-4 shadow-sm", children: _jsx(Outlet, {}) })] })] }));
}
