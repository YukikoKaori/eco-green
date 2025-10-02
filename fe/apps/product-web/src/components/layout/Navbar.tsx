import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Heart, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import "@/styles/Navbar.css";
import UserMenu from "@/components/user/UserMenu";
import { useAuth } from "@/contexts/AuthContext"; 

const mainNav = [
  { label: "EcoGreen", to: "/" },
  { label: "Xe điện", to: "/xe-dien" },
  { label: "Pin điện", to: "/pin-dien" },
  { label: "EcoBlog", to: "/blog" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth(); 

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`navbar sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "navbar-shrink" : "navbar-expanded"
      }`}
      style={
        isScrolled
          ? {
              background: "linear-gradient(90deg, #246f67 0%, #01c5a7ff 50%)",
            }
          : {
              backgroundImage: "url('/images/navbar-bg.png')",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }
      }
    >
      {/* Top bar */}
      <div className="!w-full !h-16 !flex items-center !gap-4 !px-3 !sm:px-4">
        {/* Drawer Menu (mobile) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-black md:hidden">
              <Menu className="!w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <nav className="mt-6 grid gap-3">
              {mainNav.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className="text-black !px-2 !py-2 !rounded !hover:bg-accent"
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
            <DropdownMenuContent align="start" className="min-w-[180px]">
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
            <span className="inline-flex items-center bg-white border border-gray-200 rounded-md p-0.95 shadow-sm">
              <img
                src="/images/logo-name.png"
                alt="EcoGreen"
                className="w-[80px] md:w-[80px] h-auto block object-contain"
              />
            </span>
            <span className="sr-only">ECOGREEN</span>
          </Link>
        </div>

        {/* Navigation (desktop) */}
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
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 bg-white rounded-xl px-3 shadow w-full max-w-xl"
            >
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Tìm sản phẩm..."
                className="flex-1 h-10 border-none shadow-none focus-visible:ring-0 text-sm"
              />
              <Button
                type="submit"
                className="h-8 px-3 text-sm font-medium text-white 
                bg-gradient-to-r from-[#246f67] to-[#2ba195] 
                hover:from-[#1e5c55] hover:to-[#238678]"
              >
                Tìm kiếm
              </Button>
            </form>
          )}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Favorite */}
          <Button size="icon" className="hidden sm:flex !bg-white">
            <Heart className="w-4 h-4 text-teal-700" />
          </Button>

          {user ? (
            <Button
              asChild
              className="hidden md:flex !text-[#246f67] !bg-white"
            >
              <Link to="/">Quản lý tin</Link>
            </Button>
          ) : (
            <Button
              asChild
              className="hidden md:flex !text-[#246f67] !bg-white"
            >
              <Link to="/login">Đăng nhập</Link>
            </Button>
          )}

          {/* Đăng tin */}
          <Button className="!bg-[#246f67] !text-sm hover:bg-teal-800 flex items-center gap-2 text-white">
            <PlusCircle className="w-4 h-4" />
            <span>Đăng tin</span>
          </Button>

          <UserMenu />
        </div>
      </div>

      {/* Banner dưới nếu chưa scroll */}
      {!isScrolled && (
        <>
          <div className="w-full flex justify-center py-2">
            <span className="text-[#246f67] text-3xl md:text-4xl font-extrabold mt-1.5 tracking-wide drop-shadow">
              "Đăng tin dễ – Chốt đơn nhanh!"
            </span>
          </div>

          <div className="mx-auto max-w-4xl px-4 py-3 flex justify-center">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-3xl items-center gap-2 bg-white rounded-xl px-5 py-3 mt-11 shadow"
            >
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Tìm sản phẩm..."
                className="flex-1 border-none shadow-none focus-visible:ring-0 text-sm"
              />
              <Button
                type="submit"
                className="!h-10 !px-4 !bg-[#246f67] !text-white hover:!bg-gray-800"
              >
                Tìm kiếm
              </Button>
            </form>
          </div>
        </>
      )}
    </header>
  );
}
