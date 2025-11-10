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
import ReportStatsPage from "@/pages/ReportStatsPage";
import RejectedPostsPage from "@/pages/RejectedPostsPage";
import StaffPostsManagePage from "@/pages/PostsManagePage";
import ReviewDetailPage from "@/pages/ReviewDetailPage";
import Contracts from "@/pages/transactions/Contracts";
import Commissions from "@/pages/transactions/Commissions";
import BrandCreatePage from "@/pages/brand/BrandCreatePage";
import BrandsInfoPage from "@/pages/brand/BrandsInfoPage";
import BrandEditPage from "@/pages/brand/BrandEditPage";
import CreateBatteryBrand from "@/pages/brand/CreateBatteryBrand";

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
          <Route path="/posts/pending" element={<PendingPostsPage />} />
          <Route path="/posts/rejected" element={<RejectedPostsPage />} />
          <Route path="/reports/count" element={<ReportStatsPage />} />
          <Route path="/posts/moderate" element={<StaffPostsManagePage />} />
          <Route path="/posts/review/:id" element={<ReviewDetailPage />} />
          <Route path="/posts/brands" element={<BrandsInfoPage />} />
          <Route path="/posts/brands/new" element={<BrandCreatePage />} />
          <Route path="/posts/brands/:id/edit" element={<BrandEditPage />} />
          <Route path="/posts/battery-brands/new" element={<CreateBatteryBrand />} />

          {/* Quản lý giao dịch */}
          <Route path="/transactions/contracts" element={<Contracts />} />
          <Route path="/transactions/commissions" element={<Commissions />} />

          {/* Cài đặt */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="password" element={<AccountPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
