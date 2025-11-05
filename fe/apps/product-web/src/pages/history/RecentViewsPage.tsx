import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listRecentViews, type RecentItem } from "@/api/recent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyVND } from "@/utils/price";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="container mx-auto max-w-6xl px-12 py-8">
      <h1 className="!text-2xl font-bold tracking-tight text-[#246f67] mb-5">
        Lịch sử xem tin
      </h1>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border-slate-200/80 shadow-sm shadow-emerald-50/40">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-48 max-w-[12rem] rounded-2xl aspect-[4/3]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 p-8 text-center text-slate-600 bg-white/70 backdrop-blur">
          Bạn chưa xem tin nào. Hãy khám phá sản phẩm nhé!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((it) => {
            const href = `/product/${encodeURIComponent(it.id)}`;
            return (
              <Link
                key={it.id}
                to={href}
                className="block rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-emerald-50/40 ring-1 ring-emerald-100/40 hover:shadow-md transition"
              >
                <div className="flex gap-4 p-4">
                  {/* Ảnh trái: bo tròn lớn, tỉ lệ 4:3 */}
                  <div className="w-30 max-w-[8rem]">
                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                      <img
                        src={it.imageUrl || "/images/no-image.png"}
                        alt={it.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
                        }}
                      />
                    </div>
                  </div>

                  {/* Nội dung phải */}
                  <div className="flex-1 min-w-0">
                    {/* Tiêu đề */}
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                      {it.title}
                    </h3>

                    {/* Giá đỏ to */}
                    <div className="mt-1 text-sm font-extrabold text-[#d4205b]">
                      {currencyVND(it.price)}
                    </div>

                    {/* Dòng meta 1: model/brand */}
                    <div className="mt-2 text-sm text-slate-600">
                      {(it.brandName || "")} {(it.modelName || "")} {(it.version || "")}
                    </div>

                    {/* Dòng meta 2: trạng thái / thời gian / địa điểm (tuỳ có dữ liệu) */}
                    <div className="mt-1 text-sm text-slate-500 flex flex-wrap items-center gap-x-2">
                      {/* Ví dụ: nối dữ liệu bằng dấu chấm • nếu có */}
                      {/* it.status && <><span className="font-medium text-emerald-700">{it.status}</span><span className="mx-1 text-slate-300">•</span></> */}
                      {/* it.createdAt && <span>{it.createdAt}</span> */}
                      {/* city/district/ward nếu có: */}
                      {/* <span className="mx-1 text-slate-300">•</span><span>{city}</span> ... */}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-7 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            className="border-slate-300 hover:border-emerald-300"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Trước
          </Button>
          <span className="text-sm text-slate-600">
            Trang <b>{page + 1}</b> / {totalPages}
          </span>
          <Button
            variant="outline"
            className="border-slate-300 hover:border-emerald-300"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
