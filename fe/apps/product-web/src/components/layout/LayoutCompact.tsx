import { Outlet } from "react-router-dom";
import NavbarCompact from "./NavbarCompact"; 
import Footer from "./Footer";

export default function LayoutCompact() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarCompact />
      <main className="flex-1 mx-auto w-full max-w-7xl p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
