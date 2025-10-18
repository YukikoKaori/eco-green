import api from "@/lib/axios";

export type ConditionType = "NEW" | "USED";

export type ImageMeta = {
  position: number;   
  isPrimary: boolean; 
};

export type VehiclePostData = {
  title: string;
  description?: string;
  conditionType?: ConditionType;
  price?: number;        

  city?: string | null;
  district?: string | null;
  ward?: string | null;
  addressDetail?: string | null;
  expiresAt?: string | null;   
  brandId?: string;

  // battery info
  builtInBatteryCapacityAh?: number | null;
  builtInBatteryVoltageV?: number | null;
  removableBattery?: boolean | null;
  batteryHealthPercent?: number | null;

  // performance
  motorPowerW?: number | null;
  maxSpeedKmh?: number | null;
  mileageKm?: number | null;
  rangeKm?: number | null;
  chargingTimeHours?: number | null;

  // vehicle info
  model?: string | null;
  year?: number | null;
  color?: string | null;
  origin?: string | null;
  weightKg?: number | null;
  warrantyMonths?: number | null;
  ownersCount?: number | null;

  // legal
  hasInsurance?: boolean | null;
  hasRegistration?: boolean | null;
  licensePlate?: string | null;
};

export type BatteryPostData = {
  title: string;
  description?: string;
  conditionType?: ConditionType;
  price?: number;             
  isNegotiable?: boolean;
  sellerPhone?: string | null;

  city?: string | null;
  district?: string | null;
  ward?: string | null;
  addressDetail?: string | null;
  expiresAt?: string | null;   

  brandId?: string;
  batteryTypeId?: string;

  capacityKwh?: number | null;
  healthPercent?: number | null;
  origin?: string | null;
  voltageV?: number | null;
};

function appendJsonAliases(fd: FormData, key: string, json: string) {
  fd.append("data", json);
  fd.append("request", json);
}

function appendMetaAliases(fd: FormData, metaJson: string) {
  fd.append("imagesMate", metaJson);
  fd.append("imagesMeta", metaJson);
}

function appendImages(fd: FormData, images: File[]) {
  images.forEach((f, i) => {
    const name = f.name || `image_${i}.jpg`;
    fd.append("images", f, name);
  });
}

export async function postVehicle(
  data: VehiclePostData,
  images: File[],
  imagesMeta: ImageMeta[]
) {
  const fd = new FormData();
  appendJsonAliases(fd, "data", JSON.stringify(data));
  appendImages(fd, images);
  appendMetaAliases(fd, JSON.stringify(imagesMeta));

  const { data: res } = await api.post("/post/products/vehicle", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
}

export async function postBattery(
  data: BatteryPostData,
  images: File[],
  imagesMeta: ImageMeta[]
) {
  const fd = new FormData();
  appendJsonAliases(fd, "data", JSON.stringify(data));
  appendImages(fd, images);
  appendMetaAliases(fd, JSON.stringify(imagesMeta));

  const { data: res } = await api.post("/post/products/battery", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
}

export type Brand = { id: string; name: string };

function normalizeBrand(b: any): Brand {
  return {
    id: String(b?.id ?? b?.brandId ?? b?.code ?? ""),
    name: String(b?.name ?? b?.brandName ?? b?.title ?? b?.label ?? ""),
  };
}

export async function fetchVehicleBrands(): Promise<Brand[]> {
  const { data } = await api.get("/vehicle/brands/all");
  return Array.isArray(data) ? data.map(normalizeBrand).filter(x => x.id && x.name) : [];
}

export async function fetchBatteryBrands(): Promise<Brand[]> {
  const { data } = await api.get("/battery/brands/all");
  return Array.isArray(data) ? data.map(normalizeBrand).filter(x => x.id && x.name) : [];
}

export const toVNDFromMillions = (raw: string) => {
  const cleaned = (raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) * 1_000_000 : 0;
};

// Gợi ý interface (tuỳ backend)
export async function fetchVehicleCategories(): Promise<{id:string; name:string}[]> {
  const { data } = await api.get("/vehicle-categories");
  return data.result ?? data; // tuỳ envelope BE
}
export async function fetchVehicleBrandsByCategory(categoryId: string) {
  const { data } = await api.get("/vehicle-brands", { params: { categoryId } });
  return data.result ?? data;
}
export async function fetchModelsByBrand(brandId: string) {
  const { data } = await api.get("/vehicle-models", { params: { brandId } });
  return data.result ?? data;
}
export async function fetchVersionsByModel(modelId: string) {
  const { data } = await api.get("/vehicle-versions", { params: { modelId } });
  return data.result ?? data;
}
