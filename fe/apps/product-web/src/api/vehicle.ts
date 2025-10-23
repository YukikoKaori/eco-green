import api from "@/lib/axios";

/* ── Types ─────────────────────────────────────────────────────────── */
export type VehicleItem = {
  id: string;
  title: string;
  description?: string | null;
  type?: "VEHICLE" | string;
  productImagesList?: { url?: string; imageUrl?: string; isPrimary?: boolean; position?: number | null }[];
  price?: string | number | null;
  conditionType?: "NEW" | "USED" | string;
  sellerName?: string | null;
  createdAt?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;
  brandName?: string | null;
  modelName?: string | null;
  version?: string | null;
};

export type PageResp<T> = {
  items: T[];
  page: number;   // 0-based
  size: number;
  totalItems: number;
  totalPages: number;
};

export type VehicleFilters = {
  city?: string;
  brand?: string;     // BE đang nhận brand theo code/id -> bạn truyền đúng giá trị API trả về
  minPrice?: number;  // VND
  maxPrice?: number;  // VND
  yearFrom?: number;
  yearTo?: number;
};

export type VehicleBrand = { id: string; code?: string; name: string };

export type Province = { code: string; name: string };

/* ── Helpers ───────────────────────────────────────────────────────── */
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
const toPageResp = <T,>(raw: any, page = 0, size = 12): PageResp<T> => {
  const data = unwrap(raw);
  const items: T[] = data?.items ?? data?.content ?? (Array.isArray(data) ? data : []);
  const pageNo = data?.page ?? data?.number ?? page;
  const pageSize = data?.size ?? size ?? items.length ?? 0;
  const totalItems = data?.totalItems ?? data?.totalElements ?? items.length ?? 0;
  const totalPages = data?.totalPages ?? (pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1);
  return { items, page: pageNo, size: pageSize, totalItems, totalPages };
};

/* ── Vehicles ──────────────────────────────────────────────────────── */
export async function fetchVehiclesPaged(params: {
  filters?: VehicleFilters;
  page?: number; size?: number; sort?: string; signal?: AbortSignal;
}): Promise<PageResp<VehicleItem>> {
  const { filters = {}, page = 0, size = 12, sort = "createdAt,desc", signal } = params ?? {};
  const query = compact({ type: "VEHICLE", ...filters, page, size, sort });
  const { data } = await api.get("/product/filter", { params: query, signal });
  return toPageResp<VehicleItem>(data, page, size);
}

/* ── Brands (API thật) ─────────────────────────────────────────────── */
export async function fetchVehicleBrands(): Promise<VehicleBrand[]> {
  const { data } = await api.get<any>("/vehicle/brands/all");
  const arr = unwrap(data);
  // Chuẩn hoá: dựa vào data API của bạn (id/code/name)
  return (Array.isArray(arr) ? arr : []).map((b: any) => ({
    id: String(b.id ?? b.code ?? b.brandId ?? b.value ?? b.name),
    code: b.code ?? b.id ?? null,
    name: String(b.name ?? b.brandName ?? b.label ?? b.title ?? b.code ?? ""),
  }));
}

/* ── Provinces (public API) ────────────────────────────────────────── */
export async function fetchProvinces(): Promise<Province[]> {
  const r = await fetch("https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1");
  const j = await r.json();
  return (j?.data?.data ?? []).map((p: any) => ({ code: String(p.code), name: p.name }));
}
