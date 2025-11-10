import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerApi} from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthRegister() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setfullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const { setUser } = useAuth();

  async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (loading) return;
  setLoading(true);

  try {
    const name = fullName.trim();
    const ph = phone.trim();
    const pw = password;

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

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
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

          <label className="block">
            <span className="text-sm font-bold text-[#0f766e]">Số điện thoại</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <Input
                required
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-[#0f766e]">Mật khẩu</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
              <Lock className="w-4 h-4 text-gray-500" />
              <Input
                required
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="Tối thiểu 8 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 border-0 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="!ml-auto !1text-gray-500 !bg-white"
                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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

