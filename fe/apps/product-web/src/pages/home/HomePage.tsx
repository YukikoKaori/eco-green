import { useEffect, useState } from "react";
import BannerCarousel from "@/components/ui/BannerCarousel";
import type { ListingWithKey } from "@/listings/types";
import KeywordSection from "@/components/ui/KeywordSection";
import SeoAbout from "@/components/ui/SeoAbout";
import BrandStrip from "@/components/ui/BrandStrip";
import ListingTabs from "@/components/ui/ListingTabs";
import { fetchLatestListings, fetchForYouListings } from "@/listings/api/listing.api";
import { useBrandItems } from "@/hooks/useBrandItems";

export default function HomePage() {
  const [latest, setLatest] = useState<ListingWithKey[]>([]);
  const [forYou, setForYou] = useState<ListingWithKey[]>([]);
  const [loading, setLoading] = useState(true);
  const { items: brandItems, loading: brandLoading, error: brandErr } = useBrandItems({
    type: "ALL",
    buildLink: (b) => `/xe-dien?brand=${encodeURIComponent(b.id)}`,
  });

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
        setLatest([]);
        setForYou([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="relative w-full mb-10 mt-12">
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

        {brandErr ? (
          <div className="rounded-xl border bg-white p-4 text-red-600">
            Không tải được danh sách hãng. Vui lòng thử lại.
          </div>
        ) : brandLoading ? (
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="h-4 w-48 bg-gray-200 rounded mb-4" />
            <div className="flex gap-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="min-w-[4.75rem] flex flex-col items-center">
                  <div className="h-[72px] w-[72px] rounded-full bg-gray-100 animate-pulse" />
                  <div className="h-3 w-16 bg-gray-100 rounded mt-2" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <BrandStrip items={brandItems} />
        )}

        <section />

        <ListingTabs
          forYou={forYou}
          latest={latest}
          pageSize={12}
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
