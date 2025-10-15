import { Route, Routes, Navigate } from "react-router-dom";
import PrivateRoute from "@/app/PrivateRoute";
import GuestOnlyRoute from "@/app/GuestOnlyRoute";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";

export default function App() {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>

      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
