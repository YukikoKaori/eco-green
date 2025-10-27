// src/api/moderation.ts
import api from "@/lib/axios";

/* ==== Types chung ==== */
export type ProductType = "VEHICLE" | "BATTERY";
export type ReviewStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type ListStatus = "ALL" | "ACTIVE" | "PENDING_PAYMENT" | "DRAFT" | "REJECTED";

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

/** ✅ Row dùng cho các bài đang chờ duyệt / verify */
export type PendingRow = {
  id: string;
  status: string;
  rejectReason: string | null;

  title: string;
  thumbnail: string | null;

  productType: ProductType | string;
  updateAt: string | null;

  // ✅ Bổ sung & chuẩn hoá để tránh null
  brandName: string | null;
  modelName: string | null;
  versionName: string | null;
  batteryType: string | null;

  packageName: string | null;
  amount: number | null;

  sellerId?: string | null;
  sellerName?: string | null;
  sellerPhone?: string | null;

  featuredEndAt?: string | null;
  expiresAt?: string | null;
};

export type ListedRow = {
  id: string;
  title: string;
  description: string | null;
  type: ProductType;
  productImagesList: ProductImage[];
  price: string | number | null;
  conditionType: string;
  sellerId: string | null;
  sellerName: string | null;
  sellerPhone: string | null;
  status: string;
  createdAt: string | null;
  addressDetail: string | null;
  city: string | null;
  district: string | null;
  ward: string | null;
  brandName: string | null;
  modelName: string | null;
  version: string | null;
  isWishlisted: boolean;
};

type ApiEnvelope<T> = { code: number; message: string; result: T };

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

/* ---------- Helpers lấy alias để tránh null ---------- */
const pickStr = (...candidates: any[]): string | null => {
  for (const v of candidates) {
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return null;
};
const pickNum = (...candidates: any[]): number | null => {
  for (const v of candidates) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  }
  return null;
};

/* ---------- Chuẩn hoá dữ liệu trả về từ BE ---------- */
const normalizePending = (it: any): PendingRow => ({
  id: it.id || it.productId || "",

  status: pickStr(it.status, it.newStatus, it.state) || "",
  rejectReason: it.rejectReason ?? null,

  title: pickStr(it.title, it.name) || "",
  thumbnail: pickStr(it.thumbnail, it.thumb, it.imageUrl),

  productType: pickStr(it.productType, it.type, it.product_type, it.itemType) || "",
  updateAt: pickStr(it.updateAt, it.updatedAt, it.modifiedAt),

  // ✅ alias cho brand/model/version/battery
  brandName: pickStr(it.brandName, it.brand, it.brand_name),
  modelName: pickStr(it.modelName, it.model, it.model_name),
  versionName: pickStr(it.versionName, it.version, it.version_name, it.trim),
  batteryType: pickStr(it.batteryType, it.battery_type),

  // gói & giá
  packageName: pickStr(it.packageName, it.package, it.postPackageName, it.postPackageCode),
  amount: pickNum(it.amount, it.price, it.currentPrice),

  // người bán
  sellerId: pickStr(it.sellerId, it.ownerId, it.accountId),
  sellerName: pickStr(it.sellerName, it.ownerName, it.accountName),
  sellerPhone: pickStr(it.sellerPhone, it.phone, it.ownerPhone),

  // thời hạn
  featuredEndAt: pickStr(it.featuredEndAt, it.priorityUntil, it.featuredUntil),
  expiresAt: pickStr(it.expiresAt, it.expiredAt, it.expires_at),
});

/* =========================================================
 * A) Danh sách CHỜ PHÊ DUYỆT
 * GET /staff/post/pending/review
 * ======================================================= */
export async function fetchPendingPaged(params?: {
  page?: number;
  size?: number;
  type?: ProductType | string;
  sort?: string;
  signal?: AbortSignal;
}): Promise<PageResponse<PendingRow>> {
  const {
    page = 0,
    size = 10,
    type,
    sort = "createdAt,desc",
    signal,
  } = params || {};

  const { data } = await api.get<ApiEnvelope<any>>("/staff/post/pending/review", {
    params: compact({ page, size, status: "PENDING_REVIEW", type, sort }),
    signal,
  });

  const raw = unwrap<any>(data);
  const rows = (raw?.content ?? raw?.items ?? []).map(normalizePending);

  return {
    content: rows,
    number: raw?.number ?? raw?.page ?? page,
    size: raw?.size ?? size,
    totalPages: raw?.totalPages ?? 1,
    totalElements: raw?.totalElements ?? rows.length,
    first: raw?.first,
    last: raw?.last,
  };
}

/** Fallback tìm 1 item theo id (dùng khi F5 Detail) */
export async function fetchPendingByIdViaList(
  productId: string,
  opts?: { pageSize?: number; maxPages?: number; signal?: AbortSignal }
): Promise<PendingRow | null> {
  const pageSize = opts?.pageSize ?? 50;
  const maxPages = opts?.maxPages ?? 20;
  let page = 0;

  while (page < maxPages) {
    const pageData = await fetchPendingPaged({
      page,
      size: pageSize,
      sort: "createdAt,desc",
      signal: opts?.signal,
    });
    const found = pageData.content.find((x) => x.id === productId);
    if (found) return found;

    if (pageData.last || page >= (pageData.totalPages ?? 1) - 1) break;
    page++;
  }
  return null;
}

/** Duyệt Active ngay */
export async function approveActive(productId: string, signal?: AbortSignal): Promise<PendingRow> {
  const { data } = await api.post<ApiEnvelope<any>>(
    `/staff/post/${productId}/verify/active`,
    {},
    { signal }
  );
  return normalizePending(unwrap<any>(data));
}

/** Từ chối */
export async function rejectWithReason(
  productId: string,
  rejectReason: string,
  signal?: AbortSignal
): Promise<PendingRow> {
  const { data } = await api.post<ApiEnvelope<any>>(
    `/staff/post/${productId}/verify/reject`,
    { rejectReason },
    { signal }
  );
  return normalizePending(unwrap<any>(data));
}

/** (tuỳ chọn) Verify generic */
export async function verifyStatus(
  productId: string,
  newStatus: ReviewStatus,
  signal?: AbortSignal
): Promise<PendingRow> {
  const { data } = await api.put<ApiEnvelope<any>>(
    `/staff/post/${productId}/verify`,
    { newStatus },
    { signal }
  );
  return normalizePending(unwrap<any>(data));
}

/* =========================================================
 * B) Danh sách theo status khác
 * GET /staff/product/by-status?status=...
 * GET /staff/product/status/all
 * ======================================================= */
export async function fetchListedPaged(params: {
  status?: ListStatus;
  page?: number;
  size?: number;
  keyword?: string;
  signal?: AbortSignal;
}): Promise<{
  items: ListedRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}> {
  const { status = "ALL", page = 0, size = 12, keyword, signal } = params;

  if (status !== "ALL") {
    const { data } = await api.get<any>("/staff/product/by-status", {
      params: compact({ status: status.toLowerCase(), page, size, q: keyword }),
      signal,
    });
    return data;
  }

  const { data } = await api.get<any>("/staff/product/status/all", {
    params: compact({ page, size, q: keyword }),
    signal,
  });
  return data;
}
