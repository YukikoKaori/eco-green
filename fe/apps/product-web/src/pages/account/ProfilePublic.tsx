// src/pages/account/ProfilePublic.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Camera } from "lucide-react";

export default function ProfilePublic() {
  const { user } = useAuth();
  const nav = useNavigate();

  if (!user) return <ErrorBox text="Bạn cần đăng nhập để xem trang này." />;

  const u = user;
  const initials = (u.fullName || u.username || "U").charAt(0).toUpperCase();

  async function sharePage() {
    const url = `${window.location.origin}/profile/${encodeURIComponent(u.username)}`;
    const title = u.fullName || u.username || "Trang cá nhân";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch { }
    }
    await navigator.clipboard?.writeText(url);
  }

  //chưa có listings
  const active = useMemo(() => [] as never[], []);
  const sold = useMemo(() => [] as never[], []);
  const DEFAULT_AVATAR = "/images/avatar-default.png";
  return (
    <div className="container mx-auto max-w-6xl px-15 py-10">
      <div className="overflow-x-auto">
        <div className="flex items-start gap-6 min-w-[980px]">
          {/* LEFT */}
          <aside className="w-[360px] shrink-0 rounded-xl border bg-gray-50 shadow-sm overflow-hidden">
            {/* cover */}
            <div className="relative h-28 w-full bg-[url('/images/profile-cover.png')] bg-no-repeat bg-cover bg-center opacity-90" />

            <div className="p-4">
              <div className="flex items-center gap-4 -mt-10">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow">
                    <AvatarImage
                      src={u.avatarUrl ?? DEFAULT_AVATAR}
                      alt={u.fullName || u.username}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xl bg-gray-100">
                      {(u.fullName || u.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="!absolute -bottom-1 -right-1 !grid !place-content-center !h-6 !w-6 rounded-full !bg-white !border !shadow"
                    title="Đổi ảnh đại diện"
                  >
                    <Camera className="w-4 h-4 text-gray-700" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">
                    {u.fullName || u.username}
                  </div>
                  <div className="text-xs text-muted-foreground">Chưa có đánh giá</div>
                  <div className="mt-1 text-xs text-gray-600">
                    Người theo dõi: <span className="font-medium">0</span>
                    <span className="mx-2 text-gray-300">|</span>
                    Đang theo dõi: <span className="font-medium">0</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm">
                <Button
                  size="sm"
                  className="w-full !bg-[#0f766e] !text-white hover:!bg-[#0e6a64]"
                  onClick={sharePage}
                >
                  🔗 Chia sẻ trang của bạn
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full !bg-white"
                  onClick={() => nav("/account/profile")}
                >
                  Chỉnh sửa trang cá nhân
                </Button>

                <div className="rounded-lg border p-3 bg-white" >
                  <div className="font-medium">Thông tin</div>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>
                      <span className="font-medium text-foreground">Đã tham gia:</span> ? ngày
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Đã xác thực:</span>
                      <span className="inline-flex items-center gap-2 text-lg leading-none">
                        <span title="SĐT">?</span>
                        <span title="Email">?</span>
                        <span title="Google">?</span>
                        <span title="Facebook">?</span>
                      </span>
                    </li>
                    <li>
                      <span className="font-medium text-foreground">Địa chỉ:</span>{" "}
                      {u.address || "Chưa cập nhật"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT */}
          <section className="flex-1 rounded-xl border bg-white shadow-sm !bg-gray-50">
            <Tabs defaultValue="active">
              <div className="px-4 pt-4 ">
                <div className="flex items-center justify-between">
                  <TabsList className="relative bg-transparent p-0 w-full max-w-[420px] grid grid-cols-2">
                    <div className="!absolute !left-0 right-0 -bottom-[1px] h-[2px] !bg-gray col-span-2" />
                    <TabsTrigger
                      value="active"
                      className="rounded-none !bg-white px-6 py-2 !text-center border-b-2 border-transparent
                                 data-[state=active]:border-[#0f766e] data-[state=active]:text-foreground text-sm"
                    >
                      Đang hiển thị ({active.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="sold"
                      className="rounded-none !bg-white px-4 py-2 text-center border-b-2 border-transparent
                                 data-[state=active]:border-[#0f766e] data-[state=active]:text-foreground text-sm"
                    >
                      Đã bán ({sold.length})
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <div className="p-6">
                <TabsContent value="active" className="m-0">
                  <EmptyState
                    text="Bạn chưa có tin đăng nào"
                    ctaLabel="ĐĂNG TIN NGAY"
                    onCta={() => nav("/post/new")}
                  />
                </TabsContent>
                <TabsContent value="sold" className="m-0">
                  <EmptyState
                    text="Bạn chưa có tin đã bán"
                    ctaLabel="ĐĂNG TIN NGAY"
                    onCta={() => nav("/post/new")}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ===== Sub components ===== */
function ErrorBox({ text }: { text: string }) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        {text}
      </div>
    </div>
  );
}

function EmptyState({
  text = "Bạn chưa có tin đăng nào",
  ctaLabel,
  onCta,
}: {
  text?: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed p-10 text-center text-muted-foreground min-h-[450px] flex flex-col items-center justify-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,118,110,0.08),rgba(255,255,255,0))]" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-6xl">🗒️</div>
        <div className="mt-3 text-base text-gray-700">{text}</div>

        {ctaLabel && onCta && (
          <Button
            type="button"
            onClick={onCta}
            className="mt-6 px-6 h-11 rounded-md !bg-[#0f766e] !text-white hover:!bg-[#0e6a64] font-semibold shadow-[0_2px_0_#0d5f59]"
          >
            {ctaLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
