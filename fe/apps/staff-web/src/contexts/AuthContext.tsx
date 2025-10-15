import { createContext, useContext, useMemo, useState } from "react";

type User = { username: string; roles?: string[] } | null;
type Ctx = {
  user: User;
  token: string | null;
  login: (token: string, user?: User) => void;
  logout: () => void;
  hasRole: (r: string) => boolean;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [user, setUser] = useState<User>(null);

  const value = useMemo<Ctx>(() => ({
    user, token,
    login: (tk, u) => { localStorage.setItem("access_token", tk); setToken(tk); setUser(u ?? null); },
    logout: () => { localStorage.removeItem("access_token"); setToken(null); setUser(null); },
    hasRole: (r) => !!user?.roles?.includes(r)
  }), [user, token]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
