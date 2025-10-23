import { useEffect, useState } from "react";
import BannerCarousel from "@/components/ui/BannerCarousel";
import type { ListingWithKey } from "@/listings/types";
import KeywordSection from "@/components/ui/KeywordSection";
import SeoAbout from "@/components/ui/SeoAbout";
import BrandStrip, { BrandItem } from "@/components/ui/BrandStrip";
import ListingTabs from "@/components/ui/ListingTabs";
import { fetchLatestListings, fetchForYouListings } from "@/listings/api/listing.api";

export default function HomePage() {
  const [latest, setLatest] = useState<ListingWithKey[]>([]);
  const [forYou, setForYou] = useState<ListingWithKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [latestRes, forYouRes] = await Promise.all([
          fetchLatestListings(),
          fetchForYouListings(),
        ]);
        setLatest(latestRes);
        setForYou(forYouRes.length ? forYouRes : latestRes);
      } catch (e) {
        console.error("Load listings failed:", e);
        setLatest([]); setForYou([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const brands: BrandItem[] = [
    { name: "VinFast", src: "/images/vinfast.png", to: "/xe-dien?brand=VinFast" },
    { name: "BYD", src: "/images/byd.png", to: "/xe-dien?brand=BYD" },
    { name: "Wuling", src: "/images/wuling.png", to: "/xe-dien?brand=Wuling" },
    { name: "Hyundai", src: "/images/hyundai.png", to: "/xe-dien?brand=Hyundai" },
    { name: "BMW", src: "/images/bmw.png", to: "/xe-dien?brand=BMW" },
    { name: "Audi", src: "/images/audi.png", to: "/xe-dien?brand=Audi" },
    { name: "Porsche", src: "/images/porsche.png", to: "/xe-dien?brand=Porsche" },
    { name: "MG", src: "/images/mg.png", to: "/xe-dien?brand=MG" },
  ];

  return (
    <div className="relative w-full mb-10 mt-8">
      <div
        aria-hidden
        className="fixed inset-0 z-0 bg-no-repeat bg-cover bg-[position:center] md:bg-[position:center] lg:bg-[position:center] xl:bg-[position:center_50px]"
        style={{ backgroundImage: "url('/images/home-bg.png')" }}
      />
      <div className="relative z-10 mx-auto max-w-5xl p-4 md:p-0 space-y-4">
        <section>
          <BannerCarousel
            images={["/images/banner-1.jpg", "/images/banner-2.jpg"]}
            interval={4000}
            heightClass="h-30 md:h-46 lg:h-52"
          />
        </section>

        <BrandStrip items={brands} />
        <section />

        {/* ✅ Luôn render ListingTabs, dùng isLoading để hiện skeleton */}
        <ListingTabs
          forYou={forYou}
          latest={latest}
          pageSize={8}
          className="mt-1"
          isLoading={loading}
        />

        <section>
          <SeoAbout />
        </section>
        <KeywordSection />
      </div>
    </div>
  );
}
