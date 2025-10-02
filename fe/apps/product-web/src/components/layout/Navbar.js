import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Heart, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import "@/styles/Navbar.css";
import UserMenu from "@/components/user/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
const mainNav = [
    { label: "EcoGreen", to: "/" },
    { label: "Xe điện", to: "/xe-dien" },
    { label: "Pin điện", to: "/pin-dien" },
    { label: "EcoBlog", to: "/blog" },
];
export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user } = useAuth();
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (_jsxs("header", { className: `navbar sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "navbar-shrink" : "navbar-expanded"}`, style: isScrolled
            ? {
                background: "linear-gradient(90deg, #246f67 0%, #01c5a7ff 50%)",
            }
            : {
                backgroundImage: "url('/images/navbar-bg.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
            }, children: [_jsxs("div", { className: "!w-full !h-16 !flex items-center !gap-4 !px-3 !sm:px-4", children: [_jsxs(Sheet, { children: [_jsx(SheetTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "text-black md:hidden", children: _jsx(Menu, { className: "!w-5 h-5" }) }) }), _jsx(SheetContent, { side: "right", className: "w-72", children: _jsx("nav", { className: "mt-6 grid gap-3", children: mainNav.map((it) => (_jsx(NavLink, { to: it.to, className: "text-black !px-2 !py-2 !rounded !hover:bg-accent", children: it.label }, it.to))) }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { size: "icon", className: "hidden md:inline-flex !bg-white/90 text-teal-700", "aria-label": "Danh m\u1EE5c", children: _jsx(Menu, { className: "w-5 h-5" }) }) }), _jsxs(DropdownMenuContent, { align: "start", className: "min-w-[180px]", children: [_jsx(DropdownMenuItem, { asChild: true, children: _jsx(Link, { to: "/xe-dien", className: "w-full", children: "Xe \u0111i\u1EC7n" }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsx(Link, { to: "/pin-dien", className: "w-full", children: "Pin \u0111i\u1EC7n" }) })] })] }), _jsxs(Link, { to: "/", className: "inline-flex items-center", children: [_jsx("span", { className: "inline-flex items-center bg-white border border-gray-200 rounded-md p-0.95 shadow-sm", children: _jsx("img", { src: "/images/logo-name.png", alt: "EcoGreen", className: "w-[80px] md:w-[80px] h-auto block object-contain" }) }), _jsx("span", { className: "sr-only", children: "ECOGREEN" })] })] }), _jsx("div", { className: "hidden md:flex flex-1 justify-center", children: !isScrolled ? (_jsx("nav", { className: "flex items-center gap-6 pl-35", children: mainNav.map((it) => (_jsx(NavLink, { to: it.to, className: ({ isActive }) => `relative font-medium ml-5 transition-colors ${isActive
                                    ? "text-[#124f47] font-bold"
                                    : "text-[#246f67] opacity-70 hover:text-yellow-300"}`, children: it.label }, it.to))) })) : (_jsxs("form", { onSubmit: (e) => e.preventDefault(), className: "flex items-center gap-2 bg-white rounded-xl px-3 shadow w-full max-w-xl", children: [_jsx(Search, { className: "w-5 h-5 text-gray-500" }), _jsx(Input, { placeholder: "T\u00ECm s\u1EA3n ph\u1EA9m...", className: "flex-1 h-10 border-none shadow-none focus-visible:ring-0 text-sm" }), _jsx(Button, { type: "submit", className: "h-8 px-3 text-sm font-medium text-white \r\n                bg-gradient-to-r from-[#246f67] to-[#2ba195] \r\n                hover:from-[#1e5c55] hover:to-[#238678]", children: "T\u00ECm ki\u1EBFm" })] })) }), _jsxs("div", { className: "ml-auto flex items-center gap-2", children: [_jsx(Button, { size: "icon", className: "hidden sm:flex !bg-white", children: _jsx(Heart, { className: "w-4 h-4 text-teal-700" }) }), user ? (_jsx(Button, { asChild: true, className: "hidden md:flex !text-[#246f67] !bg-white", children: _jsx(Link, { to: "/", children: "Qu\u1EA3n l\u00FD tin" }) })) : (_jsx(Button, { asChild: true, className: "hidden md:flex !text-[#246f67] !bg-white", children: _jsx(Link, { to: "/login", children: "\u0110\u0103ng nh\u1EADp" }) })), _jsxs(Button, { className: "!bg-[#246f67] !text-sm hover:bg-teal-800 flex items-center gap-2 text-white", children: [_jsx(PlusCircle, { className: "w-4 h-4" }), _jsx("span", { children: "\u0110\u0103ng tin" })] }), _jsx(UserMenu, {})] })] }), !isScrolled && (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-full flex justify-center py-2", children: _jsx("span", { className: "text-[#246f67] text-3xl md:text-4xl font-extrabold mt-1.5 tracking-wide drop-shadow", children: "\"\u0110\u0103ng tin d\u1EC5 \u2013 Ch\u1ED1t \u0111\u01A1n nhanh!\"" }) }), _jsx("div", { className: "mx-auto max-w-4xl px-4 py-3 flex justify-center", children: _jsxs("form", { onSubmit: (e) => e.preventDefault(), className: "flex w-full max-w-3xl items-center gap-2 bg-white rounded-xl px-5 py-3 mt-11 shadow", children: [_jsx(Search, { className: "w-5 h-5 text-gray-500" }), _jsx(Input, { placeholder: "T\u00ECm s\u1EA3n ph\u1EA9m...", className: "flex-1 border-none shadow-none focus-visible:ring-0 text-sm" }), _jsx(Button, { type: "submit", className: "!h-10 !px-4 !bg-[#246f67] !text-white hover:!bg-gray-800", children: "T\u00ECm ki\u1EBFm" })] }) })] }))] }));
}
