import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext({
    user: null,
    setUser: () => { },
    logout: () => { },
});
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const saved = localStorage.getItem("current_user") || sessionStorage.getItem("current_user");
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            }
            catch { }
        }
    }, []);
    function logout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("current_user");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("current_user");
        setUser(null);
    }
    return (_jsx(AuthContext.Provider, { value: { user, setUser, logout }, children: children }));
}
export const useAuth = () => useContext(AuthContext);
