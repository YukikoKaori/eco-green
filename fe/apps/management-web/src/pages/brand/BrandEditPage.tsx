import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  fetchPublicBrands,
  updateAdminBrand,
  type PublicBrand,
  type BrandType,
} from "@/api/addBrand";

const BRAND = "#246f67";

export default function BrandEditPage() {
  const { id = "" } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { state } = useLocation() as { state?: { brand?: PublicBrand } };

  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState<PublicBrand | null>(state?.brand ?? null);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [type, setType] = useState<BrandType>("VEHICLE");
  const [err, setErr] = useState<string | null>(null);

  // Load brand nếu không có từ state
  useEffect(() => {
    (async () => {
      try {
        if (!init) {
          const list = await fetchPublicBrands();
          const found = list.find((b) => b.id === id) || null;
          if (!found) {
            toast.error("Không tìm thấy hãng");
            nav("/posts/brands");
            return;
          }
          setInit(found);
        }
      } catch (e: any) {
        toast.error("Không tải được thông tin hãng", {
          description: e?.response?.data?.message || e?.message,
        });
        nav("/posts/brands");
      }
    })();
  }, [id]);

  // Đổ giá trị vào form khi có init
  useEffect(() => {
    if (!init) return;
    setName(init.name || "");
    setLogoUrl(init.logoUrl || "");
    const t = (init.type || "VEHICLE").toUpperCase() as BrandType;
    setType(t === "BATTERY" ? "BATTERY" : "VEHICLE");
  }, [init]);

  const changed = useMemo(() => {
    if (!init) return false;
    return (
      name.trim() !== (init.name || "") ||
      (logoUrl || "") !== (init.logoUrl || "") ||
      (type || "VEHICLE") !== ((init.type || "VEHICLE").toUpperCase() as BrandType)
    );
  }, [init, name, logoUrl, type]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Vui lòng nhập tên hãng");
    setErr(null);

    try {
      setLoading(true);
      await updateAdminBrand(id, {
        name: name.trim(),
        logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
        type,
      });
      toast.success("Cập nhật hãng thành công", { description: name.trim() });
      setInit({ id, name: name.trim(), logoUrl: logoUrl.trim(), type } as PublicBrand);
    } catch (e: any) {
      toast.error("Cập nhật thất bại", {
        description: e?.response?.data?.message || e?.message,
      });
    } finally {
      setLoading(false);
    }
  }

  if (!id) return null;

  return (
    <div className="p-4 md:p-6" style={{ ["--brand" as any]: BRAND }}>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
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
            Sửa thông tin hãng
          </h1>
          <p className="text-sm text-gray-600">
            Cập nhật Tên, Logo URL và Loại hãng.
          </p>
        </header>

        <Card className="p-4 md:p-6 border-[rgba(36,111,103,0.15)] shadow-sm rounded-2xl">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-medium text-[color:var(--brand)]">
                Tên hãng
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Toyota, VinFast, BYD…"
                className="h-10 focus-visible:ring-[color:var(--brand)]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logoUrl" className="font-medium text-[color:var(--brand)]">
                Logo URL
              </Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Dán URL ảnh logo (Cloudinary, S3...)"
                className="h-10 focus-visible:ring-[color:var(--brand)]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type" className="font-medium text-[color:var(--brand)]">
                Loại
              </Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="h-10 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
              >
                <option value="VEHICLE">VEHICLE</option>
                <option value="BATTERY">BATTERY</option>
              </select>
            </div>

            {err && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {err}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={loading || !changed}
                className="h-10 px-4 font-semibold text-white !bg-[color:var(--brand)] !hover:brightness-95 !disabled:opacity-70"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
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
