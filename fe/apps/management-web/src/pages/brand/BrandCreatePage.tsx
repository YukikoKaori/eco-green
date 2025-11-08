import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import {
  createVehicleCatalog,
  listVehicleCategories,
  type VehicleCategory,
} from "@/api/addBrand";

const BRAND = "#246f67";

export default function BrandCreatePage() {
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [versionName, setVersionName] = useState("");

  const [vehicleCategoryId, setVehicleCategoryId] = useState("");
  const [categories, setCategories] = useState<VehicleCategory[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await listVehicleCategories();
        const uniq = Array.from(new Map((data || []).map((c) => [c.id, c])).values())
          .filter((c) => c?.id && c?.name);
        setCategories(uniq);
        if (uniq.length && !vehicleCategoryId) setVehicleCategoryId(String(uniq[0].id));
      } catch {}
    })();
  }, []);

  // ❌ Không hiện toast ở đây nữa — chỉ setErr & reset input
  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (!f) return;

    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
      setErr("Chỉ nhận PNG/JPG/WebP");
      e.target.value = "";
      return;
    }
    if (f.size > 1_000_000) {
      setErr("Kích thước tối đa 1MB");
      e.target.value = "";
      return;
    }

    setErr(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brandName.trim()) return setErr("Vui lòng nhập tên hãng");
    if (!modelName.trim()) return setErr("Vui lòng nhập mẫu xe");
    if (!versionName.trim()) return setErr("Vui lòng nhập phiên bản");
    if (!vehicleCategoryId.trim()) return setErr("Vui lòng chọn loại xe");

    try {
      setLoading(true);
      await createVehicleCatalog({
        brandName: brandName.trim(),
        modelName: modelName.trim(),
        versionName: versionName.trim(),
        vehicleCategoryId,
        logo: file || undefined,
      });

      // ✅ Chỉ toast khi thành công
      toast.success("Đã tạo thành công", {
        description: `${brandName} • ${modelName} • ${versionName}`,
      });

      setBrandName("");
      setModelName("");
      setVersionName("");
      setFile(null);
      setPreview(null);
      setErr(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (ex: any) {
      const msg = ex?.response?.data?.message || ex?.message || "Tạo catalog thất bại";
      setErr(msg);
      // ✅ Và toast khi submit lỗi
      toast.error("Không thể tạo", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6" style={{ ["--brand" as any]: BRAND }}>
      <div className="max-w-2xl mx-auto">
        {/* Top back button */}
        <div className="mb-3">
          <Button
            asChild
            variant="outline"
            className="h-9 border-[rgba(36,111,103,0.35)] text-[color:var(--brand)] hover:bg-[rgba(36,111,103,0.08)]"
          >
            <Link to="/posts/brands">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Link>
          </Button>
        </div>

        <header className="mb-4">
          <h1 className="!text-3xl font-bold leading-tight text-[color:var(--brand)]">
            Tạo hãng, mẫu & phiên bản
          </h1>
          <p className="text-sm text-gray-600">Vui lòng điền đầy đủ thông tin bên dưới</p>
        </header>

        <Card className="p-4 md:p-6 border-[rgba(36,111,103,0.15)] shadow-sm rounded-2xl">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Hãng */}
            <div className="grid gap-2">
              <Label htmlFor="brandName" className="font-medium text-[color:var(--brand)]">
                Hãng
              </Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Ví dụ: Toyota, VinFast, BYD…"
                className="h-10 focus-visible:ring-[color:var(--brand)]"
              />
            </div>

            {/* Mẫu xe */}
            <div className="grid gap-2">
              <Label htmlFor="modelName" className="font-medium text-[color:var(--brand)]">
                Mẫu xe
              </Label>
              <Input
                id="modelName"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Ví dụ: bZ4X, e34…"
                className="h-10 focus-visible:ring-[color:var(--brand)]"
              />
            </div>

            {/* Phiên bản */}
            <div className="grid gap-2">
              <Label htmlFor="versionName" className="font-medium text-[color:var(--brand)]">
                Phiên bản
              </Label>
              <Input
                id="versionName"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="Ví dụ: FWD, RWD, Pro…"
                className="h-10 focus-visible:ring-[color:var(--brand)]"
              />
            </div>

            {/* Loại xe */}
            <div className="grid gap-2">
              <Label htmlFor="vehicleCategoryId" className="font-medium text-[color:var(--brand)]">
                Loại xe
              </Label>

              {categories.length ? (
                <select
                  id="vehicleCategoryId"
                  className="h-10 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
                  value={vehicleCategoryId}
                  onChange={(e) => setVehicleCategoryId(e.target.value)}
                >
                  {!vehicleCategoryId && (
                    <option key="__placeholder" value="">
                      -- Chọn loại xe --
                    </option>
                  )}
                  {categories.map((c, i) => (
                    <option key={`cat-${c.id || i}`} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="vehicleCategoryId"
                  value={vehicleCategoryId}
                  onChange={(e) => setVehicleCategoryId(e.target.value)}
                  placeholder="Nhập ID loại xe (fallback)"
                  className="h-10 focus-visible:ring-[color:var(--brand)]"
                />
              )}
            </div>

            {/* Logo – custom file picker */}
            <div className="grid gap-2">
              <Label className="font-medium text-[color:var(--brand)]">
                Logo (PNG/JPG/WebP ≤ 1MB)
              </Label>

              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full border bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {preview ? (
                    <img src={preview} alt="preview" className="h-full w-full object-contain" />
                  ) : (
                    <Upload className="h-5 w-5 opacity-60" />
                  )}
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <input
                    ref={inputRef}
                    id="logoFile"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onPick}
                    className="sr-only"
                  />
                  <label
                    htmlFor="logoFile"
                    className="inline-flex items-center justify-center h-10 px-4 rounded-md border cursor-pointer text-[color:var(--brand)] border-[rgba(36,111,103,0.35)] bg-[rgba(36,111,103,0.06)] hover:bg-[rgba(36,111,103,0.12)] text-sm font-medium select-none whitespace-nowrap"
                  >
                    Chọn tệp
                  </label>

                  {file && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                      className="h-10 border-[rgba(36,111,103,0.35)]"
                    >
                      Xoá
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {err && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {err}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={loading}
                className="h-10 px-4 font-semibold text-white !bg-[color:var(--brand)] !hover:brightness-95 !disabled:opacity-70"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => history.back()}
                className="h-10 text-[color:var(--brand)] hover:bg-[rgba(36,111,103,0.08)]"
              >
                Hủy
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
