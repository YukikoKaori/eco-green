import { Bell, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BRAND = "#0f766e";
const PRODUCT_URL = (import.meta.env.VITE_PRODUCT_URL || "/").trim();

export default function Topbar() {
  return (
    <header className="h-14 bg-white border-b flex items-center px-4 gap-3">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input placeholder="Tìm nhanh…" className="pl-9 rounded-lg" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/*noti*/}
        <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Thông báo">
          <Bell className="h-5 w-5" style={{ color: BRAND }} />
        </Button>
        <a
          href={PRODUCT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-2.5 py-1.5 hover:bg-gray-50 transition"
          title="Mở trang sản phẩm (Product Web)"
          aria-label="Mở trang sản phẩm EcoGreen"
          style={{ borderColor: "rgba(0,0,0,.08)" }}
        >
          <img src="/images/logo.png" alt="EcoGreen" className="h-6 w-auto" />
          <span className="hidden sm:block text-sm font-semibold" style={{ color: BRAND }}>
            Trang chủ
          </span>
          <ExternalLink className="h-4 w-4 opacity-70" />
        </a>
      </div>
    </header>
  );
}
