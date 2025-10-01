import { Outlet } from "react-router-dom";
import Navbar from "./NavbarCompact";
import Footer from "./Footer";
export default function LayoutCompact() {
  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/images/bg-login.png)" }} 
      />
      <div className="fixed inset-0 z-0 bg-white/60 backdrop-blur-[2px]" />
      <Navbar />
      <main className="relative z-10 flex-1 mx-auto w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
