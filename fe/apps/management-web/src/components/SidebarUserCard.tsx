import { useMemo } from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const BRAND = "#0f766e";

export default function SidebarUserCard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const initials = useMemo(() => {
    const name = user?.fullName || user?.username || "A";
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (first + last).toUpperCase() || "A";
  }, [user]);

  async function onLogout() {
    try { await logout(); } finally { nav("/login", { replace: true }); }
  }

  return (
    <div
      className="w-full border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70"
      style={{ borderTopColor: "rgba(0,0,0,.06)" }}
    >
      <div className="p-3 flex items-center gap-3">
        <Avatar className="h-10 w-10 ring-2" style={{ boxShadow: "0 0 0 2px #fff" }}>
          <AvatarImage src={user?.avatarUrl || ""} alt={user?.fullName || "Admin"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate" title={user?.fullName || user?.username}>
            {user?.fullName || user?.username || "Admin"}
          </div>
          <div className="text-[11px] font-medium"
               style={{ color: `${BRAND}` }}>
            <span className="inline-flex items-center gap-1">
              <User size={12} /> {user?.role ?? "ADMIN"}
            </span>
          </div>
        </div>

        <Button
          size="icon"
          variant="outline"
          className="h-9 w-9 hover:text-white"
          style={{
            borderColor: "rgba(0,0,0,.08)",
            color: BRAND,
            background: "white",
          }}
          onClick={onLogout}
          title="Đăng xuất"
          aria-label="Đăng xuất"
        >
          <LogOut size={16} />
        </Button>
      </div>
    </div>
  );
}
