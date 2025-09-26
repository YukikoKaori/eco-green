import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthLogin() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState(""); // phone/email
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // TODO: gọi API đăng nhập email/mật khẩu
      // await api.login({ phoneOrEmail: identifier.trim(), password });
      nav("/");
    } finally {
      setLoading(false);
    }
  }

  function onGoogle() {
    // Nên cấu hình qua biến môi trường để backend trả về URL OAuth (PKCE/CSRF)
    window.location.assign("/api/auth/google");
  }
  function onFacebook() {
    window.location.assign("/api/auth/facebook");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-start md:items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-5 md:p-6">
        <h1 className="text-center text-xl md:text-2xl font-extrabold text-[#0f766e]">
          Đăng nhập
        </h1>

        {/* Social */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-full border border-gray-200 bg-white text-gray-800 aria-disabled:opacity-50"
            aria-disabled={loading}
          >
            <GoogleIcon className="w-5 h-5" />
            <span>Tiếp tục với Google</span>
          </button>
          <button
            type="button"
            onClick={onFacebook}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-full border border-gray-200 bg-white text-gray-800 aria-disabled:opacity-50"
            aria-disabled={loading}
          >
            <FacebookIcon className="w-5 h-5" />
            <span>Tiếp tục với Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">hoặc</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <label className="block">
            <span className="text-sm text-gray-700">Số điện thoại / Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <Input
                required
                name="identifier"
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="ban@vidu.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-10 border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Mật khẩu</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
              <Lock className="w-4 h-4 text-gray-500" />
              <Input
                required
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 border-0 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="ml-auto text-gray-500"
                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={showPw}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
              Nhớ tài khoản
            </label>
            <Link to="/forgot" className="text-sm text-[#0f766e]">
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading || !identifier || !password}
            aria-busy={loading}
            className="w-full h-10 rounded-full bg-[#0f766e] hover:bg-[#0e6a64] text-white disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-[#0f766e] font-semibold">
              Đăng ký
            </Link>
          </p>
        </form>
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
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078V12.07h3.047V9.412c0-3.007 1.79-4.668 4.533-4.668 1.313 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.953.928-1.953 1.88v2.258h3.328l-.532 3.492h-2.796V24C19.612 23.093 24 18.1 24 12.073z"
      />
    </svg>
  );
}
