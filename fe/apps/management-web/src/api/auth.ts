// src/api/auth.ts
import api from "@/lib/axios";

/* ─────────────────────────────────────────────────── */
/*                    Common types                      */
/* ─────────────────────────────────────────────────── */

export type ApiEnvelope<T> = { code: number; message: string; result: T };
export type ProductStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

/** Spring Page response */
export interface PageResponse<T> {
  content: T[];
  number: number;            // page index (0-based)
  size: number;              // page size
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: unknown;
  pageable?: unknown;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
  phone: string;
  address?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  dateOfBirth?: string | null;
  taxCode?: string | null;
  nationalId?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | string;
  status: "ACTIVE" | "INACTIVE" | string;
  role: string;
}

export interface LoginResult {
  token: string;
  email?: null;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string | null;
  gender?: string;
  role: string;
  status?: string;
  address?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface LoginResponse extends ApiEnvelope<LoginResult> {}

export interface PendingProduct {
  id: string;
  status: string;
  rejectReason: string | null;
  title: string;
  thumbnail: string | null;
  productType: string;
  updateAt: string | null;
  modelName: string | null;
  versionName: string | null;
  packageName: string;
  amount: number | null;
}

export interface VerifyPostPayload {
  newStatus: ProductStatus;
  rejectReason?: string | null;
}

/* ─────────────────────────────────────────────────── */
/*                    Helpers                           */
/* ─────────────────────────────────────────────────── */

function unwrap<T>(data: any): T {
  return (data?.result ?? data) as T;
}

function normalizeUser(u: any): UserProfile {
  if (!u) return u;
  return {
    ...u,
    id: u.id,
    username: u.username ?? u.userName ?? "",
    taxCode: u.taxCode ?? u.tax_code ?? null,
    nationalId: u.nationalId ?? null,
    updatedAt: u.updatedAt ?? u.updateAt ?? null,
    avatarUrl: u.avatarUrl ?? u.avatar_url ?? null,
    dateOfBirth: u.dateOfBirth ?? u.date_of_birth ?? null,
  };
}

const compact = (obj: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out;
};

/* ─────────────────────────────────────────────────── */
/*                       AUTH                           */
/* ─────────────────────────────────────────────────── */

export async function loginApi(payload: { phone: string; password: string }) {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return unwrap<LoginResult>(data);
}

export async function registerApi(payload: {
  fullName: string;
  phone: string;
  password: string;
}) {
  const { data } = await api.post<ApiEnvelope<UserProfile>>(
    "/auth/register",
    payload
  );
  return unwrap<UserProfile>(data);
}

export async function logoutApi() {
  const { data } = await api.post("/auth/logout");
  return data;
}

export const oauthUrls = {
  google: `${import.meta.env.VITE_API_URL}/auth/google`,
  facebook: `${import.meta.env.VITE_API_URL}/auth/facebook`,
};

/* ─────────────────────────────────────────────────── */
/*                     PROFILE                          */
/* ─────────────────────────────────────────────────── */

export async function getMe(opts?: { signal?: AbortSignal }) {
  const { data } = await api.get<UserProfile | ApiEnvelope<UserProfile>>(
    "/profile/me",
    { signal: opts?.signal }
  );
  return normalizeUser(unwrap<UserProfile>(data));
}

export type UpdateMePayload = Partial<{
  fullName: string;
  phone: string;
  address: string;
  email: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  taxCode: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | string;
  nationalId: string | null;
}>;

function buildUpdatePayload(body: UpdateMePayload) {
  const payload: Record<string, any> = { ...body };
  if (payload.gender) payload.gender = String(payload.gender).toUpperCase();
  return compact(payload);
}

export async function updateMe(body: UpdateMePayload) {
  const finalBody = buildUpdatePayload(body);
  const { data } = await api.patch<UserProfile | ApiEnvelope<UserProfile>>(
    "/profile/me/update",
    finalBody
  );
  return normalizeUser(unwrap<UserProfile>(data));
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  const { data } = await api.post<ApiEnvelope<unknown>>(
    "/users/change-password",
    payload
  );
  return data;
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<
    { url: string } | ApiEnvelope<{ url: string }>
  >("/users/avatar", form);
  return unwrap<{ url: string }>(data).url;
}

/* ─────────────────────────────────────────────────── */
/*                STAFF – Pending Posts                 */
/* ─────────────────────────────────────────────────── */

/** Chuẩn hoá 1 item pending về PendingProduct */
function normalizePending(item: any): PendingProduct {
  return {
    id: item.id || item.productId || "",
    status: item.status || item.newStatus || "",
    rejectReason: item.rejectReason ?? null,
    title: item.title ?? "",
    thumbnail: item.thumbnail ?? null,
    productType: item.productType || item.type || "",
    updateAt: item.updateAt || item.updatedAt || null,
    modelName: item.modelName ?? null,
    versionName: item.versionName ?? null,
    packageName: item.packageName ?? "",
    amount: item.amount ?? item.price ?? null,
  };
}

/**
 * Lấy danh sách pending có phân trang + filter.
 * - page: 0-based
 * - size: số item / trang
 * - status: mặc định "PENDING_REVIEW"
 * - type: "VEHICLE" | "BATTERY" | undefined
 * - sort: ví dụ "createdAt,desc"
 */
export async function getPendingPosts(params?: {
  page?: number;            // 0-based
  size?: number;
  status?: ProductStatus | string;
  type?: "VEHICLE" | "BATTERY" | string;
  sort?: string;
}): Promise<PageResponse<PendingProduct>> {
  const {
    page = 0,
    size = 10,
    status = "PENDING_REVIEW",
    type,
    sort = "createdAt,desc",
  } = params || {};

  // BE có thể trả theo envelope hoặc thuần Spring Page
  const { data } = await api.get<any>("/staff/post/pending/review", {
    params: compact({ page, size, status, type, sort }),
  });

  const raw = unwrap<any>(data);
  const contentRaw = raw?.content ?? raw?.items ?? [];
  const pageResp: PageResponse<PendingProduct> = {
    content: Array.isArray(contentRaw) ? contentRaw.map(normalizePending) : [],
    number: raw?.number ?? raw?.page ?? 0,
    size: raw?.size ?? size,
    totalPages: raw?.totalPages ?? 1,
    totalElements: raw?.totalElements ?? (contentRaw?.length ?? 0),
    first: raw?.first,
    last: raw?.last,
    numberOfElements: raw?.numberOfElements,
    sort: raw?.sort,
    pageable: raw?.pageable,
  };

  return pageResp;
}

export async function verifyPost(
  productId: string,
  payload: VerifyPostPayload
) {
  const { data } = await api.put<ApiEnvelope<any>>(
    `/staff/post/${productId}/verify`,
    payload
  );
  return unwrap(data);
}
