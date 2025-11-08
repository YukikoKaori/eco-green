import api from "@/lib/axios";

/* ================== Create vehicle catalog ================== */
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

/* ================== Vehicle categories (select) ================== */
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

/* ================== Public brands (list view) ================== */
export type PublicBrand = {
  id: string;
  name: string;
  logoUrl?: string | null;
  type?: "VEHICLE" | "BATTERY" | (string & {});
};

export async function fetchPublicBrands(): Promise<PublicBrand[]> {
  const { data } = await api.get("/public/brands");
  const items: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.result?.items)
    ? data.result.items
    : Array.isArray(data?.items)
    ? data.items
    : [];
  return items
    .map((x) => ({
      id: String(x?.id ?? x?.brandId ?? ""),
      name: String(x?.name ?? x?.brandName ?? x?.title ?? ""),
      logoUrl: x?.logoUrl ?? x?.logoURL ?? x?.logo ?? null,
      type: x?.type,
    }))
    .filter((b) => b.id && b.name);
}

/* ================== Admin: update & delete brand ================== */
export type BrandType = "VEHICLE" | "BATTERY";

export type AdminBrand = {
  id: string;
  name: string;
  logoUrl?: string | null;
  type: BrandType;
};

/** PUT /admin/brands/update/{id}  (body JSON) */
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

/** DELETE /admin/brands/delete/{id}?type=VEHICLE|BATTERY */
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
