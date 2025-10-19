import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function isSatff(role?: string) {
  if (!role) return false;
  return role.toLowerCase().includes("staff");
}

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return null; 
  if (!user) return <Navigate to="/login" replace />;

  if (!isSatff(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
