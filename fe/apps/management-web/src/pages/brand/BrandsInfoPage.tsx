import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCcw, Copy, ImageOff, Plus, Pencil, Trash, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchPublicBrandsPage,
  deleteAdminBrand,
  type PublicBrand,
  type BrandType,
} from "@/api/addBrand";
import { toast } from "sonner";

const BRAND = "#246f67";
const PAGE_SIZE = 12;

export default function BrandsInfoPage() {
  const [loading, setLoading] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [brands, setBrands] = useState<PublicBrand[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | "VEHICLE" | "BATTERY">("");

  async function load(pageIndex = page) {
    try {
      setLoading(true);
      const res = await fetchPublicBrandsPage({
        page: pageIndex,
        size: PAGE_SIZE,
        type: (type || "ALL") as any,
      });
      setBrands(res.items);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
      setHasPrev(res.hasPreviousPage);
      setHasNext(res.hasNextPage);
    } catch (e: any) {
      toast.error("Không tải được danh sách hãng", {
        description: e?.response?.data?.message || e?.message || "Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(0); }, []);
  useEffect(() => { load(0); }, [type]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return brands.filter((b) => {
      const okType = !type || (b.type || "").toUpperCase() === type;
      const okKw = !kw || b.name.toLowerCase().includes(kw) || b.id.toLowerCase().includes(kw);
      return okType && okKw;
    });
  }, [brands, q, type]);

  function onCopyId(id: string) {
    navigator.clipboard.writeText(id).then(() => {
      toast.success("Đã sao chép ID", { description: id });
    });
  }

  async function onDelete(b: PublicBrand) {
    const t = (b.type || "").toUpperCase() as BrandType;
    if (t !== "VEHICLE" && t !== "BATTERY") {
      toast.error("Không xác định được loại (type) của hãng để xoá.");
      return;
    }
    const ok = window.confirm(
      `Bạn có chắc chắn muốn xoá hãng "${b.name}"?\n` +
      "Lưu ý: Nếu hãng đang được sử dụng trong sản phẩm/chi tiết thì sẽ không thể xoá."
    );
    if (!ok) return;

    try {
      setRowBusyId(b.id);
      const res = await deleteAdminBrand(b.id, t);
      if (res?.success === false) {
        toast.error("Không thể xoá hãng", { description: res?.message || "Đang được sử dụng." });
        return;
      }
      toast.success("Đã xoá hãng", { description: b.name });
      const nextPage = filtered.length === 1 && page > 0 ? page - 1 : page;
      await load(nextPage);
    } catch (e: any) {
      toast.error("Xoá thất bại", {
        description: e?.response?.data?.message || e?.message,
      });
    } finally {
      setRowBusyId(null);
    }
  }

  function buildPageNumbers(): (number | "...")[] {
    const maxButtons = 7;
    if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i);
    const current = page, first = 0, last = totalPages - 1;
    const around = [current - 1, current, current + 1].filter((p) => p > first && p < last);
    const result: (number | "...")[] = [first];
    if (around[0] && around[0] > first + 1) result.push("...");
    result.push(...around);
    if (around[around.length - 1] && around[around.length - 1] < last - 1) result.push("...");
    result.push(last);
    return result;
  }
  const pageNumbers = buildPageNumbers();

  return (
    <div className="p-4 md:p-6" style={{ ["--brand" as any]: BRAND }}>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-white border border-emerald-200">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="!text-xl md:text-2xl font-semibold text-emerald-900 leading-tight">Danh sách các hãng</h1>
              <p className="text-[13px] md:text-sm text-emerald-700">
                Danh sách các hãng xe và pin đang có trong hệ thống
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild className="h-9 md:h-10 !bg-[color:var(--brand)] !text-white">
              <Link to="/posts/brands/new">
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm hãng xe
              </Link>
            </Button>
            <Button asChild className="h-9 md:h-10 !bg-[color:var(--brand)] !text-white">
               <Link to="/posts/battery-brands/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Thêm hãng pin
              </Link>
            </Button>
          </div>
        </div>

        <Card className="mb-4 p-3 pr-20">
          <div className="flex items-center gap-2 w-full">
            <Input
              placeholder="Tìm theo tên hoặc ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 flex-1 min-w-[280px] focus-visible:ring-[color:var(--brand)]"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="h-9 px-3 rounded-md border text-sm bg-white !focus:outline-none focus:ring-2 !focus:ring-[color:var(--brand)] shrink-0"
            >
              <option value="">Tất cả loại</option>
              <option value="VEHICLE">VEHICLE</option>
              <option value="BATTERY">BATTERY</option>
            </select>

            <Button
              onClick={() => load(page)}
              disabled={loading}
              variant="secondary"
              className="h-9 shrink-0 !bg-[color:var(--brand)] text-white"
              title="Tải lại"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </Card>


        <Separator />

        {/* ===== Bảng danh sách ===== */}
        <Card className="overflow-x-auto p-0 overflow-hidden">
          <table className="w-full text-sm ">
            <thead className="bg-[rgba(36,111,103,0.06)] text-[color:var(--brand)] ">
              <tr className="[&>th]:px-3 [&>th]:py-2">
                <th className="w-12 ">STT</th>
                <th className="w-[64px]">Logo</th>
                <th className="w-[50px]">Tên hãng</th>
                <th className="w-20 ">Loại</th>
                <th className="w-3 ">Mã hãng</th>
                <th className="w-[50px]">Thao tác</th>
              </tr>
            </thead>

            <tbody className="[&>tr>td]:px-3 [&>tr>td]:py-2">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-600">
                    Không có dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((b, idx) => {
                  const busy = rowBusyId === b.id;
                  const stt = page * PAGE_SIZE + idx + 1;
                  return (
                    <tr key={b.id} className="border-t">
                      {/* STT */}
                      <td className="text-center">{stt}</td>

                      {/* Logo */}
                      <td>
                        <div className="h-10 w-10 rounded-full border bg-white grid place-items-center overflow-hidden mx-auto">
                          {b.logoUrl ? (
                            <img src={b.logoUrl} alt={b.name} className="h-9 w-9 object-contain" />
                          ) : (
                            <ImageOff className="h-4 w-4 opacity-60" />
                          )}
                        </div>
                      </td>

                      {/* Tên hãng */}
                      <td className="w-[20px]">
                        <div className="font-medium truncate text-[color:var(--brand)]">{b.name}</div>
                      </td>

                      <td className="text-center">
                        {b.type ? (
                          <Badge
                            variant="secondary"
                            className="px-2 py-0.5 border border-[rgba(36,111,103,0.25)] bg-[rgba(36,111,103,0.06)] text-[color:var(--brand)]"
                          >
                            {b.type}
                          </Badge>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>

                      <td className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-[color:var(--brand)] hover:bg-[rgba(36,111,103,0.08)]"
                          onClick={() => onCopyId(b.id)}
                          title={`Copy ID: ${b.id}`}
                          aria-label={`Copy brand ID ${b.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </td>

                      <td>
                        <div className="flex justify-center !gap-6">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 px-5 border-[rgba(36,111,103,0.35)] text-[color:var(--brand)]"
                            title="Sửa"
                          >
                            <Link to={`/posts/brands/${b.id}/edit`} state={{ brand: b }}>
                              <Pencil className="h-4 w-4 mr-1" />
                              Sửa
                            </Link>
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={busy}
                            className="h-8 px-3 text-red-600"
                            onClick={() => onDelete(b)}
                            title="Xoá"
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            {busy ? "Đang xử lý…" : "Xoá"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <div className="text-xs text-gray-600">
             Trang {page + 1}/{totalPages}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[color:var(--brand)]"
                disabled={!hasPrev || loading}
                onClick={() => load(page - 1)}
              >
                Trước
              </Button>

              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-2 text-gray-500">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className={`h-8 ${p === page ? "!bg-[color:var(--brand)] text-white hover:brightness-95" : ""}`}
                    onClick={() => load(p as number)}
                    disabled={loading}
                  >
                    {(p as number) + 1}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[color:var(--brand)]"
                disabled={!hasNext || loading}
                onClick={() => load(page + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
