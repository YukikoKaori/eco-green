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
  const size = 50;

  while (true) {
    try {
      const { data } = await api.get<WishListResponse>("/member/wishlist", {
        params: { page, size, sort: "addedAt,desc" },
      });
      for (const it of data.items ?? []) ids.add(it.productId);

      if (!data.hasNextPage || (data.items ?? []).length === 0) break;
      page += 1;
    } catch (e: any) {
      if (e?.response?.status === 500) {
        const { data } = await api.get<WishListResponse>("/member/wishlist", {
          params: { page, size },
        });
        for (const it of data.items ?? []) ids.add(it.productId);
        if (!data.hasNextPage || (data.items ?? []).length === 0) break;
        page += 1;
      } else {
        throw e;
      }
    }
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
  size = 50,
  sort = "addedAt,desc"
): Promise<{ data: ListingWithKey[]; meta: Omit<WishListResponse, "items"> }> {
  const params: any = { page, size };
  if (sort) params.sort = sort;

  try {
    const { data } = await api.get<WishListResponse>("/member/wishlist", { params });
    const mapped = (data.items ?? []).map((it, i) => mapWishToListing(it, i, page));
    const { items, ...meta } = data;
    return { data: mapped, meta };
  } catch (e: any) {
    if (e?.response?.status === 500 && sort) {
      const { data } = await api.get<WishListResponse>("/member/wishlist", {
        params: { page, size },
      });
      const mapped = (data.items ?? []).map((it, i) => mapWishToListing(it, i, page));
      const { items, ...meta } = data;
      return { data: mapped, meta };
    }
    throw e;
  }
}
