import api from "@/lib/axios";

export interface LoginResult {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  role: string;
  status: string;
  createdAt: string | null;
  token: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  result: LoginResult;
}

// CHỈ gửi phone + password
export async function loginApi(data: { phone: string; password: string }) {
  // debug xem baseURL có đúng không
  // console.log("loginApi baseURL =", (api.defaults as any).baseURL);
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
}

export async function registerApi(data: {
  name: string;
  phone: string;
  password: string;
}) {
  const res = await api.post("/auth/register", data);
  return res.data;
}

export const oauthUrls = {
  google: `${import.meta.env.VITE_API_URL}/auth/google`,
  facebook: `${import.meta.env.VITE_API_URL}/auth/facebook`,
};
