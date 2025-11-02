import api from "@/lib/axios";

export type RecentItem = {
  id: string;
  title: string;
  price?: number | null;
  type?: "VEHICLE" | "BATTERY" | string;
  brandName?: string | null;
  modelName?: string | null;
  version?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  status?: string | null;
  isHot?: boolean | null;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export async function addRecentView(productId: string) {
  await api.post(`/member/recent/${productId}`, "1", {
    headers: { "Content-Type": "text/plain; charset=UTF-8" },
  });
}

export async function listRecentViews(params: { page?: number; size?: number } = {}) {
  const { page = 0, size = 20 } = params;
  const { data } = await api.get<Page<RecentItem>>(`/member/recent`, { params: { page, size } });
  return data;
}
