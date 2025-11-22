import { useEffect, useMemo, useState } from "react";
import {
  getStaffsPaged,
  createStaff,
  type Account,
  banAccount,
  unbanAccount,
  deleteAccount,
} from "@/api/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Users,
  Eye,
  EyeOff,
  Ban,
  Undo2,
  Trash2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function StaffsPage() {
  const [rows, setRows] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");

  // pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // dialog form (create staff)
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // action dialogs (ban/delete)
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
      const p = await getStaffsPaged({ page, size });
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

  async function onCreateStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !password || !fullName.trim()) {
      toast.error("Vui lòng nhập đủ SĐT, mật khẩu và họ tên");
      return;
    }
    try {
      setSubmitting(true);
      await createStaff({
        phone: phone.trim(),
        password,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
      });
      toast.success("Tạo tài khoản staff thành công");
      setOpen(false);
      setPhone(""); setPassword(""); setFullName(""); setEmail("");
      setShowPw(false);
      setPage(0);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Tạo staff thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return rows;
    return rows.filter((r) =>
      [r.fullName, r.username, r.phone, r.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(key))
    );
  }, [q, rows]);

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
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full p-2 bg-white/70 border border-emerald-100">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-emerald-800">Nhân viên</h2>
            <p className="text-sm text-[#246f67]">
              Quản lý tài khoản staff và trạng thái hoạt động
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-3 md:mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên / SĐT / email…"
              className="pl-8 w-[260px] md:w-[320px]"
            />
          </div>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3.5 w-3.5" />
            {totalItems} Nhân viên
          </Badge>
        </div>

        {/* Dialog tạo staff */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="!bg-[#246f67] hover:bg-emerald-700">
              <Plus className="mr-1.5 h-4 w-4" /> Thêm Nhân Viên
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-t-4 border-[#246f67]">
            <DialogHeader>
              <DialogTitle className="text-[#246f67]">Tạo tài khoản nhân viên</DialogTitle>
            </DialogHeader>

            <form onSubmit={onCreateStaff} className="space-y-3">
              {/* SĐT */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#246f67]">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="border-[#246f67]/30 focus-visible:ring-[#246f67] focus-visible:border-[#246f67] placeholder:text-slate-400"
                />
              </div>

              {/* Mật khẩu + con mắt */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#246f67]">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Staff@1234"
                    className="border-[#246f67]/30 focus-visible:ring-[#246f67] focus-visible:border-[#246f67] placeholder:text-slate-400 pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowPw((v) => !v)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute inset-y-0 right-0 px-3 grid place-items-center text-slate-500 hover:text-[#246f67]"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Họ tên */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#246f67]">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tên nhân viên"
                  className="border-[#246f67]/30 focus-visible:ring-[#246f67] focus-visible:border-[#246f67]"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#246f67]">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@example.com"
                  className="border-[#246f67]/30 focus-visible:ring-[#246f67] focus-visible:border-[#246f67]"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-[#246f67] text-[#246f67] hover:bg-[#246f67]/10"
                >
                  Huỷ
                </Button>
                <Button type="submit" disabled={submitting} className="!bg-[#246f67] hover:bg-[#1f5a56]">
                  {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  {submitting ? "Đang thêm…" : "Thêm"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        {err && <div className="p-3 text-sm text-red-600 bg-red-50 border-b">{err}</div>}

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="text-[#246f67]">
                <Th>Họ tên</Th>
                <Th>SĐT</Th>
                <Th>Email</Th>
                <Th className="min-w-[120px]">Trạng thái</Th>
                <Th className="min-w-[180px]">Tạo lúc</Th>
                <Th className="w-[220px] text-right pr-3">Hành động</Th>
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

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Không có dữ liệu phù hợp.
                  </td>
                </tr>
              )}

              {!loading && filtered.map((r) => (
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
                          className="border-amber-500 !text-amber-600 hover:bg-amber-50"
                          onClick={() => openBan(r)}>
                          <Ban className="h-4 w-4 mr-1" /> Khóa
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline"
                          className="border-emerald-600 !text-[#246f67]hover:bg-emerald-50"
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
        <div className="flex items-center justify-between p-3 border-t bg-slate-50 text-sm">
          <div className="text-[#246f67]">
            Tổng: <b>{totalItems}</b> — Trang <b>{page + 1}</b>/<b>{totalPages}</b>
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
                <option key={n} value={n}>{n}/trang</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              className="text-[#246f67]"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0 || loading}
            >
              <ChevronsLeft className="w-4 h-4 mr-1 text-[#246f67]" /> Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[#246f67]"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              Sau <ChevronsRight className="w-4 h-4 ml-1 text-[#246f67]" />
            </Button>
          </div>
        </div>
      </div>

      {/* Ban dialog */}
      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#246f67]">Lý do khóa tài khoản</DialogTitle>
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
