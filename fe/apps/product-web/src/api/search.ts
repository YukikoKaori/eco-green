import api from "@/lib/axios";

/* ── Types ─────────────────────────────────────────────────────────── */
export type SearchByNameItem = {
  id: string;
  title: string;
  description?: string;
  type: "VEHICLE" | "BATTERY" | string;

  productImagesList?: Array<{
    url?: string;
    imageUrl?: string;
    isPrimary?: boolean;
  }>;

  price?: string | number | null;
  conditionType?: "NEW" | "USED" | string;

  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string | null;

  status?: string;
  createdAt?: string;

  addressDetail?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;

  brandName?: string | null;
  modelName?: string | null;
  version?: string | null;

  isWishlisted?: boolean;
};

export type SearchByNameResponse = {
  items: SearchByNameItem[];
  page: number;          // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type Province = { code: string; name: string };

/* ── Helpers ───────────────────────────────────────────────────────── */
const unwrap = (d: any) => (d?.result ?? d);

const toInt = (v: any, def = 0) =>
  Number.isFinite(v) ? Number(v) : def;

const toBool = (v: any, def = false) =>
  typeof v === "boolean" ? v : def;

/** Chuẩn hoá nhiều kiểu response của BE về 1 format thống nhất */
const normalizeResp = (raw: any, fallbackSize = 20): SearchByNameResponse => {
  // BE cũ có thể trả mảng thuần
  if (Array.isArray(raw)) {
    const items = raw as SearchByNameItem[];
    return {
      items,
      page: 0,
      size: fallbackSize,
      totalElements: items.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const d = unwrap(raw) ?? {};
  const items: SearchByNameItem[] =
    (Array.isArray(d.items) && d.items) ||
    (Array.isArray(d.content) && d.content) ||
    [];

  const page = toInt(d.page ?? d.number, 0);
  const size = toInt(d.size, fallbackSize);
  const totalElements = toInt(d.totalElements ?? d.totalItems ?? items.length, items.length);
  const totalPages = toInt(
    d.totalPages,
    size > 0 ? Math.max(1, Math.ceil(totalElements / size)) : 1
  );

  return {
    items,
    page,
    size,
    totalElements,
    totalPages,
    hasPreviousPage: toBool(d.hasPreviousPage, page > 0),
    hasNextPage: toBool(d.hasNextPage, page < totalPages - 1),
  };
};

/* ── Search by name (kèm filter) ───────────────────────────────────── */
export async function searchProductsByName(
  name: string,
  page = 0,
  size = 20,
  signal?: AbortSignal,
  opts?: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    yearFrom?: number;
    yearTo?: number;
    sort?: string; // "createdAt,desc"
  }
): Promise<SearchByNameResponse> {
  if (!name.trim()) {
    return {
      items: [],
      page: 0,
      size,
      totalElements: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const params: Record<string, any> = {
    name,
    page,
    size,
    sort: opts?.sort ?? "createdAt,desc",
  };
  if (opts?.city) params.city = opts.city;
  if (Number.isFinite(opts?.minPrice)) params.minPrice = opts!.minPrice;
  if (Number.isFinite(opts?.maxPrice)) params.maxPrice = opts!.maxPrice;
  if (Number.isFinite(opts?.yearFrom)) params.yearFrom = opts!.yearFrom;
  if (Number.isFinite(opts?.yearTo)) params.yearTo = opts!.yearTo;

  // BE hiện có endpoint by-name (đã hỗ trợ phân trang)
  const { data } = await api.get("/product/search/by-name", { params, signal });
  return normalizeResp(data, size);
}

/* ── Provinces (public API để filter Thành phố) ──────────────────────
   Dùng chung approach với file vehicle bạn gửi: lấy từ FPO. */
export async function fetchProvinces(): Promise<Province[]> {
  const r = await fetch("https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1");
  const j = await r.json();
  const arr = j?.data?.data ?? [];
  return arr.map((p: any) => ({ code: String(p.code), name: String(p.name) })) as Province[];
}
