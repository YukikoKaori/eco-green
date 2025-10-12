import { useEffect, useState } from "react";
import ListingCard from "@/listings/components/ListingCard";
import type { ListingWithKey } from "@/listings/types";
import { fetchWishlistPaged } from "@/wishlist/api";
import { toast } from "sonner";

export default function WishlistPage() {
  const [items, setItems] = useState<ListingWithKey[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  async function load(p = 0) {
    if (p === 0) setLoading(true);
    try {
      const { data, meta } = await fetchWishlistPaged(p, 12, "addedAt,desc");
      setItems((old) => (p === 0 ? data : [...old, ...data]));
      setHasNext(meta.hasNextPage);
      setPage(p);
    } catch (e) {
      console.error(e);
      toast.error("Không tải được danh sách theo dõi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
  }, []);

  const handleUnlikeInline = (id: string) => {
    setItems((list) => list.filter((x) => x.id !== id));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-4 text-sm text-muted-foreground">
        Đang tải…
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Danh sách theo dõi</h1>
        <p className="text-muted-foreground">Bạn chưa theo dõi tin nào.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="text-xl font-semibold mb-3">Danh sách theo dõi</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 items-stretch">
        {items.map((it) => (
          <div key={it._key} className="h-full">
            <ListingCard
              item={it}
              initialLiked={true} 
              onLikeChange={(liked) => {
                if (!liked) handleUnlikeInline(it.id);
              }}
            />
          </div>
        ))}
      </div>

      {hasNext && (
        <div className="mt-4 flex justify-center">
          <button
            disabled={loadingMore}
            onClick={async () => {
              setLoadingMore(true);
              try {
                await load(page + 1);
              } finally {
                setLoadingMore(false);
              }
            }}
            className="px-4 py-2 rounded-md border hover:bg-muted"
          >
            {loadingMore ? "Đang tải..." : "Xem thêm"}
          </button>
        </div>
      )}
    </div>
  );
}
