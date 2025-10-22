import { getPendingPosts, verifyPost } from "@/api/auth";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PackageCheck, Info } from "lucide-react";

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
  const [selected, setSelected] = useState<PendingProduct | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const normalizeProduct = (item: any): PendingProduct => ({
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
  });

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await getPendingPosts();
        setProducts(data.map(normalizeProduct));
      } catch {
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
      resetDialog();
    } catch {
      alert("❌ Lỗi khi phê duyệt sản phẩm.");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      await verifyPost(id, { newStatus: "REJECTED", rejectReason });
      alert("🚫 Đã từ chối bài đăng.");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      resetDialog();
    } catch {
      alert("❌ Lỗi khi từ chối sản phẩm.");
    }
  };

  const resetDialog = () => {
    setSelected(null);
    setRejectReason("");
    setShowRejectInput(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-96 text-emerald-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Đang tải dữ liệu...
      </div>
    );

  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <Card className="border border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <PackageCheck className="w-6 h-6 text-emerald-600" />
            Danh sách sản phẩm cần phê duyệt
            <span className="ml-2 text-sm text-gray-500">
              ({products.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Không có sản phẩm nào đang chờ phê duyệt.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-emerald-50 text-emerald-700 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Ảnh</th>
                    <th className="px-4 py-3 text-left">Tiêu đề</th>
                    <th className="px-4 py-3 text-left">Loại</th>
                    <th className="px-4 py-3 text-left">Gói</th>
                    <th className="px-4 py-3 text-right">Giá</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Cập nhật</th>
                    <th className="px-4 py-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t hover:bg-emerald-50 transition"
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
                      <td className="px-4 py-3 text-gray-700">
                        {p.productType}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {p.packageName}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                        {(p.amount ?? 0).toLocaleString()} ₫
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            p.status === "PENDING_REVIEW"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : p.status === "APPROVED"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {p.status === "PENDING_REVIEW"
                            ? "Chờ phê duyệt"
                            : p.status === "APPROVED"
                            ? "Đã duyệt"
                            : "Từ chối"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {p.updateAt
                          ? new Date(p.updateAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700 border-gray-300 hover:bg-gray-100"
                          onClick={() => setSelected(p)}
                        >
                          <Info className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔹 Dialog Chi tiết sản phẩm */}
      <Dialog open={!!selected} onOpenChange={resetDialog}>
        <DialogContent className="max-w-3xl rounded-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-emerald-700 text-lg font-semibold">
                  Chi tiết sản phẩm
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-gray-700">
                {selected.thumbnail && (
                  <img
                    src={selected.thumbnail}
                    alt={selected.title}
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                )}
                <p>
                  <b>Tiêu đề:</b> {selected.title}
                </p>
                <p>
                  <b>Loại:</b> {selected.productType}
                </p>
                <p>
                  <b>Gói:</b> {selected.packageName}
                </p>
                <p>
                  <b>Giá:</b> {(selected.amount ?? 0).toLocaleString()} ₫
                </p>
                <p>
                  <b>Trạng thái:</b> {selected.status}
                </p>
                {selected.modelName && (
                  <p>
                    <b>Model:</b> {selected.modelName}
                  </p>
                )}
                {selected.versionName && (
                  <p>
                    <b>Phiên bản:</b> {selected.versionName}
                  </p>
                )}
                {selected.rejectReason && (
                  <p>
                    <b>Lý do từ chối:</b> {selected.rejectReason}
                  </p>
                )}

                {showRejectInput && (
                  <div className="mt-4">
                    <Label htmlFor="reason">Lý do từ chối</Label>
                    <Input
                      id="reason"
                      placeholder="Nhập lý do..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-1"
                    />
                    <Button
                      className="mt-3 !bg-red-600 hover:!bg-red-700 !text-white w-full"
                      onClick={() => handleReject(selected.id)}
                    >
                      Xác nhận từ chối
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-end gap-3 mt-4">
                {!showRejectInput && (
                  <>
                    <Button className="!bg-green-600 !text-white font-medium shadow hover:!bg-green-700 active:scale-95 transition-all">
                      Duyệt
                    </Button>

                    <Button
                      onClick={() => setShowRejectInput(true)}
                      className="!bg-red-500 !text-white font-medium shadow hover:!bg-red-600 active:scale-95 transition-all"
                    >
                      Từ chối
                    </Button>
                  </>
                )}
                {/* <Button
                  variant="outline"
                  onClick={resetDialog}
                  className="!bg-gray-500 !text-white font-medium shadow hover:!bg-gray-600 active:scale-95 transition-all"
                >
                  Đóng
                </Button> */}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
