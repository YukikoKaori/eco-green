import axios, { AxiosError, type AxiosHeaders } from "axios";

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

  const headers = (config.headers ?? {}) as AxiosHeaders | Record<string, any>;
  const hAny = headers as any;

  const get = (k: string) =>
    typeof (headers as AxiosHeaders).get === "function"
      ? (headers as AxiosHeaders).get(k)
      : hAny[k];

  const set = (k: string, v: string) => {
    if (typeof (headers as AxiosHeaders).set === "function") {
      (headers as AxiosHeaders).set(k, v);
    } else {
      hAny[k] = v;
    }
  };

  const del = (k: string) => {
    if (typeof (headers as AxiosHeaders).delete === "function") {
      (headers as AxiosHeaders).delete(k);
    } else {
      delete hAny[k];
    }
  };

  if (!isAuthRoute(url)) {
    const raw = getToken();
    if (raw && !get("Authorization") && !get("authorization")) {
      const bearer = toBearer(raw);
      set("Authorization", bearer);
      set("authorization", bearer); 
    }
  }

  set("X-Requested-With", "XMLHttpRequest");

  if (config.data instanceof FormData) {
    del("Content-Type");
  }

  config.headers = headers as any;
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
      console.groupCollapsed(`API Error ${status} - ${url}`);
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
