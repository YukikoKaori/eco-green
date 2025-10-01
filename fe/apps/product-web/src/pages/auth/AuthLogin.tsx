// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Phone, Lock, Eye, EyeOff } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { loginApi, oauthUrls } from "@/api/auth"; 

// export default function AuthLogin() {
//   const [showPw, setShowPw] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const nav = useNavigate();

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (loading) return;

//     // Validate nhanh
//     if (!/^\d{9,11}$/.test(phone)) {
//       setError("Số điện thoại không hợp lệ (9–11 chữ số).");
//       return;
//     }
//     if (!password) {
//       setError("Vui lòng nhập mật khẩu.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     try {
//       const res = await loginApi({ phone, password });
//       const token = res?.result?.token;
//       if (!token) throw new Error("Không tìm thấy token trong phản hồi.");

//       // Lưu token + user
//       const store = remember ? localStorage : sessionStorage;
//       store.setItem("access_token", token);
//       store.setItem("current_user", JSON.stringify(res.result));

//       nav("/account");
//     } catch (err: any) {
//       const msg = err?.response?.data?.message || err?.message || "Đăng nhập thất bại";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function onGoogle() {
//     window.location.assign(oauthUrls.google);
//   }
//   function onFacebook() {
//     window.location.assign(oauthUrls.facebook);
//   }

//   return (
//     <div
//       className="relative min-h-[calc(100vh-60px)] flex items-center justify-center px-4"
//       style={{
//         backgroundImage: "url('/images/bg-login.png')",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//     >
//       <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white/95 shadow-lg p-8">
//         <div className="text-center text-3xl font-bold text-[#0f766e] mb-6">
//           Đăng nhập
//         </div>

//         {error && (
//           <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         <form onSubmit={onSubmit} className="space-y-4" noValidate>
//           {/* Phone */}
//           <label className="block">
//             <span className="text-sm font-bold text-[#0f766e]">Số điện thoại</span>
//             <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
//               <Phone className="w-4 h-4 text-gray-500" />
//               <Input
//                 required
//                 name="phone"            
//                 type="tel"
//                 inputMode="tel"
//                 pattern="[0-9]{9,11}"
//                 autoComplete="tel"
//                 placeholder="VD: 0987654321"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className="h-10 border-0 shadow-none focus-visible:ring-0"
//               />
//             </div>
//           </label>

//           {/* Password */}
//           <label className="block">
//             <span className="text-sm font-bold text-[#0f766e]">Mật khẩu</span>
//             <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
//               <Lock className="w-4 h-4 text-gray-500" />
//               <Input
//                 required
//                 name="password"
//                 type={showPw ? "text" : "password"}
//                 autoComplete="current-password"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="h-10 border-0 shadow-none focus-visible:ring-0"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPw(v => !v)}
//                 className="!ml-auto !text-gray-500 !bg-white"
//                 aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
//                 aria-pressed={showPw}
//               >
//                 {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//           </label>

//           {/* Options */}
//           <div className="!flex !items-center !justify-between !bg-white">
//             <label className="!inline-flex !items-center !gap-2 !text-sm !text-gray-600">
//               <input
//                 type="checkbox"
//                 checked={remember}
//                 onChange={(e) => setRemember(e.target.checked)}
//                 className="!bg-white !h-4 w-4 !rounded !border-gray-300"
//               />
//               Nhớ tài khoản
//             </label>
//             <Link to="/forgot" className="text-sm text-[#0f766e]">
//               Quên mật khẩu?
//             </Link>
//           </div>

//           {/* Submit */}
//           <Button
//             type="submit"
//             disabled={loading || !phone || !password}
//             aria-busy={loading}
//             className="!w-full !h-10 !rounded-full !bg-[#0f766e] !hover:bg-[#0e6a64] !text-white !disabled:opacity-60"
//           >
//             {loading ? "Đang xử lý..." : "Đăng nhập"}
//           </Button>

//           <p className="text-center text-sm text-gray-600">
//             Chưa có tài khoản?{" "}
//             <Link to="/register" className="text-[#0f766e] font-semibold">
//               Đăng ký
//             </Link>
//           </p>
//         </form>

//         {/* Divider */}
//         <div className="flex items-center gap-3 my-5">
//           <div className="h-px flex-1 bg-gray-200" />
//           <span className="text-xs text-gray-500">hoặc</span>
//           <div className="h-px flex-1 bg-gray-200" />
//         </div>

//         {/* Social Login */}
//         <div className="grid gap-2">
//           <button
//             type="button"
//             onClick={onGoogle}
//             disabled={loading}
//             className="!inline-flex !items-center !justify-center !gap-2 !w-full !h-10 !rounded-full !border !border-gray-200 !bg-white !text-gray-800"
//           >
//             <GoogleIcon className="w-5 h-5" />
//             <span>Tiếp tục với Google</span>
//           </button>
//           <button
//             type="button"
//             onClick={onFacebook}
//             disabled={loading}
//             className="!inline-flex !items-center !justify-center !gap-2 !w-full !h-10 !rounded-full !border !border-gray-200 !bg-white !text-gray-800"
//           >
//             <FacebookIcon className="w-5 h-5" />
//             <span>Tiếp tục với Facebook</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function GoogleIcon({ className = "" }: { className?: string }) {
//   return (
//     <svg className={className} viewBox="0 0 533.5 544.3" aria-hidden>
//       <path fill="#4285f4" d="M533.5 278.4c0-18.4-1.7-36.1-4.9-53.3H272v100.9h147.2c-6.4 34.7-26 64.1-55.6 83.8v69.5h89.9c52.5-48.4 80-119.7 80-200.9z" />
//       <path fill="#34a853" d="M272 544.3c72.5 0 133.5-24 178-65.1l-89.9-69.5c-24.9 16.7-56.8 26.6-88.1 26.6-67.7 0-125.2-45.7-145.8-107.1H34.5v67.3C79.2 486.2 169.9 544.3 272 544.3z" />
//       <path fill="#fbbc04" d="M126.2 329.1c-9.6-28.8-9.6-60.2 0-88.9V172.9H34.5c-40.5 80.8-40.5 176.9 0 257.7l91.7-101.5z" />
//       <path fill="#ea4335" d="M272 106.5c39.4-.6 77.3 14.2 106.1 41.2l79.1-79.1C403.2-8.7 324.3-23.7 249.8 4.2 147.9 42 57.2 100.1 34.5 172.9l91.7 67.3C146.8 178.8 204.3 106.5 272 106.5z" />
//     </svg>
//   );
// }

// function FacebookIcon({ className = "" }: { className?: string }) {
//   return (
//     <svg className={className} viewBox="0 0 24 24" aria-hidden>
//       <path
//         fill="#1877F2"
//         d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078V12.07h3.047V9.412c0-3.007 1.79-4.668 4.533-4.668 1.313 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.953.928-1.953 1.88v2.258h3.328l-.532 3.492h-2.796V24C19.612 23.093 24 18.1 24 12.073z"
//       />
//     </svg>
//   );
// }
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginApi, oauthUrls } from "@/api/auth"; 
import { useAuth } from "@/contexts/AuthContext";

export default function AuthLogin() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const { setUser } = useAuth(); // 👈 lấy từ context

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!/^\d{9,11}$/.test(phone)) {
      setError("Số điện thoại không hợp lệ (9–11 chữ số).");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await loginApi({ phone, password }); // { code, message, result }
      const token = res?.result?.token;
      if (!token) throw new Error("Không tìm thấy token trong phản hồi.");

      const store = remember ? localStorage : sessionStorage;
      store.setItem("access_token", token);
      store.setItem("current_user", JSON.stringify(res.result));

      // ✅ cập nhật Context để header/menu render ngay
      setUser({
        username: res.result.username,
        fullName: res.result.fullName,
        email: res.result.email,
        phone: res.result.phone,
        role: res.result.role,
        status: res.result.status,
      });

      // ✅ điều hướng (giữ /account như bạn đang dùng, hoặc đổi thành "/")
      nav("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Đăng nhập thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function onGoogle() { window.location.assign(oauthUrls.google); }
  function onFacebook() { window.location.assign(oauthUrls.facebook); }

  return (
    <div
      className="relative min-h-[calc(100vh-60px)] flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/images/bg-login.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white/95 shadow-lg p-8">
        <div className="text-center text-3xl font-bold text-[#0f766e] mb-6">Đăng nhập</div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Phone */}
          <label className="block">
            <span className="text-sm font-bold text-[#0f766e]">Số điện thoại</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3">
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
          </label>

          {/* Password */}
          <label className="block">
            <span className="text-sm font-bold text-[#0f766e]">Mật khẩu</span>
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
                onClick={() => setShowPw(v => !v)}
                className="!ml-auto !text-gray-500 !bg-white"
                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={showPw}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          {/* Options */}
          <div className="!flex !items-center !justify-between !bg-white">
            <label className="!inline-flex !items-center !gap-2 !text-sm !text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="!bg-white !h-4 w-4 !rounded !border-gray-300"
              />
              Nhớ tài khoản
            </label>
            <Link to="/forgot" className="text-sm text-[#0f766e]">Quên mật khẩu?</Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !phone || !password}
            aria-busy={loading}
            className="!w-full !h-10 !rounded-full !bg-[#0f766e] !hover:bg-[#0e6a64] !text-white !disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-[#0f766e] font-semibold">Đăng ký</Link>
          </p>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">hoặc</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Social Login */}
        <div className="grid gap-2">
          <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            className="!inline-flex !items-center !justify-center !gap-2 !w-full !h-10 !rounded-full !border !border-gray-200 !bg-white !text-gray-800"
          >
            <GoogleIcon className="w-5 h-5" />
            <span>Tiếp tục với Google</span>
          </button>
          <button
            type="button"
            onClick={onFacebook}
            disabled={loading}
            className="!inline-flex !items-center !justify-center !gap-2 !w-full !h-10 !rounded-full !border !border-gray-200 !bg-white !text-gray-800"
          >
            <FacebookIcon className="w-5 h-5" />
            <span>Tiếp tục với Facebook</span>
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
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078V12.07h3.047V9.412c0-3.007 1.79-4.668 4.533-4.668 1.313 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.953.928-1.953 1.88v2.258h3.328l-.532 3.492h-2.796V24C19.612 23.093 24 18.1 24 12.073z"
      />
    </svg>
  );
}
