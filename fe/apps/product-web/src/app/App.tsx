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
import ProfilePublicPage from "@/pages/account/ProfilePublic";
import PrivateRoute from "@/app/PrivateRoute";
import GuestOnlyRoute from "@/app/GuestOnlyRoute";
import PostNew from "@/pages/posts/PostNew";
import PostManage from "@/pages/posts/PostManage";
import PostNotice from "@/pages/posts/PostNotice";
import WishlistPage from "@/pages/wishlist/WishlistPage";
import ProductDetailPage from "@/pages/product/ProductDetail";
import VehicleListPage from "@/pages/listingEV/VehicleListPage";
import BatteryListPage from "@/pages/listingEV/BatteryListPage";


export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route element={<LayoutCompact />}>
        <Route path="/xe-dien" element={<VehicleListPage />} />
        <Route path="/pin-dien" element={<BatteryListPage />} />
        <Route path="/account/wishlist" element={<WishlistPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route
          path="/postnotice"
          element={
            <PrivateRoute>
              <PostNotice />
            </PrivateRoute>
          }
        />
        <Route path="/post/notice/:id" element={<Navigate to="/postnotice" replace />} />

        <Route path="/profile/:username" element={<ProfilePublicPage />} />
        <Route
          path="/post/new"
          element={
            <PrivateRoute>
              <PostNew />
            </PrivateRoute>
          }
        />
        <Route
          path="/post/manage"
          element={
            <PrivateRoute>
              <PostManage />
            </PrivateRoute>
          }
        />

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
