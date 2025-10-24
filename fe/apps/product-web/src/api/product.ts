import api from "@/lib/axios";

export type BEStatus =
  | "ACTIVE"
  | "PENDING_REVIEW"
  | "PENDING_PAYMENT"
  | "DRAFT"
  | "REJECTED"
  | "EXPIRED"
  | "HIDDEN"
  | "SOLD";

export type ProductImage = { url: string; isPrimary?: boolean };

export type ProductListItem = {
  id: string;
  title: string;
  description?: string;
  type?: string; 
  productImagesList?: ProductImage[];
  price: string; 
  conditionType?: string;

  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string;

  status: BEStatus;
  createdAt?: string;

  addressesDetail?: string;
  city?: string;
  district?: string;
  ward?: string;

  brandName?: string;
  modelName?: string;
  versionName?: string;

  isWishlisted?: boolean;
  views?: number; 
};

export async function fetchProductsByStatus(status: BEStatus) {
  const { data } = await api.get<ProductListItem[]>("/member/product", {
    params: { status },
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchProductDetail(id: string) {
  const { data } = await api.get<ProductListItem>(`/member/product/${id}`);
  return data;
}

export async function updateProductStatus(id: string, status: BEStatus) {
  await api.put(`/member/product/${id}/status`, { status });
}


export type SimilarVehicleItem = {
  productId: string;
  tittle: string;         
  price: number;
  brandName?: string;
  modelName?: string;
  images?: string;
};

export type SimilarBatteryItem = {
  productId: string;
  tittle: string;
  price: number;
  brandName?: string;
  modelName?: string;
  images?: string;
};

export type NormalizedSimilarItem = {
  id: string;
  title: string;
  price: number;
  brandName?: string | null;
  modelName?: string | null;
  image?: string | null;
};

function normalizeSimilar(list: Array<SimilarVehicleItem | SimilarBatteryItem> | unknown): NormalizedSimilarItem[] {
  if (!Array.isArray(list)) return [];
  return list.map((x) => ({
    id: (x as any).productId,
    title: (x as any).tittle ?? "",
    price: Number((x as any).price ?? 0),
    brandName: (x as any).brandName ?? null,
    modelName: (x as any).modelName ?? null,
    image: (x as any).images ?? null,
  }));
}

export async function fetchSimilarVehicles(productId: string): Promise<NormalizedSimilarItem[]> {
  const { data } = await api.get<SimilarVehicleItem[]>(`/vehicle/${productId}/similar`);
  return normalizeSimilar(data);
}

export async function fetchSimilarBatteries(productId: string): Promise<NormalizedSimilarItem[]> {
  const { data } = await api.get<SimilarBatteryItem[]>(`/battery/${productId}/similar`);
  return normalizeSimilar(data);
}

export async function fetchSimilarByType(
  productType: "VEHICLE" | "BATTERY",
  productId: string
): Promise<NormalizedSimilarItem[]> {
  return productType === "BATTERY"
    ? fetchSimilarBatteries(productId)
    : fetchSimilarVehicles(productId);
}
