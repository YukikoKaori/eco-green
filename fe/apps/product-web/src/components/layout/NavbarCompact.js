import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, NavLink } from "react-router-dom";
import { Menu, Heart, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import UserMenu from "../user/UserMenu";
const mainNav = [
    { label: "EcoGreen", to: "/" },
    { label: "Xe điện", to: "/xe-dien" },
    { label: "Pin điện", to: "/pin-dien" },
    { label: "EcoBlog", to: "/blog" },
];
export default function Navbar() {
    return (_jsx("header", { className: "sticky top-0 z-50", style: {
            background: "linear-gradient(90deg, #246f67 0%, #01c5a7ff 50%)",
        }, children: _jsxs("div", { className: "w-full h-16 flex items-center gap-4 px-3 sm:px-4", children: [_jsxs(Sheet, { children: [_jsx(SheetTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "text-white md:hidden", children: _jsx(Menu, { className: "w-5 h-5" }) }) }), _jsx(SheetContent, { side: "left", className: "w-72", children: _jsx("nav", { className: "mt-6 grid gap-3", children: mainNav.map((it) => (_jsx(NavLink, { to: it.to, className: "px-2 py-2 rounded hover:bg-accent", children: it.label }, it.to))) }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { size: "icon", className: "!bg-white", children: _jsx(Menu, { className: "!w-5 h-5 text-teal-700" }) }) }), _jsxs(DropdownMenuContent, { align: "start", children: [_jsx(DropdownMenuItem, { children: "Xe \u0111i\u1EC7n" }), _jsx(DropdownMenuItem, { children: "Pin \u0111i\u1EC7n" }), _jsx(DropdownMenuItem, { children: "Ph\u1EE5 ki\u1EC7n" }), _jsx(DropdownMenuItem, { children: "D\u1ECBch v\u1EE5" })] })] }), _jsxs(Link, { to: "/", className: "inline-flex items-center", children: [_jsx("span", { className: "inline-flex items-center bg-white border border-gray-200 rounded-md p-0.95 shadow-sm", children: _jsx("img", { src: "/images/logo-name.png", alt: "EcoGreen", className: "w-[80px] md:w-[80px] h-auto block object-contain" }) }), _jsx("span", { className: "sr-only", children: "ECOGREEN" })] })] }), _jsx("div", { className: "hidden md:flex flex-1 justify-center", children: _jsxs("form", { onSubmit: (e) => e.preventDefault(), className: "flex items-center gap-2 bg-white rounded-xl px-3 shadow w-full max-w-xl", children: [_jsx(Search, { className: "w-5 h-5 text-gray-500" }), _jsx(Input, { placeholder: "T\u00ECm s\u1EA3n ph\u1EA9m...", className: "flex-1 h-10 !border-none !shadow-none !focus-visible:ring-0 !text-sm" }), _jsx(Button, { type: "submit", className: "!h-7 !px-2 !text-sm !bg-[#246f67] !hover:bg-gray-800 !text-white", children: "T\u00ECm ki\u1EBFm" })] }) }), _jsxs("div", { className: "ml-auto flex items-center gap-2", children: [_jsx(Button, { size: "icon", className: "hidden sm:flex !bg-white", children: _jsx(Heart, { className: "w-4 h-4 text-teal-700" }) }), _jsx(Button, { asChild: true, className: "hidden md:flex !text-[#246f67] !bg-white", children: _jsx(Link, { to: "/login", children: "\u0110\u0103ng nh\u1EADp" }) }), _jsxs(Button, { className: "!bg-[#246f67] !text-sm hover:bg-teal-800 flex items-center gap-2 text-white", children: [_jsx(PlusCircle, { className: "w-4 h-4" }), _jsx("span", { children: "\u0110\u0103ng tin" })] }), _jsx(UserMenu, {})] })] }) }));
}
