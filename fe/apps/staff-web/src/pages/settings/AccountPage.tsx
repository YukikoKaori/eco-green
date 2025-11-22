import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { updatePassword } from "@/api/auth";

function isStrongPassword(pw: string) {
  const hasMinLength = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return hasMinLength && hasUpper && hasNumber && hasSpecial;
}

export default function AccountPage() {
  const [email, setEmail] = useState("kaorisme@gmaj.com");

  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);

  const [showCur, setShowCur] = useState(false);
  const [showN1, setShowN1] = useState(false);
  const [showN2, setShowN2] = useState(false);

  const [newPwError, setNewPwError] = useState<string | null>(null);

  const onChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cur) {
      sonnerToast.error("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    if (!isStrongPassword(n1)) {
      sonnerToast.error(
        "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt."
      );
      return;
    }

    if (n1 !== n2) {
      sonnerToast.error("Mật khẩu nhập lại không khớp.");
      return;
    }

    if (cur === n1) {
      sonnerToast.error("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setLoadingPwd(true);

    try {
      const res = await updatePassword({
        currentPassword: cur,
        newPassword: n1,
        confirmNewPassword: n2,
      });

      const msg =
        res?.message ||
        "Đổi mật khẩu thành công";

      sonnerToast.success("Đổi mật khẩu thành công", {
        description: msg,
      });

      setCur("");
      setN1("");
      setN2("");
      setNewPwError(null);
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message;
      sonnerToast.error("Đổi mật khẩu thất bại", {
        description:
          apiMsg || "Vui lòng kiểm tra lại mật khẩu hiện tại hoặc thử lại sau.",
      });
    } finally {
      setLoadingPwd(false);
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setN1(value);

    if (!value) {
      setNewPwError(null);
      return;
    }

    if (!isStrongPassword(value)) {
      setNewPwError(
        "Mật khẩu chưa đủ mạnh: cần ít nhất 8 ký tự, có chữ hoa, số và ký tự đặc biệt."
      );
    } else {
      setNewPwError(null);
    }
  };

  const isSubmitDisabled =
    loadingPwd || !cur || !n1 || !n2 || !!newPwError;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold border-b pb-2 text-[#246f67]">
        Thay đổi mật khẩu
      </h2>

      <section className="space-y-3 bg-white rounded-lg shadow p-4 border">
        <h3 className="font-semibold text-[#246f67]">Đổi mật khẩu</h3>
        <form onSubmit={onChangePwd} className="space-y-3">
          <div className="flex flex-col gap-3">
            {/* Mật khẩu hiện tại */}
            <div className="flex flex-col space-y-2">
              <Label>Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input
                  type={showCur ? "text" : "password"}
                  value={cur}
                  onChange={(e) => setCur(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowCur((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  aria-label={showCur ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className="flex flex-col space-y-1">
              <Label>Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showN1 ? "text" : "password"}
                  value={n1}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  placeholder="Ít nhất 8 ký tự, gồm chữ hoa, số, ký tự đặc biệt"
                  required
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowN1((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  aria-label={showN1 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showN1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPwError ? (
                <span className="text-xs text-red-500">{newPwError}</span>
              ) : (
                <span className="text-xs text-gray-500">
                  Gợi ý: nên dùng chữ hoa, số và ký tự đặc biệt.
                </span>
              )}
            </div>

            {/* Nhập lại mật khẩu mới */}
            <div className="flex flex-col space-y-2">
              <Label>Nhập lại mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showN2 ? "text" : "password"}
                  value={n2}
                  onChange={(e) => setN2(e.target.value)}
                  placeholder="Nhập lại để xác nhận"
                  required
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowN2((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  aria-label={showN2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showN2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-gradient-to-r from-[#246f67] to-[#2ba195] !text-sm text-white hover:from-[#1e5c55] hover:to-[#238678]"
            >
              {loadingPwd ? "Đang đổi..." : "Đổi mật khẩu"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
