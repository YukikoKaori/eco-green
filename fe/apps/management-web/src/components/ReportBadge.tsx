import { useEffect, useState } from "react";
import { fetchReportCountForProduct } from "@/api/reports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReportDetailDialog from "@/components/ReportDetailDialog";

export default function ReportBadge({ productId }: { productId: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    fetchReportCountForProduct(productId, ac.signal)
      .then((n) => setCount(n))
      .catch(() => setCount(0));
    return () => ac.abort();
  }, [productId]);

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Khiếu nại:</span>
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">{count ?? "…"}</Badge>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Chi tiết
        </Button>
      </div>

      <ReportDetailDialog productId={productId} open={open} onOpenChange={setOpen} />
    </>
  );
}
