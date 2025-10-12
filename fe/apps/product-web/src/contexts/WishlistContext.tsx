import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addWishlist, removeWishlist, fetchAllWishlistIds } from "@/wishlist/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Ctx = {
  ids: Set<string>;
  isLiked: (id: string) => boolean;
  toggle: (id: string) => Promise<boolean>; 
};
const WishlistContext = createContext<Ctx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { setIds(new Set()); return; }
    (async () => {
      try { setIds(await fetchAllWishlistIds()); } catch {}
    })();
  }, [user]);

  const ctx: Ctx = useMemo(() => ({
    ids,
    isLiked: (id) => ids.has(id),
    async toggle(id) {
      if (ids.has(id)) {
        setIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        try { await removeWishlist(id); toast("Đã hủy theo dõi tin này."); }
        catch { setIds(prev => new Set(prev).add(id)); toast.error("Không thể hủy theo dõi."); }
        return false;
      } else {
        setIds(prev => new Set(prev).add(id));
        try { await addWishlist(id); toast.success("Tin đã được đưa vào danh sách theo dõi."); }
        catch { setIds(prev => { const n = new Set(prev); n.delete(id); return n; }); toast.error("Không thể theo dõi."); }
        return true;
      }
    }
  }), [ids]);
  return <WishlistContext.Provider value={ctx}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const v = useContext(WishlistContext);
  if (!v) throw new Error("useWishlist must be used within WishlistProvider");
  return v;
}
