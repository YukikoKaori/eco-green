import axios from "axios";

const BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

// Cảnh báo nếu quên ENV → tránh rơi về relative URL (5173)
if (!BASE_URL || !/^https?:\/\//.test(BASE_URL)) {
  // Bạn có thể chọn throw Error để buộc sửa ENV
  console.error("⚠️ VITE_API_URL không hợp lệ:", BASE_URL);
}

const api = axios.create({
  baseURL: BASE_URL || "https://ecogreenbe-production.up.railway.app", // fallback an toàn
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

function getToken() {
  return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
