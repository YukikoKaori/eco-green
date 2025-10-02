import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import Navbar from "./NavbarCompact";
import Footer from "./Footer";
export default function LayoutCompact() {
    return (_jsxs("div", { className: "relative min-h-screen", children: [_jsx("div", { className: "fixed inset-0 z-0 bg-cover bg-center bg-no-repeat", style: { backgroundImage: "url(/images/bg-login.png)" } }), _jsx("div", { className: "fixed inset-0 z-0 bg-white/60 backdrop-blur-[2px]" }), _jsx(Navbar, {}), _jsx("main", { className: "relative z-10 flex-1 mx-auto w-full", children: _jsx(Outlet, {}) }), _jsx(Footer, {})] }));
}
