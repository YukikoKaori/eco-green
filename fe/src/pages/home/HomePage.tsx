import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import ListingCard from "@/features/listings/components/ListingCard";
import type { Listing } from "@/features/listings/types";
// import { ListingsApi } from "@/features/listings/api/listings.api";
import { mockListings } from "@/mocks/products";

export default function HomePage() {
  const [latest, setLatest] = useState<Listing[]>([]);
  const [featuredBrands] = useState<string[]>([
    "VinFast","BYD","Wuling","Hyundai","BMW","Audi","Porsche","MG"
  ]);

  useEffect(() => {
    // TODO: thay mock bằng API thật
    // ListingsApi.getLatest({ page: 1, size: 12 }).then(res => setLatest(res.data));
    setLatest(mockListings.concat(mockListings).slice(0, 12));
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-8">

      {/* Search bar + tagline */}
      <section className="text-center space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-amber-500">
          Đăng tin dễ – Chốt đơn nhanh!
        </h1>
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border bg-white p-2 shadow-sm">
          <input className="flex-1 rounded-xl px-4 py-2 outline-none" placeholder="Tìm sản phẩm..." />
          <button className="rounded-xl bg-sky-600 px-5 py-2 text-white">Tìm kiếm</button>
        </div>
      </section>

      {/* Hero banner placeholder */}
      <section>
        <Card className="h-40 md:h-56 bg-gradient-to-r from-amber-400 to-yellow-500 p-4 md:p-6 text-white">
          <div className="text-lg md:text-xl font-semibold">ECOGREEN</div>
          <p className="opacity-90">Giao dịch an toàn, minh bạch • Giá tốt • Kiểm định rõ ràng</p>
        </Card>
      </section>

      {/* Brand carousel (cuộn ngang đơn giản, sau có thể thay Embla/Swiper) */}
      <section className="space-y-3">
        <div className="font-semibold">Tin bán xe và pin theo hãng</div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {featuredBrands.map((b, i) => (
            <div key={i} className="min-w-24 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-muted" />
              <span className="mt-2 text-sm text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Listing grid: Dành cho bạn */}
      <section className="space-y-3">
        <div className="text-lg font-semibold">Dành cho bạn</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {latest.slice(0, 8).map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Listing grid: Mới nhất */}
      <section className="space-y-3">
        <div className="text-lg font-semibold">Mới nhất</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {latest.slice(0, 12).map((item) => (
            <ListingCard key={`latest-${item.id}`} item={item} />
          ))}
        </div>

        <div className="flex justify-center">
          <button className="rounded-full border px-4 py-2 text-sm">Xem thêm 210 tin đăng →</button>
        </div>
      </section>

      {/* SEO text block + “Mở rộng” */}
      <section>
        <Card className="p-4 md:p-6">
          <h3 className="mb-2 text-lg font-semibold">EcoGreen - Giao dịch pin và xe điện qua sử dụng</h3>
          <p className="line-clamp-4 text-sm text-muted-foreground">
            Trong thế giới hiện đại, năng lượng xanh... (thêm nội dung SEO như bản UI).
          </p>
          <button className="mt-2 text-sky-600">Mở rộng</button>
        </Card>
      </section>

      {/* Keyword chips */}
      <section className="space-y-2">
        <div className="font-semibold">Các từ khóa phổ biến</div>
        <div className="flex flex-wrap gap-2">
          {["Ô tô điện VinFast","BYD Seal","Pin đã qua dùng","Mua bán xe điện cũ","VinFast VF3"].map((k, i) => (
            <span key={i} className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:bg-accent">
              {k}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
