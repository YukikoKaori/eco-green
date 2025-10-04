import { createContext, useContext, useState } from "react";

export type AppUser = {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | string;
  dateOfBirth?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  taxCode?: string | null;
  role?: string;
};

type AuthContextType = {
  user: AppUser | null;   
  setUser: (u: AppUser | null, opts?: { remember?: "local" | "session" }) => void;
  logout: () => void;
};


const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, _setUser] = useState<AppUser | null>(() => {
    try {
      const raw =
        localStorage.getItem("current_user") ||
        sessionStorage.getItem("current_user");
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      localStorage.removeItem("current_user");
      sessionStorage.removeItem("current_user");
      return null;
    }
  });

  function setUser(u: AppUser | null, opts?: { remember?: "local" | "session" }) {
    _setUser(u);

    localStorage.removeItem("current_user");
    sessionStorage.removeItem("current_user");

    if (u) {
      const target =
        (opts?.remember ?? "local") === "local" ? localStorage : sessionStorage;
      target.setItem("current_user", JSON.stringify(u));
    }
  }

  function logout() {
    ["access_token", "current_user"].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    _setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
