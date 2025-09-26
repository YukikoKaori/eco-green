import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Heart, User, PlusCircle, Search } from "lucide-react";
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

const mainNav = [
  { label: "EcoGreen", to: "/" },
  { label: "Xe điện", to: "/xe-dien" },
  { label: "Pin điện", to: "/pin-dien" },
  { label: "EcoBlog", to: "/blog" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`navbar sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "navbar-shrink" : "navbar-expanded"
        }`}
      style={
        isScrolled
          ? { backgroundColor: "#246f67" }
          : {
            backgroundImage: "url('/images/navbar-bg.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }
      }
    >
      {/* Top bar */}
      <div className="w-full h-16 flex items-center gap-4 px-3 sm:px-4">
        {/* Mobile menu (giữ nguyên) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-black md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="mt-6 grid gap-3">
              {mainNav.map((it) => (
                <NavLink key={it.to} to={it.to} className="text-black px-2 py-2 rounded hover:bg-accent">
                  {it.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Góc trái: icon DANH MỤC + Logo */}
        <div className="flex items-center gap-2">
          {/* Icon danh mục: chỉ hiện md+ để tránh trùng nút mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="hidden md:inline-flex bg-white/90 text-teal-700"
                aria-label="Danh mục"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
              <DropdownMenuItem asChild>
                <Link to="/xe-dien" className="w-full">Xe điện</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/pin-dien" className="w-full">Pin điện</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/" className="text-white text-xl font-extrabold tracking-wide drop-shadow">
            ECOGREEN
          </Link>
        </div>

        {/* GIỮA: menu hoặc search */}
        <div className="hidden md:flex flex-1 justify-center">
          {!isScrolled ? (
            <nav className="flex items-center gap-6 pl-12">
              {mainNav.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className="relative font-medium text-white hover:text-yellow-300 transition-colors"
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
              <Button type="submit" className="!h-8 !px-2 !bg-[#246f67] !hover:bg-gray-800 !text-white">
                Tìm kiếm
              </Button>
            </form>

          )}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="icon" className="hidden sm:flex">
            <Heart className="w-4 h-4 text-teal-700" />
          </Button>

          <Button variant="secondary" className="hidden md:flex">
            Đăng nhập
          </Button>

          <Button className="bg-teal-900 hover:bg-teal-800 flex items-center gap-2 text-black">
            <PlusCircle className="w-4 h-4" />
            <span>Đăng tin</span>
          </Button>
          
          <UserMenu user={null} />
        </div>
      </div>

      {/* Slogan + Search (chỉ khi chưa scroll) */}
      {!isScrolled && (
        <>
          <div className="w-full flex justify-center py-2">
            {/* đổi màu + size chữ slogan */}
            <span className="text-black-300 text-3xl md:text-3xl font-extrabold mt-2 tracking-wide drop-shadow">
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
                variant="default"
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
