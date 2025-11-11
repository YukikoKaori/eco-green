import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, FileText, ExternalLink, Search, CreditCard, Package as PackageIcon,
} from "lucide-react";
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from "@/components/ui/tabs";
import {
  fetchContractsHistory, fetchPackageHistory,
  type ContractItem, type PackageHistoryItem, type PageResp
} from "@/api/transactions";

/* ---------------- helpers ---------------- */
const fmtVnd = (n?: number | null) =>
  (n == null ? "--" : new Intl.NumberFormat("vi-VN").format(Math.round(n))) + (n == null ? "" : "đ");

const fmtDate = (v?: string) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(+d)) return v;
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
};

const methodLabel = (m?: string) => {
  const k = (m || "").toUpperCase();
  if (k.includes("MOMO")) return "MoMo";
  if (k.includes("VNP")) return "VNPAY";
  return m || "Khác";
};

const maskId = (id?: string) => {
  if (!id) return "-";
  if (id.length <= 4) return "••••";
  return "•••• " + id.slice(-4);
};

/* ---------------- small table cells ---------------- */
function Th({ children, className = "" }: any) {
  return <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "", colSpan }: any) {
  return <td colSpan={colSpan} className={`px-3 py-2 align-middle ${className}`}>{children}</td>;
}

/* ---------------- component ---------------- */
export default function OrdersPage() {
  /* tabs */
  const [tab, setTab] = useState<"contracts" | "packages">("contracts");

  /* common state */
  const [loading, setLoading] = useState({ c: true, p: true });
  const [err, setErr] = useState<{ c?: string; p?: string }>({});

  /* --------- CONTRACTS --------- */
  const [q, setQ] = useState("");
  const [pageC, setPageC] = useState(0); 
  const [sizeC] = useState(10);
  const [contracts, setContracts] = useState<PageResp<ContractItem>>({ items: [] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading((s) => ({ ...s, c: true }));
        const data = await fetchContractsHistory({ page: pageC, size: sizeC, q });
        if (!cancelled) setContracts(data);
      } catch (e: any) {
        if (!cancelled) setErr((er) => ({ ...er, c: e?.response?.data?.message || "Tải hợp đồng thất bại" }));
      } finally {
        if (!cancelled) setLoading((s) => ({ ...s, c: false }));
      }
    })();
    return () => { cancelled = true; };
  }, [pageC, sizeC, q]);

  const filteredContracts = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return contracts.items;
    return contracts.items.filter((r) => r.title?.toLowerCase().includes(key));
  }, [contracts.items, q]);

  /* --------- PACKAGES --------- */
  const [pageP, setPageP] = useState(0);
  const [sizeP] = useState(10);
  const [qP, setQP] = useState("");
  const [packages, setPackages] = useState<PageResp<PackageHistoryItem>>({ items: [] });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading((s) => ({ ...s, p: true }));
        const data = await fetchPackageHistory({ page: pageP, size: sizeP });
        if (!cancelled) setPackages(data);
      } catch (e: any) {
        if (!cancelled) setErr((er) => ({ ...er, p: e?.response?.data?.message || "Tải giao dịch thất bại" }));
      } finally {
        if (!cancelled) setLoading((s) => ({ ...s, p: false }));
      }
    })();
    return () => { cancelled = true; };
  }, [pageP, sizeP]);

  const totalPagesC = Math.max(1, contracts.totalPages ?? 1);
  const totalPagesP = Math.max(1, packages.totalPages ?? 1);

  const filteredPackages = useMemo(() => {
    const key = qP.trim().toLowerCase();
    if (!key) return packages.items;
    return packages.items.filter((r) =>
      (r.packageName || "").toLowerCase().includes(key) ||
      (r.paymentId || "").toLowerCase().includes(key) ||
      (r.paymentMethod || "").toLowerCase().includes(key)
    );
  }, [packages.items, qP]);
  const makePages = (page: number, total: number, windowSize = 5) => {
    const n = Math.min(windowSize, total);
    const start = Math.max(0, Math.min(page - Math.floor(n / 2), total - n));
    return Array.from({ length: n }, (_, i) => start + i);
  };

  return (
    <div className="mx-auto max-w-6xl px-3 md:px-4 py-4 md:py-6 space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-white/70 border border-emerald-100">
              <PackageIcon className="h-5 w-5 text-[#246f67]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1f4f4b]">Lịch sử giao dịch</h2>
            </div>
          </div>
          <Badge variant="secondary" className="text-[#246f67]">
            Hợp đồng: {contracts.totalItems ?? contracts.items.length} • Giao dịch: {packages.totalItems ?? packages.items.length}
          </Badge>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        {/* prettier, pill tabs */}
        <TabsList className="grid grid-cols-2 w-full md:w-auto gap-6 bg-transparent p-0">
          <TabsTrigger
            value="contracts"
            className="relative rounded-xl px-6 py-2 text-slate-700 bg-slate-100/80 shadow-sm data-[state=active]:bg-slate-100 data-[state=active]:text-[#1f4f4b] data-[state=active]:font-semibold data-[state=active]:shadow md:min-w-[220px]
                        after:content-[''] after:absolute after:left-2 after:right-2 after:bottom-0 after:h-[2px] after:bg-transparent
                        data-[state=active]:after:bg-[#246f67]"
          >
            Hợp đồng
          </TabsTrigger>
          <TabsTrigger
            value="packages"
            className="relative rounded-xl px-6 py-2 text-slate-700 bg-slate-100/80 shadow-sm data-[state=active]:bg-slate-100 data-[state=active]:text-[#1f4f4b] data-[state=active]:font-semibold data-[state=active]:shadow md:min-w-[220px]
                        after:content-[''] after:absolute after:left-2 after:right-2 after:bottom-0 after:h-[2px] after:bg-transparent
                        data-[state=active]:after:bg-[#246f67]"
          >
            Gói dịch vụ
          </TabsTrigger>
        </TabsList>

        {/* ====== CONTRACTS ====== */}
        <TabsContent value="contracts" className="mt-3 space-y-3">
          <Card className="p-3 border rounded-xl">
            <label className="text-xs text-slate-500">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPageC(0); }}
                placeholder="Tìm theo tiêu đề hợp đồng…"
                className="pl-8"
              />
            </div>
          </Card>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border bg-white">
            {err.c && <div className="p-3 text-sm text-red-600 bg-red-50 border-b">{err.c}</div>}
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr className="text-[#246f67]">
                    <Th className="min-w-[240px]">Tiêu đề</Th>
                    <Th className="w-[160px]">Mã tài liệu</Th>
                    <Th className="w-[180px]">Thời gian ký</Th>
                    <Th className="w-[120px] text-center">Tác vụ</Th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading.c && (
                    <tr><Td colSpan={4}>
                      <div className="flex items-center gap-2 text-slate-500 py-6">
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
                      </div>
                    </Td></tr>
                  )}

                  {!loading.c && filteredContracts.length === 0 && (
                    <tr><Td colSpan={4} className="py-8 text-center text-slate-500">Chưa có hợp đồng.</Td></tr>
                  )}

                  {!loading.c && filteredContracts.map((r) => (
                    <tr key={r.documentId} className="hover:bg-emerald-50/40">
                      <Td className="truncate">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-700" />
                          <span className="font-medium text-slate-800">{r.title || "Hợp đồng"}</span>
                        </div>
                      </Td>
                      <Td className="font-mono">{maskId(r.documentId)}</Td>
                      <Td className="tabular-nums">{fmtDate(r.signedAt)}</Td>
                      <Td className="text-center">
                        <Button asChild variant="outline" className="h-8">
                          <a href={r.pdfUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" /> Xem PDF
                          </a>
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            <div className="flex items-center justify-end gap-2 p-3 border-t bg-slate-50 text-sm">
              <Button
                variant="outline"
                className="!text-[#246f67]"
                onClick={() => setPageC((p) => Math.max(0, p - 1))}
                disabled={pageC <= 0}
              >
                Trước
              </Button>

              {makePages(pageC, totalPagesC).map((pi) => (
                <Button
                  key={pi}
                  variant="outline"
                  onClick={() => setPageC(pi)}
                  aria-current={pageC === pi ? "page" : undefined}
                  className={[
                    "w-10 !text-[#246f67]",
                    pageC === pi && "text-white border-[#246f67]"
                  ].filter(Boolean).join(" ")}
                >
                  {pi + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                className="!text-[#246f67]"
                onClick={() => setPageC((p) => Math.min(totalPagesC - 1, p + 1))}
                disabled={pageC >= totalPagesC - 1}
              >
                Sau
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ====== PACKAGES ====== */}
        <TabsContent value="packages" className="mt-3 space-y-3">
          {/* Search for packages */}
          <Card className="p-3 border rounded-xl">
            <label className="text-xs text-slate-500">Tìm kiếm</label>
            <div className="relative">
              <svg className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/></svg>
              <Input
                value={qP}
                onChange={(e) => { setQP(e.target.value); setPageP(0); }}
                placeholder="Tìm theo tên gói, mã giao dịch, phương thức…"
                className="pl-8"
              />
            </div>
          </Card>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border bg-white">
            {err.p && <div className="p-3 text-sm text-red-600 bg-red-50 border-b">{err.p}</div>}
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr className="text-[#246f67]">
                    <Th className="min-w[220px]">Gói</Th>
                    <Th className="w-[160px]">Mã giao dịch</Th>
                    <Th className="w-[180px]">Thời gian</Th>
                    <Th className="w-[130px]">Phương thức</Th>
                    <Th className="w-[140px] text-right pr-3">Số tiền</Th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading.p && (
                    <tr><Td colSpan={5}>
                      <div className="flex items-center gap-2 text-slate-500 py-6">
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
                      </div>
                    </Td></tr>
                  )}

                  {!loading.p && filteredPackages.length === 0 && (
                    <tr><Td colSpan={5} className="py-8 text-center text-slate-500">Chưa có giao dịch.</Td></tr>
                  )}

                  {!loading.p && filteredPackages.map((r) => (
                    <tr key={r.paymentId} className="hover:bg-emerald-50/40">
                      <Td className="truncate">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            {methodLabel(r.paymentMethod)}
                          </Badge>
                          <span className="font-medium text-slate-800">{r.packageName}</span>
                        </div>
                      </Td>
                      <Td className="font-mono">{maskId(r.paymentId)}</Td>
                      <Td className="tabular-nums">{fmtDate(r.createdAt)}</Td>
                      <Td className="flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                        <span>{methodLabel(r.paymentMethod)}</span>
                      </Td>
                      <Td className="text-right tabular-nums pr-3">{fmtVnd(r.amount)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            <div className="flex items-center justify-end gap-2 p-3 border-t bg-slate-50 text-sm">
              <Button
                variant="outline"
                className="!text-[#246f67]"
                onClick={() => setPageP((p) => Math.max(0, p - 1))}
                disabled={pageP <= 0}
              >
                Trước
              </Button>

              {makePages(pageP, totalPagesP).map((pi) => (
                <Button
                  key={pi}
                  variant="outline"
                  onClick={() => setPageP(pi)}
                  aria-current={pageP === pi ? "page" : undefined}
                  className={[
                    "w-10 ",
                    pageP === pi && "!text-[#246f67] border-[#246f67]"
                  ].filter(Boolean).join(" ")}
                >
                  {pi + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                className="!text-[#246f67]"
                onClick={() => setPageP((p) => Math.min(totalPagesP - 1, p + 1))}
                disabled={pageP >= totalPagesP - 1}
              >
                Sau
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
