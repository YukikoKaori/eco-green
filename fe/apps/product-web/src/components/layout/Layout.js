import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
export default function Layout() {
    return (_jsxs("div", { className: "flex flex-col min-h-screen", children: [_jsx(Navbar, {}), _jsx("main", { className: "flex-1 mx-auto w-full", children: _jsx(Outlet, {}) }), _jsx(Footer, {})] }));
}
