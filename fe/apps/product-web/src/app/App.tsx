import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import LayoutCompact from "@/components/layout/LayoutCompact";

import HomePage from "@/pages/home/HomePage";

import AccountLayout from "@/pages/account/AccountLayout";
import ProfilePage from "@/pages/account/ProfilePage";
import AccountPage from "@/pages/account/AccountPage";
import SocialPage from "@/pages/account/SocialPage";
import AuthLogin from "@/pages/auth/AuthLogin";
import AuthRegister from "@/pages/auth/AuthRegister";

import PrivateRoute from "@/app/PrivateRoute";
import GuestOnlyRoute from "@/app/GuestOnlyRoute"; 

export default function App() {
  return (
    <Routes>
      {/* Layout chính */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Layout gọn */}
      <Route element={<LayoutCompact />}>
        {/* Khu tài khoản: yêu cầu đăng nhập */}
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <AccountLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="social" element={<SocialPage />} />
        </Route>

        {/* Auth: chỉ cho khách */}
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <AuthLogin />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <AuthRegister />
            </GuestOnlyRoute>
          }
        />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
