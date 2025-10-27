import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function fmtCurrency(v?: string | null) {
  if (!v) return "--";
  const n = Number(v);
  const amount = Number.isFinite(n) ? Math.round(n / 100) : 0;
  return amount.toLocaleString("vi-VN") + " đ";
}

function fmtDate(v?: string | null) {
  if (!v || v.length !== 14) return "--";
  const y = v.slice(0, 4);
  const m = v.slice(4, 6);
  const d = v.slice(6, 8);
  const hh = v.slice(8, 10);
  const mm = v.slice(10, 12);
  const ss = v.slice(12, 14);
  return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
}

export default function VNPayReturn() {
  const nav = useNavigate();
  const { search } = useLocation();

  const qs = useMemo(() => new URLSearchParams(search), [search]);

  let pid = qs.get("pid") ?? "";
  if (!pid) {
    try {
      const raw = localStorage.getItem("last_post_created");
      if (raw) {
        const parsed = JSON.parse(raw);
        pid = parsed?.productId || "";
      }
    } catch {}
  }

  const vnp_ResponseCode = qs.get("vnp_ResponseCode");      
  const vnp_TransactionStatus = qs.get("vnp_TransactionStatus");
  const vnp_Amount = qs.get("vnp_Amount");
  const vnp_BankCode = qs.get("vnp_BankCode");
  const vnp_TransactionNo = qs.get("vnp_TransactionNo");
  const vnp_PayDate = qs.get("vnp_PayDate");

  const isSuccess =
    (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") ||
    (vnp_ResponseCode === "00" && !vnp_TransactionStatus); 

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div
        className={`rounded-xl border p-5 ${
          isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        <h1 className="text-lg font-semibold mb-1">
          {isSuccess ? "Thanh toán thành công" : "Thanh toán chưa thành công"}
        </h1>
        <p className="text-sm opacity-80">
          {isSuccess
            ? "Hệ thống đã nhận giao dịch từ VNPay. Bạn có thể quay lại quản lý tin."
            : "Giao dịch không ở trạng thái thành công. Bạn có thể thử thanh toán lại."}
        </p>
      </div>

      <div className="mt-5 rounded-xl border bg-white p-5">
        <div className="text-sm font-semibold mb-3 text-slate-700">Chi tiết giao dịch</div>
        <ul className="text-sm space-y-1 text-slate-600">
          <li>
            <span className="inline-block w-36 text-slate-500">Mã phản hồi:</span>
            <b className="text-slate-800">{vnp_ResponseCode || "--"}</b>
          </li>
          <li>
            <span className="inline-block w-36 text-slate-500">Trạng thái:</span>
            <b className="text-slate-800">{vnp_TransactionStatus || "--"}</b>
          </li>
          <li>
            <span className="inline-block w-36 text-slate-500">Số tiền:</span>
            <b className="text-slate-800">{fmtCurrency(vnp_Amount)}</b>
          </li>
          <li>
            <span className="inline-block w-36 text-slate-500">Ngân hàng:</span>
            <b className="text-slate-800">{vnp_BankCode || "--"}</b>
          </li>
          <li>
            <span className="inline-block w-36 text-slate-500">Mã giao dịch:</span>
            <b className="text-slate-800">{vnp_TransactionNo || "--"}</b>
          </li>
          <li>
            <span className="inline-block w-36 text-slate-500">Thời gian:</span>
            <b className="text-slate-800">{fmtDate(vnp_PayDate)}</b>
          </li>
          <li>
            <span className="inline-block w-36 text-slate-500">Product ID:</span>
            <b className="text-slate-800">{pid || "(không có)"}</b>
          </li>
        </ul>

        <div className="flex flex-wrap gap-2 mt-5">
          <Button
            variant="outline"
            className="border-[#246f67] text-[#246f67]"
            onClick={() => nav("/post/manage", { replace: true })}
          >
            Về quản lý tin
          </Button>

          {pid ? (
            <Button
              className="text-white bg-[#246f67] hover:bg-[#1f5f58]"
              onClick={() =>
                nav(`/postnotice?productId=${encodeURIComponent(pid)}`, { replace: true })
              }
            >
              {isSuccess ? "Xem lại gói đã chọn" : "Thanh toán lại"}
            </Button>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        * Đây là trang thông báo tạm thời, không xác thực chữ ký VNPay. Khi BE sẵn sàng,
        bạn có thể chuyển sang cơ chế verify để tăng độ tin cậy.
      </p>
    </div>
  );
}
