import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Toaster } from "sonner"; 

export default function AdminLayout() {
  return (
    <div
      className="relative h-screen w-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg-login.png')" }}
    >
      <div className="relative flex h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-auto p-5">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster
        position="top-right"
        richColors
        theme="light"
        toastOptions={{
          style: { borderRadius: 10 },
          className: "shadow-lg",
        }}
      />
    </div>
  );
}
