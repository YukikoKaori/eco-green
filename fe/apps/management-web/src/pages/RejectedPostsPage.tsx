// src/pages/staff/RecentlyRejectedPage.tsx
import { useEffect, useState, useMemo } from "react";
import { getRecentRejected, clearRecentRejected, type RejectedItem } from "@/utils/recentRejected";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ban } from "lucide-react";

const priceVN = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";

export default function RecentlyRejectedPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<RejectedItem[]>([]);

  useEffect(() => {
    setItems(getRecentRejected());

    // Tự cập nhật nếu localStorage thay đổi ở tab khác
    const onStorage = (e: StorageEvent) => {
      if (e.key === "recent_rejected_posts") {
        setItems(getRecentRejected());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) =>
      (i.id ?? i.productId ?? "").toLowerCase().includes(s) ||
      (i.title ?? "").toLowerCase().includes(s) ||
      (i.rejectReason ?? "").toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <div>
      <Card className="border border-gray-200 shadow-md">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Ban className="w-6 h-6 text-rose-600" />
            Các tin đăng bị từ chối
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { clearRecentRejected(); setItems([]); }}>
              Xoá danh sách
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Chưa có mục nào trong phiên làm việc gần đây.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-rose-50 text-rose-700 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Ảnh</th>
                    <th className="px-4 py-3 text-left">Tiêu đề</th>
                    <th className="px-4 py-3 text-left">Lý do</th>
                    <th className="px-4 py-3 text-left">Loại</th>
                    <th className="px-4 py-3 text-right">Giá</th>
                    <th className="px-4 py-3 text-left">Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const id = p.id ?? p.productId ?? Math.random().toString(36).slice(2);
                    const time = p.updateAt ?? p.updatedAt ?? null;
                    return (
                      <tr key={id} className="border-t hover:bg-rose-50/40 transition">
                        <td className="px-4 py-3">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt={p.title ?? ""} className="w-16 h-16 object-cover rounded-md border" />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md border">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          <div className="line-clamp-2">{p.title ?? "-"}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{p.id ?? p.productId}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="line-clamp-2">{p.rejectReason || "-"}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{p.productType ?? "-"}</td>
                        <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                          {priceVN(p.amount ?? null)}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {time ? new Date(time).toLocaleString("vi-VN") : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
