import { useEffect, useState } from "react";
import {
  getMembersPaged,
  type Account,
  banAccount,
  unbanAccount,
  deleteAccount,
} from "@/api/accounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldCheck, Ban, Undo2, Trash2, ChevronsLeft, ChevronsRight } from "lucide-react";

/* ---------- Page ---------- */
export default function UsersPage() {
  const [rows, setRows] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // pagination
  const [page, setPage] = useState(0);     
  const [size, setSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // action dialogs
  const [target, setTarget] = useState<Account | null>(null);
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("Spam post");
  const [banSubmitting, setBanSubmitting] = useState(false);

  const [delOpen, setDelOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [delSubmitting, setDelSubmitting] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const p = await getMembersPaged({ page, size });
      setRows(p.items);
      setTotalItems(p.totalItems);
      setTotalPages(p.totalPages);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Tải dữ liệu thất bại");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, size]);

  if (err) return <div className="p-4 md:p-6 text-sm text-red-600">{err}</div>;

  const isBanned = (s?: string | null) =>
    ["BANNED", "LOCKED"].includes(String(s || "").toUpperCase());

  // --- actions ---
  function openBan(r: Account) {
    setTarget(r);
    setBanReason("Spam post");
    setBanOpen(true);
  }
  async function submitBan() {
    if (!target) return;
    if (!banReason.trim()) {
      toast.error("Vui lòng nhập lý do khóa.");
      return;
    }
    try {
      setBanSubmitting(true);
      const msg = await banAccount(target.id, banReason.trim());
      toast.success(msg || `Đã khóa ${target.fullName || target.username}: ${banReason.trim()}`);
      setBanOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || `Khóa thất bại: ${banReason.trim()}`);
    } finally {
      setBanSubmitting(false);
    }
  }

  async function onUnban(r: Account) {
    try {
      const msg = await unbanAccount(r.id);
      toast.success(msg || `Đã mở khóa ${r.fullName || r.username}`);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Mở khóa thất bại");
    }
  }

  function openDelete(r: Account) {
    setTarget(r);
    setAdminPassword("");
    setDelOpen(true);
  }
  async function submitDelete() {
    if (!target) return;
    if (!adminPassword) {
      toast.error("Vui lòng nhập mật khẩu admin để xác nhận xoá.");
      return;
    }
    try {
      setDelSubmitting(true);
      const msg = await deleteAccount(target.id, adminPassword);
      toast.success(msg || `Đã xoá ${target.fullName || target.username}`);
      setDelOpen(false);
      if (rows.length === 1 && page > 0) setPage((p) => p - 1);
      else load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Xoá thất bại");
    } finally {
      setDelSubmitting(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-white/70 border border-emerald-100">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-emerald-800">Người dùng</h2>
            <p className="text-sm text-[#246f67]">
              Danh sách tài khoản thành viên và trạng thái hoạt động
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="text-[#246f67]">
                <Th>Họ tên</Th>
                <Th>SĐT</Th>
                <Th>Email</Th>
                <Th>Trạng thái</Th>
                <Th>Tạo lúc</Th>
                <Th className="w-[220px] text-left pr-3">Hành động</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading &&
                Array.from({ length: size }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <Td><div className="h-4 w-40 rounded bg-slate-100" /></Td>
                    <Td><div className="h-4 w-28 rounded bg-slate-100" /></Td>
                    <Td><div className="h-4 w-48 rounded bg-slate-100" /></Td>
                    <Td><div className="h-6 w-24 rounded bg-slate-100" /></Td>
                    <Td><div className="h-4 w-36 rounded bg-slate-100" /></Td>
                    <Td />
                  </tr>
                ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Không có dữ liệu.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-50/40">
                    <Td className="font-medium text-slate-800">{r.fullName || r.username}</Td>
                    <Td className="tabular-nums">{r.phone || "-"}</Td>
                    <Td className="text-slate-600">{r.email || "-"}</Td>
                    <Td><StatusBadge value={r.status} /></Td>
                    <Td className="tabular-nums">
                      {r.createdAt ? r.createdAt.slice(0, 19).replace("T", " ") : "-"}
                    </Td>
                    <Td className="pr-3">
                      <div className="flex justify-end gap-2">
                        {!isBanned(r.status) ? (
                          <Button size="sm" variant="outline"
                            className="border-amber-500 text-amber-600 hover:bg-amber-50"
                            onClick={() => openBan(r)}>
                            <Ban className="h-4 w-4 mr-1" /> Khóa
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline"
                            className="border-emerald-600 !text-[#246f67] hover:bg-emerald-50"
                            onClick={() => onUnban(r)}>
                            <Undo2 className="h-4 w-4 mr-1" /> Mở khóa
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" className="text-[#246f67]" onClick={() => openDelete(r)}>
                          <Trash2 className="h-4 w-4 mr-1 text-[#246f67]" /> Xóa
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between p-3 border-t bg-slate-50 text-sm text-[#246f67]">
          <div className="text-[#246f67]">
            Tổng: <b>{totalItems}</b> - Trang <b>{page + 1}</b>/<b>{totalPages}</b>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-8 rounded border px-2 text-[#246f67]"
              value={size}
              onChange={(e) => {
                setPage(0);
                setSize(Number(e.target.value));
              }}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}/Trang</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              className ="text-[#246f67]"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0 || loading}
            >
              <ChevronsLeft className="w-4 h-4 mr-1 !text-[#246f67]" /> Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className ="text-[#246f67]"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              Sau <ChevronsRight className="w-4 h-4 ml-1 !text-[#246f67]" />
            </Button>
          </div>
        </div>
      </div>

      {/* Ban dialog */}
      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-[#246f67]">
            <DialogTitle>Lý do khóa tài khoản</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              Khóa: <b>{target?.fullName || target?.username}</b>
            </div>
            <Textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Nhập lý do…"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBanOpen(false)}>Huỷ</Button>
              <Button onClick={submitBan} disabled={banSubmitting} className="!bg-amber-600 hover:bg-amber-700">
                {banSubmitting ? "Đang khóa…" : "Khóa"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#246f67]">Xóa tài khoản</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              Xoá: <b>{target?.fullName || target?.username}</b>
            </div>
            <Input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Nhập mật khẩu admin để xác nhận"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDelOpen(false)}>Huỷ</Button>
              <Button variant="destructive" onClick={submitDelete} disabled={delSubmitting} className="!bg-amber-600 hover:bg-amber-700">
                {delSubmitting ? "Đang xoá…" : "Xóa"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- small UI helpers ---------- */
function Th({ children, className }: any) {
  return <th className={`px-3 py-2 text-left font-semibold ${className || ""}`}>{children}</th>;
}
function Td({ children, className }: any) {
  return <td className={`px-3 py-2 align-middle ${className || ""}`}>{children}</td>;
}
function StatusBadge({ value }: { value?: string | null }) {
  const v = (value || "").toUpperCase();
  if (v === "ACTIVE")
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">● ACTIVE</Badge>;
  if (v === "BANNED" || v === "LOCKED")
    return <Badge variant="destructive">● {v}</Badge>;
  return <Badge variant="secondary">● {v || "UNKNOWN"}</Badge>;
}
