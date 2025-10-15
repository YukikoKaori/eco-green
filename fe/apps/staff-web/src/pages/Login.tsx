import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [username, setU] = useState(""); const [password, setP] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { username, password });
      const token = data?.accessToken || data?.token;
      const roles = data?.roles || ["STAFF"]; 
      if (!token) throw new Error("Missing token");
      login(token, { username, roles });
      toast.success("Đăng nhập thành công");
      nav("/", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đăng nhập thất bại");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 rounded-lg border p-4">
        <h1 className="text-lg font-semibold">Staff Login</h1>
        <input className="w-full rounded border p-2" placeholder="Username"
               value={username} onChange={(e)=>setU(e.target.value)} />
        <input className="w-full rounded border p-2" type="password" placeholder="Password"
               value={password} onChange={(e)=>setP(e.target.value)} />
        <button className="w-full rounded bg-teal-600 p-2 text-white hover:bg-teal-700">Đăng nhập</button>
      </form>
    </div>
  );
}
