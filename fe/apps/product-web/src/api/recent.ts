import api from "@/lib/axios";

export type BackendProductImage = {
  id?: string;
  imageUrl?: string;
  isPrimary?: boolean;
  position?: number | null;
};

export type BackendProductDetail = {
  id: string;
  title: string;
  description?: string | null;
  type?: "VEHICLE" | "BATTERY" | string;
  productImagesList?: BackendProductImage[];
  price?: number | string | null;
  createdAt?: string | null;
  sellerId?: string | null;
  sellerName?: string | null;
  sellerPhone?: string | null;
  status?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;
  brandName?: string | null;
  modelName?: string | null;
  version?: string | null;
  seats?: number | null;
  color?: string | null;
  odometerKm?: number | null;
  batteryCapacityKwh?: number | null;
  topSpeedKmh?: number | null;
  zeroTo100?: number | null;
  year?: number | string | null;
  isWishlisted?: boolean;
};

export type RecentItem = {
  id: string;
  title: string;
  price?: number | string | null; 
  type?: "VEHICLE" | "BATTERY" | string;
  brandName?: string | null;
  modelName?: string | null;
  version?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  status?: string | null;
  isHot?: boolean | null;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

/* -------- helpers -------- */
function pickPrimaryImageUrl(list?: BackendProductImage[] | null): string | null {
  if (!Array.isArray(list) || list.length === 0) return null;
  const primary = list.find((i) => i?.isPrimary);
  if (primary?.imageUrl) return primary.imageUrl;
  const sorted = [...list].sort((a, b) => (a.position ?? 999999) - (b.position ?? 999999));
  return sorted[0]?.imageUrl ?? list[0]?.imageUrl ?? null;
}

function normalizeRecentItem(p: BackendProductDetail): RecentItem {
  return {
    id: p.id,
    title: p.title,
    price: p.price ?? null,
    type: p.type,
    brandName: p.brandName ?? null,
    modelName: p.modelName ?? null,
    version: p.version ?? null,
    imageUrl: pickPrimaryImageUrl(p.productImagesList),
    createdAt: p.createdAt ?? null,
    status: p.status ?? null,
  };
}

export async function addRecentView(productId: string) {
  await api.post(`/member/recent/${productId}`);
}

export async function listRecentViews(params: { page?: number; size?: number } = {}) {
  const { page = 0, size = 20 } = params;
  const { data } = await api.get(`/member/recent`, { params: { page, size } });

  if (data && Array.isArray(data.content)) {
    const content: RecentItem[] = (data.content as BackendProductDetail[]).map(normalizeRecentItem);
    const pageResp: Page<RecentItem> = {
      content,
      totalElements: Number.isFinite(data.totalElements) ? data.totalElements : content.length,
      totalPages: Number.isFinite(data.totalPages) ? data.totalPages : 1,
      number: Number.isFinite(data.number) ? data.number : page,
      size: Number.isFinite(data.size) ? data.size : size,
    };
    return pageResp;
  }
  if (Array.isArray(data)) {
    const content: RecentItem[] = (data as BackendProductDetail[]).map(normalizeRecentItem);
    const pageResp: Page<RecentItem> = {
      content,
      totalElements: content.length,
      totalPages: 1,
      number: 0,
      size: content.length,
    };
    return pageResp;
  }
  const empty: Page<RecentItem> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 0,
  };
  return empty;
}
