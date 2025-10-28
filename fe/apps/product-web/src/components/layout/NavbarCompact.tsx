import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
import UserMenu from "../user/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

const mainNav = [
  { label: "EcoGreen", to: "/" },
  { label: "Xe điện", to: "/xe-dien" },
  { label: "Pin điện", to: "/pin-dien" },
  { label: "EcoBlog", to: "/blog" },
];

export default function Navbar() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [keyword, setKeyword] = useState("");

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
                <DropdownMenuItem>Phụ kiện</DropdownMenuItem>
                <DropdownMenuItem>Dịch vụ</DropdownMenuItem>
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

          <div className="ml-auto flex items-center gap-2">
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
