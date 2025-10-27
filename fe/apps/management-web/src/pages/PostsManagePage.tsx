import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, PackageCheck, Eye, Filter, Check, SlidersHorizontal } from "lucide-react";
import {
  fetchPendingPaged,
  fetchListedPaged,
  type PendingRow,
  type ListedRow,
} from "@/api/moderation";

/* =================== Config =================== */
const BRAND = "#0f766e";

type StatusKey =
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "PENDING_PAYMENT"
  | "DRAFT"
  | "REJECTED"
  | "ALL";

const FILTERS: Array<{ key: StatusKey; label: string }> = [
  { key: "PENDING_REVIEW", label: "Chờ phê duyệt" },
  { key: "ACTIVE", label: "Đang hiển thị" },
  { key: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { key: "DRAFT", label: "Nháp" },
  { key: "REJECTED", label: "Bị từ chối" },
  { key: "ALL", label: "Tất cả" },
];

type TypeKey = "ALL" | "VEHICLE" | "BATTERY";

const TYPE_FILTERS: Array<{ key: TypeKey; label: string }> = [
  { key: "ALL", label: "Tất cả loại" },
  { key: "VEHICLE", label: "Xe (VEHICLE)" },
  { key: "BATTERY", label: "Pin (BATTERY)" },
];

const priceVN = (v: number | string | null | undefined) => {
  if (v == null || v === "") return "—";
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") + " ₫" : String(v);
};

const badgeTone: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  PENDING_PAYMENT: "bg-slate-100 text-slate-700 border-slate-200",
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

/* =================== Page =================== */
export default function StaffPostsManagePage() {
  const [sp, setSp] = useSearchParams();
  const statusFromUrl = (sp.get("status") || "PENDING_REVIEW").toUpperCase() as StatusKey;
  const pageFromUrl = Number(sp.get("page") || 0);
  const typeFromUrl = (sp.get("type") || "ALL").toUpperCase() as TypeKey;

  const [status, setStatus] = useState<StatusKey>(statusFromUrl);
  const [typeKey, setTypeKey] = useState<TypeKey>(typeFromUrl);
  const [page0, setPage0] = useState<number>(pageFromUrl);
  const [size] = useState<number>(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<Array<PendingRow | ListedRow>>([]);
  const [counts, setCounts] = useState<Record<StatusKey, number>>({
    PENDING_REVIEW: 0,
    ACTIVE: 0,
    PENDING_PAYMENT: 0,
    DRAFT: 0,
    REJECTED: 0,
    ALL: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState<boolean>(true);

  // phân trang
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // sync URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (status && status !== "PENDING_REVIEW") p.set("status", status);
    if (page0 > 0) p.set("page", String(page0));
    if (typeKey && typeKey !== "ALL") p.set("type", typeKey);
    setSp(p, { replace: true });
  }, [status, page0, typeKey]);

  // fetch list (bảng)
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    const typeParam = typeKey === "ALL" ? undefined : (typeKey as any);

    (async () => {
      try {
        if (status === "PENDING_REVIEW") {
          const res = await fetchPendingPaged({
            page: page0,
            size,
            sort: "createdAt,desc",
            type: typeParam, 
          } as any);
          if (!alive) return;
          setRows(res.content || []);
          setTotalElements(res.totalElements || 0);
          setTotalPages(res.totalPages || 1);
        } else {
          const res = await fetchListedPaged({
            status: status === "ALL" ? (undefined as any) : (status as any),
            page: page0,
            size,
            type: typeParam, 
          } as any);
          if (!alive) return;
          setRows(res.items || []);
          setTotalElements(res.totalElements || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Không thể tải dữ liệu");
        setRows([]);
        setTotalElements(0);
        setTotalPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [status, page0, size, typeKey]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCounts(true);

        const typeParam = typeKey === "ALL" ? undefined : (typeKey as any);

        // gọi size=1 để lấy totalElements nhanh
        const [pendingRes, activeRes, payRes, draftRes, rejectRes, allRes] = await Promise.all([
          fetchPendingPaged({ page: 0, size: 1, type: typeParam } as any),
          fetchListedPaged({ status: "ACTIVE" as any, page: 0, size: 1, type: typeParam } as any),
          fetchListedPaged({ status: "PENDING_PAYMENT" as any, page: 0, size: 1, type: typeParam } as any),
          fetchListedPaged({ status: "DRAFT" as any, page: 0, size: 1, type: typeParam } as any),
          fetchListedPaged({ status: "REJECTED" as any, page: 0, size: 1, type: typeParam } as any),
          fetchListedPaged({ status: undefined as any, page: 0, size: 1, type: typeParam } as any), // ALL
        ]);

        if (!alive) return;
        setCounts({
          PENDING_REVIEW: pendingRes.totalElements || 0,
          ACTIVE: activeRes.totalElements || 0,
          PENDING_PAYMENT: payRes.totalElements || 0,
          DRAFT: draftRes.totalElements || 0,
          REJECTED: rejectRes.totalElements || 0,
          ALL: allRes.totalElements || 0,
        });
      } catch {
        if (!alive) return;
        setCounts((c) => ({ ...c, }));
      } finally {
        if (alive) setLoadingCounts(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [typeKey]);

  const pages = useMemo(
    () => Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1),
    [totalPages]
  );
  const currentFilter = FILTERS.find((f) => f.key === status)!;
  const currentType = TYPE_FILTERS.find((t) => t.key === typeKey)!;

  return (
    <div className="p-4 md:p-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3 justify-between">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <PackageCheck className="w-6 h-6 text-emerald-600" />
                <span className="truncate">Quản lý bài đăng</span>
              </CardTitle>
              <div className="text-[12px] text-slate-500 mt-1">
                Đang xem: <b>{currentFilter.label}</b> • <b>{currentType.label}</b> — Tổng{" "}
                {loadingCounts ? "…" : (counts[status] ?? 0).toLocaleString("vi-VN")} tin
              </div>
            </div>

            {/* FILTERS on the right */}
            <div className="flex items-center gap-2">
              {/* Type filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 gap-2 border-slate-200 hover:border-slate-300 hover:bg-white shadow-sm"
                    title="Bộ lọc loại"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline text-slate-700">Loại</span>
                    <Badge variant="secondary" className="rounded-full">
                      {currentType.key === "ALL" ? "ALL" : currentType.key}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1">
                  {TYPE_FILTERS.map((t) => {
                    const active = typeKey === t.key;
                    return (
                      <DropdownMenuItem
                        key={t.key}
                        onClick={() => {
                          setTypeKey(t.key);
                          setPage0(0);
                        }}
                        className={[
                          "flex items-center gap-2 rounded-md",
                          active ? "bg-emerald-50" : "",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "h-5 w-5 rounded-md border grid place-items-center",
                            active ? "border-emerald-300 bg-white" : "border-slate-200 bg-white",
                          ].join(" ")}
                        >
                          {active ? <Check className="w-4 h-4" style={{ color: BRAND }} /> : null}
                        </div>
                        <span className={active ? "text-emerald-700 font-medium" : ""}>
                          {t.label}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 gap-2 border-slate-200 hover:border-slate-300 hover:bg-white shadow-sm"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline text-slate-700">Trạng thái</span>
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700"
                    >
                      {loadingCounts ? "…" : counts[status] ?? 0}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-1">
                  {FILTERS.map((f) => {
                    const active = status === f.key;
                    const n = counts[f.key] ?? 0;
                    return (
                      <DropdownMenuItem
                        key={f.key}
                        onClick={() => {
                          setStatus(f.key);
                          setPage0(0);
                        }}
                        className={[
                          "flex items-center justify-between gap-2 rounded-md",
                          active ? "bg-emerald-50" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={[
                              "h-5 w-5 rounded-md border grid place-items-center",
                              active ? "border-emerald-300 bg-white" : "border-slate-200 bg-white",
                            ].join(" ")}
                          >
                            {active ? <Check className="w-4 h-4" style={{ color: BRAND }} /> : null}
                          </div>
                          <span className={active ? "text-emerald-700 font-medium" : ""}>
                            {f.label}
                          </span>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {loadingCounts ? "…" : n}
                        </Badge>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* content: mọi trạng thái đều dùng bảng */}
          {loading ? (
            <div className="flex items-center justify-center h-60 text-emerald-600">
              <Loader2 className="animate-spin w-5 h-5 mr-2" /> Đang tải dữ liệu…
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : rows.length ? (
            <ListTable rows={rows} showStatusBadge={status !== "PENDING_REVIEW"} />
          ) : (
            <Empty />
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-5">
              <Button
                variant="outline"
                size="sm"
                className="min-w-20"
                disabled={page0 === 0}
                onClick={() => setPage0((p) => Math.max(0, p - 1))}
              >
                Trước
              </Button>
              {pages.map((p) => (
                <Button
                  key={p}
                  variant={p - 1 === page0 ? "default" : "outline"}
                  size="sm"
                  className={["min-w-10", p - 1 === page0 ? "bg-emerald-600 text-white" : ""].join(" ")}
                  onClick={() => setPage0(p - 1)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="min-w-20"
                disabled={page0 + 1 >= totalPages}
                onClick={() => setPage0((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* =================== Views =================== */
function Empty() {
  return <div className="h-48 grid place-items-center text-slate-500">Không có dữ liệu phù hợp.</div>;
}

function ListTable({
  rows,
  showStatusBadge,
}: {
  rows: Array<PendingRow | ListedRow>;
  showStatusBadge?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-emerald-50 text-emerald-700 uppercase text-xs font-semibold">
          <tr>
            <th className="px-4 py-3 text-left">Ảnh</th>
            <th className="px-4 py-3 text-left">Tiêu đề</th>
            <th className="px-4 py-3 text-left">Loại</th>
            <th className="px-4 py-3 text-left">Gói</th>
            <th className="px-4 py-3 text-right">Giá</th>
            {showStatusBadge && <th className="px-4 py-3 text-left">Trạng thái</th>}
            <th className="px-4 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p: any) => {
            const tone = badgeTone[p.status] || "bg-slate-100 text-slate-700 border-slate-200";
            return (
              <tr key={p.id} className="border-t hover:bg-emerald-50 transition">
                <td className="px-4 py-3">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.title} className="w-16 h-16 object-cover rounded-md border" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md border">
                      No Image
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{p.title}</td>
                <td className="px-4 py-3 text-gray-700">{p.productType}</td>
                <td className="px-4 py-3 text-gray-700">{p.packageName || "-"}</td>
                <td className="px-4 py-3 text-right text-gray-800 font-semibold">{priceVN(p.amount ?? p.price)}</td>
                {showStatusBadge && (
                  <td className="px-4 py-3">
                    <Badge className={["border", tone].join(" ")}>{p.status}</Badge>
                  </td>
                )}
                <td className="px-4 py-3 text-center">
                  <Button asChild variant="outline" size="sm" className="text-gray-700 border-gray-300">
                    <Link
                      to={
                        p.status === "PENDING_REVIEW"
                          ? `/posts/review/${p.id}`
                          : `/posts/review/${p.id}` 
                      }
                      state={{ item: p }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem chi tiết
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
