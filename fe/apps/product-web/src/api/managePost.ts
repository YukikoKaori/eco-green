// src/api/memberProducts.ts
import api from "@/lib/axios";

/** FE tabs */
export type ListingStatus =
  | "active"
  | "pending"
  | "unpaid"
  | "draft"
  | "rejected"
  | "expired"
  | "hidden"
  | "sold";

/** BE status */
export type BEStatus =
  | "ACTIVE"
  | "PENDING_REVIEW"
  | "PENDING_PAYMENT"
  | "DRAFT"
  | "REJECTED"
  | "EXPIRED"
  | "HIDDEN"
  | "SOLD";

/** FE ↔ BE mapping */
export const FE2BE: Record<ListingStatus, BEStatus> = {
  active: "ACTIVE",
  pending: "PENDING_REVIEW",
  unpaid: "PENDING_PAYMENT",
  draft: "DRAFT",
  rejected: "REJECTED",
  expired: "EXPIRED",
  hidden: "HIDDEN",
  sold: "SOLD",
};
export const BE2FE: Record<BEStatus, ListingStatus> = {
  ACTIVE: "active",
  PENDING_REVIEW: "pending",
  PENDING_PAYMENT: "unpaid",
  DRAFT: "draft",
  REJECTED: "rejected",
  EXPIRED: "expired",
  HIDDEN: "hidden",
  SOLD: "sold",
};

/** Kiểu ảnh: BE có thể trả url hoặc imageUrl */
export type ProductImage = {
  url?: string | null;
  imageUrl?: string | null;
  isPrimary?: boolean;
};

/** Item trong danh sách quản lý tin */
export type ProductListItem = {
  id: string;
  title: string;
  type?: "VEHICLE" | "BATTERY";
  price: number | string;
  status: BEStatus;
  createdAt?: string;

  addressesDetail?: string;
  city?: string;
  district?: string;
  ward?: string;

  brandName?: string;
  modelName?: string;
  versionName?: string;

  productImagesList?: ProductImage[];
  rejectReason?: string;
  views?: number;
};

/** Helpers */
export function getCoverFromImages(images?: ProductImage[]): string {
  const list = images || [];
  const pick = list.find((i) => i?.isPrimary) || list[0];
  const src = pick?.url || pick?.imageUrl;
  return src || "/images/placeholder-160x120.png";
}

/** Chuẩn hoá giá về number (nếu BE trả string có dấu chấm phẩy) */
export function normalizePrice(v: number | string): number {
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/* ────────────────────────────────────────────────────────── */
/*                           APIs                             */
/* ────────────────────────────────────────────────────────── */

/** Lấy danh sách tin theo status (FE hoặc BE đều được). */
export async function getMemberProducts(status: ListingStatus | BEStatus) {
  const beStatus: BEStatus =
    (["ACTIVE","PENDING_REVIEW","PENDING_PAYMENT","DRAFT","REJECTED","EXPIRED","HIDDEN","SOLD"] as BEStatus[])
      .includes(status as BEStatus)
      ? (status as BEStatus)
      : FE2BE[status as ListingStatus];

  const { data } = await api.get<ProductListItem[]>("/member/product", {
    params: { status: beStatus },
  });
  return Array.isArray(data) ? data : [];
}

/** Lấy chi tiết 1 tin của thành viên */
export async function getMemberProductDetail(id: string) {
  const { data } = await api.get<ProductListItem>(`/member/product/${id}`);
  return data;
}

/** Cập nhật trạng thái 1 tin của thành viên */
export async function updateMemberProductStatus(
  id: string,
  next: ListingStatus | BEStatus
) {
  const beStatus: BEStatus =
    (["ACTIVE","PENDING_REVIEW","PENDING_PAYMENT","DRAFT","REJECTED","EXPIRED","HIDDEN","SOLD"] as BEStatus[])
      .includes(next as BEStatus)
      ? (next as BEStatus)
      : FE2BE[next as ListingStatus];

  await api.put(`/member/product/${id}/status`, { status: beStatus });
}

/** Đếm số lượng theo mỗi tab (gọi 8 lần song song, tái dùng getMemberProducts) */
export async function getMemberCounts() {
  const tabs: ListingStatus[] = [
    "active",
    "pending",
    "unpaid",
    "draft",
    "rejected",
    "expired",
    "hidden",
    "sold",
  ];
  const results = await Promise.all(
    tabs.map(async (t) => {
      const list = await getMemberProducts(t);
      return [t, list.length] as const;
    })
  );
  return Object.fromEntries(results) as Record<ListingStatus, number>;
}
