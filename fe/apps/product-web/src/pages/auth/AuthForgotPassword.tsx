import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset, resetPassword } from "@/api/auth";

function isValidVietnamPhone(phone: string) {
  return /^0\d{9}$/.test(phone);
}

function isStrongPassword(pw: string) {
  const hasMinLength = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return hasMinLength && hasUpper && hasNumber && hasSpecial;
}

export default function AuthForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const otp = otpDigits.join("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [cooldown, setCooldown] = useState(0);

  const nav = useNavigate();
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccess(null);
    setPhoneError(null);

    const p = phone.trim();

    if (!isValidVietnamPhone(p)) {
      if (!p) {
        setPhoneError("Vui lòng nhập số điện thoại.");
      } else if (p[0] !== "0") {
        setPhoneError("Số điện thoại phải bắt đầu bằng số 0.");
      } else if (p.length !== 10) {
        setPhoneError("Số điện thoại gồm đúng 10 chữ số.");
      } else {
        setPhoneError("Số điện thoại không hợp lệ.");
      }
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(p);
      const msg =
        res.message ||
        "Nếu số điện thoại tồn tại, mã OTP sẽ được gửi đến email đã liên kết.";
      setSuccess(msg);

      setOtpDigits(["", "", "", "", "", ""]);
      setStep(2);
      setCooldown(60);

      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 0);
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message;
      setError(apiMsg || "Không thể gửi yêu cầu đặt lại mật khẩu, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (digit && index < otpInputsRef.current.length - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] ?? "";
    }
    setOtpDigits(next);

    const firstEmpty = next.findIndex((d) => !d);
    const focusIndex = firstEmpty === -1 ? 5 : firstEmpty;
    otpInputsRef.current[focusIndex]?.focus();
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccess(null);

    const p = phone.trim();
    const code = otp.trim();
    const pw = newPassword;

    if (!code || code.length !== 6) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }

    if (!isStrongPassword(pw)) {
      setError(
        "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt."
      );
      return;
    }

    if (pw !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ phone: p, otp: code, newPassword: pw });
      const msg = res.message || "Khôi phục mật khẩu thành công.";
      setSuccess(msg);

      setTimeout(() => {
        nav("/login");
      }, 1000);
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message;
      setError(apiMsg || "Khôi phục mật khẩu thất bại, vui lòng kiểm tra lại OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-[calc(100vh-60px)] flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/images/bg-login.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white/95 shadow-lg p-8 py-6">
        <div className="text-center text-2xl font-bold text-[#0f766e] mb-4">
          Quên mật khẩu
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
            <label className="block">
              <span className="text-sm font-bold text-[#0f766e]">Số điện thoại</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <Input
                  required
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  pattern="0[0-9]{9}"
                  maxLength={10}
                  autoComplete="tel"
                  placeholder="VD: 0981234567"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPhone(value);

                    if (!value) {
                      setPhoneError(null);
                      return;
                    }

                    if (value[0] !== "0") {
                      setPhoneError("Số điện thoại phải bắt đầu bằng số 0.");
                    } else if (value.length !== 10) {
                      setPhoneError("Số điện thoại gồm đúng 10 chữ số.");
                    } else {
                      setPhoneError(null);
                    }
                  }}
                  className="h-10 border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              {phoneError && (
                <p className="mt-1 text-xs text-red-600">{phoneError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Nếu số điện thoại tồn tại, mã OTP sẽ được gửi đến email đã liên kết.
              </p>
            </label>

            <Button
              type="submit"
              disabled={loading || !phone || cooldown > 0}
              aria-busy={loading}
              className="!w-full !h-10 !rounded-full !bg-[#0f766e] !hover:bg-[#0e6a64] !text-white !disabled:opacity-60"
            >
              {loading
                ? "Đang gửi OTP..."
                : cooldown > 0
                ? `Gửi lại sau ${cooldown}s`
                : "Gửi mã OTP"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Nhớ mật khẩu rồi?{" "}
              <Link to="/login" className="text-[#0f766e] font-semibold">
                Đăng nhập
              </Link>
            </p>
          </form>
        ) : (
          // ---------- STEP 2: OTP + MẬT KHẨU MỚI ----------
          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            {/* OTP 6 ô */}
            <div>
              <span className="text-sm font-bold text-[#0f766e]">Mã OTP</span>
              <p className="mt-1 text-xs text-gray-500">
                Nhập 6 số OTP được gửi đến email liên kết với số điện thoại{" "}
                <span className="font-semibold">{phone}</span>.
              </p>
              <div className="mt-2 flex justify-center gap-2 mb-1">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el: HTMLInputElement | null) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-10 h-10 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f766e]"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Mật khẩu mới */}
            <label className="block">
              <span className="text-sm font-bold text-[#0f766e]">Mật khẩu mới</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
                <Lock className="w-4 h-4 text-gray-500" />
                <Input
                  required
                  name="newPassword"
                  type={showNewPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Ít nhất 8 ký tự, gồm chữ hoa, số, ký tự đặc biệt"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 border-0 shadow-none focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="!ml-auto text-gray-500 bg-white"
                  aria-label={showNewPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            {/* Xác nhận mật khẩu */}
            <label className="block">
              <span className="text-sm font-bold text-[#0f766e]">
                Xác nhận mật khẩu mới
              </span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
                <Lock className="w-4 h-4 text-gray-500" />
                <Input
                  required
                  name="confirmPassword"
                  type={showConfirmPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 border-0 shadow-none focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  className="!ml-auto text-gray-500 bg-white"
                  aria-label={showConfirmPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </label>

            <Button
              type="submit"
              disabled={loading || otp.length !== 6 || !newPassword || !confirmPassword}
              aria-busy={loading}
              className="!w-full !h-10 !rounded-full !bg-[#0f766e] !hover:bg-[#0e6a64] !text-white !disabled:opacity-60"
            >
              {loading ? "Đang khôi phục..." : "Đổi mật khẩu"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Không nhận được OTP?{" "}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpDigits(["", "", "", "", "", ""]);
                  setNewPassword("");
                  setConfirmPassword("");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-[#0f766e] font-semibold underline"
              >
                Gửi lại
              </button>{" "}
              hoặc{" "}
              <Link to="/login" className="text-[#0f766e] font-semibold">
                Đăng nhập
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
