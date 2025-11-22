import { useEffect, useState } from "react";
import { fetchReportsByProduct, type ReportDetail } from "@/api/reports";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ReportDetailDialog({
  productId,
  open,
  onOpenChange,
}: {
  productId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [items, setItems] = useState<ReportDetail[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !productId) return;
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetchReportsByProduct(productId, page, size, ac.signal);
        setItems(res.content ?? []);
        setTotalPages(res.totalPages ?? 1);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [open, productId, page, size]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết khiếu nại {productId ? `#${productId}` : ""}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="text-left px-3 py-2">Thời gian</th>
                <th className="text-left px-3 py-2">Điện thoại</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Lý do</th>
                <th className="text-left px-3 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-3 py-4 text-slate-500">Đang tải…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-4 text-slate-500">Chưa có khiếu nại.</td></tr>
              ) : (
                items.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN") : "-"}</td>
                    <td className="px-3 py-2">{r.phone}</td>
                    <td className="px-3 py-2">{r.email || "-"}</td>
                    <td className="px-3 py-2">{r.reportReason}</td>
                    <td className="px-3 py-2">
                      <Badge className={r.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}>
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500">Trang {page + 1} / {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage(p => p - 1)}>
                Trước
              </Button>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
                Sau
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
