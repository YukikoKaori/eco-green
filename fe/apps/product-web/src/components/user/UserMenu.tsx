import { JSX, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutApi } from "@/api/auth";
import {
  Bookmark, Search as SearchIcon, Clock, Star, History, Store,
  Settings, HelpCircle, MessageSquare, LogOut, User, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

type Item = { to: string; label: string; icon: JSX.Element; danger?: boolean };
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
  { title: "Tiện ích", items: [
    { to: "/account/wishlist", label: "Tin đăng đã lưu", icon: <Bookmark className="w-4 h-4" /> },
    { to: "/history/views", label: "Lịch sử xem tin", icon: <Clock className="w-4 h-4" /> },
    { to: "/ratings", label: "Đánh giá từ tôi", icon: <Star className="w-4 h-4" /> },
  ]},
  { title: "Dịch vụ trả phí", items: [
    { to: "/orders", label: "Lịch sử giao dịch", icon: <History className="w-4 h-4" /> },
  ]},
  { title: "Khác", items: [
    { to: "/account/profile", label: "Cài đặt tài khoản", icon: <Settings className="w-4 h-4" /> },
    { to: "/help", label: "Trợ giúp", icon: <HelpCircle className="w-4 h-4" /> },
    { to: "/feedback", label: "Đóng góp ý kiến", icon: <MessageSquare className="w-4 h-4" /> },
  ]},
];

function RowLink({ to, icon, label, danger }: Item) {
  return (
    <DropdownMenuItem asChild className="p-0">
      <Link
        to={to}
        className={`flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 no-underline text-sm ${
          danger ? "text-rose-600" : "text-gray-800"
        } cursor-pointer`}
      >
        <span className="flex items-center gap-3">
          <span className="text-gray-600">{icon}</span>
          {label}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </Link>
    </DropdownMenuItem>
  );
}

export default memo(function UserMenu() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const isLoggedIn = !!user;

  async function handleLogout() {
    try { await logoutApi(); } catch {}
    await logout();
    nav("/");
  }

  const profileUrl = isLoggedIn ? `/profile/${encodeURIComponent(user!.username)}` : "/login";
  const DEFAULT_AVATAR = "/images/avatar-default.png";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="ml-1 !bg-white">
          <User className="w-5 h-5 text-teal-700" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[360px] h-[600px] p-0 rounded-2xl border border-gray-200 shadow-sm
                   z-[12020] max-h-[70vh] overflow-auto"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link
              to={profileUrl}
              aria-label={isLoggedIn ? `Xem trang của ${user!.fullName || user!.username}` : "Đăng nhập"}
              className="flex items-center gap-3 no-underline hover:opacity-90"
            >
              <Avatar className="w-14 h-14 ring-2 ring-[#2ba195]/20">
                <AvatarImage
                  src={user?.avatarUrl ?? DEFAULT_AVATAR}
                  alt={user?.fullName || user?.username || "User"}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
                  className="object-cover"
                />
                <AvatarFallback>
                  {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  {user?.fullName || user?.username || "Khách"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email ?? user?.phone ?? "Đăng nhập để dùng đầy đủ tiện ích"}
                </div>
              </div>
            </Link>
          </div>

          {!isLoggedIn && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <div className="text-[#0f766e] font-semibold text-sm">Mua thì hời, bán thì lời!</div>
              <div className="text-gray-500 text-xs mb-3">Đăng nhập tài khoản nha!</div>
              <div className="flex items-center gap-3">
                <Link to="/register" className="flex-1 h-9 rounded-full bg-white border border-gray-300 text-gray-800 text-sm grid place-content-center">
                  Tạo tài khoản
                </Link>
                <Link to="/login" className="flex-1 h-9 rounded-full bg-[#0f766e] text-white text-sm grid place-content-center">
                  Đăng nhập
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        {SECTIONS.map((sec) => (
          <div key={sec.title} className="px-4 py-3">
            <h4 className="text-gray-600 text-sm font-semibold mb-2">{sec.title}</h4>
            <div className="space-y-2">
              {sec.items.map((it) => <RowLink key={it.to} {...it} />)}
            </div>
          </div>
        ))}

        {/* Logout */}
        {isLoggedIn && (
          <div className="px-4 pb-4">
            <DropdownMenuItem className="p-0" onSelect={(e) => e.preventDefault()}>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-rose-600"
              >
                <span className="flex items-center gap-3">
                  <LogOut className="w-4 h-4 text-rose-600" />
                  Đăng xuất
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
