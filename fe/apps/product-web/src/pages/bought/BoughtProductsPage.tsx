import { useEffect, useState } from "react";
import {
  fetchBoughtProducts,
  type ProductBoughtItem,
} from "@/api/boughtProducts";
import { ReviewDialog } from "@/components/feedback/ReviewDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackageIcon } from "lucide-react";
import { Link } from "react-router-dom";   // 👈 thêm import

export default function BoughtProductsPage() {
  const [products, setProducts] = useState<ProductBoughtItem[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProductBoughtItem | null>(null);

  async function loadData() {
    try {
      const data = await fetchBoughtProducts(0, 30);
      setProducts(data);
    } catch (e) {
      console.error("Failed to fetch bought products", e);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* ===== Header ===== */}
      <div
        className="
          rounded-2xl 
          bg-gradient-to-r from-emerald-50 to-teal-50 
          border border-emerald-100 
          shadow-[0_1px_4px_rgba(0,0,0,0.05)] 
          p-6 mb-6
        "
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full p-3 bg-white/80 border border-emerald-100 shadow-sm">
            <PackageIcon className="h-6 w-6 text-[#246f67]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1f4f4b] leading-tight">
              Sản phẩm đã mua
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Danh sách các sản phẩm mà bạn đã giao dịch thành công
            </p>
          </div>
        </div>
      </div>

      {/* ===== Search ===== */}
      <Input
        placeholder="Tìm theo tên sản phẩm..."
        className="
          mb-6 rounded-xl 
          border-slate-300 
          shadow-sm
          focus:ring-emerald-300 focus:border-emerald-400
        "
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ===== Table Wrapper ===== */}
      <div
        className="
          rounded-2xl 
          border 
          bg-white 
          shadow-[0_1px_4px_rgba(0,0,0,0.06)]
          overflow-hidden
        "
      >
        {/* Table Header */}
        <div
          className="
            grid grid-cols-12 
            px-5 py-3 
            bg-slate-50 
            text-sm text-slate-600 font-semibold 
            border-b border-slate-200
          "
        >
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Sản phẩm</div>
          <div className="col-span-2">Giá</div>
          <div className="col-span-2">Ngày mua</div>
          <div className="col-span-2 text-right">Tác vụ</div>
        </div>

        {/* Rows */}
        {filtered.map((item, idx) => {
          const reviewed = !!item.hasReview;

          return (
            <div
              key={item.id}
              className="
                grid grid-cols-12 
                px-5 py-4 
                border-b border-slate-200 last:border-none 
                hover:bg-emerald-50/40 
                transition-all duration-150
              "
            >
              {/* STT */}
              <div className="col-span-1 flex items-center justify-center text-sm text-slate-600">
                {idx + 1}
              </div>

              {/* Product Info */}
              <div className="col-span-5 flex items-center gap-4">
                <img
                  src={item.images?.[0]?.url}
                  alt={item.productName}
                  className="
                    w-16 h-16 
                    rounded-xl object-cover 
                    border border-slate-200 
                    shadow-sm
                  "
                />
                <div>
                  <p className="font-medium text-slate-800">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Trạng thái: {item.status}
                  </p>

                  {/* Người bán + link sang /seller/:userId */}
                  <p className="text-xs text-gray-500 mt-0.5">
                    Người bán:{" "}
                    {item.sellerId ? (
                      <Link
                        to={`/seller/${item.sellerId}`}
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {item.sellerName || "Xem trang người bán"}
                      </Link>
                    ) : (
                      <span className="font-medium">
                        {item.sellerName || "—"}
                      </span>
                    )}
                    {item.sellerPhone && (
                      <span className="ml-1">({item.sellerPhone})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-2 flex items-center text-sm font-semibold text-slate-700">
                {item.price} ₫
              </div>

              {/* Date */}
              <div className="col-span-2 flex items-center text-sm text-gray-600">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : "-"}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <Button
                  onClick={() => !reviewed && setSelected(item)}
                  className={`
                    rounded-xl 
                    px-4 shadow-sm
                    ${reviewed
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed hover:bg-slate-200"
                      : "bg-emerald-700 hover:bg-emerald-700 text-white"
                    }
                  `}
                  disabled={reviewed}
                >
                  {reviewed ? "Đã đánh giá" : "Đánh giá"}
                </Button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-5 py-6 text-center text-sm text-slate-500">
            Không có sản phẩm nào phù hợp.
          </div>
        )}
      </div>

      {/* ===== Review Dialog ===== */}
      {selected && (
        <ReviewDialog
          open={!!selected}
          onClose={() => setSelected(null)}
          productName={selected.productName}
          productId={selected.productId}
          onSuccess={(productId) => {
            setProducts(prev =>
              prev.map(p =>
                p.productId === productId ? { ...p, hasReview: true } : p
              )
            );
            setSelected(null);
          }}
        />

      )}
    </div>
  );
}
