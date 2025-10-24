import api from "@/lib/axios";

export type ApiEnvelope<T> = { code: number; message: string; result: T };
export type ProductStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export interface PageResponse<T> {
  content: T[];
  number: number;     
  size: number;              
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  sort?: unknown;
  pageable?: unknown;
}

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
}

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

export async function getPendingPosts(params?: {
  page?: number;            
  size?: number;
  status?: ProductStatus | string;
  type?: "VEHICLE" | "BATTERY" | string;
  sort?: string;
  signal?: AbortSignal;
}): Promise<PageResponse<PendingProduct>> {
  const {
    page = 0,
    size = 10,
    status = "PENDING_REVIEW",
    type,
    sort = "createdAt,desc",
    signal,
  } = params || {};

  const { data } = await api.get<any>("/staff/post/pending/review", {
    params: compact({ page, size, status, type, sort }),
    signal,
  });

  const raw = unwrap<any>(data);
  const contentRaw = raw?.content ?? raw?.items ?? [];
  return {
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
}

export function getRejectedPosts(args?: Omit<Parameters<typeof getPendingPosts>[0], "status">) {
  return getPendingPosts({ ...(args || {}), status: "REJECTED" });
}

export async function verifyPost(
  productId: string,
  payload: VerifyPostPayload,
  signal?: AbortSignal
): Promise<PendingProduct> {
  const { data } = await api.put<ApiEnvelope<any>>(
    `/staff/post/${productId}/verify`,
    payload,
    { signal }
  );
  return normalizePending(unwrap<any>(data));
}

export async function approvePostActive(
  productId: string,
  signal?: AbortSignal
): Promise<PendingProduct> {
  const { data } = await api.post<ApiEnvelope<any>>(
    `/staff/post/${productId}/verify/active`,
    {},
    { signal }
  );
  return normalizePending(unwrap<any>(data));
}
export async function rejectPost(
  productId: string,
  rejectReason: string,
  signal?: AbortSignal
): Promise<PendingProduct> {
  const { data } = await api.post<ApiEnvelope<any>>(
    `/staff/post/${productId}/verify/reject`,
    { rejectReason },
    { signal }
  );
  return normalizePending(unwrap<any>(data));
}
