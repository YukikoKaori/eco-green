import api from "@/lib/axios";

export type PageResp<T> = {
  content: T[];
  page: number;          
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

function toPageResp<T>(raw: any): PageResp<T> {
  const content = raw?.content ?? [];
  const pg = raw?.pageable ?? {};
  return {
    content,
    page: pg?.pageNumber ?? raw?.number ?? 0,
    size: pg?.pageSize ?? raw?.size ?? content.length ?? 0,
    totalElements: raw?.totalElements ?? content.length ?? 0,
    totalPages: raw?.totalPages ?? 1,
    first: raw?.first ?? (pg?.pageNumber === 0),
    last: raw?.last ?? false,
  };
}

export type CreateReportBody = {
  productId: string;
  phone: string;
  email?: string | null;
  reportReason: string;
};
export async function createReport(body: CreateReportBody, signal?: AbortSignal) {
  const { data } = await api.post("/reports", body, { signal });
  return data;
}

export type ReportCountRow = {
  productId: string;
  productName?: string | null;
  reportCount: number;
};
export async function fetchReportCountsPaged(
  page = 0,
  size = 10,
  signal?: AbortSignal
): Promise<PageResp<ReportCountRow>> {
  const { data } = await api.get(`/reports/count`, { params: { page, size }, signal });
  return toPageResp<ReportCountRow>(data);
}

export type ReportDetail = {
  id: string;
  productId: string;
  productName?: string | null;
  phone: string;
  email?: string | null;
  reportReason: string;
  status: "PENDING" | "RESOLVED" | string;
  createdAt?: string;
  updatedAt?: string;
  updateAt?: string;
};
export async function fetchReportsByProduct(
  productId: string,
  page = 0,
  size = 20,
  signal?: AbortSignal
): Promise<PageResp<ReportDetail>> {
  const { data } = await api.get(`/reports`, { params: { productId, page, size }, signal });
  return toPageResp<ReportDetail>(data);
}
export async function fetchReportCountForProduct(
  productId: string,
  signal?: AbortSignal
): Promise<number> {
  const pg = await fetchReportsByProduct(productId, 0, 1, signal);
  return pg.totalElements ?? 0;
}

export type ReportShowRow = {
  id: string; 
  productId: string;
  productName?: string | null;
  phone?: string | null;
  email?: string | null;
  reportReason: string;
  status: "PENDING" | "RESOLVED" | string;
  createdAt?: string;
  updatedAt?: string;
  updateAt?: string;
};
export async function fetchReportsShowPaged(
  page = 0,
  size = 10,
  opts?: { productId?: string; status?: string; keyword?: string },
  signal?: AbortSignal
): Promise<PageResp<ReportShowRow>> {
  const params: Record<string, any> = { page, size };
  if (opts?.productId) params.productId = opts.productId;
  if (opts?.status) params.status = opts.status;
  if (opts?.keyword) params.keyword = opts.keyword;

  const { data } = await api.get(`/reports/show`, { params, signal });
  return toPageResp<ReportShowRow>(data);
}
export async function updateReportStatus(
  reportId: string,
  status: "PENDING" | "RESOLVED",
  signal?: AbortSignal
) {
  const { data } = await api.put(
    `/staff/post/reports/${reportId}/status`,
    { status },
    { signal }
  );
  return data;
}
