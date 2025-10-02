import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Search as SearchIcon, Clock, Star, History, Store, Settings, HelpCircle, MessageSquare, LogOut, User, ChevronRight, Edit3, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
const SECTIONS = [
    {
        title: "Tiện ích",
        items: [
            { to: "/saved", label: "Tin đăng đã lưu", icon: _jsx(Bookmark, { className: "w-4 h-4" }) },
            { to: "/search/saved", label: "Tìm kiếm đã lưu", icon: _jsx(SearchIcon, { className: "w-4 h-4" }) },
            { to: "/history/views", label: "Lịch sử xem tin", icon: _jsx(Clock, { className: "w-4 h-4" }) },
            { to: "/ratings", label: "Đánh giá từ tôi", icon: _jsx(Star, { className: "w-4 h-4" }) },
        ],
    },
    {
        title: "Dịch vụ trả phí",
        items: [
            { to: "/orders", label: "Lịch sử giao dịch", icon: _jsx(History, { className: "w-4 h-4" }) },
            { to: "/store", label: "Cửa hàng/Chuyên trang", icon: _jsx(Store, { className: "w-4 h-4" }) },
        ],
    },
    {
        title: "Khác",
        items: [
            { to: "/account/profile", label: "Cài đặt tài khoản", icon: _jsx(Settings, { className: "w-4 h-4" }) },
            { to: "/help", label: "Trợ giúp", icon: _jsx(HelpCircle, { className: "w-4 h-4" }) },
            { to: "/feedback", label: "Đóng góp ý kiến", icon: _jsx(MessageSquare, { className: "w-4 h-4" }) },
            // Đăng xuất để riêng
        ],
    },
];
function RowLink({ to, icon, label, danger }) {
    return (_jsx(DropdownMenuItem, { asChild: true, className: "p-0", children: _jsxs(Link, { to: to, className: `flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 no-underline text-sm ${danger ? "text-rose-600" : "text-gray-800"}`, children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-gray-600", children: icon }), label] }), _jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" })] }) }));
}
export default memo(function UserMenu() {
    const { user, logout } = useAuth();
    const isLoggedIn = !!user;
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { size: "icon", className: "ml-1 !bg-white", children: _jsx(User, { className: "w-5 h-5 text-teal-700" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-[360px] h-[600px] p-0 rounded-2xl border border-gray-200 shadow-sm", children: [_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-14 h-14 rounded-full bg-gray-200 overflow-hidden grid place-content-center text-gray-500", children: _jsx(User, { className: "w-7 h-7" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-semibold text-gray-900", children: user?.fullName || user?.username || "Khách" }), _jsx("div", { className: "text-xs text-gray-500", children: user?.email || user?.phone || "Đăng nhập để dùng đầy đủ tiện ích" })] }), isLoggedIn && (_jsxs(Link, { to: "/account/profile", className: "inline-flex items-center gap-1 text-sm text-teal-700", children: [_jsx(Edit3, { className: "w-4 h-4" }), " S\u1EEDa"] }))] }), !isLoggedIn && (_jsxs("div", { className: "mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3", children: [_jsx("div", { className: "text-[#0f766e] font-semibold text-sm", children: "Mua th\u00EC h\u1EDDi, b\u00E1n th\u00EC l\u1EDDi!" }), _jsx("div", { className: "text-gray-500 text-xs mb-3", children: "\u0110\u0103ng nh\u1EADp t\u00E0i kho\u1EA3n nha!" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/register", className: "flex-1 h-9 rounded-full bg-white border border-gray-300 text-gray-800 text-sm grid place-content-center", children: "T\u1EA1o t\u00E0i kho\u1EA3n" }), _jsx(Link, { to: "/login", className: "flex-1 h-9 rounded-full bg-[#0f766e] text-white text-sm grid place-content-center", children: "\u0110\u0103ng nh\u1EADp" })] })] }))] }), SECTIONS.map((sec) => (_jsxs("div", { className: "px-4 py-3", children: [_jsx("h4", { className: "text-gray-600 text-sm font-semibold mb-2", children: sec.title }), _jsx("div", { className: "space-y-2", children: sec.items.map((it) => (_jsx(RowLink, { ...it }, it.to))) })] }, sec.title))), isLoggedIn && (_jsx("div", { className: "px-4 pb-4", children: _jsx(DropdownMenuItem, { className: "p-0", onClick: logout, children: _jsxs("button", { className: "flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-rose-600", children: [_jsxs("span", { className: "flex items-center gap-3", children: [_jsx(LogOut, { className: "w-4 h-4 text-rose-600" }), "\u0110\u0103ng xu\u1EA5t"] }), _jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" })] }) }) }))] })] }));
});
