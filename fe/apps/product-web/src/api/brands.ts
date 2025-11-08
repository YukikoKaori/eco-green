import api from "@/lib/axios";

export type PublicBrand = {
  id: string;
  name: string;
  logoUrl: string | null;
  type: "VEHICLE" | "BATTERY" | string;
};

export async function fetchPublicBrands(): Promise<PublicBrand[]> {
  const res = await api.get("/public/brands");
  return Array.isArray(res.data) ? res.data : (res.data?.result ?? []);
}
