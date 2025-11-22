import { NavLink, Outlet } from "react-router-dom";

export default function AccountLayout() {
  const item = (to: string, label: string) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "block rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-teal-50 text-teal-700 font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );

  return (
    <main className="flex-1 mx-auto w-full max-w-7xl px-35 pb-20 pt- bg-gre">
      <h2 className="font-semibold my-5 text-3xl text-[#246f67]">Thông tin cá nhân</h2>
      <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-4 md:gap-6">
        {/* Sidebar */}
        <aside className="border p-3 md:p-4 bg-white h-max">
          <h3 className="font-semibold mb-2">Thiết lập</h3>
          <nav className="space-y-1">
            {item("profile", "Thông tin cá nhân")}
            {item("account", "Tài khoản")}
            {/* {item("social", "Liên kết mạng xã hội")} */}
          </nav>
        </aside>

        {/* Content */}
        <div className="bg-white p-4 shadow-sm">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
