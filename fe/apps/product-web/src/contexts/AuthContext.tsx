import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { logoutApi } from "@/api/auth"; 

const STORAGE_USER_KEY = "current_user";
const STORAGE_TOKEN_KEY = "access_token";

export type AppUser = {
  id: string;
  username: string;
  fullName: string;
  email?:  null; 
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

type AuthContextType = {
  user: AppUser | null;
  isAuthenticated: boolean;
  setUser: (u: AppUser | null, opts?: { remember?: "local" | "session" }) => void;
  logout: () => Promise<void>; 
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, _setUser] = useState<AppUser | null>(() => {
    const fromLocal = safeParse<AppUser>(localStorage.getItem(STORAGE_USER_KEY));
    const fromSession = safeParse<AppUser>(sessionStorage.getItem(STORAGE_USER_KEY));
    const u = fromLocal ?? fromSession ?? null;
    return u && u.id ? u : null;
  });

  const isAuthenticated = useMemo(() => !!user, [user]);

  function setUser(u: AppUser | null, opts?: { remember?: "local" | "session" }) {
    localStorage.removeItem(STORAGE_USER_KEY);
    sessionStorage.removeItem(STORAGE_USER_KEY);

    if (!u || !u.id) {
      _setUser(null);
      return;
    }

    _setUser(u);
    const target = (opts?.remember ?? "local") === "local" ? localStorage : sessionStorage;
    target.setItem(STORAGE_USER_KEY, JSON.stringify(u));
  }

  async function logout() {
    try {
      await logoutApi();
    } catch (err) {
      console.warn("⚠️ BE logout lỗi hoặc chưa cấu hình, bỏ qua:", err);
    }

    [STORAGE_TOKEN_KEY, STORAGE_USER_KEY].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });

    try {
      delete (api.defaults.headers as any).common?.Authorization;
    } catch {}

    _setUser(null);
  }

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY) ?? sessionStorage.getItem(STORAGE_TOKEN_KEY);
    if (!token) _setUser(null);
  }, []);

  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === STORAGE_USER_KEY) {
        const next = safeParse<AppUser>(ev.newValue);
        _setUser(next && next.id ? next : null);
      }
      if (ev.key === STORAGE_TOKEN_KEY && ev.newValue == null) {
        _setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
