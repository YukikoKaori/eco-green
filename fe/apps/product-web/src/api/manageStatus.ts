// src/api/manageStatus.ts
import api from "@/lib/axios";

/* ===== Trạng thái BE ===== */

export type BEStatus =
  | "ACTIVE"
  | "PENDING_REVIEW"
  | "PENDING_PAYMENT"
  | "DRAFT"
  | "REJECTED"
  | "EXPIRED"
  | "HIDDEN"
  | "SOLD";

/* ===== Toggle status ===== */

export type ToggleStatusResponse = {
  productId: string;
  status: BEStatus;
  message?: string;
  updatedAt?: string;
};

const ENDPOINT_BY_STATUS: Partial<Record<BEStatus, string>> = {
  ACTIVE: "/member/product/active",
  HIDDEN: "/member/product/hide",
};

export async function updateProductStatus(
  productId: string,
  status: BEStatus
): Promise<ToggleStatusResponse> {
  const path = ENDPOINT_BY_STATUS[status] ?? "/member/product/active";
  const { data } = await api.put<ToggleStatusResponse>(path, null, {
    params: { productId, status },
  });
  return data;
}

export const activateProduct = (productId: string) =>
  updateProductStatus(productId, "ACTIVE");
export const hideProduct = (productId: string) =>
  updateProductStatus(productId, "HIDDEN");

/* ===== Retry payment ===== */

export type RetryPaymentResponse = {
  productId: string;
  status: "PENDING_PAYMENT" | string;
  totalPayable: number;
  currency: string;
  paymentUrl: string;
};

export async function retryPayment(productId: string) {
  const { data } = await api.post<RetryPaymentResponse>(
    `/post/payments/retry/${productId}`
  );
  return data;
}

/* ===== Renew product (gia hạn bài đăng) ===== */

export type RenewPayload = {
  standardPackageId: string;
  addonPackageId?: string | null;
  optionId?: string | null;
  paymentMethod: "VNPAY" | string;
};

export type RenewResponse = {
  productId: string;
  status: BEStatus | string;
  totalPayable: number;
  currency: string;
  paymentUrl?: string;
  updatedAt?: string;
  startRenewalAt?: string | null;
};

/**
 * Gọi API gia hạn bài đăng
 * PUT /member/products/renewal/{productId}
 */
export async function renewProduct(
  productId: string,
  body: RenewPayload
): Promise<RenewResponse> {
  const { data } = await api.put<RenewResponse>(
    `/member/products/renewal/${productId}`,
    body
  );
  return data;
}

/* ===== Draft product types (theo response BE) ===== */

export type DraftImage = {
  id: string;
  url: string;
  position: number;
  width?: number;
  height?: number;
  primary?: boolean; // BE đang trả primary: true/false
};

export interface VehicleDraft {
  productId: string;
  status: BEStatus; // "DRAFT" | "PENDING_REVIEW" | ...
  title: string;
  description?: string;
  price: number;

  sellerPhone: string;

  city: string;
  district: string;
  ward: string;
  addressDetail?: string;

  createdAt: string;

  categoryId: string;
  brandId: string;
  brandName?: string;
  categoryName?: string;

  // thêm các field đang dùng ở PostNew
  year?: number | string | null;
  modelId?: string | null;
  versionId?: string | null;

  batteryHealthPercent?: number | null;
  mileageKm?: number | null;
  modelName?: string;
  warrantyMonths?: number | null;
  hasInsurance?: boolean | null;
  hasRegistration?: boolean | null;

  images?: DraftImage[];
}

export interface BatteryDraft {
  productId: string;
  status: BEStatus;
  title: string;
  description?: string;
  conditionType?: string | null;
  price: number;

  sellerPhone: string;

  city: string;
  district: string;
  ward: string;
  addressDetail?: string;

  createdAt: string;

  // thêm để dùng ở PostNew
  batteryTypeId?: string | null;
  batteryTypeName?: string;

  brandId: string;
  brandName?: string;

  capacityKwh?: number | null;
  healthPercent?: number | null;
  voltageV?: number | null;

  images?: DraftImage[];
}

/* ===== Image meta gửi khi update ===== */

export type ImageMeta = { position: number; isPrimary: boolean };
export type DraftData = Record<string, any>;

/* ===== GET draft chi tiết theo productId ===== */

export async function getVehicleDraft(
  productId: string
): Promise<VehicleDraft> {
  const { data } = await api.get<VehicleDraft>(
    `/member/product/vehicle/${productId}`
  );
  return data;
}

export async function getBatteryDraft(
  productId: string
): Promise<BatteryDraft> {
  const { data } = await api.get<BatteryDraft>(
    `/member/product/battery/${productId}`
  );
  return data;
}

/* ===== UPDATE draft (merge old + data mới, kèm ảnh) ===== */

export async function updateVehicleDraft(params: {
  productId: string;
  data: DraftData; // partial VehicleDraft
  images?: (File | Blob)[];
  imagesMeta?: ImageMeta[];
}) {
  const { productId, data, images, imagesMeta } = params;

  const old = await getVehicleDraft(productId);
  const merged = { ...(old || {}), ...(data || {}) };

  const fd = new FormData();

  if (images?.length) images.forEach((f) => fd.append("images", f));
  fd.append("data", JSON.stringify(merged));
  if (imagesMeta) fd.append("imagesMeta", JSON.stringify(imagesMeta));

  const { data: res } = await api.put<any>(
    `/member/product/vehicle/update/${productId}/draft`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res;
}

export async function updateBatteryDraft(params: {
  productId: string;
  data: DraftData; 
  images?: (File | Blob)[];
  imagesMeta?: ImageMeta[];
}) {
  const { productId, data, images, imagesMeta } = params;

  const old = await getBatteryDraft(productId);
  const merged = { ...(old || {}), ...(data || {}) };

  const fd = new FormData();

  if (images?.length) images.forEach((f) => fd.append("images", f));
  fd.append("data", JSON.stringify(merged));
  if (imagesMeta) fd.append("imagesMeta", JSON.stringify(imagesMeta));

  const { data: res } = await api.put<any>(
    `/member/product/battery/update/${productId}/draft`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res;
}
