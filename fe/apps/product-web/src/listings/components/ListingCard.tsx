import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Listing } from "@/listings/types";
import { Camera, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import LikeButton from "@/listings/components/LikeButton";
import { toast } from "sonner";
import { addWishlist, removeWishlist } from "@/wishlist/api";

type Props = {
  item: Listing;
  initialLiked?: boolean;
  onLikeChange?: (liked: boolean) => void;
};

function formatPrice(v: Listing["price"]): string {
  if (v == null || v === "") return "—";
  if (typeof v === "number") return v.toLocaleString("vi-VN") + " đ";
  // Loại hết ký tự không phải số để tránh "8.500" -> 8.5
  const cleaned = String(v).replace(/[^\d]/g, "");
  if (!cleaned) return "—";
  const n = Number(cleaned);
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") + " đ" : "—";
}

function getThumb(item: Listing): string | undefined {
  const fromMedia = item.media?.cover ?? item.media?.images?.[0] ?? undefined;
  return fromMedia ?? item.thumbnail ?? undefined;
}

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

/* ===== component ===== */
export default function ListingCard({ item, initialLiked = false, onLikeChange }: Props) {
  const thumb = getThumb(item);
  const priceLabel = formatPrice(item.price);
  const createdLabel = timeAgo(item.createdAt);
  const mediaCount = item.media?.images?.length ?? (thumb ? 1 : 0);

  const [liked, setLiked] = useState<boolean>(!!initialLiked);
  useEffect(() => {
    setLiked(!!initialLiked);
  }, [initialLiked, item.id]);

  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const handleToggleLike = async () => {
    if (!user) {
      const next = encodeURIComponent(loc.pathname + loc.search + loc.hash);
      nav(`/login?next=${next}`);
      toast.info("Vui lòng đăng nhập để theo dõi tin.");
      return;
    }
    if (busy) return;

    const prev = liked;
    const nextLiked = !prev;

    setLiked(nextLiked);
    onLikeChange?.(nextLiked);
    setBusy(true);

    try {
      if (nextLiked) {
        await addWishlist(item.id);
        toast.success("Tin đã được đưa vào danh sách theo dõi.");
      } else {
        await removeWishlist(item.id);
        toast("Đã hủy theo dõi tin này.");
      }
    } catch (e) {
      setLiked(prev);
      onLikeChange?.(prev);
      toast.error("Không thể cập nhật theo dõi. Vui lòng thử lại.");
      console.error("wishlist toggle failed:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="h-full overflow-hidden shadow-sm transition hover:shadow-md">
      {/* MEDIA */}
      <div className="relative aspect-[4/3] w-full bg-muted">
        {thumb ? (
          <img
            src={thumb}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            sizes="(max-width: 768px) 100vw, 33vw"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Không có ảnh
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />

        <LikeButton
          liked={liked}
          onToggle={handleToggleLike}
          className="absolute right-2 top-2 p-0"
          size={20}
        />

        <div className="absolute left-2 bottom-2 flex items-center gap-2 text-[11px] text-white">
          {createdLabel && (
            <span className="rounded-md bg-black/50 px-2 py-0.5">{createdLabel}</span>
          )}
          {mediaCount > 0 && (
            <span className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5">
              <Camera className="h-3.5 w-3.5" />
              {mediaCount}
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <CardContent className="flex h-full flex-col p-3">
        <h3 className="min-h-[40px] line-clamp-2 text-[15px] font-medium leading-snug">
          {item.title}
        </h3>

        <div className="mt-1 text-lg font-semibold text-rose-600">{priceLabel}</div>

        <div className="mt-auto flex items-center justify-between pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-[180px]">
              {item.location || "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
