import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { addWishlist, removeWishlist, fetchAllWishlistIds } from "@/api/WishlistApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Ctx = {
  ids: Set<string>;
  isLiked: (id: string) => boolean;
  toggle: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>; 
};

const WishlistContext = createContext<Ctx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      return;
    }
    try {
      const set = await fetchAllWishlistIds();
      if (mounted.current) setIds(set);
    } catch {
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    (async () => {
      await refresh();
    })();
  }, [user, refresh]);

  const ctx: Ctx = useMemo(
    () => ({
      ids,
      isLiked: (id) => ids.has(id),
      async toggle(id) {
        if (!user) {
          toast.info("Vui lòng đăng nhập để theo dõi tin.");
          return false;
        }

        if (ids.has(id)) {
          setIds((prev) => {
            const n = new Set(prev);
            n.delete(id);
            return n;
          });
          try {
            await removeWishlist(id);
            toast("Đã hủy theo dõi tin này.", { id: `wl-${id}` });
            return false;
          } catch {
            // rollback
            setIds((prev) => new Set(prev).add(id));
            toast.error("Không thể hủy theo dõi.", { id: `wl-${id}` });
            return true;
          }
        } else {
          // optimistic add
          setIds((prev) => new Set(prev).add(id));
          try {
            await addWishlist(id);
            toast.success("Tin đã được đưa vào danh sách theo dõi.", { id: `wl-${id}` });
            return true;
          } catch {
            // rollback
            setIds((prev) => {
              const n = new Set(prev);
              n.delete(id);
              return n;
            });
            toast.error("Không thể theo dõi.", { id: `wl-${id}` });
            return false;
          }
        }
      },
      refresh,
    }),
    [ids, user, refresh]
  );

  return <WishlistContext.Provider value={ctx}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const v = useContext(WishlistContext);
  if (!v) throw new Error("useWishlist must be used within WishlistProvider");
  return v;
}
