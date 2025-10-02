import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import LayoutCompact from "@/components/layout/LayoutCompact";
import HomePage from "@/pages/home/HomePage";
import AccountLayout from "@/pages/account/AccountLayout";
import ProfilePage from "@/pages/account/ProfilePage";
import AccountPage from "@/pages/account/AccountPage";
import SocialPage from "@/pages/account/SocialPage";
import AuthLogin from "@/pages/auth/AuthLogin";
import AuthRegister from "@/pages/auth/AuthRegister";
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { element: _jsx(Layout, {}), children: _jsx(Route, { path: "/", element: _jsx(HomePage, {}) }) }), _jsxs(Route, { element: _jsx(LayoutCompact, {}), children: [_jsxs(Route, { path: "/account", element: _jsx(AccountLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "profile", replace: true }) }), _jsx(Route, { path: "profile", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "account", element: _jsx(AccountPage, {}) }), _jsx(Route, { path: "social", element: _jsx(SocialPage, {}) })] }), _jsx(Route, { path: "/login", element: _jsx(AuthLogin, {}) }), _jsx(Route, { path: "/register", element: _jsx(AuthRegister, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
