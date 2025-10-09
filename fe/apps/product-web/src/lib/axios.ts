import axios, { AxiosError } from "axios";

const RAW = (import.meta.env.VITE_API_URL || "").trim();
const BASE_URL = RAW.replace(/\/+$/, "");

if (!BASE_URL || !/^https?:\/\//.test(BASE_URL)) {
  console.error("⚠️ VITE_API_URL không hợp lệ:", RAW);
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 15000,
});

function getToken() {
  return localStorage.getItem("access_token") ?? sessionStorage.getItem("access_token");
}
function toBearer(raw: string) {
  return raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
}
function inProtectedArea() {
  if (typeof window === "undefined") return false;
  return /^\/(account|checkout)/.test(window.location.pathname);
}
const isAuthRoute = (url?: string) => !!url && /\/auth\/(login|register|refresh)/.test(url);

api.interceptors.request.use((config) => {
  const url = config.url || "";

  if (!isAuthRoute(url)) {
    const raw = getToken();
    if (raw) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = toBearer(raw);
    }
  }

  (config.headers as any)["X-Requested-With"] = "XMLHttpRequest";

  if (config.data instanceof FormData && config.headers) {
    delete (config.headers as any)["Content-Type"];
  }
  return config;
});

let isRedirecting = false;

api.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) {
    }
    return res;
  },
  (err: AxiosError<any>) => {
    const status = err.response?.status;
    const url = err.config?.url ?? "";
    const hasAuthHeader = !!(err.config as any)?.headers?.Authorization;

    if (import.meta.env.DEV) {
      console.groupCollapsed(`❌ API Error ${status} - ${url}`);
      console.log("Message:", err.response?.data?.message || err.message);
      console.log("Response:", err.response?.data);
      console.log("Request data:", err.config?.data);
      console.log("Headers:", err.response?.headers);
      console.groupEnd();
    }
    if (status === 401 && !isAuthRoute(url) && !isRedirecting && (hasAuthHeader || inProtectedArea())) {
      try {
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        localStorage.removeItem("current_user");
        sessionStorage.removeItem("current_user");
      } catch {}
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        isRedirecting = true;
        window.location.replace("/login");
      }
    }

    return Promise.reject(err);
  }
);

export default api;
