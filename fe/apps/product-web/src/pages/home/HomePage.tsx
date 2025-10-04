import { useEffect, useState } from "react";
import BannerCarousel from "@/components/ui/BannerCarousel";
import type { Listing } from "@/listings/types";
import { mockListings } from "@/mocks/products";
import KeywordSection from "@/components/ui/KeywordSection";
import SeoAbout from "@/components/ui/SeoAbout";
import BrandStrip, { BrandItem } from "@/components/ui/BrandStrip";
import ListingTabs from "@/components/ui/ListingTabs";

export default function HomePage() {
  const [latest, setLatest] = useState<(Listing & { _key: string })[]>([]);
  useEffect(() => {
    const data = mockListings
      .concat(mockListings)
      .slice(0, 12)
      .map((it, idx) => ({ ...it, _key: `${it.id}-${idx}` }));
    setLatest(data);
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
    <div className="relative w-full mb-10 mt-5">
      <div
        aria-hidden
        className="
        fixed inset-0 z-0 bg-no-repeat bg-cover
        bg-[position:center]
        md:bg-[position:center]
        lg:bg-[position:center]
        xl:bg-[position:center_50px]
        "
        style={{ backgroundImage: "url('/images/home-bg.png')" }}
      />
      <div className="relative z-10 mx-auto max-w-5xl p-4 md:p-0 space-y-4 ">
        <section>
          <BannerCarousel
            images={["/images/banner-1.jpg", "/images/banner-2.jpg"]}
            interval={4000}
            heightClass="h-30 md:h-46 lg:h-52"
          />
        </section>
        <BrandStrip items={brands} />
        <section />

        <ListingTabs
          forYou={latest.slice(0, 12)}
          latest={latest}
          pageSize={8}
          className="mt-1"
        />
        <section>
          <SeoAbout />
        </section>
        <KeywordSection />
      </div>
    </div>
  );
}
