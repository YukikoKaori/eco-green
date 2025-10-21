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
