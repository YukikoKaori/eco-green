// src/layouts/Sidebar.tsx
import { useLocation, NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Clock3,
  Eye,
  Users,
  UserRound,
  BadgeCheck,
  DollarSign,
  Settings,
  ChevronDown,
  LockKeyhole,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import SidebarUserCard from "@/components/SidebarUserCard";

const BRAND = "#0f766e";

// style helpers (đồng bộ cho mọi item)
const linkBase =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition";
const linkActive =
  "bg-[rgba(15,118,110,0.10)] text-[color:var(--brand,_#0f766e)]";
const linkIdle =
  "text-gray-700 hover:bg-[rgba(15,118,110,0.06)] hover:text-[color:var(--brand,_#0f766e)]";
const groupBtn = `${linkBase} w-full justify-between select-none`;

export default function Sidebar() {
  const { pathname } = useLocation();

  // active detection cho group
  const isPostsActive = useMemo(() => pathname.startsWith("/posts"), [pathname]);
  const isAccountsActive = useMemo(
    () => pathname.startsWith("/users") || pathname.startsWith("/staffs"),
    [pathname]
  );
  const isSettingsActive = useMemo(
    () => pathname.startsWith("/settings"),
    [pathname]
  );

  // mở mặc định nếu đang ở trong nhóm
  const [openPosts, setOpenPosts] = useState(isPostsActive);
  const [openAccounts, setOpenAccounts] = useState(isAccountsActive);
  const [openSettings, setOpenSettings] = useState(isSettingsActive);

  return (
    <aside className="hidden md:flex w-60 h-full border-r bg-white">
      <div className="flex flex-col w-full">
        {/* Logo */}
        <div className="h-14 flex items-center px-4">
          <div className="inline-flex items-center gap-2">
            <img src="/images/logo.png" className="h-6" alt="EcoGreen" />
            <span className="font-extrabold text-sm" style={{ color: BRAND }}>
              EcoGreen Staff
            </span>
          </div>
        </div>

        <Separator />

        {/* Menu */}
        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="space-y-1">
            {/* Tổng quan */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                [linkBase, isActive ? linkActive : linkIdle].join(" ")
              }
              aria-label="Tổng quan"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="truncate">Tổng quan</span>
            </NavLink>

            {/* Quản lý bài đăng (group) */}
            <button
              type="button"
              onClick={() => setOpenPosts((v) => !v)}
              className={[groupBtn, isPostsActive ? linkActive : linkIdle].join(" ")}
              aria-expanded={openPosts}
              aria-controls="menu-posts"
            >
              <span className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="truncate text-sm">Quản lý bài đăng</span>
              </span>
              <ChevronDown
                className={[
                  "h-4 w-4 transition-transform",
                  openPosts ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            <div
              id="menu-posts"
              className={[
                "overflow-hidden pl-9 pr-1",
                openPosts ? "max-h-48 py-1" : "max-h-0",
                "transition-[max-height,padding] duration-300 ease-in-out",
              ].join(" ")}
            >
              <NavLink
                to="/posts/pending"
                className={({ isActive }) =>
                  ["flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                   isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Cần phê duyệt"
              >
                <Clock3 className="h-4 w-4" />
                <span className="truncate">Cần phê duyệt</span>
              </NavLink>

              <NavLink
                to="/posts/active"
                className={({ isActive }) =>
                  ["flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                   isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Đang hiển thị"
              >
                <Eye className="h-4 w-4" />
                <span className="truncate">Đang hiển thị</span>
              </NavLink>
            </div>

            {/* Quản lý tài khoản (group) */}
            <button
              type="button"
              onClick={() => setOpenAccounts((v) => !v)}
              className={[groupBtn, isAccountsActive ? linkActive : linkIdle].join(" ")}
              aria-expanded={openAccounts}
              aria-controls="menu-accounts"
            >
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="truncate text-sm">Quản lý tài khoản</span>
              </span>
              <ChevronDown
                className={[
                  "h-4 w-4 transition-transform",
                  openAccounts ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            <div
              id="menu-accounts"
              className={[
                "overflow-hidden pl-9 pr-1",
                openAccounts ? "max-h-48 py-1" : "max-h-0",
                "transition-[max-height,padding] duration-300 ease-in-out",
              ].join(" ")}
            >
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  ["flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                   isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Người dùng"
              >
                <UserRound className="h-4 w-4" />
                <span className="truncate">Người dùng</span>
              </NavLink>

              <NavLink
                to="/staffs"
                className={({ isActive }) =>
                  ["flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                   isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Nhân viên"
              >
                <BadgeCheck className="h-4 w-4" />
                <span className="truncate">Nhân viên</span>
              </NavLink>
            </div>

            {/* Quản lý giao dịch */}
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                [linkBase, isActive ? linkActive : linkIdle].join(" ")
              }
              aria-label="Quản lý giao dịch"
            >
              <DollarSign className="h-4 w-4" />
              <span className="truncate">Quản lý giao dịch</span>
            </NavLink>

            {/* Cài đặt */}
            <button
              type="button"
              onClick={() => setOpenSettings((v) => !v)}
              className={[groupBtn, isSettingsActive ? linkActive : linkIdle].join(" ")}
              aria-expanded={openSettings}
              aria-controls="menu-settings"
            >
              <span className="inline-flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="truncate text-sm">Cài đặt</span>
              </span>
              <ChevronDown
                className={[
                  "h-4 w-4 transition-transform",
                  openSettings ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            <div
              id="menu-settings"
              className={[
                "overflow-hidden pl-9 pr-1",
                openSettings ? "max-h-40 py-1" : "max-h-0",
                "transition-[max-height,padding] duration-300 ease-in-out",
              ].join(" ")}
            >
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  ["flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                   isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Hồ sơ cá nhân"
              >
                <UserRound className="h-4 w-4" />
                <span className="truncate">Hồ sơ cá nhân</span>
              </NavLink>

              <NavLink
                to="/password"
                className={({ isActive }) =>
                  ["flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                   isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Đổi mật khẩu"
              >
                <LockKeyhole className="h-4 w-4" />
                <span className="truncate">Đổi mật khẩu</span>
              </NavLink>
            </div>
          </nav>
        </ScrollArea>

        {/* Thẻ thông tin Admin + Logout ở đáy */}
        <SidebarUserCard />
      </div>
    </aside>
  );
}
