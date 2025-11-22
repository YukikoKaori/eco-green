import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Heart, PlusCircle, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import "@/styles/Navbar.css";
import UserMenu from "@/components/user/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { searchProductsByName } from "@/api/search";
import { toast } from "sonner";
import {
  listMemberNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getUnreadNotificationCount,
  type NotificationDTO,
} from "@/api/notifications";

const mainNav = [
  { label: "EcoGreen", to: "/" },
  { label: "Xe điện", to: "/xe-dien" },
  { label: "Pin điện", to: "/pin-dien" },
  // { label: "EcoBlog", to: "/blog" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [keyword, setKeyword] = useState("");
  const { user } = useAuth();
  const nav = useNavigate();
  const [openNoti, setOpenNoti] = useState(false);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNoti = async () => {
    if (!user) return;
    setLoadingNoti(true);
    try {
      const res = await listMemberNotifications({ page: 0, size: 10 });
      setNotifications(res.content ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Không tải được thông báo.");
    } finally {
      setLoadingNoti(false);
    }
  };

  const onOpenChange = (v: boolean) => {
    if (v && user) {
      loadNoti();
    }
    if (!user && v) {
      setOpenNoti(false);
      nav(
        `/login?next=${encodeURIComponent(
          location.pathname + location.search + location.hash
        )}`
      );
      toast.info("Vui lòng đăng nhập để xem thông báo.");
      return;
    }
    setOpenNoti(v);
  };

  const hasUnread = unreadCount > 0;

  const handleMarkAllRead = async () => {
    if (!notifications.length && unreadCount === 0) return;
    try {
      const res = await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success(res.message || "Đã đánh dấu tất cả là đã đọc.");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Không thể đánh dấu đã đọc."
      );
    }
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    (async () => {
      try {
        const res = await getUnreadNotificationCount();
        setUnreadCount(res.unreadCount ?? 0);
      } catch {
      }
    })();
  }, [user]);

  useEffect(() => {
    const THRESHOLD = 60,
      HYST = 12;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled((prev) =>
          prev ? y > THRESHOLD - HYST : y > THRESHOLD + HYST
        );
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = keyword.trim();
    try {
      if (q) await searchProductsByName(q);
    } catch {
      // ignore
    }
    nav(`/search?keyword=${encodeURIComponent(q)}`);
  };

  const requireLoginAndGo = (target: string, message: string) => {
    if (!user) {
      nav(
        `/login?next=${encodeURIComponent(
          location.pathname + location.search + location.hash
        )}`
      );
      toast.info(message);
      return false;
    }
    nav(target);
    return true;
  };

  return (
    <header
      className={`navbar fixed top-0 left-0 right-0 ${
        isScrolled ? "navbar-shrink" : "navbar-expanded"
      }`}
      style={
        isScrolled
          ? { background: "linear-gradient(90deg,#246f67 0%,#01c5a7ff 50%)" }
          : { background: "transparent" }
      }
    >
      {/* TOP BAR */}
      <div
        style={{ height: "var(--nav-h)" }}
        className="w-full flex items-center gap-4 px-3 sm:px-4"
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-black md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 z-[12000]">
            <nav className="mt-6 grid gap-3">
              {mainNav.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className="text-black px-2 py-2 rounded hover:bg-accent"
                >
                  {it.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo + Danh mục */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="hidden md:inline-flex !bg-white/90 text-teal-700"
                aria-label="Danh mục"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="min-w-[180px] z-[12010] max-h-[70vh] overflow-auto"
            >
              <DropdownMenuItem asChild>
                <Link to="/xe-dien" className="w-full">
                  Xe điện
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/pin-dien" className="w-full">
                  Pin điện
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/" className="inline-flex items-center">
            <img
              src="/images/logo-name.png"
              alt="EcoGreen"
              className="w-[92px] md:w-[132px] h-auto object-contain"
            />
            <span className="sr-only">ECOGREEN</span>
          </Link>
        </div>

        {/* Nav / search */}
        <div className="hidden md:flex flex-1 justify-center">
          {!isScrolled ? (
            <nav className="flex items-center gap-6 pl-35">
              {mainNav.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    `relative font-medium ml-5 transition-colors ${
                      isActive
                        ? "text-[#124f47] font-bold"
                        : "text-[#246f67] opacity-70 hover:text-yellow-300"
                    }`
                  }
                >
                  {it.label}
                </NavLink>
              ))}
            </nav>
          ) : (
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-white rounded-lg px-3 shadow w-full max-w-xl"
            >
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Tìm sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 h-9 border-none shadow-none focus-visible:ring-0 text-sm"
              />
              <Button
                type="submit"
                className="!h-7 !px-3 !text-[14px] text-white
                           !bg-gradient-to-r from-[#246f67] to-[#2ba195]
                           hover:from-[#1e5c55] hover:to-[#238678]"
              >
                Tìm kiếm
              </Button>
            </form>
          )}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Thông báo */}
          <Popover open={openNoti} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="hidden sm:flex !bg-white"
                aria-label="Thông báo"
                title="Thông báo"
              >
                <div className="relative">
                  <Bell className="w-4 h-4 text-teal-700" />
                  {hasUnread && (
                    <span
                      className="
                        absolute -top-2 -right-2
                        flex items-center justify-center
                        min-w-[16px] h-4 px-1
                        rounded-full bg-red-500
                        text-[10px] leading-none text-white
                      "
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={10}
              className="eg-noti p-0 w-[420px] max-h-[70vh] z-[20000] rounded-2xl border-teal-200 bg-white shadow-xl"
            >
              {/* Header popover */}
              <div
                className="sticky top-0 z-10 px-4 py-3 rounded-t-2xl text-white"
                style={{ background: "linear-gradient(90deg,#246f67 0%,#01c5a7 100%)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">Thông Báo</div>
                    <div className="mt-1 text-xs text-white/80">
                      {unreadCount > 0
                        ? `${unreadCount} thông báo chưa đọc`
                        : "Bạn đã đọc hết tất cả thông báo"}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="font-medium text-white hover:text-emerald-100 transition-colors"
                    >
                      Đánh dấu đã đọc hết
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenNoti(false);
                        nav("/notifications");
                      }}
                      className="font-medium text-white hover:text-emerald-100 transition-colors"
                    >
                      Xem tất cả
                    </button>
                  </div>
                </div>
              </div>

              {/* Body popover */}
              {loadingNoti ? (
                <div className="px-4 py-6 text-sm text-slate-600">Đang tải…</div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-600">
                  Chưa có thông báo nào.
                </div>
              ) : (
                <ul className="px-3 pb-3">
                  {notifications.map((n) => {
                    const created = n.createdAt
                      ? new Date(n.createdAt).toLocaleString("vi-VN")
                      : "";
                    const isRequest = n.type === "PURCHASE_REQUEST";

                    const clickable =
                      (isRequest && n.refId) ||
                      (n.type === "PURCHASE_REQUEST_COMPLETED" && n.refId);

                    const goto = async () => {
                      if (!clickable) return;

                      if (!n.read) {
                        try {
                          await markNotificationRead(n.id);
                          setNotifications((prev) =>
                            prev.map((x) =>
                              x.id === n.id ? { ...x, read: true } : x
                            )
                          );
                          setUnreadCount((c) => Math.max(0, c - 1));
                        } catch {
                        }
                      }

                      if (isRequest && n.refId) {
                        nav(`/seller/purchase-requests/${n.refId}`, {
                          state: { fromNoti: true },
                        });
                      } else if (
                        n.type === "PURCHASE_REQUEST_COMPLETED" &&
                        n.refId
                      ) {
                        nav(
                          `/account/bought-products?ref=${encodeURIComponent(
                            n.refId
                          )}`
                        );
                      }
                      setOpenNoti(false);
                    };

                    return (
                      <li
                        key={n.id}
                        className={`rounded-xl border bg-white m-2 p-3 shadow-sm transition ${
                          !n.read ? "border-teal-300 bg-teal-50/70" : "border-slate-200"
                        } ${clickable ? "cursor-pointer" : "cursor-default"}`}
                        onClick={goto}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && (
                            <span className="mt-1 w-2 h-2 rounded-full bg-red-500" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold text-emerald-800">
                                {n.title}
                              </div>
                              {isRequest && clickable && (
                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-[11px] text-emerald-700 border border-emerald-200">
                                  Yêu cầu mua
                                </span>
                              )}
                              {!clickable && (
                                <span className="px-3 py-1 rounded-full bg-slate-50 text-[11px] text-slate-600 border border-slate-200">
                                  Thông báo
                                </span>
                              )}
                            </div>

                            <div className="mt-1 !text-xs text-slate-700">
                              {n.content}
                            </div>
                            <div className="mt-1 text-[11px] text-slate-500">
                              {created}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </PopoverContent>
          </Popover>

          {/* Wishlist */}
          <Button
            type="button"
            size="icon"
            className="hidden sm:flex !bg-white"
            aria-label="Danh sách theo dõi"
            title="Danh sách theo dõi"
            onClick={() =>
              requireLoginAndGo(
                "/account/wishlist",
                "Vui lòng đăng nhập để xem tin đã lưu."
              )
            }
          >
            <Heart className="w-4 h-4 text-teal-700" />
          </Button>

          {/* Quản lý tin / Đăng nhập */}
          {user ? (
            <Button asChild className="hidden md:flex text-[#246f67] !bg-white">
              <Link to="/post/manage">Quản lý tin</Link>
            </Button>
          ) : (
            <Button asChild className="hidden md:flex !text-[#246f67] !bg-white">
              <Link to="/login">Đăng nhập</Link>
            </Button>
          )}

          {/* Đăng tin */}
          <Button
            type="button"
            className="!bg-[#246f67] text-sm flex items-center gap-2 !text-white"
            onClick={() =>
              requireLoginAndGo("/post/new", "Vui lòng đăng nhập để đăng tin.")
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>Đăng tin</span>
          </Button>

          {/* User menu */}
          <UserMenu />
        </div>
      </div>

      {!isScrolled && (
        <div className="nav-overlay">
          <div className="mx-auto max-w-5xl px-4">
            <div className="w-full flex justify-center py-1">
              <span className="text-[#246f67] text-2xl md:text-3xl lg:text-[30px] font-bold tracking-wide drop-shadow leading-tight text-center mt-14">
                "Đăng tin dễ – Chốt đơn nhanh"
              </span>
            </div>
            <div className="mx-auto max-w-4xl px-0 py-1 flex justify-center">
              <form
                onSubmit={handleSearch}
                className="flex w-full max-w-3xl items-center gap-2 bg-white rounded-xl px-4 py-2 mt-1 shadow"
              >
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Tìm sản phẩm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="flex-1 h-10 border-none shadow-none focus-visible:ring-0 text-sm"
                />
                <Button
                  type="submit"
                  className="h-10 px-4 !bg-[#246f67] text-white hover:bg-gray-800"
                >
                  Tìm kiếm
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
