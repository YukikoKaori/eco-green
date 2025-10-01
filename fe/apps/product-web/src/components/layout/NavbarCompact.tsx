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
import UserMenu from "../user/UserMenu";

const mainNav = [
  { label: "EcoGreen", to: "/" },
  { label: "Xe điện", to: "/xe-dien" },
  { label: "Pin điện", to: "/pin-dien" },
  { label: "EcoBlog", to: "/blog" },
];

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "linear-gradient(90deg, #246f67 0%, #01c5a7ff 50%)",
      }}
    >
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
              <Button size="icon" className="!bg-white">
                <Menu className="!w-5 h-5 text-teal-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Xe điện</DropdownMenuItem>
              <DropdownMenuItem>Pin điện</DropdownMenuItem>
              <DropdownMenuItem>Phụ kiện</DropdownMenuItem>
              <DropdownMenuItem>Dịch vụ</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/" className="inline-flex items-center">
            <span className="inline-flex items-center bg-white border border-gray-200 rounded-md p-0.95 shadow-sm">
              <img src="/images/logo-name.png" alt="EcoGreen" className="w-[80px] md:w-[80px] h-auto block object-contain" />
            </span>
            <span className="sr-only">ECOGREEN</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 bg-white rounded-xl px-3 shadow w-full max-w-xl"
          >
            <Search className="w-5 h-5 text-gray-500" />
            <Input
              placeholder="Tìm sản phẩm..."
              className="flex-1 h-10 !border-none !shadow-none !focus-visible:ring-0 !text-sm"
            />
            <Button type="submit" className="!h-7 !px-2 !text-sm !bg-[#246f67] !hover:bg-gray-800 !text-white">
              Tìm kiếm
            </Button>
          </form>
        </div>

        {/* Actions bên phải */}
        <div className="ml-auto flex items-center gap-2">
          <Button size="icon" className="hidden sm:flex !bg-white">
            <Heart className="w-4 h-4 text-teal-700" />
          </Button>
          <Button asChild className="hidden md:flex !text-[#246f67] !bg-white">
            <Link to="/login">Đăng nhập</Link>
          </Button>

          <Button className="!bg-[#246f67] !text-sm hover:bg-teal-800 flex items-center gap-2 text-white">
            <PlusCircle className="w-4 h-4" />
            <span>Đăng tin</span>
          </Button>

          <UserMenu user={null} />
        </div>
      </div>
    </header>
  );
}
