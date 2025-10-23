import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import RowListing from "@/components/post/RowListing";
import { fetchVehiclesPaged, type VehicleItem } from "@/api/vehicle";
import { VehicleFilterBar, type VehicleFilterState } from "@/components/filters/VehicleFilterBar";

/* utils */
const fmtVND = (v?: string | number | null) =>
  v == null
    ? "--"
    : (typeof v === "number" ? v : Number(String(v).replace(/[^\d]/g, ""))).toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    }) + " đ";

function timeAgoVi(iso?: string | null) {
  if (!iso) return "";
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

export default function VehicleListPage() {
  const nav = useNavigate();
  const loc = useLocation();

  const q = new URLSearchParams(loc.search);
  const [filters, setFilters] = useState<VehicleFilterState>({
    city: q.get("city") || "",
    brand: q.get("brand") || "",
    minPrice: q.get("minPrice") ? Number(q.get("minPrice")) : undefined,
    maxPrice: q.get("maxPrice") ? Number(q.get("maxPrice")) : undefined,
    yearFrom: q.get("yearFrom") ? Number(q.get("yearFrom")) : undefined,
    yearTo: q.get("yearTo") ? Number(q.get("yearTo")) : undefined,
  });

  const SIZE = 12;
  const [page0, setPage0] = useState(q.get("page") ? Math.max(0, Number(q.get("page")) - 1) : 0);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // sync URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (filters.city) p.set("city", filters.city);
    if (filters.brand) p.set("brand", filters.brand);
    if (filters.minPrice) p.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice) p.set("maxPrice", String(filters.maxPrice));
    if (filters.yearFrom) p.set("yearFrom", String(filters.yearFrom));
    if (filters.yearTo) p.set("yearTo", String(filters.yearTo));
    p.set("page", String(page0 + 1));
    nav({ search: p.toString() }, { replace: true });
  }, [filters, page0, nav]);

  // filter change => reset page 1
  useEffect(() => {
    setPage0(0);
  }, [filters]);

  // fetch data
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetchVehiclesPaged({
          filters: {
            city: filters.city,
            brand: filters.brand,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            yearFrom: filters.yearFrom,
            yearTo: filters.yearTo,
          },
          page: page0,
          size: SIZE,
          sort: "createdAt,desc",
          signal: ac.signal,
        });
        setItems(res.items ?? []);
        setTotalPages(res.totalPages ?? 1);
      } catch {
        if (!ac.signal.aborted) {
          setItems([]);
          setTotalPages(1);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [filters, page0]);

  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  return (
    <div className="max-w-[1200px] mx-auto px-3 md:px-6 py-4">
      <VehicleFilterBar
        value={filters}
        onChange={setFilters}
        onClearAll={() => setFilters({ city: "", brand: "" })}
      />
      <div className="h-[56px] md:h-[60px]" />

      {/* LIST */}
      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-slate-600 py-8">Không tìm thấy xe phù hợp.</div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => {
            const firstImg =
              p.productImagesList?.find((i) => i.isPrimary) || p.productImagesList?.[0];
            const thumb =
              firstImg?.imageUrl || firstImg?.url || "https://via.placeholder.com/320x200?text=No+Image";
            const addr = [p.ward, p.district, p.city].filter(Boolean).join(" · ");
            const model = [p.brandName, p.modelName].filter(Boolean).join(" ");

            return (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200"
              >
                <RowListing
                  id={p.id}
                  title={p.title || model}
                  price={fmtVND(p.price)}
                  subtitleLeft={model}
                  subtitleRight={timeAgoVi(p.createdAt)}
                  seller={p.sellerName || ""}
                  address={addr}
                  img={thumb}
                  to={`/product/${p.id}`}
                />
              </div>
            );
          })}
        </div>
      )}


      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          className="!px-3 !py-1.5 border rounded-md !text-sm disabled:opacity-50"
          disabled={page0 <= 0}
          onClick={() => setPage0((p) => Math.max(0, p - 1))}
        >
          Trước
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`px-3 py-1.5 border rounded-md text-sm ${p - 1 === page0 ? "!bg-[#00BFAE] !text-white !text-sm !border-emerald-600" : "hover:bg-slate-50"
              }`}
            onClick={() => setPage0(p - 1)}
          >
            {p}
          </button>
        ))}
        <button
          className="!px-3 !py-1.5 border rounded-md !text-sm  !disabled:opacity-50"
          disabled={page0 + 1 >= totalPages}
          onClick={() => setPage0((p) => p + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
