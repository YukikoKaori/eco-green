import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const token =
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  return token ? <Navigate to="/account/profile" replace /> : <>{children}</>;
}
