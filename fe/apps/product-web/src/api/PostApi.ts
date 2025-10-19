// src/api/PostApi.ts
import api from "@/lib/axios";

/* =================== Types khớp BE =================== */

// Ảnh trả về từ BE
export type ProductImageResponseFE = {
  id: string;
  url: string;
  isPrimary: boolean;
  position: number | null;
  width: number | null;
  height: number | null;
};

// Meta gửi kèm khi upload (client-side)
export type ImageMeta = {
  position: number;
  isPrimary: boolean;
  width?: number;
  height?: number;
};

/** ========== VEHICLE ========== */
export type VehiclePostData = {
  title: string;
  description: string;
  price: number;

  city: string;
  district: string;
  ward: string;
  addressDetail: string;

  brandId: string;
  batteryHealthPercent: number; // 0..100
  mileageKm: number;

  modelId: string;   // ✅ gửi modelId
  year: number;
  versionId: string; // ✅ gửi versionId
  categoryId: string;
};

export type VehiclePostResponse = {
  productId: string;
  status: string;
  title: string;
  description: string;
  price: number;

  sellerPhone?: string | null;
  city: string;
  district: string;
  ward: string;
  addressDetail: string;

  createdAt: string; // ISO

  categoryId: string;
  brandId: string;
  brandName?: string;
  categoryName?: string;

  builtInBatteryCapacityAh?: number | null;
  builtInBatteryVoltageV?: number | null;
  removableBattery?: boolean | null;
  batteryHealthPercent?: number | null;

  motorPowerW?: number | null;
  maxSpeedKmh?: number | null;
  mileageKm?: number | null;
  rangeKm?: number | null;
  chargingTimeHours?: number | null;

  modelId?: string | null;
  year?: number | null;
  color?: string | null;
  origin?: string | null;
  weightKg?: number | null;
  warrantyMonths?: number | null;
  ownersCount?: number | null;

  hasInsurance?: boolean | null;
  hasRegistration?: boolean | null;

  images?: ProductImageResponseFE[];
};

/** ========== BATTERY ========== */
export type BatteryPostData = {
  title: string;
  description: string;
  price: number;

  city: string;
  district: string;
  ward?: string;
  addressDetail?: string;

  batteryTypeId?: string;
  brandId: string;

  capacityKwh: number;
  healthPercent: number; // 0..100
  voltageV: number;      // > 0
};

export type BatteryPostResponse = {
  productId: string;
  status: string;
  title: string;
  description: string;
  price: number;

  sellerPhone?: string | null;
  city: string;
  district: string;
  ward?: string | null;
  addressDetail?: string | null;

  createdAt: string; // ISO

  batteryTypeName?: string | null;
  brandId: string;
  brandName?: string | null;

  capacityKwh: number;
  healthPercent: number;
  voltageV: number;

  images?: ProductImageResponseFE[];
};

/* =================== Catalog types =================== */
export type Brand = { id: string; name: string };
export type OptionItem = { id: string; name: string };

/* =================== Helpers =================== */
// FormData: BE đọc "data" + "imagesMeta" + "images"
function appendJson(fd: FormData, json: string) {
  fd.append("data", json);
}
function appendMeta(fd: FormData, metaJson: string) {
  fd.append("imagesMeta", metaJson);
}
function appendImages(fd: FormData, images: File[]) {
  images.forEach((f, i) => fd.append("images", f, f.name || `image_${i}.jpg`));
}

// Bóc mảng an toàn từ nhiều kiểu response khác nhau
function unwrapList<T = any>(data: any): T[] {
  const c1 = data?.result?.items;
  const c2 = data?.result;
  const c3 = data?.items;
  if (Array.isArray(c1)) return c1 as T[];
  if (Array.isArray(c2)) return c2 as T[];
  if (Array.isArray(c3)) return c3 as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
}

function normalizeBrand(b: any): Brand {
  return {
    id: String(b?.id ?? b?.brandId ?? b?.code ?? ""),
    name: String(b?.name ?? b?.brandName ?? b?.title ?? b?.label ?? ""),
  };
}

function normalizeOption(x: any): OptionItem {
  return {
    // id có thể là id/categoryId/modelId/versionId/modelVersionId/code
    id: String(
      x?.id ??
      x?.categoryId ??
      x?.modelId ??
      x?.versionId ??
      x?.modelVersionId ??
      x?.code ??
      ""
    ),
    // name có thể là name/categoryName/modelName/versionName/modelVersionName/title/label
    name: String(
      x?.name ??
      x?.categoryName ??
      x?.modelName ??
      x?.versionName ??
      x?.modelVersionName ??
      x?.title ??
      x?.label ??
      ""
    ),
  };
}

export const toVNDFromMillions = (raw: string) => {
  const cleaned = (raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) * 1_000_000 : 0;
};

/* =================== POST endpoints =================== */
export async function postVehicle(
  data: VehiclePostData,
  images: File[],
  imagesMeta: ImageMeta[]
) {
  const fd = new FormData();
  appendJson(fd, JSON.stringify(data));
  appendImages(fd, images);
  appendMeta(fd, JSON.stringify(imagesMeta));
  const { data: res } = await api.post<VehiclePostResponse>("/post/products/vehicle", fd);
  return res;
}

export async function postBattery(
  data: BatteryPostData,
  images: File[],
  imagesMeta: ImageMeta[]
) {
  const fd = new FormData();
  appendJson(fd, JSON.stringify(data));
  appendImages(fd, images);
  appendMeta(fd, JSON.stringify(imagesMeta));
  const { data: res } = await api.post<BatteryPostResponse>("/post/products/battery", fd);
  return res;
}

/* =================== Catalog endpoints =================== */

// Brands (all)
export async function fetchVehicleBrands(): Promise<Brand[]> {
  const { data } = await api.get("/vehicle/brands/all");
  return unwrapList<any>(data).map(normalizeBrand).filter(x => x.id && x.name);
}

// Brands theo categoryId (filter qua query nếu BE hỗ trợ; fallback lấy all)
export async function fetchVehicleBrandsByCategory(categoryId: string): Promise<Brand[]> {
  if (!categoryId) return [];
  try {
    const { data } = await api.get("/vehicle/brands/all", { params: { categoryId } });
    return unwrapList<any>(data).map(normalizeBrand).filter(x => x.id && x.name);
  } catch {
    const { data } = await api.get("/vehicle/brands/all");
    return unwrapList<any>(data).map(normalizeBrand).filter(x => x.id && x.name);
  }
}

export async function fetchBatteryBrands(): Promise<Brand[]> {
  const { data } = await api.get("/battery/brands/all");
  return unwrapList<any>(data).map(normalizeBrand).filter(x => x.id && x.name);
}

// Categories
export async function fetchVehicleCategories(): Promise<OptionItem[]> {
  const { data } = await api.get("/vehicle/categories/all");
  return unwrapList<any>(data).map(normalizeOption).filter(x => x.id && x.name);
}

// Models theo categoryId + brandId
export async function fetchModelsByTypeAndBrand(
  categoryId: string,
  brandId: string
): Promise<OptionItem[]> {
  if (!categoryId || !brandId) return [];
  const { data } = await api.post("/vehicle/models/all", { categoryId, brandId });
  return unwrapList<any>(data).map(normalizeOption).filter(x => x.id && x.name);
}

// Versions theo modelId (POST; nếu server không hỗ trợ thì GET fallback)
export async function fetchVersionsByModel(modelId: string): Promise<OptionItem[]> {
  if (!modelId) return [];
  try {
    const { data } = await api.post("/vehicle/model/versions", { modelId });
    return unwrapList<any>(data).map(normalizeOption).filter(x => x.id && x.name);
  } catch {
    const { data } = await api.get("/vehicle/model/versions", { params: { modelId } });
    return unwrapList<any>(data).map(normalizeOption).filter(x => x.id && x.name);
  }
}
