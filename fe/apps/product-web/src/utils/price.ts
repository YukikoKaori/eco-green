export function parsePrice(v: unknown): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;

  const cleaned = s
    .replace(/đ|vnd|vnđ/gi, "")
    .replace(/[.,\s_]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function currencyVND(v?: number | string | null): string {
  const n = parsePrice(v);
  if (n == null) return "--";
  return n.toLocaleString("vi-VN") + " đ";
}
