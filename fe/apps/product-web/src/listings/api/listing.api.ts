import api from "@/lib/axios";
import type { RawListing, ListingWithKey } from "@/listings/types";
import { mapRawToListing, onlyActive, sortByNewest } from "@/listings/utils";

export async function fetchLatestListings(opts?: { signal?: AbortSignal }): Promise<ListingWithKey[]> {
  try {
    const { data } = await api.get<RawListing[]>("/product/filter/new", { signal: opts?.signal });
    const raw = Array.isArray(data) ? data : [];
    return sortByNewest(onlyActive(raw)).map(mapRawToListing);
  } catch (e: any) {
    if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return [];
    console.error("fetchLatestListings failed:", e?.response?.data || e);
    throw e;
  }
}
export async function fetchForYouListings(_opts?: { signal?: AbortSignal }): Promise<ListingWithKey[]> {
  return [];
}
