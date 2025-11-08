import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Phone, Copy, CheckCheck, CalendarClock } from "lucide-react";
import {
  approveActive,
  rejectWithReason,
  fetchPendingByIdViaList,
  type PendingRow,
} from "@/api/moderation";
import { toast } from "sonner";

/* ---------- constants & helpers ---------- */
const BRAND = "#0f766e";

const fmtMoney = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("vi-VN") + " ₫";

const normalizeIso = (iso?: string | null): string | null => {
  if (!iso) return null;
  return String(iso).trim().replace(/(\.\d{3})\d+/, "$1");
};
const toDate = (iso?: string | null): Date | null => {
  const s = normalizeIso(iso);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};
const fmtDate = (iso?: string | null) => {
  const d = toDate(iso);
  return d ? d.toLocaleString("vi-VN") : "—";
};
const relTime = (iso?: string | null) => {
  const d = toDate(iso);
  if (!d) return "";
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const day = 86400000;
  const hour = 3600000;
  if (abs >= day) {
    const n = Math.round(abs / day);
    return diff >= 0 ? `(còn ${n} ngày)` : `(${n} ngày trước)`;
  }
  const n = Math.round(abs / hour);
  return diff >= 0 ? `(còn ${n} giờ)` : `(${n} giờ trước)`;
};

const statusTone: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const loc = useLocation();
  const itemFromState = (loc.state as any)?.item as PendingRow | undefined;

  const [item, setItem] = useState<PendingRow | undefined>(itemFromState);
  const [loading, setLoading] = useState<boolean>(!itemFromState);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!id || itemFromState) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const found = await fetchPendingByIdViaList(id, { pageSize: 50, maxPages: 20 });
        if (!alive) return;
        if (!found) setError("Không tìm thấy bài đang chờ phê duyệt.");
        setItem(found || undefined);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Lỗi tải dữ liệu.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, itemFromState]);

  const tone = useMemo(
    () => statusTone[item?.status || "PENDING_REVIEW"] || "bg-gray-50 text-gray-700 border-gray-200",
    [item?.status]
  );

  if (!id) return <div className="p-4">Thiếu id</div>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => nav(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại
        </Button>
        {item?.status ? (
          <Badge className={["border", tone].join(" ")}>
            {item.status}
          </Badge>
        ) : null}
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col gap-2">
            <span className="text-emerald-700">{item?.title || "Chi tiết sản phẩm chờ duyệt"}</span>
            <div className="text-xs text-slate-500 font-normal">
              <span className="mr-2">ID:</span>
              <code className="px-1.5 py-0.5 bg-slate-100 rounded">{id}</code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 ml-1 px-2"
                onClick={async () => {
                  await navigator.clipboard.writeText(id || "");
                  setCopied("id");
                  setTimeout(() => setCopied(null), 1200);
                }}
              >
                {copied === "id" ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-emerald-700">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang tải…
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : !item ? (
            <div>Không có dữ liệu.</div>
          ) : (
            <>
              {/* TOP: Ảnh trái - Thông tin xe phải */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ảnh bên trái */}
                <div>
                  {item.thumbnail ? (
                    <div className="overflow-hidden rounded-xl border">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full max-h-[520px] object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-[320px] rounded-xl border bg-slate-50 flex items-center justify-center text-slate-400">
                      Không có ảnh
                    </div>
                  )}
                </div>

                {/* Thông tin xe bên phải */}
                <div className="space-y-5">
                  <Section title="Thông tin xe">
                    <InfoGrid
                      rows={[
                        { label: "Loại sản phẩm", value: item.productType || "—" },
                        { label: "Hãng", value: item.brandName || "—" },
                        { label: "Model", value: item.modelName || "—" },
                        { label: "Phiên bản", value: item.versionName || "—" },
                        ...(item.batteryType
                          ? [{ label: "Loại pin", value: item.batteryType as React.ReactNode }]
                          : []),
                        { label: "Gói hiển thị", value: item.packageName || "—" },
                        { label: "Giá", value: fmtMoney(item.amount) },
                      ]}
                    />
                  </Section>

                  {/* Lý do từ chối nếu có */}
                  {item.rejectReason ? (
                    <Section title="Lý do từ chối">
                      <div className="rounded-lg border p-3 bg-red-50 text-red-700">
                        {item.rejectReason}
                      </div>
                    </Section>
                  ) : null}
                </div>
              </div>

              {/* BOTTOM: Thông tin người bán & Thông tin gói/thời hạn */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Người bán */}
                <Section title="Thông tin người bán">
                  <div className="rounded-xl border p-4 bg-white space-y-3">
                    <Row label="Seller ID">
                      <div className="inline-flex items-center gap-1">
                        <code className="px-1.5 py-0.5 bg-slate-100 rounded">
                          {item.sellerId || "—"}
                        </code>
                        {!!item.sellerId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={async () => {
                              await navigator.clipboard.writeText(item.sellerId!);
                              setCopied("sellerId");
                              setTimeout(() => setCopied(null), 1200);
                            }}
                            title="Copy Seller ID"
                          >
                            {copied === "sellerId" ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </Row>
                    <Row label="Họ tên" value={item.sellerName || "—"} />
                    <Row
                      label="Số điện thoại"
                      value={
                        item.sellerPhone ? (
                          <a
                            href={`tel:${item.sellerPhone}`}
                            className="inline-flex items-center gap-1"
                            style={{ color: BRAND }}
                          >
                            <Phone className="w-4 h-4" />
                            {item.sellerPhone}
                          </a>
                        ) : ("—")
                      }
                    />
                  </div>
                </Section>

                {/* Gói / thời hạn */}
                <Section title="Thông tin gói & thời hạn">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-slate-500 mb-1">Gói hiển thị</div>
                      <div className="font-medium">{item.packageName || "—"}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-slate-500 mb-1">Giá hiện tại</div>
                      <div className="font-medium">{fmtMoney(item.amount)}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-slate-500 mb-1">Gói nổi bật đến</div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">{fmtDate(item.featuredEndAt)}</span>
                        <span className="text-xs text-slate-500">{relTime(item.featuredEndAt)}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-slate-500 mb-1">Tin hết hạn</div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">{fmtDate(item.expiresAt)}</span>
                        <span className="text-xs text-slate-500">{relTime(item.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Footer meta */}
              <Separator />
              {/* Hành động phê duyệt */}
              <Section title="Hành động phê duyệt">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="reason">Lý do từ chối (nếu từ chối)</Label>
                    <Input
                      id="reason"
                      placeholder="Nhập lý do…"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-1"
                      disabled={submitting}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      style={{ backgroundColor: BRAND }}
                      className="!text-white flex-1"
                      disabled={submitting}
                      onClick={async () => {
                        try {
                          setSubmitting(true);
                          const updated = await approveActive(id!);
                          setItem(updated);
                          toast.success("Đã duyệt & kích hoạt bài đăng!"); 
                          nav("/posts/moderate?status=ACTIVE", { replace: true });
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Duyệt & kích hoạt
                    </Button>

                    <Button
                      className="!bg-red-600 !text-white flex-1"
                      disabled={submitting}
                      onClick={async () => {
                        if (!rejectReason.trim()) return alert("Nhập lý do từ chối!");
                        try {
                          setSubmitting(true);
                          await rejectWithReason(id!, rejectReason.trim());
                          toast.success("Đã từ chối bài đăng."); // <<< CHỈ THÊM TOAST
                          nav("/posts/moderate?status=REJECTED", { replace: true });
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Từ chối
                    </Button>
                  </div>
                </div>
              </Section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- UI blocks ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      {children}
    </div>
  );
}

function InfoGrid({ rows }: { rows: Array<{ label: string; value?: React.ReactNode }> }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 rounded-xl border p-3 bg-white">
      {rows.map((r, i) => (
        <Row key={i} label={r.label} value={r.value} />
      ))}
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs text-slate-500 min-w-[120px]">{label}</div>
      <div className="flex-1 font-medium text-slate-800 break-words">
        {value ?? children ?? "—"}
      </div>
    </div>
  );
}
