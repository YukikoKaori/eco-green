"use client"

import { Link, NavLink } from "react-router-dom"
import {
  Menu,
  Heart,
  User,
  Globe,
  ChevronDown,
  PlusCircle,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"

const mainNav = [
  { label: "EcoGreen", to: "/" },
  { label: "Xe điện", to: "/xe-dien" },
  { label: "Pin điện", to: "/pin-dien" },
  { label: "EcoBlog", to: "/blog" },
]

export default function Navbar() {
  return (
    <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-cyan-500 to-teal-500">
      {/* TOP SMALL BAR */}
      <div className="w-full bg-cyan-600 text-white text-sm">
        <div className="flex justify-end items-center gap-6 px-4 h-8 ml-auto">
          <NavLink to="/feedback" className="hover:text-black transition-colors">
            Đóng góp ý kiến
          </NavLink>
          <NavLink to="/help" className="hover:text-black transition-colors">
            Trợ giúp
          </NavLink>

          {/* Ngôn ngữ dropdown (chỉ là chữ, không phải button) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className="cursor-pointer hover:text-black transition-colors flex items-center gap-1">
                Ngôn ngữ <ChevronDown className="w-3 h-3" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white text-black">
              <DropdownMenuItem>Tiếng Việt</DropdownMenuItem>
              <DropdownMenuItem>English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* TOP BAR */}
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
                <NavLink
                  key={it.to}
                  to={it.to}
                  className="px-2 py-2 rounded hover:bg-accent"
                >
                  {it.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>


        {/* Logo + Danh mục */}
        <div className="flex items-center gap-2">
          {/* Icon danh mục kế bên ECOGREEN */}
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
          {/* Logo chỉ chữ ECOGREEN */}
          <Link to="/" className="text-white text-xl font-extrabold tracking-wide">
            ECOGREEN
          </Link>
        </div>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 ml-auto">
          {mainNav.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className="relative font-medium text-white hover:text-black transition-colors"
            >
              {it.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Yêu thích */}
          <Button variant="secondary" size="icon" className="hidden sm:flex">
            <Heart className="w-4 h-4 text-teal-700" />
          </Button>

          {/* Đăng nhập (chỉ chữ) */}
          <Button variant="secondary" className="hidden md:flex">
            Đăng nhập
          </Button>

          {/* Đăng tin (icon + chữ, chữ màu đen) */}
          <Button className="bg-teal-900 hover:bg-teal-800 flex items-center gap-2 text-black">
            <PlusCircle className="w-4 h-4" />
            <span>Đăng tin</span>
          </Button>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="ml-1">
                <User className="w-5 h-5 text-teal-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Tài khoản của tôi</DropdownMenuItem>
              <DropdownMenuItem>Tin đã lưu</DropdownMenuItem>
              <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* SLOGAN: hàng riêng */}
      <div className="w-full flex justify-center bg-gradient-to-r from-cyan-500 to-teal-500 py-2">
        <span className="text-yellow-300 text-xl font-extrabold drop-shadow">
          Đăng tin dễ – Chốt đơn nhanh!
        </span>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white/20 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <form className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 shadow">
            <Search className="w-5 h-5 text-gray-500" />
            <Input
              placeholder="Tìm sản phẩm..."
              className="flex-1 border-none shadow-none focus-visible:ring-0 text-sm"
            />
            <Button
              type="submit"
              className="bg-black hover:bg-gray-800 text-black px-4 py-1.5 rounded-lg"
            >
              Tìm kiếm
            </Button>
          </form>
        </div>
      </div>

    </header>
  )
}
