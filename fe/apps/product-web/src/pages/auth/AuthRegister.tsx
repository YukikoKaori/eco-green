import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerApi } from "@/api/auth"; 

export default function AuthRegister() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setfullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi({ fullName, phone, password }); 
      nav("/login");
    } catch (err) {
      console.error("Register failed:", err); 
    } finally {
      setLoading(false);
    }
  }

  function onGoogle() {
    window.location.assign("/api/auth/google");
  }
  function onFacebook() {
    window.location.assign("/api/auth/facebook");
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

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">hoặc</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Social */}
        <div className="grid gap-2 mb-5">
          <button
            onClick={onGoogle}
            type="button"
            className="!inline-flex !items-center !justify-center !gap-2 !w-full !h-10 !rounded-full !border !border-gray-200 !bg-white !text-gray-800"
          >
            <GoogleIcon className="w-5 h-5" />
            <span>Đăng ký với Google</span>
          </button>
          <button
            onClick={onFacebook}
            type="button"
            className="!inline-flex !items-center !justify-center !gap-2 !w-full !h-10 !rounded-full !border !border-gray-200 !bg-white !text-gray-800"
          >
            <FacebookIcon className="w-5 h-5" />
            <span>Đăng ký với Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 533.5 544.3" aria-hidden>
      <path fill="#4285f4" d="M533.5 278.4c0-18.4-1.7-36.1-4.9-53.3H272v100.9h147.2c-6.4 34.7-26 64.1-55.6 83.8v69.5h89.9c52.5-48.4 80-119.7 80-200.9z" />
      <path fill="#34a853" d="M272 544.3c72.5 0 133.5-24 178-65.1l-89.9-69.5c-24.9 16.7-56.8 26.6-88.1 26.6-67.7 0-125.2-45.7-145.8-107.1H34.5v67.3C79.2 486.2 169.9 544.3 272 544.3z" />
      <path fill="#fbbc04" d="M126.2 329.1c-9.6-28.8-9.6-60.2 0-88.9V172.9H34.5c-40.5 80.8-40.5 176.9 0 257.7l91.7-101.5z" />
      <path fill="#ea4335" d="M272 106.5c39.4-.6 77.3 14.2 106.1 41.2l79.1-79.1C403.2-8.7 324.3-23.7 249.8 4.2 147.9 42 57.2 100.1 34.5 172.9l91.7 67.3C146.8 178.8 204.3 106.5 272 106.5z" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078V12.07h3.047V9.412c0-3.007 1.79-4.668 4.533-4.668 1.313 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.953.928-1.953 1.88v2.258h3.328l-.532 3.492h-2.796V24C19.612 23.093 24 18.1 24 12.073z" />
    </svg>
  );
}
