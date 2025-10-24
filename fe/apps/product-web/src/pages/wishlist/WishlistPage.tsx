import { useEffect, useRef, useState } from "react";
import type { ListingWithKey } from "@/listings/types";
import { fetchWishlistPaged } from "@/api/WishlistApi";
import { toast } from "sonner";
import { useWishlist } from "@/contexts/WishlistContext";
import LikeButton from "@/listings/components/LikeButton";
import { Link } from "react-router-dom";

function timeAgo(iso?: string) {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const s = Math.max(1, Math.floor(diff / 1000));
  if (s < 60) return `${s} giây trước`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
}
function formatPrice(v: ListingWithKey["price"]): string {
  if (v == null || v === "") return "—";
  if (typeof v === "number") return v.toLocaleString("vi-VN") + " đ";
  const cleaned = String(v).replace(/[^\d]/g, "");
  if (!cleaned) return "—";
  const n = Number(cleaned);
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") + " đ" : "—";
}

function RowSkeleton() {
  return (
    <li className="p-3 md:p-4">
      <div className="flex gap-3">
        <div className="relative w-[124px] h-[96px] shrink-0 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-3/4 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-1/3 bg-muted rounded-md animate-pulse" />
          <div className="h-3 w-1/2 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="w-[40px]" />
      </div>
    </li>
  );
}
function EmptyState() {
  return (
    <div className="mx-auto max-w-5xl p-8 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 mb-3">
        <span className="text-xl">♡</span>
      </div>
      <h1 className="text-xl font-semibold mb-1">Danh sách theo dõi</h1>
      <p className="text-sm text-muted-foreground">
        Bạn chưa theo dõi tin nào. Hãy nhấn <span className="font-medium">tim</span> ở sản phẩm để lưu lại nhé.
      </p>
    </div>
  );
}

export default function WishlistPage() {
  const [items, setItems] = useState<ListingWithKey[]>([]);
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const didInit = useRef(false);
  const hasErrored = useRef(false);

  async function load(p = 0) {
    setLoading(true);
    try {
      const { data, meta } = await fetchWishlistPaged(p, 5, "addedAt,desc");
      setItems(data);
      setPage(p);
      setTotalPages(meta.totalPages || 1);
    } catch (e) {
      console.error(e);
      if (!hasErrored.current) {
        hasErrored.current = true;
        toast.error("Không tải được danh sách theo dõi.", { id: "wishlist-load" });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    load(0);
  }, []);

  const handleUnlikeInline = (id: string) => {
    setItems((list) => list.filter((x) => x.id !== id));
  };

  const goTo = (p: number) => {
    if (p < 0 || p >= totalPages || p === page) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    load(p);
  };
  const pageWindow = (() => {
    const WIN = 5;
    if (totalPages <= WIN) return { start: 1, end: totalPages };
    const maxStart = totalPages - (WIN - 1);
    const start = Math.max(1, Math.min(page + 1 - 2, maxStart));
    const end = Math.min(totalPages, start + WIN - 1);
    return { start, end };
  })();

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* header */}
      <div className="mb-4 md:mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl text-emerald-800 font-bold leading-tight">Tin đã lưu</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Trang {page + 1}/{totalPages} • {items.length} mục
          </p>
        </div>

        <Link
          to="/post/new"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-emerald-300
                     bg-white text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50
                     active:bg-emerald-100 shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
          </svg>
          <span className="font-semibold">Đăng tin</span>
        </Link>
      </div>

      {/* list */}
      <ul className="rounded-2xl border bg-background/70 backdrop-blur-sm divide-y">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
          : items.length === 0
            ? <EmptyState />
            : items.map((it) => (
              <WishlistRow
                key={it._key}
                item={it}
                onUnlike={() => handleUnlikeInline(it.id)}
              />
            ))}
      </ul>

      {!loading && totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">

          {(() => {
            const base =
              "min-w-9 h-9 px-3 inline-flex items-center justify-center rounded-lg border text-sm transition shadow-sm";
            const idle = "bg-white text-slate-800 hover:bg-emerald-50 border-slate-200";
            const active = "bg-emerald-600 text-white border-emerald-600";
            const disabled = "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200";

            return (
              <>
                {/* Prev */}
                <button
                  className={`${base} ${page === 0 ? disabled : idle}`}
                  onClick={() => goTo(page - 1)}
                  disabled={page === 0}
                  aria-label="Trang trước"
                >
                  Trước
                </button>
                {pageWindow.start > 1 && (
                  <>
                    <button
                      className={`${base} ${page === 0 ? active : idle}`}
                      onClick={() => goTo(0)}
                      aria-current={page === 0 ? "page" : undefined}
                    >
                      1
                    </button>
                    {pageWindow.start > 2 && <span className="px-1 select-none text-slate-400">…</span>}
                  </>
                )}

                {Array.from(
                  { length: pageWindow.end - pageWindow.start + 1 },
                  (_, i) => pageWindow.start + i
                ).map((p) => {
                  const isActive = p - 1 === page;
                  return (
                    <button
                      key={p}
                      className={`${base} ${isActive ? active : idle}`}
                      onClick={() => goTo(p - 1)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {p}
                    </button>
                  );
                })}
                {pageWindow.end < totalPages && (
                  <>
                    {pageWindow.end < totalPages - 1 && (
                      <span className="px-1 select-none text-slate-400">…</span>
                    )}
                    <button
                      className={`${base} ${page === totalPages - 1 ? active : idle}`}
                      onClick={() => goTo(totalPages - 1)}
                      aria-current={page === totalPages - 1 ? "page" : undefined}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Next */}
                <button
                  className={`${base} ${page >= totalPages - 1 ? disabled : idle}`}
                  onClick={() => goTo(page + 1)}
                  disabled={page >= totalPages - 1}
                  aria-label="Trang sau"
                >
                  Sau
                </button>
              </>
            );
          })()}
        </div>
      )}

    </div>
  );
}

function WishlistRow({
  item,
  onUnlike,
}: {
  item: ListingWithKey;
  onUnlike: () => void;
}) {
  const { isLiked, toggle } = useWishlist();
  const liked = isLiked(item.id);

  const thumb =
    item.media?.cover ??
    item.media?.images?.[0] ??
    item.thumbnail ??
    undefined;

  const created = timeAgo(item.createdAt);
  const price = formatPrice(item.price);

  const [busy, setBusy] = useState(false);
  const handleToggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await toggle(item.id);
      if (!next) onUnlike();
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="group p-3 md:p-4 transition relative hover:bg-muted/40">
      <div className="flex gap-3 md:gap-4">
        <Link to={`/product/${item.id}`} className="flex gap-3 md:gap-4 flex-1 min-w-0">
          {/* image */}
          <div className="relative w-[124px] h-[96px] md:w-[148px] md:h-[112px] shrink-0 overflow-hidden rounded-xl bg-muted">
            {thumb ? (
              <img
                src={thumb}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">
                Không có ảnh
              </div>
            )}
            {item.media?.images?.length ? (
              <span className="absolute top-1 left-1 text-[11px] rounded-md bg-black/60 text-white px-1.5 py-0.5">
                {item.media.images.length}
              </span>
            ) : null}
          </div>

          {/* content */}
          <div className="flex-1 min-w-0">
            <h3 className="line-clamp-2 text-[15px] md:text-[16px] font-medium leading-snug">
              {item.title}
            </h3>

            <div className="mt-1 text-[16px] md:text-[17px] font-semibold text-rose-600">
              {price}
            </div>

            <div className="mt-2 text-[13px] text-muted-foreground flex items-center gap-2">
              <span>Địa chỉ</span>
              {created && <span>• {created}</span>}
              {item.location && <span>• {item.location}</span>}
            </div>
          </div>
        </Link>

        <div className="flex flex-col items-end gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <LikeButton
            liked={liked}
            onToggle={handleToggle}
            className={`p-2 rounded-full hover:bg-muted ${busy ? "opacity-60 pointer-events-none" : ""}`}
            size={20}
            outlineWidth={4}
          />
        </div>
      </div>
    </li>
  );
}
