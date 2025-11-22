import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerApi } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";

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

export default function AuthRegister() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setfullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const nav = useNavigate();
  const { setUser } = useAuth(); 

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setPhoneError(null);
    setPasswordError(null);

    const name = fullName.trim();
    const ph = phone.trim();
    const pw = password;

    if (!name) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }

    if (!isValidVietnamPhone(ph)) {
      if (!ph) {
        setPhoneError("Vui lòng nhập số điện thoại.");
      } else if (ph[0] !== "0") {
        setPhoneError("Số điện thoại phải bắt đầu bằng số 0.");
      } else if (ph.length !== 10) {
        setPhoneError("Số điện thoại gồm đúng 10 chữ số.");
      } else {
        setPhoneError("Số điện thoại không hợp lệ.");
      }
      setError("Thông tin không hợp lệ, vui lòng kiểm tra lại.");
      return;
    }
    if (!pw) {
      setPasswordError("Vui lòng nhập mật khẩu.");
      setError("Thông tin không hợp lệ, vui lòng kiểm tra lại.");
      return;
    }

    if (!isStrongPassword(pw)) {
      setPasswordError(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt."
      );
      setError("Thông tin không hợp lệ, vui lòng kiểm tra lại.");
      return;
    }

    setLoading(true);

    try {
      await registerApi({ fullName: name, phone: ph, password: pw });

      alert("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
      nav("/login");
    } catch (err: any) {
      console.error("Register failed:", err);
      alert(err?.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại.");
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
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white/95 shadow-lg p-8">
        <div className="text-center text-3xl font-bold text-[#0f766e] mb-6">
          Tạo tài khoản
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Họ và tên */}
          <label className="block">
            <span className="text-sm font-bold text-[#0f766e]">Họ và tên</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <Input
                required
                name="name"
                type="text"
                placeholder="Nhập đầy đủ họ và tên"
                value={fullName}
                onChange={(e) => setfullName(e.target.value)}
                className="h-10 border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </label>

          {/* Số điện thoại */}
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
                    setPhoneError("Số điện thoại Việt Nam phải bắt đầu bằng số 0.");
                  } else if (value.length !== 10) {
                    setPhoneError("Số điện thoại Việt Nam gồm đúng 10 chữ số.");
                  } else {
                    setPhoneError(null);
                  }
                }}
                className="h-10 border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-xs text-red-600">
                {phoneError}
              </p>
            )}
          </label>

          {/* Mật khẩu */}
          <label className="block">
            <span className="text-sm font-bold text-[#0f766e]">Mật khẩu</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
              <Lock className="w-4 h-4 text-gray-500" />
              <Input
                required
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="Tối thiểu 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt"
                value={password}
                onChange={(e) => {
                  const pw = e.target.value;
                  setPassword(pw);

                  if (!pw) {
                    setPasswordError(null);
                  } else if (!isStrongPassword(pw)) {
                    setPasswordError(
                      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt."
                    );
                  } else {
                    setPasswordError(null);
                  }
                }}
                className="h-10 border-0 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="!ml-auto !text-gray-500 !bg-white"
                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-xs text-red-600">
                {passwordError}
              </p>
            )}
          </label>

          <Button
            type="submit"
            disabled={loading || !fullName || !phone || !password}
            aria-busy={loading}
            className="!w-full !h-10 !rounded-full !bg-[#0f766e] !hover:bg-[#0e6a64] !text-white !disabled:opacity-60"
          >
            {loading ? "Đang tạo..." : "Tạo tài khoản"}
          </Button>

          <p className="text-center text-sm text-gray-600 mb-3">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-[#0f766e] font-semibold">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
