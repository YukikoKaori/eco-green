import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const token =
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  const loc = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <>{children}</>;
}
