
import api from "@/lib/axios";
import { parsePrice } from "@/utils/price";

export type SellerPublicProfile = {
  id: string;
  username: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  createdAt: string;       
  updatedAt: string | null;
  dateOfBirth: string | null;
  taxCode: string | null;
  nationalId: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | string;
  status: "ACTIVE" | string;
  role: "MEMBER" | string;
};

export type ProductImage = {
  id?: string;
  imageUrl?: string;
  publicId?: string;
  isPrimary?: boolean;
  position?: number | null;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

export type SellerProduct = {
  id: string;
  title: string;
  description?: string;
  type?: string;
  productImagesList?: ProductImage[];
  price?: number | string | null; 
  conditionType?: string;
  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string | null;
  expiresAt?: string | null;
  featuredEndAt?: string | null;
  addressDetail?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;
  brandName?: string | null;
  modelName?: string | null;
  version?: string | null;
  batteryType?: string | null;
  rejectReason?: string | null;
  isHot?: boolean;
  isWishlisted?: boolean | null;
  sellerAvatarUrl?: string | null;
};

export function formatVND(v?: number | string | null) {
  if (v == null) return "--";
  const n = typeof v === "string" ? parsePrice(v) : v;
  if (!Number.isFinite(n as number)) return String(v ?? "");
  return (n as number).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

export function pickProductImage(p: SellerProduct) {
  const list = p.productImagesList || [];
  if (!list.length) return "/images/placeholder.png";
  const pri = list.find((x) => x.isPrimary) || list[0];
  return pri?.imageUrl || "/images/placeholder.png";
}

export async function getSellerProfile(sellerId: string) {
  const { data } = await api.get<SellerPublicProfile>("/profile/public", {
    params: { sellerId },
  });
  return data;
}

export async function getSellerActiveProducts(sellerId: string) {
  const { data } = await api.get<SellerProduct[]>("/profile/public/products/active", {
    params: { sellerId },
  });
  return data;
}
export async function getSellerSoldProducts(sellerId: string) {
  const { data } = await api.get<SellerProduct[]>("/profile/public/products/sold", {
    params: { sellerId },
  });
  return data;
}
