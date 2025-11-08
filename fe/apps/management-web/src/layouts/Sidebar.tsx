import { useLocation, NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Eye,
  Users,
  UserRound,
  BadgeCheck,
  DollarSign,
  Settings,
  ChevronDown,
  LockKeyhole,
  ListOrdered,
  Info, 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import SidebarUserCard from "@/components/SidebarUserCard";

const BRAND = "#0f766e";

const linkBase =
  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition";
const linkActive =
  "bg-[rgba(15,118,110,0.10)] text-[color:var(--brand,_#0f766e)]";
const linkIdle =
  "text-gray-700 hover:bg-[rgba(15,118,110,0.06)] hover:text-[color:var(--brand,_#0f766e)]";
const groupBtn = `${linkBase} w-full justify-between select-none`;

export default function Sidebar() {
  const { pathname } = useLocation();

  const isPostsActive = useMemo(
    () => pathname.startsWith("/posts") || pathname.startsWith("/reports"),
    [pathname]
  );
  const isAccountsActive = useMemo(
    () => pathname.startsWith("/users") || pathname.startsWith("/staffs"),
    [pathname]
  );
  const isTransactionsActive = useMemo(
    () => pathname.startsWith("/transactions"),
    [pathname]
  );
  const isSettingsActive = useMemo(
    () => pathname.startsWith("/settings") || pathname === "/profile" || pathname === "/password",
    [pathname]
  );

  const [openPosts, setOpenPosts] = useState(isPostsActive);
  const [openAccounts, setOpenAccounts] = useState(isAccountsActive);
  const [openTransactions, setOpenTransactions] = useState(isTransactionsActive);
  const [openSettings, setOpenSettings] = useState(isSettingsActive);

  return (
    <aside className="hidden md:flex w-60 h-full border-r bg-white">
      <div className="flex flex-col w-full">
        {/* Logo */}
        <div className="h-14 flex items-center px-4">
          <div className="inline-flex items-center gap-2">
            <img src="/images/logo.png" className="h-6" alt="EcoGreen" />
            <span className="font-extrabold text-sm" style={{ color: BRAND }}>
              EcoGreen Admin
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

            {/* Quản lý bài đăng */}
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
                openPosts ? "max-h-80 py-1" : "max-h-0",
                "transition-[max-height,padding] duration-300 ease-in-out",
              ].join(" ")}
            >
              <NavLink
                to="/posts/moderate"
                className={({ isActive }) =>
                  [linkBase, isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Tất cả tin đăng"
              >
                <Eye className="h-4 w-4" />
                <span className="truncate">Tất cả tin đăng</span>
              </NavLink>

              <NavLink
                to="/reports/count"
                className={({ isActive }) =>
                  [linkBase, isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Các khiếu nại"
              >
                <ListOrdered className="h-4 w-4" />
                <span className="truncate">Các khiếu nại</span>
              </NavLink>

              {/* ✅ Thông tin các hãng */}
              <NavLink
                to="/posts/brands"
                className={({ isActive }) =>
                  [linkBase, isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Thông tin các hãng"
              >
                <Info className="h-4 w-4" />
                <span className="truncate">Thông tin các hãng</span>
              </NavLink>
            </div>

            {/* Quản lý tài khoản */}
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
                  [linkBase, isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Người dùng"
              >
                <UserRound className="h-4 w-4" />
                <span className="truncate">Người dùng</span>
              </NavLink>

              <NavLink
                to="/staffs"
                className={({ isActive }) =>
                  [linkBase, isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Nhân viên"
              >
                <BadgeCheck className="h-4 w-4" />
                <span className="truncate">Nhân viên</span>
              </NavLink>
            </div>

            {/* Quản lý giao dịch */}
            <button
              type="button"
              onClick={() => setOpenTransactions((v) => !v)}
              className={[groupBtn, isTransactionsActive ? linkActive : linkIdle].join(" ")}
              aria-expanded={openTransactions}
              aria-controls="menu-transactions"
            >
              <span className="inline-flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="truncate text-sm">Quản lý giao dịch</span>
              </span>
              <ChevronDown
                className={[
                  "h-4 w-4 transition-transform",
                  openTransactions ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            <div
              id="menu-transactions"
              className={[
                "overflow-hidden pl-9 pr-1",
                openTransactions ? "max-h-40 py-1" : "max-h-0",
                "transition-[max-height,padding] duration-300 ease-in-out",
              ].join(" ")}
            >
              <NavLink
                to="/transactions/contracts"
                className={({ isActive }) =>
                  [linkBase, isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Hợp đồng điện tử"
              >
                <FileText className="h-4 w-4" />
                <span className="truncate">Hợp đồng điện tử</span>
              </NavLink>

              <NavLink
                to="/transactions/commissions"
                className={({ isActive }) =>
                  [linkBase, isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Hoa hồng đăng tin"
              >
                <DollarSign className="h-4 w-4" />
                <span className="truncate">Hoa hồng đăng tin</span>
              </NavLink>
            </div>

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
                  [linkBase, isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Hồ sơ cá nhân"
              >
                <UserRound className="h-4 w-4" />
                <span className="truncate">Hồ sơ cá nhân</span>
              </NavLink>

              <NavLink
                to="/password"
                className={({ isActive }) =>
                  [linkBase, isActive ? linkActive : linkIdle].join(" ")
                }
                aria-label="Đổi mật khẩu"
              >
                <LockKeyhole className="h-4 w-4" />
                <span className="truncate">Đổi mật khẩu</span>
              </NavLink>
            </div>
          </nav>
        </ScrollArea>

        <SidebarUserCard />
      </div>
    </aside>
  );
}
