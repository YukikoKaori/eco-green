import api from "@/lib/axios";
import { parsePrice } from "@/utils/price";

/* ----------------------------- Types chung ----------------------------- */

export type ProductImage = {
  id?: string;
  imageUrl?: string;
  isPrimary?: boolean;
  position?: number | null;
};

export type VehicleCatalog = {
  id: string;
  year?: number | string | null;
  type?: string | null;
  color?: string | null;
  rangeKm?: number | null;
  batteryCapacityKwh?: number | null;
  powerHp?: number | null;
  topSpeedKmh?: number | null;
  acceleration0100s?: number | null;
  acceleration0to100s?: number | null;
  weightKg?: number | null;
  grossWeightKg?: number | null;
  lengthMm?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
};

export type ProductDetailDTO = {
  id: string;
  title: string;
  description?: string | null;
  type?: "VEHICLE" | "BATTERY" | string;
  productImagesList?: ProductImage[];
  price?: number | string | null;
  createdAt?: string | null;
  sellerId?: string | null;
  sellerName?: string | null;
  sellerPhone?: string | null;
  status?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;
  brandName?: string | null;
  modelName?: string | null;
  version?: string | null;
  seats?: number | null;
  color?: string | null;
  odometerKm?: number | null;
  batteryCapacityKwh?: number | null;
  topSpeedKmh?: number | null;
  zeroTo100?: number | null;
  year?: number | string | null;
  isWishlisted?: boolean;
};

export type VehicleCatalogEnvelope = {
  productTitle?: string;
  productPrice?: number | string | null;
  productStatus?: string;
  brandName?: string;
  brandLogoUrl?: string;
  modelName?: string;
  versionName?: string;
  categoryName?: string;
  mileageKm?: number;
  batteryHealthPercent?: number;
  hasRegistration?: boolean | null;
  hasInsurance?: boolean | null;
  warrantyMonths?: number | null;
  vehicleCatalog: VehicleCatalog;
};

export type SimilarItemRaw = {
  productId: string;
  tittle: string; // BE typo
  price: number | string;
  brandName?: string;
  modelName?: string;
  images?: string;
};

export type NormalizedSimilarItem = {
  id: string;
  title: string;
  price: number;
  brandName?: string | null;
  modelName?: string | null;
  image?: string | null;
};

/* ----------------------------- Helpers ----------------------------- */

export function normalizeSimilar(list: SimilarItemRaw[] | unknown): NormalizedSimilarItem[] {
  if (!Array.isArray(list)) return [];
  return list.map((x) => {
    const obj = x as SimilarItemRaw;
    return {
      id: obj.productId,
      title: obj.tittle ?? "",
      price: parsePrice(obj.price) ?? 0,
      brandName: obj.brandName ?? null,
      modelName: obj.modelName ?? null,
      image: obj.images ?? null,
    };
  });
}

/* ------------------------------- APIs ------------------------------- */

export const fetchProductDetail = async (id: string) => {
  const { data } = await api.get<ProductDetailDTO>(`/product/search/${id}`);
  return data;
};

export const fetchVehicleCatalog = async (id: string) => {
  const { data } = await api.get<VehicleCatalogEnvelope>(`/vehicle/catalog/${id}`);
  return data;
};

export const fetchSimilarVehicles = async (id: string) => {
  const { data } = await api.get<SimilarItemRaw[]>(`/vehicle/${id}/similar`);
  return normalizeSimilar(data);
};

export const fetchSimilarBatteries = async (id: string) => {
  const { data } = await api.get<SimilarItemRaw[]>(`/battery/${id}/similar`);
  return normalizeSimilar(data);
};


export type PurchaseRequestPayload = {
  productId: string;
  offeredPrice: number;
  buyerMessage?: string;
};

export type PurchaseRequestDTO = {
  id: string;
  productId: string;
  productTitle?: string;
  productPrice?: number | string | null;

  buyerId?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string | null;

  sellerId?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string | null;

  offeredPrice: number | string;
  buyerMessage?: string | null;

  sellerResponseMessage?: string | null;
  rejectReason?: string | null;

  status: "PENDING" | "APPROVED" | "REJECTED" | "CONTRACT_SENT" | string;
  contractStatus?: "SENT" | "SIGNED" | "CANCELLED" | null;
  contractUrl?: string | null;

  createdAt?: string | null;
  respondedAt?: string | null; 
};

export const createPurchaseRequest = async (payload: PurchaseRequestPayload) => {
  const { data } = await api.post<PurchaseRequestDTO>(
    "/member/purchase-request/create",
    payload
  );
  return data;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export const listSellerPurchaseRequests = async (params?: {
  page?: number;
  size?: number;
}) => {
  const { page = 0, size = 20 } = params || {};
  const { data } = await api.get<Page<PurchaseRequestDTO>>(
    "/member/purchase-request/seller",
    {
      params: { page, size },
    }
  );
  return data;
};

export type RespondPayload = {
  requestId: string;
  accept: boolean;
  responseMessage?: string;
  rejectReason?: string;
};

export const respondPurchaseRequest = async (payload: RespondPayload) => {
  const { data } = await api.post<PurchaseRequestDTO>(
    "/member/purchase-request/respond",
    payload
  );
  return data;
};
