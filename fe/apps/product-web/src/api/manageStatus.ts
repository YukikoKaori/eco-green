import api from "@/lib/axios";

export type BEStatus =
  | "ACTIVE"
  | "PENDING_REVIEW"
  | "PENDING_PAYMENT"
  | "DRAFT"
  | "REJECTED"
  | "EXPIRED"
  | "HIDDEN"
  | "SOLD";

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

export type ImageMeta = { position: number; isPrimary: boolean };

export type DraftData = Record<string, any>;

export async function updateVehicleDraft(params: {
  productId: string;
  data: DraftData;              
  images?: (File | Blob)[];        
  imagesMeta?: ImageMeta[];      
}) {
  const { productId, data, images, imagesMeta } = params;
  const fd = new FormData();

  if (images?.length) images.forEach((f) => fd.append("images", f));
  fd.append("data", JSON.stringify(data || {}));
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
  const fd = new FormData();

  if (images?.length) images.forEach((f) => fd.append("images", f));
  fd.append("data", JSON.stringify(data || {}));
  if (imagesMeta) fd.append("imagesMeta", JSON.stringify(imagesMeta));

  const { data: res } = await api.put<any>(
    `/member/product/battery/update/${productId}/draft`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res;
}
