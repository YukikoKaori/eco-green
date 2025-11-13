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
import {
  Loader2,
  PackageCheck,
  Eye,
  Filter,
  Check,
  SlidersHorizontal,
} from "lucide-react";

import {
  fetchPendingPaged,
  fetchListedPaged,
  type ModerationRow,
  type ProductType,
  type ListStatus,
} from "@/api/moderation";

/* CONFIG */
const BRAND = "#0f766e";

const FILTERS: Array<{ key: ListStatus | "PENDING_REVIEW"; label: string }> = [
  { key: "PENDING_REVIEW", label: "Chờ phê duyệt" },
  { key: "ACTIVE", label: "Đang hiển thị" },
  { key: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { key: "DRAFT", label: "Nháp" },
  { key: "REJECTED", label: "Bị từ chối" },
  { key: "ALL", label: "Tất cả" },
];

const TYPE_FILTERS: Array<{ key: ProductType | "ALL"; label: string }> = [
  { key: "ALL", label: "Tất cả loại" },
  { key: "VEHICLE", label: "Xe (VEHICLE)" },
  { key: "BATTERY", label: "Pin (BATTERY)" },
];

const badgeTone: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  PENDING_PAYMENT: "bg-slate-100 text-slate-700 border-slate-200",
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

const priceVN = (v: number | string | null | undefined) => {
  if (v == null || v === "") return "—";
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") + " ₫" : String(v);
};

const formatDate = (v?: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return d.toLocaleString("vi-VN", { hour12: false, timeZone: "Asia/Ho_Chi_Minh" });
};

/* =================== PAGE =================== */
export default function StaffPostsManagePage() {
  const [sp, setSp] = useSearchParams();

  const statusFromUrl = (sp.get("status") || "PENDING_REVIEW").toUpperCase() as
    | ListStatus
    | "PENDING_REVIEW";

  const typeFromUrl = (sp.get("type") || "ALL").toUpperCase() as ProductType | "ALL";
  const pageFromUrl = Number(sp.get("page") || 0);

  const [status, setStatus] = useState<ListStatus | "PENDING_REVIEW">(statusFromUrl);
  const [typeKey, setTypeKey] = useState<ProductType | "ALL">(typeFromUrl);
  const [page0, setPage0] = useState<number>(pageFromUrl);

  const size = 10;

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ModerationRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  /* Sync URL */
  useEffect(() => {
    const p = new URLSearchParams();
    if (status !== "PENDING_REVIEW") p.set("status", status);
    if (typeKey !== "ALL") p.set("type", typeKey);
    if (page0 > 0) p.set("page", String(page0));
    setSp(p, { replace: true });
  }, [status, typeKey, page0]);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const typeParam = typeKey === "ALL" ? undefined : typeKey;

    (async () => {
      try {
        let data: ModerationRow[] = [];
        let totalFromAPI = 1;

        if (status === "PENDING_REVIEW") {
          const res = await fetchPendingPaged({
            page: 0, 
            size: 99999,
            type: typeParam,
          });
          data = res.content;
          totalFromAPI = res.totalElements;
        } else {
          const res = await fetchListedPaged({
            status: status === "ALL" ? undefined : status,
            page: 0,
            size: 99999,
            type: typeParam,
          });
          data = res.items;
          totalFromAPI = res.totalElements;
        }

        // ⭐ CLIENT FILTER
        if (typeKey !== "ALL") {
          data = data.filter((x) => x.productType === typeKey);
        }
        const totalFiltered = data.length;
        const totalPagesFiltered = Math.max(1, Math.ceil(totalFiltered / size));
        const pagedData = data.slice(page0 * size, page0 * size + size);

        if (!alive) return;

        setRows(pagedData);
        setTotalPages(totalPagesFiltered);

        if (page0 >= totalPagesFiltered) {
          setPage0(0);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [status, typeKey, page0]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingCounts(true);

      const [pA, aA, rA, payA, dA] = await Promise.all([
        fetchPendingPaged({ page: 0, size: 1 }),
        fetchListedPaged({ status: "ACTIVE", page: 0, size: 1 }),
        fetchListedPaged({ status: "REJECTED", page: 0, size: 1 }),
        fetchListedPaged({ status: "PENDING_PAYMENT", page: 0, size: 1 }),
        fetchListedPaged({ status: "DRAFT", page: 0, size: 1 }),
      ]);

      if (!alive) return;

      setCounts({
        PENDING_REVIEW: pA.totalElements,
        ACTIVE: aA.totalElements,
        REJECTED: rA.totalElements,
        PENDING_PAYMENT: payA.totalElements,
        DRAFT: dA.totalElements,
        ALL:
          pA.totalElements +
          aA.totalElements +
          rA.totalElements +
          payA.totalElements +
          dA.totalElements,
      });

      setLoadingCounts(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  const currentFilter = FILTERS.find((f) => f.key === status)!;
  const currentType = TYPE_FILTERS.find((t) => t.key === typeKey)!;

  return (
    <div className="p-4 md:p-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <PackageCheck className="w-6 h-6 text-emerald-600" />
                Quản lý bài đăng
              </CardTitle>
              <div className="text-[12px] text-slate-500 mt-1">
                Đang xem: <b>{currentFilter.label}</b> •{" "}
                <b>{currentType.label}</b> —{" "}
                {loadingCounts ? "…" : counts[status] ?? 0} tin
              </div>
            </div>

            {/* FILTERS */}
            <div className="flex items-center gap-2">
              {/* TYPE */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 gap-2 border-slate-200 shadow-sm">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline text-slate-700">Loại</span>
                    <Badge>{currentType.key}</Badge>
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
                        className={`flex items-center gap-2 rounded-md ${
                          active ? "bg-emerald-50" : ""
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-md border grid place-items-center ${
                            active ? "border-emerald-300" : "border-slate-200"
                          }`}
                        >
                          {active && <Check className="w-4 h-4" style={{ color: BRAND }} />}
                        </div>
                        <span className={active ? "text-emerald-700 font-medium" : ""}>
                          {t.label}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* STATUS */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 gap-2 border-slate-200 shadow-sm">
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline text-slate-700">Trạng thái</span>
                    <Badge className="bg-emerald-50 border text-emerald-700">
                      {loadingCounts ? "…" : counts[status] ?? 0}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60 p-1">
                  {FILTERS.map((f) => {
                    const active = status === f.key;
                    return (
                      <DropdownMenuItem
                        key={f.key}
                        onClick={() => {
                          setStatus(f.key);
                          setPage0(0);
                        }}
                        className={`flex items-center justify-between rounded-md ${
                          active ? "bg-emerald-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-5 w-5 rounded-md border grid place-items-center ${
                              active ? "border-emerald-300" : "border-slate-200"
                            }`}
                          >
                            {active && <Check className="w-4 h-4" style={{ color: BRAND }} />}
                          </div>
                          <span className={active ? "text-emerald-700 font-medium" : ""}>
                            {f.label}
                          </span>
                        </div>
                        <Badge variant="secondary">{counts[f.key] ?? 0}</Badge>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* ================= LIST ================= */}
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-60 text-emerald-600">
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Đang tải dữ liệu…
            </div>
          ) : rows.length ? (
            <ListTable
              rows={rows}
              page0={page0}
              size={size}
              showStatusBadge={status !== "PENDING_REVIEW"}
            />
          ) : (
            <Empty />
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-5">
              <Button
                variant="outline"
                className="text-emerald-800"
                size="sm"
                disabled={page0 === 0}
                onClick={() => setPage0((p) => p - 1)}
              >
                Trước
              </Button>

              {pages.map((p) => (
                <Button
                  key={p}
                  variant={p - 1 === page0 ? "default" : "outline"}
                  size="sm"
                  className={p - 1 === page0 ? "!bg-emerald-800 text-white" : ""}
                  onClick={() => setPage0(p - 1)}
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="outline"
                className="text-emerald-800"
                size="sm"
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

/* ================== EMPTY ================== */
function Empty() {
  return (
    <div className="h-48 grid place-items-center text-slate-500">
      Không có dữ liệu phù hợp.
    </div>
  );
}

/* ================== TABLE ================== */
function ListTable({
  rows,
  showStatusBadge,
  page0,
  size,
}: {
  rows: ModerationRow[];
  showStatusBadge?: boolean;
  page0: number;
  size: number;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full bg-white text-sm">
        <thead className="bg-emerald-50 text-emerald-700 uppercase text-xs font-semibold">
          <tr>
            <th className="px-4 py-3 text-center w-[40px]">#</th>
            <th className="px-4 py-3 text-left">Ảnh</th>
            <th className="px-4 py-3 text-left">Tiêu đề</th>
            <th className="px-4 py-3 text-left">Loại</th>
            <th className="px-4 py-3 text-left">Gói</th>
            <th className="px-4 py-3 text-left">Giá</th>
            <th className="px-4 py-3 text-left">Ngày đăng</th>
            {showStatusBadge && <th className="px-4 py-3 text-left">Trạng thái</th>}
            <th className="px-4 py-3 text-center">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((p, idx) => {
            const tone =
              badgeTone[p.status] || "bg-slate-100 text-slate-700 border-slate-200";

            const stt = page0 * size + idx + 1;

            return (
              <tr key={p.id} className="border-t hover:bg-emerald-50 transition">
                <td className="px-4 py-3 text-center text-gray-500">{stt}</td>

                <td className="px-4 py-3">
                  {p.thumbnail ? (
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md border">
                      No Image
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 font-medium text-gray-800">{p.title}</td>

                <td className="px-4 py-3 text-gray-700">{p.productType}</td>

                <td className="px-4 py-3 text-gray-700">{p.packageName || "-"}</td>

                <td className="px-4 py-3 text-gray-800 font-semibold">
                  {priceVN(p.price)}
                </td>

                <td className="px-4 py-3 text-gray-600">{formatDate(p.createdAt)}</td>

                {showStatusBadge && (
                  <td className="px-4 py-3">
                    <Badge className={`border ${tone}`}>{p.status}</Badge>
                  </td>
                )}

                <td className="px-4 py-3 text-center">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-gray-700 border-gray-300 hover:bg-emerald-50"
                  >
                    <Link to={`/posts/review/${p.id}`} state={{ item: p }}>
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
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
