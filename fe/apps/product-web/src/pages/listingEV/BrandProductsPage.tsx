import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchProductsByBrand, type ProductByBrand } from "@/api/brands";

const BRAND = "#246f67";

export default function BrandProductsPage() {
  const { brandId = "" } = useParams<{ brandId: string }>();
  const [items, setItems] = useState<ProductByBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchProductsByBrand(brandId);
        if (mounted) setItems(res.items || []);
      } catch (e: any) {
        if (mounted) setErr(e?.response?.data?.message || e?.message || "Không tải được sản phẩm theo hãng");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [brandId]);

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold" style={{ color: BRAND }}>
          Sản phẩm theo hãng
        </h1>
        <Button asChild variant="outline" className="h-9">
          <Link to="/">Trang chủ</Link>
        </Button>
      </div>

      {err && <div className="rounded-xl border bg-white p-4 text-red-600">{err}</div>}

      {loading ? (
        <Card className="p-4">Đang tải…</Card>
      ) : items.length === 0 ? (
        <Card className="p-6 text-center text-gray-600">Chưa có sản phẩm nào cho hãng này.</Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((p) => {
            const img = p.productImagesList?.find(i => i.isPrimary)?.imageUrl
              || p.productImagesList?.[0]?.imageUrl
              || p.productImagesList?.[0]?.url
              || "/images/listing-placeholder.png";
            return (
              <Card key={p.id} className="p-3">
                <div className="aspect-[4/3] rounded-lg overflow-hidden border bg-white grid place-items-center">
                  <img src={img} alt={p.title || ""} className="h-full w-full object-contain" />
                </div>
                <div className="mt-2 font-medium line-clamp-2">{p.title}</div>
                {p.price != null && (
                  <div className="text-sm text-emerald-700 mt-1">
                    {new Intl.NumberFormat("vi-VN").format(Number(p.price))}đ
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
