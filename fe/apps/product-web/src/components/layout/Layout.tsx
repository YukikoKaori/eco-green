import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header cố định */}
      <Navbar />
      <div className="nav-fixed-spacer" />

      {/* Nội dung chính */}
      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
