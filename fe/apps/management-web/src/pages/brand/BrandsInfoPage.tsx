import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCcw, Copy, ImageOff, Plus, Pencil, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchPublicBrands,
  deleteAdminBrand,
  type PublicBrand,
  type BrandType,
} from "@/api/addBrand";
import { toast } from "sonner";

const BRAND = "#246f67";

export default function BrandsInfoPage() {
  const [loading, setLoading] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [brands, setBrands] = useState<PublicBrand[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | "VEHICLE" | "BATTERY">("");

  async function load() {
    try {
      setLoading(true);
      const data = await fetchPublicBrands();
      setBrands(data);
    } catch (e: any) {
      toast.error("Không tải được danh sách hãng", {
        description: e?.response?.data?.message || e?.message || "Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

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

  // Xoá có xác nhận
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
      await load();
    } catch (e: any) {
      toast.error("Xoá thất bại", {
        description: e?.response?.data?.message || e?.message,
      });
    } finally {
      setRowBusyId(null);
    }
  }

  return (
    <div className="p-4 md:p-6" style={{ ["--brand" as any]: BRAND }}>
      <div className="max-w-6xl mx-auto">
        {/* Header + actions */}
        <div className="mb-4 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="!text-3xl font-bold text-[color:var(--brand)]">
              Thông tin các hãng
            </h1>
            <p className="text-sm text-gray-600">
              Tìm kiếm, lọc, thêm mới, chỉnh sửa và xoá brand trong hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild className="h-10 bg-[color:var(--brand)] text-white hover:brightness-95">
              <Link to="/posts/brands/new">
                <Plus className="h-4 w-4 mr-2" />
                Thêm hãng xe
              </Link>
            </Button>
            <Button disabled variant="secondary" className="h-10" title="Sắp có">
              <Plus className="h-4 w-4 mr-2" />
              Thêm hãng pin
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-4 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Tìm theo tên hoặc ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 w-60 focus-visible:ring-[color:var(--brand)]"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="h-9 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
            >
              <option value="">Tất cả loại</option>
              <option value="VEHICLE">VEHICLE</option>
              <option value="BATTERY">BATTERY</option>
            </select>
            <Button
              onClick={load}
              disabled={loading}
              variant="secondary"
              className="h-9"
              title="Tải lại"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <div className="ml-auto text-xs text-gray-600">
              Tổng: <span className="font-semibold text-gray-900">{filtered.length}</span> hãng
              {type ? <> • Loại: <span className="font-semibold">{type}</span></> : null}
              {q ? <> • Từ khóa: <span className="font-semibold">{q}</span></> : null}
            </div>
          </div>
        </Card>

        <Separator className="mb-3" />

        {/* List (table) */}
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[rgba(36,111,103,0.06)] text-[color:var(--brand)]">
              <tr className="[&>th]:text-left [&>th]:px-3 [&>th]:py-2">
                <th className="w-[72px]">Logo</th>
                <th>Tên hãng</th>
                <th className="w-36">Loại</th>
                <th className="min-w-[240px]">ID</th>
                <th className="w-44 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-600">
                    Không có dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const busy = rowBusyId === b.id;
                  return (
                    <tr key={b.id} className="border-t">
                      <td className="px-3 py-2">
                        <div className="h-10 w-10 rounded-full border bg-white flex items-center justify-center overflow-hidden">
                          {b.logoUrl ? (
                            <img src={b.logoUrl} alt={b.name} className="h-full w-full object-contain" />
                          ) : (
                            <ImageOff className="h-4 w-4 opacity-60" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{b.name}</div>
                      </td>
                      <td className="px-3 py-2">
                        {b.type ? (
                          <Badge
                            variant="secondary"
                            className="border border-[rgba(36,111,103,0.25)] bg-[rgba(36,111,103,0.06)] text-[color:var(--brand)]"
                          >
                            {b.type}
                          </Badge>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{b.id}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-7 px-2 text-[color:var(--brand)] hover:bg-[rgba(36,111,103,0.08)]"
                            onClick={() => onCopyId(b.id)}
                            title="Sao chép ID"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          {/* Sửa -> dẫn tới trang edit và truyền state để prefill */}
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 border-[rgba(36,111,103,0.35)] text-[color:var(--brand)]"
                            title="Sửa"
                          >
                            <Link to={`/posts/brands/${b.id}/edit`} state={{ brand: b }}>
                              <Pencil className="h-4 w-4 mr-1" />
                              Sửa
                            </Link>
                          </Button>

                          {/* Xoá */}
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={busy}
                            className="h-8 text-red-600"
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
        </Card>
      </div>
    </div>
  );
}
