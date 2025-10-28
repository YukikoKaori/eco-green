import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="nav-fixed-spacer" />
      <main className="flex-1 mx-auto w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
