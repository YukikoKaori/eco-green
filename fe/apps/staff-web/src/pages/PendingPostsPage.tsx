import { getPendingPosts, verifyPost } from "@/api/auth";
import { useEffect, useState } from "react";

interface PendingProduct {
  id: string;
  status: string;
  rejectReason: string | null;
  title: string;
  thumbnail: string | null;
  productType: string;
  updateAt: string | null;
  modelName: string | null;
  versionName: string | null;
  packageName: string;
  amount: number | null;
}

export default function PendingPostsPage() {
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normalize data from API
  const normalizeProduct = (item: any): PendingProduct => {
    return {
      id: item.id || item.productId || "",
      status: item.status || item.newStatus || "",
      rejectReason: item.rejectReason || null,
      title: item.title || "",
      thumbnail: item.thumbnail || null,
      productType: item.productType || "",
      updateAt: item.updateAt || item.updatedAt || null,
      modelName: item.modelName || null,
      versionName: item.versionName || null,
      packageName: item.packageName || "",
      amount: item.amount || item.price || null,
    };
  };

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await getPendingPosts();
        console.log("Raw API data:", data);
        const normalized = data.map(normalizeProduct);
        console.log("Normalized data:", normalized);
        setProducts(normalized);
      } catch (err) {
        console.error("Error fetching pending review products:", err);
        setError("Không thể tải danh sách sản phẩm cần phê duyệt.");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await verifyPost(id, { newStatus: "APPROVED" });
      alert("✅ Phê duyệt thành công!");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error approving product:", err);
      alert("❌ Lỗi khi phê duyệt sản phẩm.");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;
    try {
      await verifyPost(id, { newStatus: "REJECTED", rejectReason: reason });
      alert("🚫 Đã từ chối bài đăng.");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error rejecting product:", err);
      alert("❌ Lỗi khi từ chối sản phẩm.");
    }
  };

  if (loading) return <p className="p-4 text-gray-600">Đang tải dữ liệu...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-emerald-700 ">
        Danh sách sản phẩm cần phê duyệt ({products.length})
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-600">
          Không có sản phẩm nào đang chờ phê duyệt.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-emerald-50 text-emerald-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">Ảnh</th>
                <th className="px-4 py-3 text-left">Tiêu đề</th>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Gói</th>
                <th className="px-4 py-3 text-right">Giá</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Lý do từ chối</th>
                <th className="px-4 py-3 text-left">Cập nhật lần cuối</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr
                  key={p.id || `product-${index}`}
                  className="border-t hover:bg-emerald-50 transition-colors"
                >
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

                  <td className="px-4 py-3 font-medium text-gray-800">
                    {p.title}
                  </td>

                  <td className="px-4 py-3 text-gray-700">{p.productType}</td>
                  <td className="px-4 py-3 text-gray-700">{p.packageName}</td>

                  <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                    {(p.amount ?? 0).toLocaleString()} ₫
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {p.status === "PENDING_REVIEW"
                      ? "Chờ phê duyệt"
                      : p.status === "APPROVED"
                      ? "Đã duyệt"
                      : "Từ chối"}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {p.rejectReason || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {p.updateAt ? new Date(p.updateAt).toLocaleString() : "-"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="px-3 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition active:scale-95"
                      >
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => handleReject(p.id)}
                        className="px-3 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition active:scale-95"
                      >
                        Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}