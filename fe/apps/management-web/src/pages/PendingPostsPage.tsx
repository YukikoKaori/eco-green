import { getPendingPosts, verifyPost, rejectPost, approvePostActive } from "@/api/product";
import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PackageCheck, Info } from "lucide-react";
import { pushRecentRejected } from "@/utils/recentRejected";

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

const priceVN = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";

const normalizeProduct = (item: any): PendingProduct => ({
  id: item.id || item.productId || "",
  status: item.status || item.newStatus || "",
  rejectReason: item.rejectReason || null,
  title: item.title || "",
  thumbnail: item.thumbnail || null,
  productType: item.productType || item.type || "",
  updateAt: item.updateAt || item.updatedAt || null,
  modelName: item.modelName || null,
  versionName: item.versionName || null,
  packageName: item.packageName || "",
  amount: item.amount ?? item.price ?? null,
});

export default function PendingPostsPage() {
  const [status] = useState<"PENDING_REVIEW">("PENDING_REVIEW");
  const [type, setType] = useState<"" | "VEHICLE" | "BATTERY">("");

  // pagination
  const [page0, setPage0] = useState(0); 
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // data
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // dialog
  const [selected, setSelected] = useState<PendingProduct | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function fetchPage() {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingPosts({
        page: page0,
        size,
        status,
        type: type || undefined,
        sort: "createdAt,desc",
      });

      const list = (data.content ?? []).map(normalizeProduct);
      setProducts(list);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? list.length);
    } catch {
      setError("Không thể tải danh sách sản phẩm cần phê duyệt.");
      setProducts([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPage();
  }, [page0, size, status, type]);

  const resetDialog = () => {
    setSelected(null);
    setRejectReason("");
    setShowRejectInput(false);
    setSubmitting(false);
  };

  const handleApprove = async (id: string) => {
    try {
      setSubmitting(true);
      await approvePostActive(id);

      const remain = products.length - 1;
      if (remain === 0 && page0 > 0) setPage0((p) => p - 1);
      else await fetchPage();
      resetDialog();
    } catch {
      alert(" Lỗi khi phê duyệt sản phẩm.");
      setSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      setSubmitting(true);
      const rejected = await rejectPost(id, rejectReason.trim());
      pushRecentRejected(rejected);

      const remain = products.length - 1;
      if (remain === 0 && page0 > 0) setPage0((p) => p - 1);
      else await fetchPage();
      resetDialog();
    } catch {
      alert("Lỗi khi từ chối sản phẩm.");
      setSubmitting(false);
    }
  };

  const pages = useMemo(() => {
    const arr: number[] = [];
    for (let i = 1; i <= totalPages; i++) arr.push(i);
    return arr;
  }, [totalPages]);

  if (loading && products.length === 0)
    return (
      <div className="flex items-center justify-center h-96 text-emerald-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Đang tải dữ liệu...
      </div>
    );

  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div>
      <Card className="border border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <PackageCheck className="w-6 h-6 text-emerald-600" />
            Danh sách sản phẩm cần phê duyệt
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Không có sản phẩm nào.</p>
          ) : (
            <>
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
                      <tr key={p.id} className="border-t hover:bg-emerald-50 transition">
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
                        <td className="px-4 py-3 text-gray-700">{p.packageName}</td>
                        <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                          {priceVN(p.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              p.status === "PENDING_REVIEW"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : p.status === "ACTIVE" || p.status === "APPROVED"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }
                          >
                            {p.status === "PENDING_REVIEW"
                              ? "Chờ phê duyệt"
                              : p.status === "ACTIVE"
                              ? "Đang hiển thị"
                              : p.status === "APPROVED"
                              ? "Đã duyệt"
                              : "Từ chối"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {p.updateAt ? new Date(p.updateAt).toLocaleString() : "-"}
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

              {/* Pagination bar */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Hiển thị {products.length} / {totalElements}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
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
                      className={p - 1 === page0 ? "bg-emerald-600 text-white" : ""}
                      onClick={() => setPage0(p - 1)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page0 + 1 >= totalPages}
                    onClick={() => setPage0((p) => p + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog chi tiết + duyệt/từ chối */}
      <Dialog open={!!selected} onOpenChange={() => resetDialog()}>
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
                  <b>Giá:</b> {priceVN(selected.amount)}
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
                      disabled={submitting}
                    />
                    <Button
                      className="mt-3 !bg-red-600 hover:!bg-red-700 !text-white w-full"
                      onClick={() => handleReject(selected.id)}
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Xác nhận từ chối
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-end gap-3 mt-4">
                {!showRejectInput && (
                  <>
                    <Button
                      className="!bg-green-600 !text-white"
                      onClick={() => handleApprove(selected.id)}
                      disabled={submitting || selected.status !== "PENDING_REVIEW"}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Duyệt
                    </Button>
                    <Button
                      className="!bg-red-500 !text-white"
                      onClick={() => setShowRejectInput(true)}
                      disabled={submitting || selected.status !== "PENDING_REVIEW"}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
