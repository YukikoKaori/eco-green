import api from "@/lib/axios";
import type { Listing, ListingWithKey } from "@/listings/types";

export type WishItemDTO = {
  productId: string;
  productName: string;
  thumbnailUrl?: string | null;
  addedAt?: string | null;
};

export type WishListResponse = {
  items: WishItemDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export async function fetchAllWishlistIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  let page = 0;
  while (true) {
    const { data } = await api.get<WishListResponse>("/member/wishlist", {
      params: { page, size: 50, sort: "addedAt,desc" },
    });
    for (const it of data.items ?? []) ids.add(it.productId);
    if (!data.hasNextPage) break;
    page += 1;
  }
  return ids;
}

export async function addWishlist(productId: string) {
  await api.post("/member/wishlist", { productId });
}
export async function removeWishlist(productId: string) {
  await api.delete(`/member/wishlist/${productId}`);
}

function mapWishToListing(x: WishItemDTO, idx: number, page: number): ListingWithKey {
  const item: Listing = {
    id: x.productId,
    title: x.productName,
    description: null,
    type: "VEHICLE",           
    price: "—",                 
    createdAt: x.addedAt ?? undefined,
    thumbnail: x.thumbnailUrl ?? null,
    media: x.thumbnailUrl ? { cover: x.thumbnailUrl } : undefined,
    status: "ACTIVE",
    location: null,
    distance: null,
  };
  return { ...item, _key: `${x.productId}-${page}-${idx}` };
}

export async function fetchWishlistPaged(
  page = 0,
  size = 12,
  sort = "addedAt,desc"
): Promise<{ data: ListingWithKey[]; meta: Omit<WishListResponse, "items"> }> {
  const { data } = await api.get<WishListResponse>("/member/wishlist", {
    params: { page, size, sort },
  });
  const mapped = (data.items ?? []).map((it, i) => mapWishToListing(it, i, page));
  const { items, ...meta } = data;
  return { data: mapped, meta };
}
