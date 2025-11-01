import { X, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function wasAINudgeDismissed() {
  try { return localStorage.getItem("eco_ai_nudge_dismissed") === "1"; }
  catch { return false; }
}

export type AINudgeFields = {
  brandName?: string;
  modelName?: string;
  versionName?: string;
  year?: string;
  mileageKm?: string;
  batteryHealth?: string;
  batteryTypeId?: string;
  capacityKwh?: string;
  voltageV?: string;
};

export default function AINudgeDialog({
  open,
  onOpenChange,
  fields,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fields: AINudgeFields;
}) {
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => { if (open) setDontShow(false); }, [open]);

  const checklist = useMemo(() => ([
    { label: "Hãng xe", ok: !!fields.brandName },
    { label: "Dòng xe", ok: !!fields.modelName || !!fields.batteryTypeId },
    { label: "Năm sản xuất", ok: !!fields.year },
    { label: "Số km đã đi (ODO)", ok: !!fields.mileageKm },
    { label: "Sức khỏe pin (%)", ok: !!fields.batteryHealth },
  ]), [fields]);

  function close() {
    if (dontShow) {
      try { localStorage.setItem("eco_ai_nudge_dismissed", "1"); } catch {}
    }
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-[1px]" onClick={close} />
      {/* tăng khoảng cách với top */}
      <div className="fixed z-[71] inset-x-4 sm:inset-auto sm:right-6 sm:left-6 top-28 md:top-32">
        <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-100 bg-white shadow-xl overflow-hidden">
          {/* header */}
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="inline-grid place-items-center w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200">
                <img src="/images/eco-bot.png" alt="EcoAI" className="w-5 h-5 object-contain" />
              </span>
              <div className="text-[17px] font-semibold text-[#0f766e]">Đăng bài nhanh hơn với EcoAI</div>
            </div>
            <button
              onClick={close}
              aria-label="Đóng"
              className="absolute right-3 top-3 rounded-md p-1 text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* body */}
          <div className="grid md:grid-cols-[1fr,220px] gap-0 md:gap-2">
            <div className="px-5 pb-4">
              <p className="text-sm text-slate-600">
                Điền vài thông tin cơ bản, EcoAI sẽ gợi ý <b>tiêu đề</b>, <b>mô tả</b> và <b>khoảng giá</b>.
                Tính năng này chỉ áp dụng với các tin đăng về xe.
              </p>

              <div className="mt-3 text-[15px] font-semibold text-[#0f766e]">Bạn cần chuẩn bị:</div>
              <ul className="mt-2 space-y-2">
                {checklist.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-[14px]">
                    <CheckCircle2 className={`w-4 h-4 ${c.ok ? "text-emerald-600" : "text-slate-300"}`} />
                    <span className={c.ok ? "text-slate-800" : "text-slate-500"}>{c.label}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-xs text-slate-500">
                <b>Phiên bản</b> là <i>không bắt buộc</i>. Khi đã điền đủ, hãy bấm
                <b className="text-emerald-700"> “Gợi ý giá EcoAI”</b> ở góc dưới phải để mở.
              </p>

              {/* hàng checkbox trái + nút phải */}
              <div className="mt-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="accent-[#14b8a6]"
                    checked={dontShow}
                    onChange={(e) => setDontShow(e.target.checked)}
                  />
                  Đừng hiện lại lần sau
                </label>

                <button
                  type="button"
                  onClick={close}
                  className="!px-4 !py-2 !text-sm rounded-lg border border-slate-200 text-[#0f766e] hover:bg-slate-50 ml-auto md:ml-0"
                >
                  Để sau
                </button>
              </div>
            </div>

            {/* logo */}
            <div className="hidden md:flex items-center justify-center relative bg-gradient-to-b from-emerald-50 to-transparent">
              <div className="relative w-[160px] h-[160px]">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full blur-2xl opacity-70"
                  style={{
                    background:
                      "radial-gradient(60% 60% at 50% 50%, rgba(20,184,166,.35) 0%, rgba(20,184,166,.18) 35%, rgba(20,184,166,0) 70%)",
                  }}
                />
                <img
                  src="/images/eco-bot.png"
                  alt="EcoAI"
                  className="absolute inset-0 m-auto w-[150px] h-[150px] object-contain drop-shadow"
                  style={{
                    filter:
                      "drop-shadow(0 0 8px rgba(20,184,166,.45)) drop-shadow(0 8px 12px rgba(16,185,129,.25))",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
