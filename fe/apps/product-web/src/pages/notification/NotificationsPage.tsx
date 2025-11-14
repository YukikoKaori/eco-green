import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listMemberNotifications,
  markNotificationRead,
  deleteNotification,
  deleteAllNotifications,
  type NotificationDTO,
} from "@/api/notifications";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Trash2, Check } from "lucide-react";

function getNotificationTarget(n: NotificationDTO): string | null {
  if (n.type === "PURCHASE_REQUEST" && n.refId) {
    return `/seller/purchase-requests/${n.refId}`;
  }
  if (n.type === "PRODUCT_EXPIRE_SOON" && n.refId) {
    return `/post/manage?highlight=${encodeURIComponent(n.refId)}`;
  }
  if (n.type === "PURCHASE_REQUEST_COMPLETED" && n.refId) {
    return `/account/bought-products?ref=${encodeURIComponent(n.refId)}`;
  }
  return null;
}

export default function NotificationCenterPage() {
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const nav = useNavigate();

  const loadPage = async (p = 0) => {
    setLoading(true);
    try {
      const res = await listMemberNotifications({ page: p, size });
      setItems(res.content ?? []);
      setPage(res.page ?? p);

      const tp =
        typeof res.totalPages === "number" && res.totalPages > 0
          ? res.totalPages
          : res.totalElements
          ? Math.max(1, Math.ceil(res.totalElements / size))
          : 1;

      setTotalPages(tp);
      setTotalElements(res.totalElements ?? res.content?.length ?? 0);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Không tải được danh sách thông báo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(0);
  }, []);

  const handleClickItem = async (n: NotificationDTO) => {
    const target = getNotificationTarget(n);

    try {
      if (!n.read) {
        setBusyId(n.id);
        const res = await markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) =>
            x.id === n.id ? res.notification ?? { ...x, read: true } : x
          )
        );
      }
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }

    if (target) {
      nav(target);
    }
  };

  const handleDeleteOne = async (id: string) => {
    setBusyId(id);
    try {
      const res = await deleteNotification(id);
      if (res.success !== false) {
        toast.success(res.message || "Đã xoá thông báo.");
        setItems((prev) => prev.filter((n) => n.id !== id));
        setTotalElements((c) => Math.max(0, c - 1));
        if (items.length === 1 && page > 0) {
          loadPage(page - 1);
        }
      } else {
        toast.error(res.message || "Xoá thông báo thất bại.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Xoá thông báo thất bại.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!items.length) return;
    if (!confirm("Bạn có chắc muốn xoá TẤT CẢ thông báo không?")) return;

    setDeletingAll(true);
    try {
      const res = await deleteAllNotifications(true);
      if (res.success !== false) {
        toast.success(res.message || "Đã xoá tất cả thông báo.");
        setItems([]);
        setPage(0);
        setTotalPages(0);
        setTotalElements(0);
      } else {
        toast.error(res.message || "Không thể xoá tất cả thông báo.");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Không thể xoá tất cả thông báo.");
    } finally {
      setDeletingAll(false);
    }
  };

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full p-3 bg-emerald-50 border border-emerald-200">
            <Bell className="w-6 h-6 text-[#246f67]" />
          </div>
          <div>
            <h1 className="!text-2xl font-bold text-[#1f4f4b]">Thông báo</h1>
            <p className="text-sm text-slate-600 mt-1">
              {unreadCount > 0
                ? `${unreadCount} thông báo chưa đọc`
                : "Bạn đã đọc hết tất cả thông báo."}
            </p>
            {totalElements > 0 && (
              <p className="text-xs text-emerald-500">
                Tổng cộng {totalElements} thông báo
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!items.length || deletingAll}
            onClick={handleDeleteAll}
            className="flex items-center gap-1 text-red-700"
          >
            <Trash2 className="w-4 h-4 " />
            Xoá tất cả
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-slate-600">
            Đang tải thông báo…
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-600">
            Hiện chưa có thông báo nào.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {items.map((n) => {
              const created = n.createdAt
                ? new Date(n.createdAt).toLocaleString("vi-VN")
                : "";
              const target = getNotificationTarget(n);
              const clickable = !!target;

              const typeLabel =
                n.type === "PURCHASE_REQUEST"
                  ? "Yêu cầu mua"
                  : n.type === "PRODUCT_EXPIRE_SOON"
                  ? "Tin đăng sắp hết hạn"
                  : n.type === "PURCHASE_REQUEST_COMPLETED"
                  ? "Giao dịch hoàn tất"
                  : "Thông báo";

              return (
                <li
                  key={n.id}
                  className={`px-4 py-3 flex gap-3 ${
                    clickable ? "cursor-pointer" : "cursor-default"
                  } ${!n.read ? "bg-emerald-50/60" : "bg-white"}`}
                  onClick={() => handleClickItem(n)}
                >
                  <div className="pt-1">
                    {!n.read ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-white" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300">
                        <Check className="w-3 h-3 text-slate-400" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-emerald-700">
                        {n.title}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                        {typeLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">
                      {n.content}
                    </p>
                    <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{created}</span>
                      {!clickable && (
                        <span className="italic text-[10px] text-slate-400">
                          Không có trang chi tiết
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                      disabled={busyId === n.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOne(n.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination: Trước [1] [2] [3] Sau */}
      {totalPages >= 1 && totalElements > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 0}
            onClick={() => page > 0 && loadPage(page - 1)}
          >
            Trước
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "outline"}
              className={
                p === page
                  ? "!bg-[#246f67] text-white border-[#246f67]"
                  : "border-slate-300"
              }
              onClick={() => p !== page && loadPage(p)}
            >
              {p + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => page < totalPages - 1 && loadPage(page + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
