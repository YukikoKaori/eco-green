import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function isStaff(role?: string) {
  if (!role) return false;
  return role.toUpperCase() === "STAFF";
}

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaff(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
