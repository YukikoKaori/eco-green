import { useEffect, useState } from "react";
import BannerCarousel from "@/components/ui/BannerCarousel";
import ListingCard from "@/listings/components/ListingCard";
import type { Listing } from "@/listings/types";
import { mockListings } from "@/mocks/products";
import KeywordSection from "@/components/ui/KeywordSection";
import SeoAbout from "@/components/ui/SeoAbout";

export default function HomePage() {
  const [latest, setLatest] = useState<(Listing & { _key: string })[]>([]);
  const [featuredBrands] = useState<string[]>([
    "VinFast", "BYD", "Wuling", "Hyundai", "BMW", "Audi", "Porsche", "MG",
  ]);

  useEffect(() => {
    const data = mockListings
      .concat(mockListings)
      .slice(0, 12)
      .map((it, idx) => ({ ...it, _key: `${it.id}-${idx}` }));
    setLatest(data);
  }, []);

  return (
    <div className="relative w-full">
      {/* BG cố định (parallax nhẹ) */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/home-bg.png')" }}
      />
      {/* overlay nếu cần dịu nền: */}
      {/* <div className="fixed inset-0 z-0 bg-white/30" aria-hidden /> */}

      {/* CONTENT ở trên nền */}
      <div className="relative z-10 mx-auto max-w-6xl p-4 md:p-6 space-y-8">
        <section>
          <BannerCarousel
            images={["/images/banner-1.jpg", "/images/banner-2.jpg"]}
            interval={4000}
            heightClass="h-64 md:h-[380px] lg:h-[280px]"
          />
        </section>

        <section className="space-y-3">
          <div className="font-semibold">Tin bán xe và pin theo hãng</div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {featuredBrands.map((b, i) => (
              <div key={`brand-${i}`} className="min-w-24 flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-muted" />
                <span className="mt-2 text-sm text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-lg font-semibold">Dành cho bạn</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {latest.slice(0, 8).map((item) => (
              <ListingCard key={`for-you-${item._key}`} item={item} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-lg font-semibold">Mới nhất</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {latest.slice(0, 12).map((item) => (
              <ListingCard key={`latest-${item._key}`} item={item} />
            ))}
          </div>

          <div className="flex justify-center">
            <button className="rounded-full border px-4 py-2 text-sm">
              Xem thêm 210 tin đăng →
            </button>
          </div>
        </section>

        <section>
          <SeoAbout />
        </section>

        <KeywordSection />
      </div>
    </div>
  );
}
