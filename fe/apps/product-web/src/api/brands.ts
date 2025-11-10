import api from "@/lib/axios";

/* ================== Public brands ================== */
export type PublicBrand = {
  id: string;
  name: string;
  logoUrl: string | null;
  type: "VEHICLE" | "BATTERY" | string;
};

export async function fetchPublicBrands(): Promise<PublicBrand[]> {
  const res = await api.get("/public/brands");
  return Array.isArray(res.data) ? res.data : (res.data?.result ?? []);
}


export type ProductImage = {
  id?: string;
  imageUrl?: string;   
  url?: string;       
  publicId?: string;
  isPrimary?: boolean;
  position?: number | string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

export type ProductByBrand = {
  id: string;
  title?: string;
  description?: string;
  type?: "VEHICLE" | "BATTERY" | string;
  productImagesList?: ProductImage[];
  price?: number | string;
  conditionType?: string;
  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any; 
};

export type ProductByBrandResponse = {
  items: ProductByBrand[];
  page?: number;
  size?: number;
  totalPages?: number;
  totalItems?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
};

export async function fetchProductsByBrand(
  brandId: string,
  extraParams?: Record<string, any>
): Promise<ProductByBrandResponse> {
  const { data } = await api.get("/product/filter/brand", {
    params: { brand: brandId, ...(extraParams || {}) },
  });

  const items: any[] =
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.result?.items) && data.result.items) ||
    (Array.isArray(data?.result) && data.result) ||
    (Array.isArray(data) && data) ||
    [];

  return {
    items: items as ProductByBrand[],
    page: Number(data?.page ?? data?.result?.page ?? 0) || undefined,
    size: Number(data?.size ?? data?.result?.size ?? 0) || undefined,
    totalPages: Number(data?.totalPages ?? data?.result?.totalPages ?? 0) || undefined,
    totalItems: Number(data?.totalItems ?? data?.result?.totalItems ?? 0) || undefined,
    hasPreviousPage: Boolean(
      data?.hasPreviousPage ?? data?.result?.hasPreviousPage ?? false
    ) || undefined,
    hasNextPage: Boolean(
      data?.hasNextPage ?? data?.result?.hasNextPage ?? false
    ) || undefined,
  };
}
