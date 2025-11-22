import api from "@/lib/axios";

/* ==== Types chung ==== */
export type ProductType = "VEHICLE" | "BATTERY";
export type ReviewStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type ListStatus =
  | "ALL"
  | "ACTIVE"
  | "PENDING_PAYMENT"
  | "DRAFT"
  | "REJECTED";

export type ProductImage = {
  id: string;
  imageUrl: string;
  publicId: string;
  isPrimary: boolean;
  position: number | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  format: string | null;
};

export type PageResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
};

export type ModerationRow = {
  id: string;
  status: string;
  rejectReason: string | null;

  title: string;
  description?: string | null;
  thumbnail: string | null;

  productType: ProductType | string;
  createdAt: string | null;
  updateAt: string | null;

  brandName: string | null;
  modelName: string | null;
  versionName: string | null;
  categoryName?: string | null;

  price: number | null;
  packageName: string | null;

  mileageKm?: number | null;
  year?: number | null;
  batteryTypeId?: string | null;
  batteryType?: string | null;
  batteryHealthPercent?: number | null;
  healthPercent?: number | null;
  capacityKwh?: number | null;
  voltageV?: number | null;

  sellerId: string | null;
  sellerName: string | null;
  sellerPhone: string | null;
  sellerEmail?: string | null;

  city?: string | null;
  district?: string | null;
  ward?: string | null;
  addressDetail?: string | null;

  featuredEndAt?: string | null;
  expiresAt?: string | null;
};

const unwrap = <T,>(data: any): T => (data?.result ?? data) as T;

const compact = (obj: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out;
};

const pickStr = (...candidates: any[]): string | null => {
  for (const v of candidates) {
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return null;
};

const pickNum = (...candidates: any[]): number | null => {
  for (const v of candidates) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && !isNaN(Number(v))) return Number(v);
  }
  return null;
};

const normalizeRow = (it: any): ModerationRow => ({
  id: pickStr(it.id, it.productId) || "",
  status: pickStr(it.status, it.state) || "",
  rejectReason: it.rejectReason ?? null,

  title: pickStr(it.title, it.name) || "",
  description: pickStr(it.description, it.desc),
  thumbnail:
    it.thumbnail ??
    it.thumb ??
    (Array.isArray(it.images)
      ? it.images.find((i: any) => i.isPrimary)?.imageUrl
      : null),

  productType:
    (pickStr(it.productType, it.type, it.product_type) || "").toUpperCase(),

  createdAt: pickStr(it.createdAt, it.createAt, it.created_date),
  updateAt: pickStr(it.updateAt, it.updatedAt, it.modifiedAt),

  brandName: pickStr(it.brandName, it.brand, it.brand_name),
  modelName: pickStr(it.modelName, it.model, it.model_name),
  versionName: pickStr(it.versionName, it.version, it.version_name),
  categoryName: pickStr(it.categoryName, it.category_name),

  price: pickNum(it.price, it.amount, it.currentPrice),
  packageName: pickStr(it.packageName, it.package, it.packageCode),

  mileageKm: pickNum(it.mileageKm, it.mileage, it.km),
  year: pickNum(it.year, it.productionYear),
  batteryTypeId: pickStr(it.batteryTypeId),
  batteryType: pickStr(it.batteryType),
  batteryHealthPercent: pickNum(it.batteryHealthPercent),
  healthPercent: pickNum(it.healthPercent),
  capacityKwh: pickNum(it.capacityKwh),
  voltageV: pickNum(it.voltageV),

  sellerId: pickStr(it.sellerId, it.ownerId, it.accountId),
  sellerName: pickStr(it.sellerName, it.ownerName, it.accountName),
  sellerPhone: pickStr(it.sellerPhone, it.phone, it.ownerPhone),
  sellerEmail: pickStr(it.sellerEmail, it.ownerEmail),

  city: pickStr(it.city, it.province),
  district: pickStr(it.district, it.area),
  ward: pickStr(it.ward, it.subDistrict),
  addressDetail: pickStr(it.addressDetail, it.address),

  featuredEndAt: pickStr(it.featuredEndAt, it.featuredUntil),
  expiresAt: pickStr(it.expiresAt, it.expiredAt, it.expires_at),
});

export async function fetchPendingPaged(params?: {
  page?: number;
  size?: number;
  type?: ProductType | string;
  sort?: string;
  signal?: AbortSignal;
}): Promise<PageResponse<ModerationRow>> {
  const { page = 0, size = 10, type, sort = "createdAt,desc", signal } =
    params || {};

  const endpoint = `/staff/post/pending/review`;

  const { data } = await api.get(endpoint, {
    params: compact({
      page,
      size,
      sort,
      type: type ? String(type).toUpperCase() : undefined,
    }),
    signal,
  });

  const raw = unwrap<any>(data);
  const list = (raw?.content ?? raw?.items ?? []).map(normalizeRow);

  return {
    content: list,
    number: raw?.number ?? page,
    size: raw?.size ?? size,
    totalPages: raw?.totalPages ?? 1,
    totalElements: raw?.totalElements ?? list.length,
    first: raw?.first,
    last: raw?.last,
  };
}

export async function fetchListedPaged(params: {
  status?: ListStatus;
  page?: number;
  size?: number;
  keyword?: string;
  type?: ProductType | "ALL";
  signal?: AbortSignal;
}) {
  const { status = "ALL", page = 0, size = 12, keyword, type, signal } = params;

  const endpoint =
    status === "ALL"
      ? "/staff/product/status/all"
      : "/staff/product/by-status";

  const { data } = await api.get<any>(endpoint, {
    params: compact({
      status: status === "ALL" ? undefined : status,
      page,
      size,
      q: keyword,
      type: type && type !== "ALL" ? String(type).toUpperCase() : undefined, // FIX HERE
    }),
    signal,
  });

  const items = (data.items ?? data.content ?? data.result ?? []).map(
    normalizeRow
  );

  return {
    items,
    page: data.page ?? 0,
    size: data.size ?? size,
    totalElements: data.totalElements ?? items.length,
    totalPages: data.totalPages ?? 1,
    hasPreviousPage: !!data.hasPreviousPage,
    hasNextPage: !!data.hasNextPage,
  };
}

export async function approveActive(productId: string, signal?: AbortSignal) {
  const { data } = await api.post(
    `/staff/post/${productId}/verify/active`,
    {},
    { signal }
  );
  return normalizeRow(unwrap<any>(data));
}

export async function rejectWithReason(
  productId: string,
  rejectReason: string,
  signal?: AbortSignal
) {
  const { data } = await api.post(
    `/staff/post/${productId}/verify/reject`,
    { rejectReason },
    { signal }
  );
  return normalizeRow(unwrap<any>(data));
}

export async function verifyStatus(
  productId: string,
  newStatus: ReviewStatus,
  signal?: AbortSignal
) {
  const { data } = await api.put(
    `/staff/post/${productId}/verify`,
    { newStatus },
    { signal }
  );
  return normalizeRow(unwrap<any>(data));
}
