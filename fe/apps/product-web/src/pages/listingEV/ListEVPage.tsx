import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RowListing from "@/components/post/RowListing";
import TopFilterBar, { TopFilters } from "@/components/post/TopFilterBar";
import { Skeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  title: string;
  description?: string | null;
  type: "VEHICLE" | "BATTERY" | string;
  productImagesList?: { imageUrl?: string; isPrimary?: boolean; position?: number | null }[];
  price?: string | number | null;
  conditionType?: "NEW" | "USED" | string;
  sellerName?: string | null;
  createdAt?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;
  brandName?: string | null;
  modelName?: string | null;
};

function buildApiUrl(base: string, type: "VEHICLE" | "BATTERY", f: TopFilters, keyword: string) {
  const p = new URLSearchParams();
  p.set("type", type);
  if (f.condition) p.set("conditionType", f.condition);
  if (f.brand) p.set("brandName", f.brand);
  if (f.yearFrom) p.set("yearFrom", String(f.yearFrom));
  if (f.yearTo) p.set("yearTo", String(f.yearTo));
  if (f.priceFrom) p.set("priceFrom", String(f.priceFrom));
  if (f.priceTo) p.set("priceTo", String(f.priceTo));
  if (keyword) p.set("keyword", keyword);
  return `${base}?${p.toString()}`;
}

function fmtVND(v?: string | number | null) {
  if (v == null) return "--";
  if (typeof v === "number") return v.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " đ";
  const digits = v.replace(/[^\d]/g, "");
  if (!digits) return String(v);
  return Number(digits).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " đ";
}

export default function ListEVPage({ type }: { type: "VEHICLE" | "BATTERY" }) {
  const nav = useNavigate();
  const loc = useLocation();

  // đọc keyword từ query (từ ô search Navbar)
  const params = new URLSearchParams(loc.search);
  const initialKeyword = params.get("keyword") || "";

  const [keyword, setKeyword] = useState(initialKeyword);
  const [filters, setFilters] = useState<TopFilters>({
    area: "all",
    condition: "",
    brand: "",
    priceFrom: undefined,
    priceTo: undefined,
    yearFrom: undefined,
    yearTo: undefined,
  });

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // gọi API
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setLoading(true);
        const url = buildApiUrl(
          "https://ecogreenbe-production.up.railway.app/product/filter",
          type,
          filters,
          keyword
        );
        const res = await fetch(url);
        const json = await res.json();
        if (!off) setData(Array.isArray(json) ? json : []);
      } catch {
        if (!off) setData([]);
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [type, filters, keyword]);

  // cập nhật URL khi đổi filter/keyword (để share link)
  useEffect(() => {
    const p = new URLSearchParams();
    if (keyword) p.set("keyword", keyword);
    if (filters.condition) p.set("condition", filters.condition);
    if (filters.brand) p.set("brand", filters.brand);
    if (filters.priceFrom) p.set("pf", String(filters.priceFrom));
    if (filters.priceTo) p.set("pt", String(filters.priceTo));
    if (filters.yearFrom) p.set("yf", String(filters.yearFrom));
    if (filters.yearTo) p.set("yt", String(filters.yearTo));
    nav({ search: p.toString() }, { replace: true });
  }, [filters, keyword, nav]);

  // mô phỏng phân trang: 20 item/ trang
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [data]);
  const pageSize = 20;
  const items = useMemo(() => data.slice(0, page * pageSize), [data, page]);
  const canLoadMore = items.length < data.length;

  return (
    <div className="max-w-[1200px] mx-auto px-3 md:px-6 py-4">
      {/* Thanh lọc trên đầu */}
      <TopFilterBar
        type={type}
        value={filters}
        onChange={setFilters}
        keyword={keyword}
        onKeywordChange={setKeyword}
      />

      <div className="grid grid-cols-12 gap-4 mt-3">
        {/* LIST LEFT (span 8) */}
        <div className="col-span-12 lg:col-span-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[140px] rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-slate-600 py-8">Không tìm thấy tin phù hợp.</div>
          ) : (
            <div className="space-y-3">
              {items.map((p) => {
                const thumb =
                  p.productImagesList?.find((i) => i.isPrimary)?.imageUrl ||
                  p.productImagesList?.[0]?.imageUrl ||
                  "https://via.placeholder.com/320x200?text=No+Image";
                const addr = [p.ward, p.district, p.city].filter(Boolean).join(" · ");
                return (
                  <RowListing
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    price={fmtVND(p.price)}
                    subtitleLeft={
                      p.type === "VEHICLE"
                        ? [p.brandName, p.modelName].filter(Boolean).join(" ")
                        : p.conditionType === "NEW"
                        ? "Pin mới"
                        : "Pin đã dùng"
                    }
                    subtitleRight={p.createdAt ? timeAgoVi(p.createdAt) : ""}
                    seller={p.sellerName || ""}
                    address={addr}
                    img={thumb}
                    to={`/product/${p.id}`}
                  />
                );
              })}

              {canLoadMore && (
                <div className="flex justify-center py-4">
                  <button
                    className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
                    onClick={() => setPage((x) => x + 1)}
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR RIGHT (span 4) */}
        <div className="hidden lg:block lg:col-span-4">
          <aside className="space-y-4">
            <FilterCard title="Mua bán xe điện">
              {["Hà Nội", "TP Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Bình Dương", "An Giang"].map(
                (c) => (
                  <button
                    key={c}
                    className="text-left w-full py-1.5 text-sm hover:underline"
                    onClick={() => setFilters((f) => ({ ...f, area: c }))}
                  >
                    {c}
                  </button>
                )
              )}
            </FilterCard>

            <FilterCard title="Lọc theo khoảng giá">
              {[
                [0, 200_000_000, "Giá dưới 200 triệu"],
                [200_000_000, 300_000_000, "Giá 200 – 300 triệu"],
                [300_000_000, 400_000_000, "Giá 300 – 400 triệu"],
                [400_000_000, 500_000_000, "Giá 400 – 500 triệu"],
                [500_000_000, 600_000_000, "Giá 500 – 600 triệu"],
                [600_000_000, 700_000_000, "Giá 600 – 700 triệu"],
              ].map(([from, to, label]) => (
                <button
                  key={label as string}
                  className="text-left w-full py-1.5 text-sm hover:underline"
                  onClick={() =>
                    setFilters((f) => ({ ...f, priceFrom: from as number, priceTo: to as number }))
                  }
                >
                  {label as string}
                </button>
              ))}
            </FilterCard>

            {type === "VEHICLE" && (
              <FilterCard title="Lọc theo số chỗ">
                {["2 chỗ", "4 chỗ", "5 chỗ", "6 chỗ", "7 chỗ"].map((s) => (
                  <div key={s} className="text-sm py-1.5">
                    {s}
                  </div>
                ))}
              </FilterCard>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function FilterCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border">
      <div className="px-3 py-2 font-semibold text-sm border-b">{title}</div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function timeAgoVi(iso: string) {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return "Vừa đăng";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} tháng trước`;
  const y = Math.floor(d / 365);
  return `${y} năm trước`;
}
