import api from "@/lib/axios";

export type VehicleCatalogCreateReq = {
  brandName: string;
  modelName: string;
  versionName: string;
  vehicleCategoryId: string;
  logo?: File | null;
};

export type VehicleCatalogCreated = {
  brandId: string;
  modelId: string;
  versionId: string;

  brandCreated: boolean;
  modelCreated: boolean;
  versionCreated: boolean;

  brandName?: string;
  modelName?: string;
  versionName?: string;
  logoUrl?: string | null;
};

export async function createVehicleCatalog(req: VehicleCatalogCreateReq) {
  const fd = new FormData();
  fd.append("brandName", req.brandName.trim());
  fd.append("modelName", req.modelName.trim());
  fd.append("versionName", req.versionName.trim());
  fd.append("vehicleCategoryId", req.vehicleCategoryId);
  if (req.logo) fd.append("logo", req.logo);

  const { data } = await api.post<VehicleCatalogCreated>(
    "/staff/vehicle/create",
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export type BatteryBrandCreateReq = {
  brandName: string;
  logo?: File | null;
};

export type BatteryBrandCreated = {
  brandId: string;
  brandName: string;
  logoUrl?: string | null;
};

export async function createBatteryBrand(req: BatteryBrandCreateReq): Promise<BatteryBrandCreated> {
  const fd = new FormData();
  fd.append("brandName", req.brandName.trim());
  if (req.logo) fd.append("logo", req.logo);

  const { data } = await api.post<BatteryBrandCreated>(
    "/staff/battery/brands/create",
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export type VehicleCategory = { id: string; name: string };
export async function listVehicleCategories(): Promise<VehicleCategory[]> {
  const { data } = await api.get("/vehicle/categories/all");

  const items =
    (Array.isArray(data?.result?.items) && data.result.items) ||
    (Array.isArray(data?.result) && data.result) ||
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data) && data) ||
    [];

  return (items as any[])
    .map((x) => ({
      id: String(x?.id ?? x?.categoryId ?? x?.code ?? ""),
      name: String(x?.name ?? x?.categoryName ?? x?.label ?? x?.title ?? ""),
    }))
    .filter((c) => c.id && c.name);
}

export type BrandType = "VEHICLE" | "BATTERY";

export type PublicBrand = {
  id: string;
  name: string;
  logoUrl?: string | null;
  type?: BrandType | (string & {});
};

export type BrandPage = {
  items: PublicBrand[];
  page: number;
  size: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

function normalizeBrands(raw: any[]): PublicBrand[] {
  return (raw || [])
    .map((x) => ({
      id: String(x?.id ?? x?.brandId ?? ""),
      name: String(x?.name ?? x?.brandName ?? x?.title ?? ""),
      logoUrl: x?.logoUrl ?? x?.logoURL ?? x?.logo ?? null,
      type: x?.type,
    }))
    .filter((b) => b.id && b.name);
}


export async function fetchPublicBrandsPage(params?: {
  page?: number;
  size?: number;
  type?: BrandType | "ALL";
}): Promise<BrandPage> {
  const { page = 0, size = 12, type } = params || {};

  const { data } = await api.get("/public/brands/pageable", {
    params: {
      page,
      size,
      ...(type && type !== "ALL" ? { type } : {}),
    },
  });

  const itemsArr =
    (Array.isArray(data?.items) && data.items) ||
    (Array.isArray(data?.result?.items) && data.result.items) ||
    [];

  return {
    items: normalizeBrands(itemsArr),
    page: Number(data?.page ?? page) || 0,
    size: Number(data?.size ?? size) || size,
    totalPages: Number(data?.totalPages ?? data?.totalPage ?? 0) || 0,
    totalItems: Number(data?.totalItems ?? data?.total ?? 0) || 0,
    hasPreviousPage: Boolean(
      data?.hasPreviousPage ?? data?.hasPrev ?? data?.previous ?? false
    ),
    hasNextPage: Boolean(
      data?.hasNextPage ?? data?.hasMore ?? data?.next ?? false
    ),
  };
}

export async function fetchPublicBrands(
  opts?: { size?: number; type?: BrandType | "ALL" }
): Promise<PublicBrand[]> {
  const size = opts?.size ?? 100;
  const page = await fetchPublicBrandsPage({
    page: 0,
    size,
    type: opts?.type,
  });
  return page.items;
}

export type AdminBrand = {
  id: string;
  name: string;
  logoUrl?: string | null;
  type: BrandType;
};

export type UpdateBrandPayload = {
  name?: string;
  logoUrl?: string | null;
  type?: BrandType;
};

export async function updateAdminBrand(
  brandId: string,
  payload: UpdateBrandPayload
): Promise<AdminBrand> {
  const { data } = await api.put<AdminBrand>(
    `/admin/brands/update/${brandId}`,
    payload
  );
  return data;
}

export type DeleteBrandResp = {
  success?: boolean;
  message?: string;
};

export async function deleteAdminBrand(
  brandId: string,
  type: BrandType
): Promise<DeleteBrandResp> {
  const { data } = await api.delete<DeleteBrandResp>(
    `/admin/brands/delete/${brandId}`,
    { params: { type } }
  );
  return data;
}
