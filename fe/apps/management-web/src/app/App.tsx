import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import PrivateRoute from "./PrivateRoute";
import GuestOnlyRoute from "./GuestOnlyRoute";
import UsersPage from "@/pages/Users";
import StaffsPage from "@/pages/Staffs";
import ProfilePage from "@/pages/settings/ProfilePage";
import AccountPage from "@/pages/settings/AccountPage";
import PendingPostsPage from "@/pages/PendingPostsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          {/* Quản lý tài khoản */}
          <Route path="users" element={<UsersPage />} />
          <Route path="staffs" element={<StaffsPage />} />

          {/* Quản lý bài đăng */}
          <Route path="posts/pending" element={<PendingPostsPage/> } />
          <Route path="posts/active" element={<div>Đang hiển thị</div>} />

          {/* Cài đặt */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="password" element={<AccountPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
