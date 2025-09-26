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

const mainNav = [
  { label: "EcoGreen", to: "/" },
  { label: "Xe điện", to: "/xe-dien" },
  { label: "Pin điện", to: "/pin-dien" },
  { label: "EcoBlog", to: "/blog" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-cyan-600">
      <div className="w-full h-16 flex items-center gap-4 px-3 sm:px-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="mt-6 grid gap-3">
              {mainNav.map((it) => (
                <NavLink key={it.to} to={it.to} className="px-2 py-2 rounded hover:bg-accent">
                  {it.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo + menu danh mục (dropdown) */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon">
                <Menu className="w-5 h-5 text-teal-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Xe điện</DropdownMenuItem>
              <DropdownMenuItem>Pin điện</DropdownMenuItem>
              <DropdownMenuItem>Phụ kiện</DropdownMenuItem>
              <DropdownMenuItem>Dịch vụ</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/" className="text-white text-xl font-extrabold tracking-wide drop-shadow">
            ECOGREEN
          </Link>
        </div>

        {/* Ở giữa: luôn là ô tìm kiếm nhỏ */}
        <div className="hidden md:flex flex-1 justify-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow w-full max-w-md"
          >
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Tìm sản phẩm..."
              className="flex-1 border-none shadow-none focus-visible:ring-0 text-sm"
            />
            <Button type="submit" className="bg-black hover:bg-gray-800 text-white h-8 px-3">
              Tìm
            </Button>
          </form>
        </div>

        {/* Actions bên phải */}
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="ml-1">
                <User className="w-5 h-5 text-teal-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/account" className="w-full">Tài khoản của tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/saved" className="w-full">Tin đã lưu</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button type="button" className="w-full text-left">Đăng xuất</button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
