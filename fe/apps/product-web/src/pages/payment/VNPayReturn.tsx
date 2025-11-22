import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, CircleSlash2, Banknote, Info, Copy } from "lucide-react";
import { verifyVNPay, type VNPayVerifyResponse } from "@/api/payment";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ---------- helpers ---------- */
const PRI = "#246f67";

const mapCode = (c?: string | null) =>
  c === "00" ? "Thành công" : c ? `Mã ${c}` : undefined;

function fmtMoney(n?: number | null, fallback?: string) {
  if (n == null) return fallback ?? "--";
  return Math.round(n).toLocaleString("vi-VN") + " đ";
}
function fmtMoneyFromQuery(v?: string | null, fallback?: string) {
  if (!v) return fallback ?? "--";
  const n = Number(v);
  const amount = Number.isFinite(n) ? Math.round(n / 100) : 0;
  return fmtMoney(amount, fallback);
}
function fmtVnpDate(v?: string | null) {
  if (!v || v.length !== 14) return undefined;
  const y = v.slice(0, 4), m = v.slice(4, 6), d = v.slice(6, 8);
  const hh = v.slice(8, 10), mm = v.slice(10, 12), ss = v.slice(12, 14);
  return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
}
function fmtIso(v?: string | null) {
  if (!v) return undefined;
  const dt = new Date(v);
  if (isNaN(dt.getTime())) return undefined;
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yy = dt.getFullYear();
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${mi}:${ss}`;
}

/* ---------- small UI bits ---------- */
function Badge({
  tone = "ok",
  children,
}: {
  tone?: "ok" | "warn" | "fail";
  children?: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : tone === "warn"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-rose-100 text-rose-800 border-rose-200";
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${cls}`}>
      {children}
    </span>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[160px_1fr] items-start gap-4 py-3">
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-800 break-all">{value}</div>
    </div>
  );
}

function SkeletonLine({ w = "100%" }: { w?: string }) {
  return <div className="h-3 rounded bg-slate-200 animate-pulse" style={{ width: w }} />;
}

/* ---------- Page ---------- */
export default function VNPayReturn() {
  const nav = useNavigate();
  const { search } = useLocation();

  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const rawQuery = search.startsWith("?") ? search.slice(1) : search;

  let pid = qs.get("pid") ?? "";
  if (!pid) {
    try {
      const raw = localStorage.getItem("last_post_created");
      if (raw) pid = JSON.parse(raw)?.productId || "";
    } catch {}
  }

  // fallback từ URL (khi BE chưa/trễ verify)
  const q_rc = qs.get("vnp_ResponseCode");
  const q_tx = qs.get("vnp_TransactionStatus");
  const q_amt = qs.get("vnp_Amount");
  const q_bank = qs.get("vnp_BankCode");
  const q_no = qs.get("vnp_TransactionNo");
  const q_date = qs.get("vnp_PayDate");
  const q_success = (q_rc === "00" && q_tx === "00") || (q_rc === "00" && !q_tx);

  const [loading, setLoading] = useState(false);
  const [vr, setVr] = useState<VNPayVerifyResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!pid || !rawQuery) return;
      setLoading(true);
      setErr(null);
      try {
        const data = await verifyVNPay(pid, rawQuery);
        setVr(data);
        if (!data.success) setErr(data.message || "Xác minh thanh toán không thành công.");
      } catch (e: any) {
        setErr(e?.userMessage || e?.message || "Không gọi được API verify.");
      } finally {
        setLoading(false);
      }
    })();
  }, [pid, rawQuery]);

  const success = vr?.success ? (vr.status === "PAID" || vr.vnpResponseCode === "00") : q_success;

  const title = success ? "Thanh toán thành công" : err ? "Không xác minh được" : "Thanh toán chưa thành công";
  const desc = success
    ? "Hệ thống đã xác minh giao dịch. Bạn có thể quay lại quản lý tin."
    : err
    ? err
    : "Giao dịch chưa ở trạng thái thành công. Bạn có thể thử thanh toán lại.";

  const tone: "ok" | "warn" | "fail" = success ? "ok" : err ? "fail" : "warn";
  const Icon = success ? CheckCircle2 : err ? CircleSlash2 : AlertTriangle;

  const amountStr = vr ? fmtMoney(vr.amount) : fmtMoneyFromQuery(q_amt);
  const bank = vr?.bankCode ?? q_bank ?? undefined;
  const rc = vr?.vnpResponseCode ?? q_rc ?? undefined;
  const rcText = rc ? `${rc} – ${mapCode(rc)}` : undefined;
  const st = vr?.status ?? q_tx ?? undefined;
  const stText =
    vr?.status === "PAID" ? "00 – Thành công" :
    st === "00" ? "00 – Thành công" :
    st ? `Mã ${st}` : undefined;

  const when = vr ? fmtIso(vr.payDate) : fmtVnpDate(q_date);
  const txNo = vr?.vnpTransactionNo ?? q_no ?? undefined;

  const goManage = () => nav("/post/manage", { replace: true });
  const goBackNotice = () => pid && nav(`/postnotice?productId=${encodeURIComponent(pid)}`, { replace: true });

  const copy = (v?: string) => {
    if (!v) return;
    navigator.clipboard.writeText(v).then(() => toast.success("Đã sao chép!"));
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Hero */}
      <div
        className={`relative overflow-hidden text-sm border p-6 sm:p-4 ${
          success ? "border-emerald-200 bg-emerald-50" :
          err ? "border-rose-200 bg-rose-50" :
          "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="mt-2 flex items-center gap-3">
          <Icon className="h-9 w-9" color={PRI} />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: PRI }}>
            {title}
          </h1>
        </div>
        <p className="mt-2 text-slate-600">{desc}</p>

        {/* decorative circle */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/40 blur-2xl" />
      </div>

      {/* Content */}
      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_320px]">
        {/* Details card */}
        <div className="rounded-2xl border bg-white p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-slate-800">Chi tiết giao dịch</div>
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              <SkeletonLine w="40%" />
              <SkeletonLine w="55%" />
              <SkeletonLine w="35%" />
              <SkeletonLine w="60%" />
              <SkeletonLine w="50%" />
              <SkeletonLine w="30%" />
            </div>
          ) : (
            <div className="mt-2">
              <Row label="Mã phản hồi:" value={rcText} />
              <Row label="Trạng thái:" value={stText} />
              <Row label="Ngân hàng:" value={bank} />
              <Row
                label="Mã giao dịch:"
                value={
                  txNo && (
                    <span className="inline-flex items-center gap-2">
                      <span>{txNo}</span>
                      <button
                        onClick={() => copy(txNo)}
                        className="rounded border px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
                        title="Sao chép"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )
                }
              />
              <Row label="Thời gian:" value={when} />
              <Row label="Product ID:" value={pid} />
            </div>
          )}
        </div>

        {/* Amount card */}
        <div className="rounded-2xl border bg-white p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-slate-800">Số tiền</div>
            <Banknote className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: PRI }}>
            {loading ? <SkeletonLine w="70%" /> : amountStr}
          </div>

          {success ? (
            <div className="mt-3 text-xs text-emerald-700">
              Đã ghi nhận thanh toán. Tin sẽ được xử lý theo gói bạn chọn.
            </div>
          ) : err ? (
            <div className="mt-3 text-xs text-rose-600">
              Không xác minh được với máy chủ. Bạn có thể quay lại để thử thanh toán lại.
            </div>
          ) : (
            <div className="mt-3 text-xs text-amber-600">
              Giao dịch chưa ở trạng thái thành công. Hãy thử lại nếu cần.
            </div>
          )}

          <div className="mt-5 grid gap-2">
            <Button
              className="w-full text-white"
              style={{ backgroundColor: PRI, borderColor: PRI }}
              onClick={goManage}
            >
              Về quản lý tin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
