import { useEffect, useMemo, useState } from "react";
import {
  fetchReportCountsPaged,
  fetchReportsShowPaged,
  type ReportCountRow,
  type ReportShowRow,
} from "@/api/reports";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, List, PieChart } from "lucide-react";
import ReportDetailDialog from "@/components/ReportDetailDialog";
const CLIENT_SITE_URL =
  import.meta.env.VITE_PUBLIC_SITE_URL || "https://eco-green.store";

function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
      <div className="h-full bg-rose-500/80" style={{ width: `${v}%` }} />
    </div>
  );
}

export default function ReportStatsPage() {
  // ── States dùng cho tab “Thống kê”
  const [items, setItems] = useState<ReportCountRow[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // ── States dùng chung
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"stats" | "table">("stats");
  const [detailId, setDetailId] = useState<string | null>(null);

  const [pendingReports, setPendingReports] = useState<ReportShowRow[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const [tableItems, setTableItems] = useState<ReportShowRow[]>([]);
  const [tablePage, setTablePage] = useState(0);
  const [tablePages, setTablePages] = useState(1);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    if (mode !== "stats") return;
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetchReportCountsPaged(page, size, ac.signal);
        setItems(res.content ?? []);
        setTotalPages(res.totalPages ?? 1);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [mode, page, size]);

  useEffect(() => {
    if (mode !== "stats") return;
    const ac = new AbortController();
    (async () => {
      try {
        setLoadingPending(true);
        const res = await fetchReportsShowPaged(
          0,
          8,
          { status: "PENDING" },
          ac.signal
        );
        setPendingReports(
          (res.content ?? []).filter((r) => r.status === "PENDING")
        );
      } finally {
        setLoadingPending(false);
      }
    })();
    return () => ac.abort();
  }, [mode]);

  useEffect(() => {
    if (mode !== "table") return;
    const ac = new AbortController();
    (async () => {
      try {
        setTableLoading(true);
        const res = await fetchReportsShowPaged(
          tablePage,
          12,
          { keyword: q.trim() || undefined },
          ac.signal
        );
        setTableItems(res.content ?? []);
        setTablePages(res.totalPages ?? 1);
      } finally {
        setTableLoading(false);
      }
    })();
    return () => ac.abort();
  }, [mode, tablePage, q]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter(
      (i) =>
        i.productId.toLowerCase().includes(s) ||
        (i.productName ?? "").toLowerCase().includes(s)
    );
  }, [items, q]);

  const stats = useMemo(() => {
    const totalProducts = filtered.length;
    const totalReports = filtered.reduce(
      (sum, x) => sum + (x.reportCount ?? 0),
      0
    );
    const maxReports = filtered.reduce(
      (m, x) => Math.max(m, x.reportCount ?? 0),
      0
    );
    const top = [...filtered]
      .sort((a, b) => (b.reportCount ?? 0) - (a.reportCount ?? 0))
      .slice(0, 8);
    return { totalProducts, totalReports, maxReports, top };
  }, [filtered]);

  // 👉 Mở trang product trên site client trong tab mới
  const goToProductDetail = (id: string) => {
    const base = CLIENT_SITE_URL.replace(/\/+$/, "");
    const url = `${base}/product/${id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="!text-2xl font-semibold text-[#0f766e]">
            Các khiếu nại
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex gap-2">
            <Button
              size="sm"
              variant={mode === "stats" ? "default" : "outline"}
              onClick={() => setMode("stats")}
              className={mode === "stats" ? "!bg-[#0f766e]" : ""}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Thống kê
            </Button>
            <Button
              size="sm"
              variant={mode === "table" ? "default" : "outline"}
              onClick={() => setMode("table")}
              className={mode === "table" ? "!bg-[#0f766e]" : ""}
            >
              <List className="h-4 w-4 mr-1" />
              Bảng
            </Button>
          </div>
        </div>
      </div>

      {mode === "stats" && (
        <>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="!text-xl font-semibold text-[#0f766e]">
                  Tổng số tin có khiếu nại
                </div>
                <div className="text-2xl font-bold mt-1">
                  {stats.totalProducts}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="!text-xl font-semibold text-[#0f766e]">
                  Tổng số khiếu nại
                </div>
                <div className="text-2xl font-bold mt-1 text-rose-600">
                  {stats.totalReports}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Top tin có nhiều khiếu nại */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-slate-600" />
                  <div className="font-semibold">
                    Top tin có nhiều khiếu nại
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Dựa trên {filtered.length} tin
                </div>
              </div>

              {loading ? (
                <div className="text-slate-500 text-sm">Đang tải…</div>
              ) : stats.top.length === 0 ? (
                <div className="text-slate-500 text-sm">Không có dữ liệu.</div>
              ) : (
                <div className="space-y-3">
                  {stats.top.map((r) => {
                    const pct = stats.maxReports
                      ? Math.round((r.reportCount / stats.maxReports) * 100)
                      : 0;
                    return (
                      <div
                        key={r.productId}
                        className="border rounded-md p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {r.productName || "(Không có tiêu đề)"}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate">
                              {r.productId}
                            </div>
                          </div>
                          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                            {r.reportCount}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <Progress value={pct} />
                          <div className="mt-1 text-[11px] text-slate-500">
                            {pct}% so với mức cao nhất
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ============== TAB: BẢNG (dùng /reports/show) ============== */}
      {mode === "table" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="text-left px-4 py-3 w-[40%]">Product</th>
                    <th className="text-left px-4 py-3">Người báo cáo</th>
                    <th className="text-left px-4 py-3">Lý do</th>
                    <th className="text-left px-4 py-3">Trạng thái</th>
                    <th className="text-left px-4 py-3">Tạo lúc</th>
                    <th className="text-right px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr>
                      <td className="px-4 py-4 text-slate-500" colSpan={6}>
                        Đang tải…
                      </td>
                    </tr>
                  ) : tableItems.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-slate-500" colSpan={6}>
                        Không có dữ liệu.
                      </td>
                    </tr>
                  ) : (
                    tableItems.map((r) => (
                      <tr key={r.id} className="border-t align-top">
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {r.productName || "(Không có tiêu đề)"}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {r.productId}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{r.phone || "-"}</div>
                          <div className="text-[11px] text-slate-500">
                            {r.email || ""}
                          </div>
                        </td>
                        <td className="px-4 py-3">{r.reportReason}</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              r.status === "PENDING"
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[12px] text-slate-600">
                            {r.createdAt
                              ? new Date(r.createdAt).toLocaleString("vi-VN")
                              : "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => goToProductDetail(r.productId)}
                          >
                            Xem chi tiết tin
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination cho bảng */}
            {tablePages > 1 && (
              <div className="flex items-center justify-center gap-2 p-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={tablePage <= 0}
                  onClick={() => setTablePage((p) => p - 1)}
                >
                  Trước
                </Button>
                <div className="text-sm">
                  Trang {tablePage + 1} / {tablePages}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={tablePage + 1 >= tablePages}
                  onClick={() => setTablePage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ReportDetailDialog
        productId={detailId}
        open={!!detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
      />
    </div>
  );
}
