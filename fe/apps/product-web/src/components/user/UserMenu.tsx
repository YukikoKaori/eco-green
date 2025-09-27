import { JSX, memo } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark, Search as SearchIcon, Clock, Star, History, Store, Settings,
  HelpCircle, MessageSquare, LogOut, User, ChevronRight, Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from "@/components/ui/dropdown-menu";

type Item = { to: string; label: string; icon: JSX.Element; danger?: boolean };
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: "Tiện ích",
    items: [
      { to: "/saved",         label: "Tin đăng đã lưu",   icon: <Bookmark className="w-4 h-4" /> },
      { to: "/search/saved",  label: "Tìm kiếm đã lưu",   icon: <SearchIcon className="w-4 h-4" /> },
      { to: "/history/views", label: "Lịch sử xem tin",   icon: <Clock className="w-4 h-4" /> },
      { to: "/ratings",       label: "Đánh giá từ tôi",   icon: <Star className="w-4 h-4" /> },
    ],
  },
  {
    title: "Dịch vụ trả phí",
    items: [
      { to: "/orders", label: "Lịch sử giao dịch",     icon: <History className="w-4 h-4" /> },
      { to: "/store",  label: "Cửa hàng/Chuyên trang", icon: <Store className="w-4 h-4" /> },
    ],
  },
  {
    title: "Khác",
    items: [
      { to: "/account/profile", label: "Cài đặt tài khoản", icon: <Settings className="w-4 h-4" /> },
      { to: "/help",             label: "Trợ giúp",          icon: <HelpCircle className="w-4 h-4" /> },
      { to: "/feedback",         label: "Đóng góp ý kiến",   icon: <MessageSquare className="w-4 h-4" /> },
      { to: "/logout",           label: "Đăng xuất",         icon: <LogOut className="w-4 h-4 text-rose-600" />, danger: true },
    ],
  },
];

function RowLink({ to, icon, label, danger }: Item) {
  return (
    <DropdownMenuItem asChild className="p-0">
      <Link
        to={to}
        className={`flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 no-underline text-sm ${
          danger ? "text-rose-600" : "text-gray-800"
        }`}
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

export default memo(function UserMenu({
  user,
}: {
  user?: { name?: string; email?: string; avatarUrl?: string } | null;
}) {
  const isLoggedIn = !!user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="ml-1">
          <User className="w-5 h-5 text-teal-700" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] h-[600px] p-0 rounded-2xl border border-gray-200 shadow-sm"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden grid place-content-center text-gray-500">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">
                {user?.name || "Khách"}
              </div>
              <div className="text-xs text-gray-500">
                {user?.email || "Đăng nhập để dùng đầy đủ tiện ích"}
              </div>
            </div>
            {isLoggedIn ? (
              <Link to="/account/profile" className="inline-flex items-center gap-1 text-sm text-teal-700">
                <Edit3 className="w-4 h-4" /> Sửa
              </Link>
            ) : null}
          </div>

          {/* chua login */}
          {!isLoggedIn && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <div className="text-[#0f766e] font-semibold text-sm">
                Mua thì hời, bán thì lời!
              </div>
              <div className="text-gray-500 text-xs mb-3">Đăng nhập tại khoản nha!</div>
              <div className="flex items-center gap-3">
                <Link
                  to="/register"
                  className="flex-1 h-9 rounded-full bg-white border border-gray-300 text-gray-800 text-sm grid place-content-center"
                >
                  Tạo tài khoản
                </Link>
                <Link
                  to="/login"
                  className="flex-1 h-9 rounded-full bg-[#0f766e] text-white text-sm grid place-content-center"
                >
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
              {sec.items.map((it) => (
                <RowLink key={it.to} {...it} />
              ))}
            </div>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
