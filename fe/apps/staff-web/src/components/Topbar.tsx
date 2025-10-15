import { useAuth } from "@/contexts/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center justify-between border-b p-3">
      <b>EcoGreen • Staff</b>
      <div className="flex items-center gap-3 text-sm">
        <span>{user?.username}</span>
        <button className="rounded bg-gray-800 px-3 py-1 text-white" onClick={logout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
