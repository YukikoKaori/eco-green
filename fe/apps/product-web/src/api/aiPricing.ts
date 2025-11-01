import api from "@/lib/axios";

export type SuggestPayload = {
  title?: string;
  brandName?: string;
  modelName?: string;
  versionName?: string;
  batteryHealth?: string | number;
  mileageKm?: string | number;
  manufactureYear?: string | number;
};

export type SuggestPriceResponse = {
  price: string;        
  reason: string;
  sources: string[];
  description: string;
  title: string;
  priceRange?: { min: number; max: number; currency: "VND" };
};

function toNumberIfNumeric(v: unknown): unknown {
  if (typeof v === "string") {
    const s = v.trim();
    if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  }
  return v;
}

function cleanPayload(p: SuggestPayload) {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (!s) continue;
    obj[k] = toNumberIfNumeric(v);
  }
  return obj;
}

function parsePriceFlexible(s?: string) {
  if (!s) return undefined;
  const text = s.normalize("NFC");
  const rawNums = Array.from(text.matchAll(/(\d{1,3}(?:[.,]\d{3})+|\d+)/g)).map(m => m[1]);
  if (rawNums.length === 0) return undefined;

  const hasTrieu = /\b(tr|triệu)\b/i.test(text);
  const hasTy    = /\b(tỷ|ty)\b/i.test(text);

  const toVnd = (numStr: string) => {
    let n = Number(numStr.replace(/[.,]/g, ""));
    if (!Number.isFinite(n)) return NaN;
    if (hasTy) n *= 1_000_000_000;
    else if (hasTrieu) n *= 1_000_000;
    return n;
  };

  const nums = rawNums.map(toVnd).filter(Number.isFinite) as number[];
  if (nums.length === 0) return undefined;

  const min = Math.min(...nums);
  const max = nums.length >= 2 ? Math.max(...nums) : min;
  if (min <= 0) return undefined;

  return { min, max, currency: "VND" as const };
}

export async function suggestPrice(
  payload: SuggestPayload,
  opts?: { signal?: AbortSignal; timeout?: number }
): Promise<SuggestPriceResponse> {
  const timeout = opts?.timeout ?? 60_000;
  const controller = new AbortController();
  if (opts?.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const body = cleanPayload(payload);

  const { data } = await api.post<SuggestPriceResponse>(
    "/gemini/suggest-price",
    body,
    { timeout, signal: controller.signal }
  );

  const priceRange = data?.priceRange ?? parsePriceFlexible(data?.price);
  return {
    ...data,
    sources: Array.isArray(data?.sources) ? data.sources : [],
    priceRange,
  };
}
