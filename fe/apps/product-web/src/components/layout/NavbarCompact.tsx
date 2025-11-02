import { useEffect, useRef, useState } from "react";
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
import UserMenu from "../user/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  listSellerPurchaseRequests,
  type PurchaseRequestDTO,
} from "@/api/productDetail";

const mainNav = [
  { label: "EcoGreen", to: "/" },
  { label: "Xe điện", to: "/xe-dien" },
  { label: "Pin điện", to: "/pin-dien" },
  { label: "EcoBlog", to: "/blog" },
];

const READ_KEY = "eg_read_requests_ids";

export default function Navbar() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [keyword, setKeyword] = useState("");

  const [openNoti, setOpenNoti] = useState(false);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const [requests, setRequests] = useState<PurchaseRequestDTO[]>([]);
  const readIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(READ_KEY);
      if (raw) readIdsRef.current = new Set(JSON.parse(raw));
    } catch {}
  }, []);

  const saveReadIds = () => {
    try {
      sessionStorage.setItem(READ_KEY, JSON.stringify(Array.from(readIdsRef.current)));
    } catch {}
  };

  const loadNoti = async () => {
    if (!user) return;
    setLoadingNoti(true);
    try {
      const res = await listSellerPurchaseRequests({ page: 0, size: 20 });
      setRequests(res?.content ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Không tải được thông báo giao dịch.");
    } finally {
      setLoadingNoti(false);
    }
  };

  const markAsRead = (id: string) => {
    if (!readIdsRef.current.has(id)) {
      readIdsRef.current.add(id);
      saveReadIds();
    }
  };

  const onOpenChange = (v: boolean) => {
    if (v && user) loadNoti();
    if (!user && v) {
      setOpenNoti(false);
      nav(`/login?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`);
      toast.info("Vui lòng đăng nhập để xem thông báo.");
      return;
    }
    setOpenNoti(v);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = keyword.trim();
    nav(`/search?keyword=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[12000] shadow-sm"
        style={{ background: "linear-gradient(90deg, #246f67 0%, #01c5a7ff 50%)" }}
      >
        <div className="w-full h-16 flex items-center gap-4 px-3 sm:px-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 z-[13000]">
              <nav className="mt-6 grid gap-3">
                {mainNav.map((it) => (
                  <NavLink key={it.to} to={it.to} className="px-2 py-2 rounded hover:bg-accent">
                    {it.label}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo + menu danh mục */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="!bg-white">
                  <Menu className="!w-5 h-5 text-teal-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="z-[13000]">
                <DropdownMenuItem asChild><Link to="/xe-dien">Xe điện</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/pin-dien">Pin điện</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/" className="inline-flex items-center">
              <span className="inline-flex items-center">
                <img
                  src="/images/logo-name.png"
                  alt="EcoGreen"
                  className="w-[100px] md:w-[150px] h-auto block object-contain"
                />
              </span>
              <span className="sr-only">ECOGREEN</span>
            </Link>
          </div>

          {/* Search (desktop) */}
          <div className="hidden md:flex flex-1 justify-center">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-white rounded-xl px-3 shadow w-full max-w-xl"
            >
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Tìm sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 h-10 !border-none !shadow-none !focus-visible:ring-0 !text-sm"
              />
              <Button
                type="submit"
                className="!h-7 !px-2 !text-sm !bg-[#246f67] !hover:bg-gray-800 !text-white"
              >
                Tìm kiếm
              </Button>
            </form>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <Popover open={openNoti} onOpenChange={onOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="hidden sm:flex !bg-white"
                  aria-label="Thông báo"
                  title="Thông báo giao dịch"
                >
                  <Bell className="w-4 h-4 text-teal-700" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                side="bottom"
                align="end"
                sideOffset={10}
                className="
                  p-0 w-[420px] max-h-[70vh]
                  overflow-y-auto             /* chỉ để auto, không overscroll-behavior */
                  rounded-2xl border border-teal-200 bg-white shadow-xl
                  focus-visible:outline-none focus-visible:ring-0
                "
              >
                {/* Header */}
                <div
                  className="sticky top-0 z-10 px-4 py-3 rounded-t-2xl text-white"
                  style={{ background: "linear-gradient(90deg,#246f67 0%,#01c5a7 100%)" }}
                >
                  <div className="text-lg font-semibold">Thông Báo</div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur">Hoạt động</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10">Tin tức</span>
                  </div>
                </div>

                {loadingNoti ? (
                  <div className="px-4 py-6 text-sm text-slate-600">Đang tải…</div>
                ) : requests.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-slate-600">Chưa có thông báo giao dịch nào.</div>
                ) : (
                  <ul className="px-3 pb-3">
                    {requests.map((r) => {
                      const isRead = readIdsRef.current.has(r.id);
                      return (
                        <li
                          key={r.id}
                          className={`rounded-xl border border-teal-100 m-2 p-3 shadow-sm transition bg-teal-50/40 hover:bg-teal-50 ${
                            isRead ? "opacity-60" : "opacity-100"
                          }`}
                        >
                          <div className="font-semibold text-slate-800">
                            Yêu cầu mua – {r.productTitle}
                          </div>
                          <div className="mt-1 text-sm text-slate-700">
                            Người mua: <b>{r.buyerName}</b>
                          </div>
                          <div className="text-sm text-slate-700">
                            Giá đề nghị: <b>{(r.offeredPrice ?? 0).toLocaleString("vi-VN")} đ</b>
                          </div>

                          <div className="mt-3">
                            <Link
                              to={`/seller/purchase-requests/${r.id}`}
                              state={{ request: r }}
                              className="inline-flex items-center gap-1 rounded-sm px-3 py-1 !text-sm bg-[#246f67] text-white"
                              onClick={() => {
                                setOpenNoti(false);
                                markAsRead(r.id);
                              }}
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              size="icon"
              className="hidden sm:flex !bg-white"
              aria-label="Danh sách theo dõi"
              title="Danh sách theo dõi"
              onClick={() => nav("/account/wishlist")}
            >
              <Heart className="w-4 h-4 text-teal-700" />
            </Button>

            {user ? (
              <Button asChild className="hidden md:flex !text-[#246f67] !bg-white">
                <Link to="/post/manage">Quản lý tin</Link>
              </Button>
            ) : (
              <Button asChild className="hidden md:flex !text-[#246f67] !bg-white">
                <Link to="/login">Đăng nhập</Link>
              </Button>
            )}

            <Button
              asChild
              className="!bg-[#246f67] !text-sm hover:bg-teal-800 flex items-center gap-2 text-white"
            >
              <Link to="/post/new">
                <PlusCircle className="w-4 h-4" />
                <span>Đăng tin</span>
              </Link>
            </Button>

            <UserMenu />
          </div>
        </div>
      </header>
      <div className="h-16" />
    </>
  );
}
