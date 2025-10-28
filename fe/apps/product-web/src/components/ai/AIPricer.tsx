import { useEffect, useMemo, useState } from "react";
import { X, Sparkles, Loader2, ExternalLink, RefreshCcw, Bot, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { suggestPrice } from "@/api/aiPricing";

type Payload = {
  title?: string;
  brand?: string;
  modelName?: string;
  versionName?: string;
  batteryHealth?: string;
  mileageKm?: string;
  manufactureYear?: string;
};

export default function AIPriceChat({
  open, onOpenChange, payload, onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payload: Payload;
  onApply: (priceVnd: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [range, setRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [value, setValue] = useState(0);
  const [error, setError] = useState("");

  const cleanDigits = (s: string) => (s || "").replace(/[^\d]/g, "");
  const fmt = (n: number) => n.toLocaleString("vi-VN");
  const step = useMemo(() => {
    const span = Math.max(1, range.max - range.min);
    return Math.min(5_000_000, Math.max(500_000, Math.round(span / 100)));
  }, [range]);

  function parsePriceRange(s: string) {
    const m = (s || "").split("-").map((x) => Number(cleanDigits(x))).filter(Boolean);
    if (m.length >= 2) return { min: m[0], max: m[1] };
    if (m.length === 1) return { min: m[0], max: m[0] };
    return { min: 0, max: 0 };
  }
  const roundTo = (n: number, stepN = 1_000_000) => Math.round(n / stepN) * stepN;

  const hasAnyInput = useMemo(
    () =>
      !!(
        (payload.title && payload.title.trim()) ||
        payload.brand ||
        payload.modelName ||
        payload.versionName ||
        payload.batteryHealth ||
        payload.mileageKm ||
        payload.manufactureYear
      ),
    [payload]
  );

  async function run() {
    if (!hasAnyInput) {
      setLoading(false);
      setReason("");
      setSources([]);
      setRange({ min: 0, max: 0 });
      setValue(0);
      setError("Nhập thông tin để AI gợi ý cho bạn.");
      return;
    }

    setError("");
    setLoading(true);
    setReason("");
    setSources([]);
    try {
      const res = await suggestPrice(payload, { timeout: 60000 });
      const { min, max } = parsePriceRange(String(res?.price ?? ""));
      const _min = roundTo(min);
      const _max = roundTo(max || min);
      if (_min <= 0) setError("AI chưa trả về khoảng giá hợp lệ.");
      setRange({ min: _min, max: Math.max(_min, _max) });
      setValue(_min > 0 ? _min : 0);
      if (res?.reason) setReason(res.reason);
      if (Array.isArray(res?.sources)) setSources(res.sources);
    } catch (e: any) {
      setError(e?.code === "ECONNABORTED" ? "AI phản hồi chậm. Thử lại sau." : "Không gọi được AI gợi ý giá.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (open) run(); }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/15 backdrop-blur-[2px]" onClick={() => onOpenChange(false)} />

      <div className="fixed bottom-6 right-4 z-[71]">
        <div className="relative rounded-2xl p-[1.2px] bg-gradient-to-br from-zinc-300 via-slate-200 to-gray-300">
          <div className="w-[392px] max-h-[78vh] rounded-2xl overflow-hidden bg-white/90 backdrop-blur border border-zinc-200 shadow-xl flex flex-col">
            {/* Header */}
            <div className="relative px-4 py-3 bg-white">
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
              <div className="flex items-center gap-2">
                <img src="/images/eco-bot.png" alt="EcoAI" className="w-7 h-7 object-contain" draggable="false" />
                <div className="font-semibold text-[#14b8a6]">EcoAI gợi ý giá tốt</div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="absolute right-2 top-2 p-1 rounded hover:bg-slate-100 focus:outline-none"
                aria-label="Đóng"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* chips tóm tắt */}
              <div className="flex flex-wrap gap-2 text-xs">
                {payload.brand && <span className="rounded-full bg-zinc-50 text-slate-700 border border-emerald-200/40 px-2.5 py-1">Hãng: {payload.brand}</span>}
                {payload.modelName && <span className="rounded-full bg-zinc-50 text-slate-700 border border-emerald-200/40 px-2.5 py-1">Dòng: {payload.modelName}</span>}
                {payload.versionName && <span className="rounded-full bg-zinc-50 text-slate-700 border border-emerald-200/40 px-2.5 py-1">Phiên bản: {payload.versionName}</span>}
                {payload.manufactureYear && <span className="rounded-full bg-zinc-50 text-slate-700 border border-emerald-200/40 px-2.5 py-1">Năm: {payload.manufactureYear}</span>}
                {payload.mileageKm && (
                  <span className="rounded-full bg-zinc-50 text-slate-700 border border-emerald-200/40 px-2.5 py-1">
                    ODO: {Number(cleanDigits(payload.mileageKm)).toLocaleString("vi-VN")} km
                  </span>
                )}
                {payload.batteryHealth && <span className="rounded-full bg-zinc-50 text-slate-700 border border-emerald-200/40 px-2.5 py-1">Pin: {payload.batteryHealth}</span>}
              </div>

              {/* Trạng thái */}
              {loading && (
                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-slate-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  Đang phân tích dữ liệu…
                </div>
              )}

              {!!error && (
                <div className="rounded-xl border border-sky-200 bg-sky-50 text-sky-800 p-3 text-sm flex gap-2">
                  <Info className="w-4 h-4 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              {range.min > 0 && !loading && !error && (
                <>
                  <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-[#14b8a6] font-semibold">
                      <Bot className="w-4 h-4" /> Khoảng giá đề xuất
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-zinc-100 text-slate-700 border-zinc-200">
                        Thấp nhất: {fmt(range.min)} đ
                      </Badge>
                      <Badge variant="secondary" className="bg-zinc-100 text-slate-700 border-zinc-200">
                        Cao nhất: {fmt(range.max)} đ
                      </Badge>
                    </div>
                    <div className="mt-3 px-1">
                      <Slider
                        min={range.min}
                        max={range.max}
                        step={step}
                        value={[value || range.min]}
                        onValueChange={(v) => setValue(v[0])}
                        className="
                          [&>div]:bg-zinc-200
                          [&_[role=slider]]:border-slate-400
                          [&_[role=slider]]:ring-emerald-100
                          [&_[role=slider]]:data-[state=on]:bg-white
                        "
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-sm text-slate-500">Giá bạn chọn</div>
                      <div className="text-2xl font-extrabold text-[#14b8a6] tracking-tight">{fmt(value)} đ</div>
                    </div>
                  </div>

                  {!!reason && (
                    <div className="rounded-xl border border-zinc-200 bg-white p-3 text-sm text-slate-700">
                      <div className="font-semibold text-[#14b8a6] mb-1">Vì sao AI gợi ý khoảng này?</div>
                      <div className="whitespace-pre-wrap">{reason}</div>
                    </div>
                  )}

                  {sources?.length > 0 && (
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                      <div className="text-sm font-semibold text-slate-800 mb-2">Nguồn tham khảo</div>
                      <ul className="space-y-2 text-sm">
                        {sources.map((url, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ExternalLink className="w-4 h-4 mt-0.5 text-slate-500" />
                            <a href={url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline break-all">
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 p-3 flex items-center justify-between bg-white/90 backdrop-blur">
              <Button
                size="sm"
                variant="outline"
                className="border-zinc-300 text-[#14b8a6] hover:bg-zinc-100"
                onClick={run}
              >
                <Sparkles className="w-4 h-4 mr-2 text-[#14b8a6]" /> Gợi ý lại
              </Button>
              <Button
                size="sm"
                className="!bg-[#14b8a6] text-white hover:bg-slate-800"
                disabled={!value || value <= 0}
                onClick={() => { onApply(value); onOpenChange(false); }}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
