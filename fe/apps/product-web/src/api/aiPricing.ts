// src/api/aiPricing.ts
import api from "@/lib/axios";

type SuggestPayload = {
  title?: string;
  brand?: string;
  modelName?: string;
  versionName?: string;
  batteryHealth?: string | number;
  mileageKm?: string | number;
  manufactureYear?: string | number;
};

export async function suggestPrice(
  payload: SuggestPayload,
  opts?: { signal?: AbortSignal; timeout?: number }
) {
  const timeout = opts?.timeout ?? 60000;              // ⬅️ tăng lên 60s
  const controller = new AbortController();
  // nếu caller truyền signal thì nối chuỗi abort
  const link = opts?.signal;
  if (link) link.addEventListener("abort", () => controller.abort(), { once: true });

  const { data } = await api.post(
    "/gemini/suggest-price",
    payload,
    { timeout, signal: controller.signal }
  );
  return data; // { price: "Khoảng 285.000.000 VND", reason: "..." }
}
