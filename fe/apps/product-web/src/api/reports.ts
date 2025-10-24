// src/api/reports.ts
import api from "@/lib/axios";

export type ReportCreateReq = {
  productId: string;
  phone: string;
  email?: string | null;
  reportReason: string;
};

export type ReportResp = {
  id: string;
  productId: string;
  productName?: string | null;
  phone: string;
  email?: string | null;
  reportReason: string;
  status: "PENDING" | "RESOLVED" | string;
  createdAt?: string;
};

/**
 * Tạo report vi phạm cho tin đăng.
 * - API yêu cầu Bearer token: axios instance `api` của bạn nên đã gắn token qua interceptor.
 * - Nếu muốn tự truyền token thủ công, truyền thêm tham số `token`.
 */
export async function createReport(
  payload: ReportCreateReq,
  signal?: AbortSignal,
  token?: string
): Promise<ReportResp> {
  const { data } = await api.post<ReportResp>("/reports", payload, {
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}
