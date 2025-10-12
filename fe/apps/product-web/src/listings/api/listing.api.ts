import api from "@/lib/axios";
import type { RawListing, ListingWithKey } from "@/listings/types";
import { mapRawToListing, onlyActive, sortByNewest } from "@/listings/utils";

/** Lấy danh sách mới nhất (có hỗ trợ AbortSignal) */
export async function fetchLatestListings(opts?: { signal?: AbortSignal }): Promise<ListingWithKey[]> {
  try {
    const { data } = await api.get<RawListing[]>("/product/filter/new", { signal: opts?.signal });
    const raw = Array.isArray(data) ? data : [];
    // onlyActive & sortByNewest đều đã an toàn khi thiếu field
    return sortByNewest(onlyActive(raw)).map(mapRawToListing);
  } catch (e: any) {
    // Nếu bị hủy request thì trả mảng rỗng (không coi là lỗi UI)
    if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return [];
    // Log + ném tiếp để UI quyết định hiển thị lỗi
    console.error("fetchLatestListings failed:", e?.response?.data || e);
    throw e;
  }
}

/** Dành cho tab “Gợi ý cho bạn” – tạm thời trả rỗng, nhưng giữ cùng interface (opts) */
export async function fetchForYouListings(_opts?: { signal?: AbortSignal }): Promise<ListingWithKey[]> {
  return [];
}
