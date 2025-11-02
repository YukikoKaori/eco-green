import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Download, Search } from "lucide-react";
import * as XLSX from "xlsx";

type CommissionItem = {
  paymentId?: string;
  createdAt?: string;      
  amount?: number;         
  paymentMethod?: string;  
  packageName?: string;    
  durationDays?: number | null;
  productId?: string;
  productName?: string;
};

const fmtVnd = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";

export default function Commissions() {
  const [rows, setRows] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filters
  const [q, setQ] = useState("");
  const [method, setMethod] = useState<string>("ALL");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const r = await api.get<CommissionItem[]>("/transactions/show");
      setRows(Array.isArray(r.data) ? r.data : []);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Tải dữ liệu thất bại");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    const f = from ? new Date(from + "T00:00:00") : null;
    const t = to ? new Date(to + "T23:59:59") : null;

    return rows.filter((r) => {
      if (method !== "ALL" && (r.paymentMethod || "").toUpperCase() !== method) return false;

      const textHit = !key || [r.paymentId, r.packageName, r.productName, r.paymentMethod]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(key));
      if (!textHit) return false;

      if (!f && !t) return true;
      const d = r.createdAt ? new Date(r.createdAt) : null;
      if (!d) return false;
      if (f && d < f) return false;
      if (t && d > t) return false;
      return true;
    });
  }, [rows, q, method, from, to]);

  const totalAmount = filtered.reduce((s, x) => s + (Number(x.amount) || 0), 0);

  const methods = useMemo(() => {
    const set = new Set<string>();
    rows.forEach(r => r.paymentMethod && set.add((r.paymentMethod || "").toUpperCase()));
    return ["ALL", ...Array.from(set)];
  }, [rows]);

  function exportExcel() {
    const data = filtered.map((x, i) => ({
      STT: i + 1,
      "Mã thanh toán": x.paymentId || "",
      "Thời gian": x.createdAt ? x.createdAt.replace("T"," ").slice(0,19) : "",
      "Số tiền": Number(x.amount || 0),
      "Phương thức": x.paymentMethod || "",
      "Gói": x.packageName || "",
      "Số ngày": x.durationDays ?? "",
      "ID Sản phẩm": x.productId || "",
      "Tên sản phẩm": x.productName || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const amountCol = Object.keys(data[0] || {}).indexOf("Số tiền");
    if (amountCol >= 0) {
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let r = 1; r <= range.e.r; r++) {
        const c = XLSX.utils.encode_cell({ r, c: amountCol });
        if (ws[c]) ws[c].t = "n";
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HoaHong");
    XLSX.writeFile(wb, `hoa-hong-dang-tin.xlsx`);
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-white/70 border border-emerald-100">
              <DollarSign className="h-5 w-5 text-[#246f67]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1f4f4b]">Hoa hồng đăng tin</h2>
              <p className="text-sm text-[#246f67]">Theo dõi thanh toán & doanh thu dịch vụ</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[#246f67]">
            Tổng: {fmtVnd(totalAmount)}
          </Badge>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="p-3 border rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mã thanh toán / gói / sản phẩm…" className="pl-8" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500">Phương thức</label>
            <select className="h-9 w-full rounded border px-2" value={method} onChange={(e) => setMethod(e.target.value)}>
              {methods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Từ ngày</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Đến ngày</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" onClick={load}>Làm mới</Button>
          <Button className="!bg-[#246f67] hover:bg-emerald-700" onClick={exportExcel}>
            <Download className="h-4 w-4 mr-1" /> Xuất Excel
          </Button>
        </div>
      </Card>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        {err && <div className="p-3 text-sm text-red-600 bg-red-50 border-b">{err}</div>}
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="text-[#246f67]">
                <Th>#</Th>
                <Th>Mã thanh toán</Th>
                <Th className="min-w-[160px]">Thời gian</Th>
                <Th className="text-right pr-3">Số tiền</Th>
                <Th>Phương thức</Th>
                <Th>Gói</Th>
                <Th className="text-center">Ngày</Th>
                <Th>ID SP</Th>
                <Th>Tên sản phẩm</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr><Td colSpan={9}>
                  <div className="flex items-center gap-2 text-slate-500 py-6">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
                  </div>
                </Td></tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr><Td colSpan={9} className="py-8 text-center text-slate-500">Không có dữ liệu.</Td></tr>
              )}

              {!loading && filtered.map((r, i) => (
                <tr key={r.paymentId || i} className="hover:bg-emerald-50/40">
                  <Td className="tabular-nums">{i + 1}</Td>
                  <Td className="font-medium">{r.paymentId}</Td>
                  <Td className="tabular-nums">{r.createdAt ? r.createdAt.slice(0,19).replace("T"," ") : "-"}</Td>
                  <Td className="text-right tabular-nums pr-3">{fmtVnd(Number(r.amount || 0))}</Td>
                  <Td>{r.paymentMethod || "-"}</Td>
                  <Td>{r.packageName || "-"}</Td>
                  <Td className="text-center">{r.durationDays ?? "-"}</Td>
                  <Td className="tabular-nums">{r.productId || "-"}</Td>
                  <Td className="truncate">{r.productName || "-"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer tổng */}
        <div className="flex items-center justify-end p-3 border-t bg-slate-50 text-sm">
          <span className="text-[#246f67] font-medium">Tổng tiền:</span>
          <span className="ml-2 font-semibold">{fmtVnd(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: any) {
  return <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "", colSpan }: any) {
  return <td colSpan={colSpan} className={`px-3 py-2 align-middle ${className}`}>{children}</td>;
}
