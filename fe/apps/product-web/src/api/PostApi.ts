import api from "@/lib/axios";

/* ================== Common types ================== */
export type ProductImageResponseFE = {
  id: string;
  url: string;
  isPrimary: boolean;
  position: number | null;
  width: number | null;
  height: number | null;
};

export type ImageMeta = {
  position: number;
  isPrimary: boolean;
  width?: number;
  height?: number;
};

export type Brand = { id: string; name: string };
export type OptionItem = { id: string; name: string };

/* ================== Vehicle posting ================== */
export type VehiclePostData = {
  title: string;
  description: string;
  price: number;

  city: string;
  district: string;
  ward: string;
  addressDetail: string;

  brandId: string;
  batteryHealthPercent: number;
  mileageKm: number;

  modelId: string;
  year: number;
  versionId: string;
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

  createdAt: string;

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

/* ================== Battery posting ================== */
export type BatteryPostData = {
  title: string;
  description: string;
  price: number;

  city: string;
  district: string;
  ward?: string;
  addressDetail?: string;

  batteryTypeId?: string;   // gửi lên BE
  brandId: string;

  capacityKwh: number;
  healthPercent: number;
  voltageV: number;
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

  createdAt: string;

  // BE có 2 field này
  batteryTypeId?: string | null;     // <— bổ sung cho khớp BE
  batteryTypeName?: string | null;

  brandId: string;
  brandName?: string | null;

  capacityKwh: number;
  healthPercent: number;
  voltageV: number;

  images?: ProductImageResponseFE[];
};

/* ================== Helpers ================== */
function appendJson(fd: FormData, json: string) {
  fd.append("data", json);
}
function appendMeta(fd: FormData, metaJson: string) {
  fd.append("imagesMeta", metaJson);
}
function appendImages(fd: FormData, images: File[]) {
  images.forEach((f, i) => fd.append("images", f, f.name || `image_${i}.jpg`));
}

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
    id: String(
      x?.id ??
        x?.categoryId ??
        x?.modelId ??
        x?.versionId ??
        x?.modelVersionId ??
        x?.code ??
        ""
    ),
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

/** Battery Type normalizer (khớp BE: batteryTypeId, batteryTypeName) */
function normalizeBatteryType(x: any): OptionItem {
  return {
    id: String(x?.batteryTypeId ?? x?.typeId ?? x?.id ?? x?.code ?? ""),
    name: String(
      x?.batteryTypeName ??
        x?.typeName ??
        x?.brandName ?? // fallback nếu BE từng đặt nhầm
        x?.name ??
        x?.label ??
        ""
    ),
  };
}

export const toVNDFromMillions = (raw: string) => {
  const cleaned = (raw ?? "").replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) * 1_000_000 : 0;
};

/* ================== Create Post ================== */
export async function postVehicle(
  data: VehiclePostData,
  images: File[],
  imagesMeta: ImageMeta[]
) {
  const fd = new FormData();
  appendJson(fd, JSON.stringify(data));
  appendImages(fd, images);
  appendMeta(fd, JSON.stringify(imagesMeta));
  const { data: res } = await api.post<VehiclePostResponse>(
    "/post/products/vehicle",
    fd,
    { timeout: 60000 }
  );
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
  const { data: res } = await api.post<BatteryPostResponse>(
    "/post/products/battery",
    fd
  );
  return res;
}

/* ================== Master Data ================== */
// Vehicle
export async function fetchVehicleBrands(): Promise<Brand[]> {
  const { data } = await api.get("/vehicle/brands/all");
  return unwrapList<any>(data).map(normalizeBrand).filter(x => x.id && x.name);
}

export async function fetchVehicleBrandsByCategory(
  categoryId: string
): Promise<Brand[]> {
  if (!categoryId) return [];
  try {
    const { data } = await api.get("/vehicle/brands/all", { params: { categoryId } });
    return unwrapList<any>(data).map(normalizeBrand).filter(x => x.id && x.name);
  } catch {
    const { data } = await api.get("/vehicle/brands/all");
    return unwrapList<any>(data).map(normalizeBrand).filter(x => x.id && x.name);
  }
}

export async function fetchVehicleCategories(): Promise<OptionItem[]> {
  const { data } = await api.get("/vehicle/categories/all");
  return unwrapList<any>(data).map(normalizeOption).filter(x => x.id && x.name);
}

export async function fetchModelsByTypeAndBrand(
  categoryId: string,
  brandId: string
): Promise<OptionItem[]> {
  if (!categoryId || !brandId) return [];
  const { data } = await api.post("/vehicle/models/all", { categoryId, brandId });
  return unwrapList<any>(data).map(normalizeOption).filter(x => x.id && x.name);
}

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

// Battery
export async function fetchBatteryBrands(): Promise<Brand[]> {
  const { data } = await api.get("/battery/brands/all");
  return unwrapList<any>(data).map(normalizeBrand).filter(x => x.id && x.name);
}

/** 🔥 Battery Types (mới) */
export async function fetchBatteryTypes(): Promise<OptionItem[]> {
  const { data } = await api.get("/battery/types/all");
  return unwrapList<any>(data).map(normalizeBatteryType).filter(x => x.id && x.name);
}

/* ================== Member Products (khớp response hiện tại của BE) ================== */
export type ProductStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "REJECTED"
  | (string & {});

export type MemberProductRow = {
  productId: string;
  title: string;
  price: number; // parse từ "400.000.000" -> 400000000
  status: ProductStatus;
  createdAt?: string;
  images?: { url?: string; isPrimary?: boolean }[];
};

export type PageResp<T> = {
  items: T[];
  totalItems?: number;
  totalPages?: number;
  page?: number;
  size?: number;
};

function buildStatusParam(input?: ProductStatus | ProductStatus[]) {
  if (!input) return undefined;
  return Array.isArray(input) ? input.filter(Boolean).join(",") : input;
}

function parseVNDStringToNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  const n = String(v).replace(/[^\d]/g, "");
  return n ? Number(n) : 0;
}

function normalizeMemberProduct(x: any): MemberProductRow {
  const imagesSrc: any[] =
    Array.isArray(x?.productImagesList) ? x.productImagesList :
    Array.isArray(x?.images) ? x.images : [];

  return {
    productId: String(x?.productId ?? x?.id ?? ""),
    title: String(x?.title ?? ""),
    price: parseVNDStringToNumber(x?.price),
    status: String(x?.status ?? "") as ProductStatus,
    createdAt: x?.createdAt ?? undefined,
    images: imagesSrc.map((im) => ({
      url: im?.imageUrl ?? im?.url ?? undefined,
      isPrimary: Boolean(im?.isPrimary),
    })),
  };
}

/** GET /member/product?status=... (BE hiện trả mảng thuần) */
export async function fetchMemberProducts(params: {
  status?: ProductStatus | ProductStatus[];
  page?: number;
  size?: number;
  sort?: string;
}): Promise<PageResp<MemberProductRow>> {
  const { data } = await api.get("/member/product", {
    params: {
      status: buildStatusParam(params?.status),
      page: params?.page,
      size: params?.size,
      sort: params?.sort,
    },
  });

  if (Array.isArray(data)) {
    const items = data.map(normalizeMemberProduct);
    return { items, totalItems: items.length, totalPages: 1, page: 0, size: items.length };
  }

  const rawItems =
    data?.result?.items ?? data?.items ?? data?.content ?? data?.data ?? [];
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeMemberProduct) : [];
  const totalItems = Number(
    data?.totalItems ?? data?.result?.totalItems ?? data?.totalElements ?? items.length
  );
  const totalPages = Number(data?.totalPages ?? data?.result?.totalPages ?? 1);
  const page = Number(data?.page ?? data?.number ?? data?.result?.page ?? params?.page ?? 0);
  const size = Number(data?.size ?? data?.result?.size ?? params?.size ?? items.length);

  return { items, totalItems, totalPages, page, size };
}
