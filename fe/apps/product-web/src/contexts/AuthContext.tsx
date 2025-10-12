// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import type { AxiosHeaders } from "axios";
import { getMe, logoutApi, UserProfile } from "@/api/auth";

const STORAGE_USER_KEY = "current_user";
const STORAGE_TOKEN_KEY = "access_token";

export type AppUser = {
  id: string;
  username: string;
  fullName: string;
  email?: string | null;
  phone: string;
  status: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | string;
  dateOfBirth?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  taxCode?: string | null;
  role?: string;
  nationalId?: string | null;
};

type Remember = "local" | "session";

type AuthContextType = {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (u: AppUser | null, opts?: { remember?: Remember }) => void;
  logout: () => Promise<void>;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function setAuthHeader(token: string | null) {
  if (token) {
    const bearer = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    api.defaults.headers.common["Authorization"] = bearer;
    (api.defaults.headers.common as any)["authorization"] = bearer;
  } else {
    delete api.defaults.headers.common["Authorization"];
    delete (api.defaults.headers.common as any)["authorization"];
  }
}

function readStoredToken() {
  return localStorage.getItem(STORAGE_TOKEN_KEY) ?? sessionStorage.getItem(STORAGE_TOKEN_KEY);
}

function clearStoredAuth() {
  [STORAGE_TOKEN_KEY, STORAGE_USER_KEY].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
  setAuthHeader(null);
}

function mapUser(me: UserProfile): AppUser {
  return {
    id: me.id,
    username: me.username,
    fullName: me.fullName,
    email: me.email ?? null,
    phone: me.phone,
    status: me.status,
    gender: me.gender,
    dateOfBirth: me.dateOfBirth ?? null,
    address: me.address ?? null,
    avatarUrl: me.avatarUrl ?? null,
    taxCode: me.taxCode ?? null,
    role: me.role,
    nationalId: me.nationalId ?? null,
  };
}

// ✅ gắn token vào header ngay khi file được import (fix reload)
setAuthHeader(readStoredToken());

// ✅ interceptor request: thao tác an toàn với AxiosHeaders/Record, không gán {} trực tiếp
api.interceptors.request.use((config) => {
  // headers có thể là AxiosHeaders (có get/set) hoặc object thường
  const headers = (config.headers ?? {}) as AxiosHeaders | Record<string, any>;

  const getHeader = (k: string) => {
    const h = headers as any;
    return typeof h.get === "function" ? h.get(k) : h[k];
  };
  const setHeader = (k: string, v: string) => {
    const h = headers as any;
    if (typeof h.set === "function") h.set(k, v);
    else h[k] = v;
  };

  const hasAuth = !!getHeader("Authorization") || !!getHeader("authorization");
  if (!hasAuth) {
    const t = readStoredToken();
    if (t) {
      const bearer = t.startsWith("Bearer ") ? t : `Bearer ${t}`;
      setHeader("Authorization", bearer);
      setHeader("authorization", bearer);
      // gán lại để thỏa kiểu cấu hình của axios
      config.headers = headers as any;
    }
  }
  return config;
});

// ✅ interceptor response: clear & (tuỳ chọn) điều hướng khi 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearStoredAuth();
      // optional: window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, _setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = useMemo(() => !!user, [user]);

  function setUser(u: AppUser | null, opts?: { remember?: Remember }) {
    localStorage.removeItem(STORAGE_USER_KEY);
    sessionStorage.removeItem(STORAGE_USER_KEY);
    if (!u || !u.id) { _setUser(null); return; }
    _setUser(u);
    const target = (opts?.remember ?? "local") === "local" ? localStorage : sessionStorage;
    target.setItem(STORAGE_USER_KEY, JSON.stringify(u));
  }

  async function logout() {
    try { await logoutApi(); } catch (err) { console.warn("⚠️ BE logout lỗi, bỏ qua:", err); }
    clearStoredAuth();
    _setUser(null);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = readStoredToken();
        if (!token) {
          _setUser(null);
          setAuthHeader(null);
          if (!cancelled) setLoading(false);
          return;
        }
        setAuthHeader(token);
        const me = await getMe();
        if (cancelled) return;
        setUser(mapUser(me), {
          remember: token === localStorage.getItem(STORAGE_TOKEN_KEY) ? "local" : "session",
        });
      } catch {
        clearStoredAuth();
        if (!cancelled) _setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === STORAGE_USER_KEY) {
        const next = safeParse<AppUser>(ev.newValue);
        _setUser(next && next.id ? next : null);
      }
      if (ev.key === STORAGE_TOKEN_KEY && ev.newValue == null) {
        clearStoredAuth();
        _setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
