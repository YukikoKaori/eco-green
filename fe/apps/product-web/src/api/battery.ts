import api from "@/lib/axios";

export type BatteryItem = {
  id: string;
  title: string;
  description?: string | null;
  type?: "BATTERY" | string;

  productImagesList?: {
    url?: string;
    imageUrl?: string;
    isPrimary?: boolean;
    position?: number | null;
  }[];

  price?: string | number | null;
  priceNumber?: number | null;

  conditionType?: "NEW" | "USED" | string;

  sellerId?: string | null;
  sellerName?: string | null;
  sellerPhone?: string | null;

  status?: string | null;
  createdAt?: string | null;

  addressDetail?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;

  brandName?: string | null;
  modelName?: string | null;
  version?: string | null;

  isWishlisted?: boolean;
};

export type BatteryBrand = { id: string; code?: string; name: string };

export type PageResp<T> = {
  items: T[];
  page: number;      
  size: number;      
  totalItems: number;
  totalPages: number;
};

export type BatteryFilters = {
  city?: string;
  district?: string;
  brand?: string;     
  minPrice?: number;  
  maxPrice?: number;  
  yearFrom?: number;
  yearTo?: number;
};

/* ========= Helpers ========= */
const unwrap = (d: any) => (d?.result ?? d);
const compact = (o: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out;
};

const toNumberFromCommaString = (v: any): number | null => {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v).replace(/[^\d]/g, "");
  return s ? Number(s) : null;
};

const toPageResp = <T,>(raw: any, page = 0, size = 12): PageResp<T> => {
  const data = unwrap(raw);
  const items: T[] = data?.items ?? data?.content ?? (Array.isArray(data) ? data : []);
  const pageNo = data?.page ?? data?.number ?? page;
  const pageSize = data?.size ?? size ?? items.length ?? 0;
  const totalItems = data?.totalItems ?? data?.totalElements ?? items.length ?? 0;
  const totalPages =
    data?.totalPages ?? (pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1);
  return { items, page: pageNo, size: pageSize, totalItems, totalPages };
};

const normalizeItem = (it: any): BatteryItem => ({
  ...it,
  priceNumber: toNumberFromCommaString(it?.price),
  productImagesList: Array.isArray(it?.productImagesList) ? it.productImagesList : [],
});

/* ========= Batteries ========= */
const PRODUCT_FILTER_ENDPOINT = "/product/filter";

export async function fetchBatteriesPaged(params: {
  filters?: BatteryFilters;
  page?: number;
  size?: number;
  sort?: string;
  signal?: AbortSignal;
}): Promise<PageResp<BatteryItem>> {
  const { filters = {}, page = 0, size = 12, sort = "createdAt,desc", signal } = params ?? {};

  const query = compact({
    type: "BATTERY",
    city: filters.city,
    district: filters.district,
    brand: filters.brand,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    yearFrom: filters.yearFrom,
    yearTo: filters.yearTo,
    page,
    size,
    sort,
  });

  const { data } = await api.get(PRODUCT_FILTER_ENDPOINT, { params: query, signal });
  const pageResp = toPageResp<BatteryItem>(data, page, size);
  return { ...pageResp, items: pageResp.items.map(normalizeItem) };
}

/* ========= Brands ========= */
export async function fetchBatteryBrands(): Promise<BatteryBrand[]> {
  const { data } = await api.get<any>("/battery/brands/all");
  const arr = unwrap(data);
  return (Array.isArray(arr) ? arr : []).map((b: any) => ({
    id: String(b.id ?? b.code ?? b.brandId ?? b.value ?? b.name),
    code: b.code ?? b.id ?? undefined,
    name: String(b.name ?? b.brandName ?? b.label ?? b.title ?? b.code ?? ""),
  }));
}
