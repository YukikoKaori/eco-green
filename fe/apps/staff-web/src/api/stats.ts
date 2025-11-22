import api from "@/lib/axios";

export type RevenueMonthItem = { year: number; month: number; totalAmount: string };
export type RevenuePoint = { m: string; v: number };

export const parseVnAmount = (v?: string | null) =>
  Number((v ?? "").replace(/[^\d]/g, "")) || 0;

async function getRevenueMonthlyByYear(year: number): Promise<RevenuePoint[]> {
  const { data } = await api.get<RevenueMonthItem[]>(`/revenue/year/${year}/monthly`);
  const arr = Array.isArray(data) ? data : [];

  const map = new Map<number, number>();
  for (const x of arr) map.set(Number(x.month), parseVnAmount(x.totalAmount));

  return Array.from({ length: 12 }, (_, i) => {
    const mm = i + 1;
    return { m: String(mm).padStart(2, "0"), v: map.get(mm) ?? 0 };
  });
}

async function getRevenueSeriesByYearFallback(year: number): Promise<RevenuePoint[]> {
  try {
    const r = await api.get<Array<{ month: number; totalAmount: string }>>(
      "/revenue/by-month", { params: { year } }
    );
    const arr = Array.isArray(r.data) ? r.data : [];
    const map = new Map(arr.map(x => [Number(x.month), parseVnAmount(x.totalAmount)]));
    return Array.from({ length: 12 }, (_, i) => {
      const mm = i + 1;
      return { m: String(mm).padStart(2, "0"), v: map.get(mm) ?? 0 };
    });
  } catch { }

  // 12 lần /revenue/month
  const months = await Promise.all(
    Array.from({ length: 12 }, (_, i) => i + 1).map(async (mm) => {
      try {
        const r = await api.get<{ totalAmount: string }>("/revenue/month", { params: { month: mm, year } });
        return { m: String(mm).padStart(2, "0"), v: parseVnAmount(r.data.totalAmount) };
      } catch { return { m: String(mm).padStart(2, "0"), v: 0 }; }
    })
  );
  return months;
}
export async function getRevenueSeriesByYear(year: number): Promise<RevenuePoint[]> {
  try {
    return await getRevenueMonthlyByYear(year);
  } catch {
    return await getRevenueSeriesByYearFallback(year);
  }
}

export type ApprovalRate = {
  approved: number;
  rejected: number;
  total: number;
  rate: number;    
  rateText: string; 
};
export async function getApprovalRate(): Promise<ApprovalRate> {
  const r = await api.get<ApprovalRate>("/staff/post/approval-rate");
  return r.data;
}

export async function getMemberCount(role: "MEMBER" | "STAFF" = "MEMBER"): Promise<number> {
  const r = await api.get<{ role: string; total: number }>("/staff/member/count", { params: { role } });
  return r.data.total ?? 0;
}
