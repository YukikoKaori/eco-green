import { useEffect, useRef, useState } from "react";
import type { ListingWithKey } from "@/listings/types";
import { fetchWishlistPaged } from "@/wishlist/api";
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
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const didInit = useRef(false);
  const hasErrored = useRef(false);

  async function load(p = 0) {
    if (p === 0) setLoading(true);
    try {
      const { data, meta } = await fetchWishlistPaged(p, 12, "addedAt,desc");
      setItems((old) => (p === 0 ? data : [...old, ...data]));
      setHasNext(meta.hasNextPage);
      setPage(p);
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

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* header */}
      <div className="mb-4 md:mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl text-emerald-800 font-bold leading-tight">Tin đã lưu</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} mục • cập nhật theo thời điểm bạn đã thêm.
          </p>
        </div>

        {/* Nút Đăng tin – text xanh đậm để đồng bộ trang */}
        <Link
          to="/post/new"
          className="
            inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-emerald-300
            bg-white text-emerald-800 hover:text-emerald-900
            hover:bg-emerald-50 active:bg-emerald-100 shadow-sm
          "
        >
          {/* icon dùng currentColor để nhận màu chữ */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               className="h-4 w-4">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8M8 12h8" />
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

      {/* load more */}
      {hasNext && items.length > 0 && (
        <div className="mt-5 flex justify-center">
          <button
            disabled={loadingMore}
            onClick={async () => {
              setLoadingMore(true);
              try { await load(page + 1); } finally { setLoadingMore(false); }
            }}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm shadow-sm transition hover:bg-muted disabled:opacity-60"
          >
            {loadingMore ? "Đang tải..." : "Xem thêm"}
          </button>
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

        {/* actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
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
