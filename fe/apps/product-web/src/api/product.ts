import api from "@/lib/axios";

/** Trạng thái từ BE */
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

/** KHỚP CHÍNH XÁC response của /member/product?status=... */
export type ProductListItem = {
  id: string;
  title: string;
  description?: string;
  type?: string; // VEHICLE/BATTERY...
  productImagesList?: ProductImage[];
  price: string; // "900.000.000" (BE trả string)
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
  views?: number; // nếu có
};

/** Danh sách theo trạng thái */
export async function fetchProductsByStatus(status: BEStatus) {
  const { data } = await api.get<ProductListItem[]>("/member/product", {
    params: { status }, // PENDING_REVIEW, ACTIVE, ...
  });
  return Array.isArray(data) ? data : [];
}

/** Đọc chi tiết */
export async function fetchProductDetail(id: string) {
  const { data } = await api.get<ProductListItem>(`/member/product/${id}`);
  return data;
}

/** Cập nhật trạng thái */
export async function updateProductStatus(id: string, status: BEStatus) {
  await api.put(`/member/product/${id}/status`, { status });
}
