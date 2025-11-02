import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Download, ExternalLink, Search } from "lucide-react";
import * as XLSX from "xlsx";

type ContractItem = {
  title?: string;
  sellerName?: string;
  buyerName?: string;
  signedAt?: string;     
  contractUrl?: string; 
};

export default function Contracts() {
  const [rows, setRows] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filters
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const r = await api.get<ContractItem[] | ContractItem>("/staff/product/transaction/history");
      const data = Array.isArray(r.data) ? r.data : (r.data ? [r.data] : []);
      setRows(data);
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
      const textHit = !key || [r.title, r.sellerName, r.buyerName]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(key));
      if (!textHit) return false;
      if (!f && !t) return true;

      const d = r.signedAt ? new Date(r.signedAt) : null;
      if (!d) return false;
      if (f && d < f) return false;
      if (t && d > t) return false;
      return true;
    });
  }, [rows, q, from, to]);

  const totalContracts = filtered.length;

  function exportExcel() {
    const data = filtered.map((x, i) => ({
      STT: i + 1,
      "Tiêu đề": x.title || "",
      "Người bán": x.sellerName || "",
      "Người mua": x.buyerName || "",
      "Ký lúc": x.signedAt ? x.signedAt.replace("T", " ").slice(0, 19) : "",
      "Link hợp đồng": x.contractUrl || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HopDong");
    XLSX.writeFile(wb, `hop-dong-dien-tu.xlsx`);
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-white/70 border border-emerald-100">
              <FileText className="h-5 w-5 text-[#246f67]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1f4f4b]">Hợp đồng điện tử</h2>
              <p className="text-sm text-[#246f67]">Lịch sử ký kết & tải hợp đồng</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[#246f67]">
            Tổng: {totalContracts}
          </Badge>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="p-3 border rounded-xl">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tiêu đề / người bán / người mua…" className="pl-8" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500">Từ ngày</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Đến ngày</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load}>Làm mới</Button>
            <Button className="!bg-[#246f67] hover:bg-emerald-700" onClick={exportExcel}>
              <Download className="h-4 w-4 mr-1" /> Xuất Excel
            </Button>
          </div>
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
                <Th>Tiêu đề</Th>
                <Th>Người bán</Th>
                <Th>Người mua</Th>
                <Th className="min-w-[160px]">Ký lúc</Th>
                <Th className="w-[140px] text-right pr-3">Tệp</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr><Td colSpan={6}>
                  <div className="flex items-center gap-2 text-slate-500 py-6">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
                  </div>
                </Td></tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr><Td colSpan={6} className="py-8 text-center text-slate-500">Không có dữ liệu.</Td></tr>
              )}

              {!loading && filtered.map((r, i) => (
                <tr key={i} className="hover:bg-emerald-50/40">
                  <Td className="tabular-nums">{i + 1}</Td>
                  <Td className="font-medium">{r.title || "-"}</Td>
                  <Td>{r.sellerName || "-"}</Td>
                  <Td>{r.buyerName || "-"}</Td>
                  <Td className="tabular-nums">
                    {r.signedAt ? r.signedAt.slice(0,19).replace("T"," ") : "-"}
                  </Td>
                  <Td className="pr-3">
                    <div className="flex justify-end gap-2">
                      {r.contractUrl ? (
                        <>
                          <a className="text-[#246f67] hover:underline inline-flex items-center gap-1"
                             href={r.contractUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" /> Xem
                          </a>
                          <a className="text-[#246f67] hover:underline inline-flex items-center gap-1"
                             href={r.contractUrl} download>
                            <Download className="h-4 w-4" /> Tải
                          </a>
                        </>
                      ) : <span className="text-slate-400">N/A</span>}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
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
