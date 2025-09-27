const API_URL = import.meta.env.VITE_API_URL; 

export async function registerApi(data: {
  name: string;
  phone: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Đăng ký thất bại");
  return res.json(); 
}

export async function loginApi(data: { phone: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Đăng nhập thất bại");
  return res.json(); 
}
