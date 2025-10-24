import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  searchProductsByName,
  type SearchByNameItem,
  type SearchByNameResponse,
} from "@/api/search";
import RowListing from "@/components/post/RowListing";
import { SearchFilterBar, type SearchFilterState } from "@/components/filters/SearchFilterBar";

/* ======= helpers ======= */
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

export default function SearchResults() {
  const [params, setParams] = useSearchParams();

  // từ ô search trên navbar
  const keyword = (params.get("keyword") || "").trim();

  // filter chỉ 3 trường
  const [filters, setFilters] = useState<SearchFilterState>({
    city: params.get("city") || "",
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    yearFrom: params.get("yearFrom") ? Number(params.get("yearFrom")) : undefined,
    yearTo: params.get("yearTo") ? Number(params.get("yearTo")) : undefined,
  });

  const size = 12;
  const pageParam = Number(params.get("page") ?? "0");
  const page = Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0;

  const [items, setItems] = useState<SearchByNameItem[]>([]);
  const [meta, setMeta] = useState<Omit<SearchByNameResponse, "items">>({
    page: 0,
    size,
    totalElements: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // đồng bộ URL khi thay filter
  useEffect(() => {
    const p = new URLSearchParams(params);
    if (filters.city) p.set("city", filters.city); else p.delete("city");
    if (filters.minPrice) p.set("minPrice", String(filters.minPrice)); else p.delete("minPrice");
    if (filters.maxPrice) p.set("maxPrice", String(filters.maxPrice)); else p.delete("maxPrice");
    if (filters.yearFrom) p.set("yearFrom", String(filters.yearFrom)); else p.delete("yearFrom");
    if (filters.yearTo) p.set("yearTo", String(filters.yearTo)); else p.delete("yearTo");

    // mỗi lần đổi filter → reset page = 0
    p.set("page", "0");
    setParams(p, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const load = async () => {
      if (!keyword) {
        setItems([]); setMeta(m => ({ ...m, page: 0, totalPages: 0, totalElements: 0, hasNextPage: false, hasPreviousPage: false }));
        setLoading(false); setErr(null); return;
      }
      setLoading(true); setErr(null);
      try {
        abortRef.current?.abort();
        const ctl = new AbortController(); abortRef.current = ctl;

        const data = await searchProductsByName(
          keyword,
          page,
          size,
          ctl.signal,
          {
            city: filters.city || undefined,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            yearFrom: filters.yearFrom,
            yearTo: filters.yearTo,
            sort: "createdAt,desc",
          }
        );
        setItems(data.items);
        setMeta({
          page: data.page,
          size: data.size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          hasPreviousPage: data.hasPreviousPage,
          hasNextPage: data.hasNextPage,
        });
      } catch (e: any) {
        if (e?.name !== "CanceledError" && e?.name !== "AbortError") setErr("Không thể tải kết quả tìm kiếm.");
      } finally { setLoading(false); }
    };
    load();
    return () => abortRef.current?.abort();
  }, [keyword, page, size, filters]);

  const pages = useMemo(
    () => Array.from({ length: meta.totalPages || 0 }, (_, i) => i),
    [meta.totalPages]
  );

  const firstImg = (it: SearchByNameItem) => {
    const list = it.productImagesList || [];
    const pri = list.find(i => i.isPrimary);
    return pri?.imageUrl || pri?.url || list[0]?.imageUrl || list[0]?.url || "";
  };

  const goToPage = (p: number) => {
    if (p < 0 || (meta.totalPages > 0 && p > meta.totalPages - 1)) return;
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
  };

  return (
    <div>
      <SearchFilterBar value={filters} onChange={setFilters} />
      <div className="max-w-[1200px] mx-auto px-3 md:px-6 py-4">
        {loading && items.length === 0 ? (
          <div className="text-slate-600">Đang tải…</div>
        ) : !loading && !err && items.length === 0 ? (
          <div className="text-center text-slate-600 py-8">Không tìm thấy kết quả phù hợp.</div>
        ) : err ? (
          <div className="text-red-600">{err}</div>
        ) : (
          <div className="space-y-3">
            {items.map((p) => {
              const thumb = firstImg(p) || "https://via.placeholder.com/320x200?text=No+Image";
              const addr = [p.ward, p.district, p.city].filter(Boolean).join(" · ");
              return (
                <div key={p.id} className="bg-white rounded-lg shadow-sm">
                  <RowListing
                    id={p.id}
                    to={`/product/${p.id}`}           
                    img={thumb}
                    title={p.title || p.brandName || "Tin đăng"}
                    price={fmtVND(p.price)}
                    subtitleLeft={timeAgoVi(p.createdAt)}
                    subtitleRight={addr}
                    seller={p.sellerName || ""}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
              disabled={!meta.hasPreviousPage}
              onClick={() => goToPage(meta.page - 1)}
            >
              Trước
            </button>
            {pages.map((p) => (
              <button
                key={p}
                className={`px-3 py-1.5 border rounded-md text-sm ${p === meta.page ? "!bg-[#00BFAE] !text-white !border-emerald-600" : "hover:bg-slate-50"
                  }`}
                onClick={() => goToPage(p)}
              >
                {p + 1}
              </button>
            ))}
            <button
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
              disabled={!meta.hasNextPage}
              onClick={() => goToPage(meta.page + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
