import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function PrivateRoute() {
  const { token, hasRole } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!hasRole("STAFF")) return <Navigate to="/login" replace />;
  return <Outlet />;
}
