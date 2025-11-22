import { useEffect, useMemo, useState } from "react";
import StatsCard from "@/components/StatsCard";
import { DollarSign, Users, Car, Battery } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  getApprovalRate,
  getMemberCount,
  getRevenueSeriesByYear,
} from "@/api/stats";

const BRAND = "#246f67";
const CHART_HEIGHT = 380; 

const fmtVnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";
const formatTickShort = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

function msToNextMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setDate(now.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export default function Dashboard() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [yearRevenue, setYearRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [monthly, setMonthly] = useState<Array<{ m: string; v: number }>>([]);

  const [memberCount, setMemberCount] = useState(0);
  const [approveRate, setApproveRate] = useState<number | null>(null);
  const [approveStats, setApproveStats] =
    useState<{ approved: number; rejected: number; total: number } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setYear(new Date().getFullYear()), msToNextMidnight());
    return () => clearTimeout(t);
  }, [year]);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const mm = now.getMonth() + 1;
      const series = await getRevenueSeriesByYear(year);
      setMonthly(series);

      setYearRevenue(series.reduce((s, x) => s + x.v, 0));
      setMonthRevenue(series.find(x => Number(x.m) === mm)?.v ?? 0);

      try {
        const rate = await getApprovalRate();
        setApproveRate(rate.rate * 100);
        setApproveStats({ approved: rate.approved, rejected: rate.rejected, total: rate.total });
      } catch {}

      try { setMemberCount(await getMemberCount("MEMBER")); } catch { setMemberCount(0); }
    })();
  }, [year]);

  const stats = useMemo(() => ([
    { title: `Doanh thu năm ${year}`, value: yearRevenue, icon: DollarSign, format: fmtVnd },
    {
      title: `Doanh thu tháng này (${String(new Date().getMonth() + 1).padStart(2, "0")}/${year})`,
      value: monthRevenue, icon: Car, format: fmtVnd
    },
    { title: "Thành viên (MEMBER)", value: memberCount, icon: Users },
    {
      title: "Tỉ lệ duyệt",
      value: approveRate == null ? "--" : Number(approveRate),
      delta: approveStats ? `A:${approveStats.approved} / R:${approveStats.rejected}` : "",
      icon: Battery,
      format: (n: number) => n.toFixed(2) + "%"
    },
  ]), [year, yearRevenue, monthRevenue, memberCount, approveRate, approveStats]);

  const monthlyTotal = monthly.reduce((s, x) => s + x.v, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatsCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="col-span-full border rounded-2xl bg-white p-4">
          <div className="text-[15px] font-semibold mb-3" style={{ color: BRAND }}>
            Doanh thu theo tháng ({year})
          </div>

          <div className="w-full">
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={monthly}>
                <CartesianGrid stroke="#e5f3f0" strokeDasharray="3 3" />
                <XAxis dataKey="m" tick={{ fill: "#5b6b67" }} />
                <YAxis tickFormatter={formatTickShort} tick={{ fill: "#5b6b67" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: "#d4ece7" }}
                  formatter={(v: any) => fmtVnd(Number(v))}
                  labelFormatter={(label) => `Tháng ${label}`}
                />
                <Bar dataKey="v" radius={[6, 6, 0, 0]} fill={BRAND} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {monthlyTotal === 0 && (
            <div className="text-xs text-gray-500 mt-2">
              Không có dữ liệu theo tháng cho năm {year}.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
