import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listRecentViews, type RecentItem } from "@/api/recent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function fmtPrice(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("vi-VN") + " đ";
}

export default function RecentViewsPage() {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(params.get("page") ?? 0));
  const [size] = useState(20);
  const [data, setData] = useState<RecentItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await listRecentViews({ page: p, size });
      setData(res.content ?? []);
      setTotalPages(res.totalPages ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    setParams(prev => {
      prev.set("page", String(page));
      return prev;
    }, { replace: true });
  }, [page, setParams]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold text-[#246f67] mb-4">Lịch sử xem tin</h1>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 flex gap-3">
              <Skeleton className="w-28 h-20 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent></Card>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border p-6 text-center text-slate-600">
          Bạn chưa xem tin nào. Hãy khám phá sản phẩm nhé!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((it) => {
            const href = `/product/${encodeURIComponent(it.id)}`;
            return (
              <Card key={it.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <Link to={href} className="flex gap-3 p-3 no-underline hover:bg-slate-50">
                    <div className="w-28 h-20 flex-shrink-0 bg-slate-100 rounded overflow-hidden grid place-items-center">
                      <img
                        src={it.imageUrl || "/images/no-image.png"}
                        alt={it.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/no-image.png"; }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 line-clamp-2">{it.title}</div>
                      <div className="text-sm text-slate-600">
                        {it.brandName || ""} {it.modelName || ""} {it.version || ""}
                      </div>
                      <div className="text-[#246f67] font-semibold mt-1">{fmtPrice(it.price)}</div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
            Trước
          </Button>
          <span className="text-sm">Trang {page + 1} / {totalPages}</span>
          <Button variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
