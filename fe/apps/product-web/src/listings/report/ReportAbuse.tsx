// src/listings/components/ReportAbuse.tsx
import { useMemo, useState } from "react";
import { Flag, MoreVertical } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  productId: string;
  className?: string;       // để đặt absolute vị trí (right-3 top-3)
  defaultPhone?: string;
  defaultEmail?: string;
};

const REASONS = [
  { id: "scam", label: "Lừa đảo" },
  { id: "duplicate", label: "Trùng lặp" },
  { id: "sold", label: "Tin đã bán" },
  { id: "no-contact", label: "Không liên lạc được" },
  { id: "incorrect", label: "Thông tin không đúng thực tế" },
  { id: "defect-after", label: "Hư hỏng sau khi mua" },
  { id: "other", label: "Lý do khác" },
] as const;

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

  const canSubmit = useMemo(() => !!reason && !!phone, [reason, phone]);

  async function submit() {
    if (!canSubmit) {
      toast.info("Vui lòng chọn lý do và nhập số điện thoại.");
      return;
    }
    try {
      setBusy(true);
      await api.post("/reports", {
        productId,
        reason,
        note: note?.trim() || null,
        phone: phone?.trim(),
        email: email?.trim() || null,
      });
      toast.success("Đã gửi báo cáo. Cảm ơn bạn!");
      setDialogOpen(false);
      setReason("");
      setNote("");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gửi báo cáo thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Nút ba chấm + menu */}
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
            <Flag className="mr-2 h-4 w-4" />
            Báo cáo tin đăng
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal báo cáo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className ="text-[#008377]">Báo cáo vi phạm</DialogTitle>
            <DialogDescription>Cho chúng tôi biết vấn đề với tin đăng này.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-3">
              <Label className="font-medium">
                Tin rao này có vấn đề gì <span className="text-rose-600">*</span>
              </Label>
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                {REASONS.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem id={`report-${r.id}`} value={r.id} />
                    <span>{r.label}</span>
                  </label>
                ))}
              </RadioGroup>

              {reason === "other" && (
                <div className="mt-2">
                  <Label htmlFor="report-note">Mô tả thêm</Label>
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

            <div className="space-y-2">
              <Label className="font-medium text-[#008377] text-sm">Thông tin liên hệ</Label>
              <div>
                <Label htmlFor="report-phone">Điện thoại <span className="text-rose-600">*</span></Label>
                <Input
                  id="report-phone"
                  inputMode="tel"
                  placeholder="Điện thoại của bạn"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="report-email">Email</Label>
                <Input
                  id="report-email"
                  type="email"
                  placeholder="Email của bạn (không bắt buộc)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={busy}>
              Hủy
            </Button>
            <Button onClick={submit} disabled={!canSubmit || busy} className="!bg-[#00C4B4] hover:bg-[#00a99d] text-white">
              <Flag className="mr-2 h-4 w-4" />
              Gửi báo cáo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
