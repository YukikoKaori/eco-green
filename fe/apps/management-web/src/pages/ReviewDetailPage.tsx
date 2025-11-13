import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowLeft,
  Phone,
  Copy,
  CheckCheck,
  CalendarClock,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import {
  approveActive,
  rejectWithReason,
  fetchPendingPaged,
  type ModerationRow,
} from "@/api/moderation";
import { toast } from "sonner";

const BRAND = "#0f766e";

const fmtMoney = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("vi-VN") + " ₫";

const fmtDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN");
};

const statusTone: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const loc = useLocation();

  const [item, setItem] = useState<ModerationRow | null>(
    (loc.state as any)?.item || null
  );
  const [loading, setLoading] = useState(!item);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<{ id?: boolean; seller?: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item || !id) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchPendingPaged({ page: 0, size: 50 });
        const found = res.content.find((x) => x.id === id);
        if (!alive) return;
        if (!found) setError("Không tìm thấy bài đang chờ phê duyệt.");
        else setItem(found);
      } catch (e: any) {
        setError(e?.message || "Lỗi tải dữ liệu.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, item]);

  const tone = useMemo(
    () =>
      statusTone[item?.status || "PENDING_REVIEW"] ||
      "bg-gray-50 text-gray-700 border-gray-200",
    [item?.status]
  );

  if (!id) return <div className="p-4">Thiếu ID</div>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => nav(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
        </Button>
        {item?.status && (
          <Badge className={["border", tone].join(" ")}>{item.status}</Badge>
        )}
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex flex-col gap-2">
            <span className="text-emerald-700 text-lg font-semibold">
              {item?.title || "Chi tiết sản phẩm"}
            </span>
            <div className="text-xs text-slate-500 font-normal">
              <span className="mr-2">Post ID:</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 ml-1 px-2"
                onClick={async () => {
                  await navigator.clipboard.writeText(id || "");
                  setCopied({ id: true });
                  toast.success("Đã copy Post ID");
                  setTimeout(() => setCopied({}), 1200);
                }}
              >
                {copied.id ? (
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-500" />
                )}
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
              {/* Ảnh + mô tả + người bán */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="rounded-xl border w-full max-h-[500px] object-cover"
                    />
                  ) : (
                    <div className="h-[320px] rounded-xl border bg-slate-50 flex items-center justify-center text-slate-400">
                      Không có ảnh
                    </div>
                  )}

                  <Section title="Thông tin người bán" className="mt-6">
                    <div className="rounded-xl border p-4 bg-white space-y-3">
                      <Row
                        label="Seller ID"
                        value={
                          item.sellerId ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={async () => {
                                  await navigator.clipboard.writeText(
                                    item.sellerId || ""
                                  );
                                  setCopied({ seller: true });
                                  toast.success("Đã copy Seller ID");
                                  setTimeout(() => setCopied({}), 1200);
                                }}
                              >
                                {copied.seller ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            "—"
                          )
                        }
                      />
                      <Row label="Họ tên" value={item.sellerName || "—"} />
                      <Row
                        label="Số điện thoại"
                        value={
                          item.sellerPhone ? (
                            <a
                              href={`tel:${item.sellerPhone}`}
                              className="inline-flex items-center gap-1 text-emerald-700"
                            >
                              <Phone className="w-4 h-4" /> {item.sellerPhone}
                            </a>
                          ) : (
                            "—"
                          )
                        }
                      />
                      <Row label="Email" value={item.sellerEmail || "—"} />
                    </div>
                  </Section>
                </div>

                {/* Cột phải */}
                <div className="space-y-5">
                  <Section title="Thông tin bài đăng">
                    <div className="rounded-xl border p-3 bg-white">
                      <div className="font-semibold text-slate-800 mb-1">
                        {item.title || "—"}
                      </div>
                      {item.description ? (
                        <div className="text-slate-700 text-sm leading-relaxed max-h-[160px] overflow-y-auto">
                          {item.description}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-sm">Không có mô tả</div>
                      )}
                    </div>
                  </Section>

                  <Section title="Thông tin sản phẩm">
                    <InfoGrid
                      rows={
                        item.productType === "BATTERY"
                          ? [
                              { label: "Loại sản phẩm", value: item.productType },
                              { label: "Hãng", value: item.brandName || "—" },
                              {
                                label: "Loại pin",
                                value: item.batteryType || "—",
                              },
                              {
                                label: "Sức khỏe pin (%)",
                                value:
                                  item.batteryHealthPercent ??
                                  item.healthPercent ??
                                  "—",
                              },
                              {
                                label: "Dung lượng (kWh)",
                                value: item.capacityKwh
                                  ? `${item.capacityKwh} kWh`
                                  : "—",
                              },
                              {
                                label: "Điện áp (V)",
                                value: item.voltageV
                                  ? `${item.voltageV} V`
                                  : "—",
                              },
                              {
                                label: "Gói hiển thị",
                                value: item.packageName || "—",
                              },
                              { label: "Giá", value: fmtMoney(item.price) },
                            ]
                          : [
                              { label: "Loại sản phẩm", value: item.productType },
                              { label: "Danh mục", value: item.categoryName || "—" },
                              { label: "Hãng", value: item.brandName || "—" },
                              { label: "Model", value: item.modelName || "—" },
                              { label: "Phiên bản", value: item.versionName || "—" },
                              {
                                label: "Năm sản xuất",
                                value: item.year ?? "—",
                              },
                              {
                                label: "Số km đã đi",
                                value: item.mileageKm
                                  ? `${item.mileageKm} km`
                                  : "—",
                              },
                              {
                                label: "Gói hiển thị",
                                value: item.packageName || "—",
                              },
                              { label: "Giá", value: fmtMoney(item.price) },
                            ]
                      }
                    />
                  </Section>

                  <Section title="Địa chỉ đăng bán">
                    <div className="rounded-lg border p-4 bg-white space-y-1">
                      <div>{item.addressDetail || "—"}</div>
                      <div className="text-slate-600 text-sm">
                        {[item.ward, item.district, item.city]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  </Section>

                  <Section title="Thời hạn & hiển thị">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InfoCard
                        label="Gói nổi bật đến"
                        value={fmtDate(item.featuredEndAt)}
                      />
                      <InfoCard
                        label="Tin hết hạn"
                        value={fmtDate(item.expiresAt)}
                      />
                    </div>
                  </Section>

                  {item.status === "REJECTED" && item.rejectReason && (
                    <Section title="Lý do bị từ chối">
                      <div className="rounded-lg border p-3 bg-red-50 text-red-700">
                        {item.rejectReason}
                      </div>
                    </Section>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* ---- Hành động phê duyệt ---- */}
              {item.status === "PENDING_REVIEW" && (
                <Section title="Hành động phê duyệt">
                  {!showRejectBox ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        style={{ backgroundColor: BRAND }}
                        className="text-white flex items-center gap-1"
                        disabled={submitting}
                        onClick={async () => {
                          setSubmitting(true);
                          await approveActive(id!);
                          toast.success("Đã duyệt & kích hoạt bài đăng!");
                          nav("/posts/moderate?status=ACTIVE", { replace: true });
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Duyệt
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-1 !bg-red-600 text-white"
                        onClick={() => setShowRejectBox(true)}
                      >
                        <XCircle className="w-4 h-4" /> Từ chối
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label>Lý do từ chối</Label>
                      <Input
                        placeholder="Nhập lý do..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        disabled={submitting}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="!bg-red-600 text-white flex items-center gap-1"
                          disabled={submitting}
                          onClick={async () => {
                            if (!rejectReason.trim())
                              return toast.error("Vui lòng nhập lý do từ chối!");
                            setSubmitting(true);
                            await rejectWithReason(id!, rejectReason.trim());
                            toast.success("Đã từ chối bài đăng!");
                            nav("/posts/moderate?status=REJECTED", { replace: true });
                          }}
                        >
                          <XCircle className="w-4 h-4" /> Xác nhận từ chối
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowRejectBox(false)}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  )}
                </Section>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- UI Helpers ---------- */
function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 mt-4 ${className}`}>
      <div className="text-sm font-semibold text-emerald-700">{title}</div>
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

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs text-slate-500 min-w-[120px]">{label}</div>
      <div className="flex-1 font-medium text-slate-800 break-words">
        {value ?? "—"}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border p-3 bg-white flex items-center gap-2">
      <CalendarClock className="w-4 h-4 text-slate-500" />
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-medium text-slate-800">{value || "—"}</div>
      </div>
    </div>
  );
}
