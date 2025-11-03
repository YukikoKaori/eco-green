import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Heart, PlusCircle, Search, Bell, CheckCircle2, XCircle } from "lucide-react";
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
  listSellerPurchaseRequests,
  respondPurchaseRequest,
  type PurchaseRequestDTO,
} from "@/api/productDetail";

const mainNav = [
  { label: "EcoGreen", to: "/" },
  { label: "Xe điện", to: "/xe-dien" },
  { label: "Pin điện", to: "/pin-dien" },
  { label: "EcoBlog", to: "/blog" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [keyword, setKeyword] = useState("");
  const { user } = useAuth();
  const nav = useNavigate();

  /* ===== Popover Thông báo ===== */
  const [openNoti, setOpenNoti] = useState(false);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const [requests, setRequests] = useState<PurchaseRequestDTO[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

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

  const handleRespond = async (id: string, accept: boolean) => {
    setBusy(id);
    try {
      const updated = await respondPurchaseRequest({
        requestId: id,
        accept,
        responseMessage: accept
          ? "Đồng ý bán với giá bạn đề xuất. Vui lòng ký hợp đồng."
          : "Xin lỗi, tôi không đồng ý bán.",
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success(accept ? "Đã đồng ý – hợp đồng đã được gửi qua email." : "Đã từ chối yêu cầu.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Thao tác thất bại.");
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    const THRESHOLD = 60, HYST = 12;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled((prev) => (prev ? y > THRESHOLD - HYST : y > THRESHOLD + HYST));
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
    try { if (q) await searchProductsByName(q); } catch { }
    nav(`/search?keyword=${encodeURIComponent(q)}`);
  };

  return (
    <header
      className={`navbar fixed top-0 left-0 right-0 ${isScrolled ? "navbar-shrink" : "navbar-expanded"}`}
      style={isScrolled ? { background: "linear-gradient(90deg,#246f67 0%,#01c5a7ff 50%)" } : { background: "transparent" }}
    >
      {/* TOP BAR */}
      <div style={{ height: "var(--nav-h)" }} className="w-full flex items-center gap-4 px-3 sm:px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-black md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 z-[12000]">
            <nav className="mt-6 grid gap-3">
              {mainNav.map(it => (
                <NavLink key={it.to} to={it.to} className="text-black px-2 py-2 rounded hover:bg-accent">
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
              <Button size="icon" className="hidden md:inline-flex bg-white/90 text-teal-700" aria-label="Danh mục">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="min-w-[180px] z-[12010] max-h-[70vh] overflow-auto">
              <DropdownMenuItem asChild><Link to="/xe-dien" className="w-full">Xe điện</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/pin-dien" className="w-full">Pin điện</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/" className="inline-flex items-center">
            <img src="/images/logo-name.png" alt="EcoGreen" className="w-[92px] md:w-[132px] h-auto object-contain" />
            <span className="sr-only">ECOGREEN</span>
          </Link>
        </div>

        {/* Nav desktop / Search khi shrink */}
        <div className="hidden md:flex flex-1 justify-center">
          {!isScrolled ? (
            <nav className="flex items-center gap-6 pl-35">
              {mainNav.map(it => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    `relative font-medium ml-5 transition-colors ${isActive ? "text-[#124f47] font-bold" : "text-[#246f67] opacity-70 hover:text-yellow-300"
                    }`
                  }
                >
                  {it.label}
                </NavLink>
              ))}
            </nav>
          ) : (
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white rounded-lg px-3 shadow w-full max-w-xl">
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
                           hover:from-[#1e5c55] hover:to-[#238678]">
                Tìm kiếm
              </Button>
            </form>
          )}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Popover open={openNoti} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="hidden sm:flex bg-white"
                aria-label="Thông báo"
                title="Thông báo giao dịch"
              >
                <Bell className="w-4 h-4 text-teal-700" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={10}
              className="eg-noti p-0 w-[420px] max-h-[70vh] z-[20000] rounded-2xl border-teal-200 bg-white shadow-xl"
            >
              <div className="sticky top-0 z-10 px-4 py-3 rounded-t-2xl text-white"
                style={{ background: "linear-gradient(90deg,#246f67 0%,#01c5a7 100%)" }}>
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
                  {requests.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-teal-100 bg-teal-50/40 hover:bg-teal-50 transition m-2 p-3 shadow-sm"
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

                      <div className="mt-2 flex flex-wrap items-center gap-2">

                        {(r as any).contractUrl && r.contractStatus === "SENT" && (
                          <a
                            href={(r as any).contractUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs underline text-teal-700 ml-1"
                          >
                            Mở hợp đồng
                          </a>
                        )}
                      </div>
                      <div className="mt-3">
                        <Link
                          to={`/seller/purchase-requests/${r.id}`}
                          state={{ request: r }}  
                          className="inline-flex items-center gap-1 rounded-sm px-3 py-1 !text-sm
                       bg-[#246f67] text-white"
                          onClick={() => setOpenNoti(false)}
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            size="icon"
            className="hidden sm:flex bg-white"
            aria-label="Danh sách theo dõi"
            title="Danh sách theo dõi"
            onClick={() => nav("/account/wishlist")}
          >
            <Heart className="w-4 h-4 text-teal-700" />
          </Button>

          {user ? (
            <Button asChild className="hidden md:flex text-[#246f67] !bg-white">
              <Link to="/post/manage">Quản lý tin</Link>
            </Button>
          ) : (
            <Button asChild className="hidden md:flex text-[#246f67] !bg-white">
              <Link to="/login">Đăng nhập</Link>
            </Button>
          )}

          <Button asChild className="bg-[#246f67] text-sm hover:bg-teal-800 flex items-center gap-2 text-white">
            <Link to="/post/new"><PlusCircle className="w-4 h-4" /><span>Đăng tin</span></Link>
          </Button>

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
                <Button type="submit" className="h-10 px-4 !bg-[#246f67] text-white hover:bg-gray-800">
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
