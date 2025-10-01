import { createContext, useContext, useState, useEffect } from "react";

export type AppUser = {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
};

type AuthContextType = {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("current_user") || sessionStorage.getItem("current_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
  }, []);

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("current_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
