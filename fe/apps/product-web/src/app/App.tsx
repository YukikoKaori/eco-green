import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import LayoutCompact from "@/components/layout/LayoutCompact";

import HomePage from "@/pages/home/HomePage";

import AccountLayout from "@/pages/account/AccountLayout";
import ProfilePage from "@/pages/account/ProfilePage";
import AccountPage from "@/pages/account/AccountPage";
import SocialPage from "@/pages/account/SocialPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout cho Home */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Layout gọn cho các trang khác */}
        <Route element={<LayoutCompact />}>
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="social" element={<SocialPage />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
