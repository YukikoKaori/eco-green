import { useMemo, useState } from "react";
import { Flag, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/api/reports";

const BRAND = "#008377";
const BRAND_SOFT = "#00C4B4";

type Props = {
  productId: string;
  className?: string;
  defaultPhone?: string;
  defaultEmail?: string;
};

const REASONS = [
  { id: "scam", label: "Lừa đảo" },
  { id: "duplicate", label: "Trùng lặp" },
  { id: "sold", label: "Hàng đã bán" },
  { id: "no-contact", label: "Không liên lạc được" },
  { id: "incorrect", label: "Thông tin không đúng thực tế" },
  { id: "counterfeit", label: "Hàng giả, hàng nhái, hàng dựng" },
  { id: "defect-after", label: "Hàng hư hỏng sau khi mua" },
  { id: "other", label: "Lý do khác" },
] as const;

const REASON_LABELS = Object.fromEntries(REASONS.map(r => [r.id, r.label])) as Record<string, string>;

function ReasonRow({
  value,
  current,
  onSelect,
  children,
}: {
  value: string;
  current: string;
  onSelect: (val: string) => void;
  children: React.ReactNode;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        "w-full text-left px-3 py-2 rounded-xl border transition flex items-center gap-3",
        selected
          ? "border-[color:var(--accent,#f59e0b)] bg-amber-50/40 shadow-[inset_0_0_0_1px_rgba(245,158,11,.15)]"
          : "border-slate-200 hover:bg-slate-50",
      ].join(" ")}
      style={{ ["--accent" as any]: BRAND_SOFT }}
    >
      <span
        className={[
          "shrink-0 inline-flex items-center justify-center rounded-full border h-4 w-4",
          selected ? "border-[color:var(--accent,#f59e0b)]" : "border-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "block h-2.5 w-2.5 rounded-full",
            selected ? "bg-[color:var(--accent,#f59e0b)]" : "bg-transparent",
          ].join(" ")}
        />
      </span>

      <span className="text-[15px] text-slate-800">{children}</span>
    </button>
  );
}

export default function ReportAbuse({
  productId,
  className = "",
  defaultPhone = "",
  defaultEmail = "",
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => {
    if (!reason) return false;
    const phoneDigits = phone.replace(/[^\d]/g, "");
    return phoneDigits.length >= 8;
  }, [reason, phone]);

  async function submit() {
    if (!canSubmit) {
      toast.info("Vui lòng chọn lý do và nhập số điện thoại hợp lệ.");
      return;
    }
    const phoneTrim = phone.trim();
    const emailTrim = email.trim() || undefined;

    const reportReason =
      reason === "other" ? (note?.trim() || "Lý do khác") : (REASON_LABELS[reason] || "Báo cáo vi phạm");

    try {
      setBusy(true);
      await createReport({ productId, phone: phoneTrim, email: emailTrim, reportReason });

      toast.success("Đã gửi báo cáo. Cảm ơn bạn! Bộ phận kiểm duyệt sẽ xem xét sớm.");
      setDialogOpen(false);
      setReason("");
      setNote("");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Gửi báo cáo thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className={`rounded-full shadow bg-white/95 hover:bg-white ${className}`}
            title="Tùy chọn"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[200px]">
          <DropdownMenuItem
            onClick={() => {
              setMenuOpen(false);
              setDialogOpen(true);
            }}
            className="cursor-pointer"
          >
            <Flag className="mr-2 h-4 w-4 text-[color:var(--brand,#008377)]" style={{ ["--brand" as any]: BRAND }} />
            Báo cáo tin đăng
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal báo cáo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-[color:var(--brand,#008377)]" style={{ ["--brand" as any]: BRAND }}>
              Báo cáo vi phạm
            </DialogTitle>
            <DialogDescription>Cho chúng tôi biết vấn đề với tin đăng này.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {/* Lý do */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-slate-800">
                  Tin rao này có vấn đề gì <span className="text-rose-600">*</span>
                </Label>
              </div>

              <div className="space-y-2">
                {REASONS.map((r) => (
                  <ReasonRow key={r.id} value={r.id} current={reason} onSelect={setReason}>
                    {r.label}
                  </ReasonRow>
                ))}
              </div>

              {reason === "other" && (
                <div className="mt-3">
                  <Label htmlFor="report-note" className="text-slate-700">
                    Mô tả thêm
                  </Label>
                  <Textarea
                    id="report-note"
                    placeholder="Mô tả ngắn gọn vấn đề…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Liên hệ */}
            <div className="space-y-3">
              <Label className="font-medium text-sm" style={{ color: BRAND }}>
                Thông tin liên hệ
              </Label>
              <div className="space-y-1.5">
                <Label htmlFor="report-phone">
                  Điện thoại <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="report-phone"
                  inputMode="tel"
                  placeholder="Điện thoại của bạn"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="report-email">
                  Email <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="report-email"
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={busy}>
              Hủy
            </Button>
            <Button
              onClick={submit}
              disabled={!canSubmit || busy}
              className="text-white"
              style={{ backgroundColor: BRAND_SOFT }}
            >
              <Flag className="mr-2 h-4 w-4" />
              Gửi báo cáo
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </>
  );
}
