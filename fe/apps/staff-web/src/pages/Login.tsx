import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginApi, getMe } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import ReCAPTCHA from "react-google-recaptcha";

function Typewriter({
  texts,
  typingSpeed = 45,
  deletingSpeed = 28,
  pause = 1400,
  loop = true,
  className = "",
}: {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pause?: number;
  loop?: boolean;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [sub, setSub] = useState("");
  const [del, setDel] = useState(false);

  useEffect(() => {
    if (!texts.length) return;
    const full = texts[i % texts.length];

    if (!del && sub === full) {
      const t = setTimeout(() => setDel(true), pause);
      return () => clearTimeout(t);
    }

    if (del && sub === "") {
      setDel(false);
      setI((x) => (x + 1) % texts.length);
      if (!loop && i + 1 >= texts.length) return;
    }

    const timer = setTimeout(
      () => setSub((s) => (del ? s.slice(0, -1) : full.slice(0, s.length + 1))),
      del ? deletingSpeed : typingSpeed
    );
    return () => clearTimeout(timer);
  }, [texts, i, sub, del, typingSpeed, deletingSpeed, pause, loop]);

  return (
    <div className={className}>
      {sub}
      <span className="ml-1 opacity-60 animate-pulse">|</span>
    </div>
  );
}

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const nav = useNavigate();
  const { setUser } = useAuth();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const p = phone.trim();
    if (!/^\d{9,11}$/.test(p)) return setErr("Số điện thoại không hợp lệ (9–11 chữ số).");
    if (!password) return setErr("Vui lòng nhập mật khẩu.");
    if (siteKey && !captchaToken) return setErr("Vui lòng xác nhận captcha trước khi đăng nhập.");

    try {
      setLoading(true);
      setErr(null);

      const res = await loginApi({
        phone: p,
        password,
        ...(siteKey ? { recaptchaToken: captchaToken! } : {}),
      });

      const tokenRaw = res.token;
      if (!tokenRaw) throw new Error("Không tìm thấy token trong phản hồi.");
      const bare = tokenRaw.startsWith("Bearer ") ? tokenRaw.slice(7) : tokenRaw;

      const store = remember ? localStorage : sessionStorage;
      store.setItem("access_token", bare);
      api.defaults.headers.common.Authorization = `Bearer ${bare}`;

      const me = await getMe();

      // ==== CHỈ CHO STAFF VÀO HỆ THỐNG ====
      const role = String(me.role || "").toUpperCase();
      const allowedRoles = ["STAFF"]; // nếu muốn cho thêm ADMIN vào thì: ["STAFF", "ADMIN"]
      const isAllowed = allowedRoles.includes(role);

      if (!isAllowed) {
        setErr("Tài khoản không có quyền truy cập trang staff.");
        try {
          localStorage.removeItem("access_token");
          sessionStorage.removeItem("access_token");
        } catch {}
        return;
      }
      // ====================================

      setUser(
        {
          id: me.id,
          username: me.username,
          fullName: me.fullName,
          email: me.email ?? "",
          phone: me.phone,
          status: me.status,
          gender: me.gender,
          dateOfBirth: me.dateOfBirth ?? null,
          address: me.address ?? null,
          avatarUrl: me.avatarUrl ?? null,
          taxCode: me.taxCode ?? null,
          nationalId: me.nationalId ?? null,
          role: me.role,
        },
        { remember: remember ? "local" : "session" }
      );

      recaptchaRef.current?.reset();
      setCaptchaToken(null);

      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Đăng nhập thất bại");

      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg,#f5faf9,#e8f4f2)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center">
            <img src="/images/logo.png" className="h-30" alt="EcoGreen" />
          </div>
          <h1 className="!text-3xl font-extrabold tracking-tight text-[#0f766e]">
            EcoGreen Staff
          </h1>

          <Typewriter
            className="mt-2 text-sm text-[#0f766e]/80"
            texts={[
              "Vui lòng đăng nhập để quản lý hệ thống.",
              "Nền tảng giao dịch pin & xe điện đã qua sử dụng.",
              "Chúc các staff có một ngày làm việc năng lượng!",
            ]}
            typingSpeed={45}
            deletingSpeed={28}
            pause={1400}
            loop
          />
        </div>

        <div className="rounded-2xl border bg-white/90 backdrop-blur-sm shadow-[0_6px_30px_-10px_rgba(0,0,0,0.2)] p-6">
          {err && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-[#0f766e]">Số điện thoại</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-white px-3 focus-within:ring-2 focus-within:ring-[#0f766e]/20 focus-within:border-[#0f766e]">
                <Phone className="w-4 h-4 text-gray-500" />
                <Input
                  required
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9]{9,11}"
                  autoComplete="tel"
                  placeholder="VD: 0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 border-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-[#0f766e]">Mật khẩu</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border bg-white px-3 focus-within:ring-2 focus-within:ring-[#0f766e]/20 focus-within:border-[#0f766e]">
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
                  className="ml-auto text-gray-500 hover:text-[#0f766e]"
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-pressed={showPw}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {siteKey && (
              <div className="pt-1">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={siteKey}
                  onChange={(v) => setCaptchaToken(v)}
                  onExpired={() => setCaptchaToken(null)}
                  onErrored={() => {
                    recaptchaRef.current?.reset();
                    setCaptchaToken(null);
                  }}
                />
              </div>
            )}

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-[#0f766e]"
                />
                Nhớ tài khoản
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || !phone || !password}
              aria-busy={loading}
              className="w-full h-10 rounded-lg !bg-[#0f766e] hover:bg-[#0e6a64] text-white disabled:opacity-60"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          © {new Date().getFullYear()} EcoGreen. Staff access only.
        </p>
      </div>
    </div>
  );
}
