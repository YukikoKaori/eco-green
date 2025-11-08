import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, MapPin } from "lucide-react";
import {
  getMe,
  type UserProfile,
  getMemberProducts,
  type MemberProduct,
  pickProductImage,
  formatVND,
} from "@/api/auth";

/* ===== helpers ===== */
function daysSince(iso?: string | null) {
  if (!iso) return "?";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "?";
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}
function FullscreenSpinner() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
    </div>
  );
}

/* ================= Page ================= */
export default function ProfilePublic() {
  const { user, loading: authLoading } = useAuth();
  const { username: routeUsername } = useParams<{ username?: string }>();

  /* ---- PROFILE LEFT ---- */
  const [me, setMe] = useState<UserProfile | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getMe();
        if (mounted) setMe(p);
      } catch {
        if (mounted) setMe(null);
      } finally {
        if (mounted) setLoadingMe(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Chủ tài khoản?
  const isOwner = !!(
    user &&
    ((routeUsername && routeUsername === user.username) || (me?.id && me.id === user.id))
  );

  const initials = (me?.fullName || me?.username || "U").charAt(0).toUpperCase();
  const DEFAULT_AVATAR = "/images/avatar-default.png";

  async function sharePage() {
    const uname = routeUsername || me?.username || user?.username || "user";
    const title = me?.fullName || me?.username || "Trang cá nhân";
    const url = `${window.location.origin}/profile/${encodeURIComponent(uname)}`;
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch { }
    }
    await navigator.clipboard?.writeText(url);
  }

  /* ---- LISTINGS RIGHT ---- */
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [active, setActive] = useState<MemberProduct[]>([]);
  const [sold, setSold] = useState<MemberProduct[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [a, s] = await Promise.all([
          getMemberProducts("ACTIVE"),
          getMemberProducts("SOLD"),
        ]);
        if (mounted) { setActive(a); setSold(s); }
      } catch (e: any) {
        if (mounted) setErr(e?.response?.data?.message || e?.message || "Không tải được danh sách tin.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (authLoading) return <FullscreenSpinner />;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8">
      <div className="md:flex md:items-start md:gap-6">
        {/* LEFT */}
        {/* LEFT */}
        <aside className="w-full md:w-96 md:sticky md:top-24 md:self-start space-y-4">
          {/* Thông tin người bán */}
          <div className="rounded-2xl bg-white shadow-sm border border-emerald-100">
            <div
              className="w-full h-28 rounded-t-2xl bg-center bg-cover bg-no-repeat"
              style={{ backgroundImage: "url('/images/profile-cover.png')" }}
            />
            <div className="p-5">
              {loadingMe ? (
                <div className="animate-pulse">
                  <div className="h-6 w-48 bg-emerald-50 rounded mb-3" />
                  <div className="h-4 w-32 bg-emerald-50 rounded" />
                </div>
              ) : (
                <div className="flex items-center gap-4 -mt-20">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow">
                    <AvatarImage
                      src={me?.avatarUrl ?? DEFAULT_AVATAR}
                      alt={me?.fullName || me?.username}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xl bg-emerald-50 text-emerald-800">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="text-[17px] font-semibold truncate text-slate-900">
                      {me?.fullName || me?.username || "Người dùng"}
                    </div>
                    <div className="text-xs text-slate-500">Chưa có đánh giá</div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid gap-3 text-sm">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-800"
                  onClick={sharePage}
                >
                  🔗 Chia sẻ trang này
                </Button>

                {isOwner && (
                  <Button
                    size="sm"
                    className="w-full !bg-[#246f67] text-white hover:bg-emerald-800 focus-visible:ring-emerald-600"
                    asChild
                  >
                    <Link to="/account/profile">Chỉnh sửa trang cá nhân</Link>
                  </Button>
                )}

                <div className="rounded-xl border border-emerald-100 p-4 bg-white">
                  <div className="font-medium text-slate-900">Thông tin</div>
                  <ul className="mt-2 space-y-2 text-slate-700">
                    <li className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800">Đã tham gia:</span>{" "}
                      <span>{daysSince(me?.createdAt)} ngày</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-800">Địa chỉ:</span>{" "}
                        {me?.address || "Chưa cập nhật"}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="w-full md:flex-1 mt-6 md:mt-0 bg-white">
          <Tabs defaultValue="active" className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full flex  bg-transparent p-0">
                <TabsTrigger
                  value="active"
                  className="
            relative !rounded-none bg-transparent py-3 text-sm font-semibold
            text-emerald-800 data-[state=inactive]:text-emerald-700/70
            after:absolute after:inset-x-0 after:-bottom-[1px] after:h-[2px]
            after:scale-x-0 after:bg-[#246f67] after:transition
            data-[state=active]:after:scale-x-100
          "
                >
                  Đang hiển thị ({active.length})
                </TabsTrigger>
                <TabsTrigger
                  value="sold"
                  className="
            relative !rounded-none bg-transparent py-3 text-sm font-semibold
            text-emerald-800 data-[state=inactive]:text-emerald-700/70
            after:absolute after:inset-x-0 after:-bottom-[1px] after:h-[2px]
            after:scale-x-0 after:bg-[#246f67] after:transition
            data-[state=active]:after:scale-x-100
          "
                >
                  Đã bán ({sold.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* ACTIVE */}
              <TabsContent value="active" className="m-0">
                {loading ? (
                  <CardsSkeleton />
                ) : err ? (
                  <BlockError text={err} />
                ) : active.length === 0 ? (
                  <EmptyState text="Chưa có tin đăng nào" />
                ) : (
                  <CardsGrid items={active} sold={false} isOwner={isOwner} />
                )}
              </TabsContent>

              {/* SOLD */}
              <TabsContent value="sold" className="m-0">
                {loading ? (
                  <CardsSkeleton />
                ) : err ? (
                  <BlockError text={err} />
                ) : sold.length === 0 ? (
                  <EmptyState text="Chưa có tin đã bán" />
                ) : (
                  <CardsGrid items={sold} sold isOwner={isOwner} />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </div>
    </div>
  );
}

function BlockError({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{text}</div>
  );
}
function EmptyState({ text = "Chưa có tin đăng nào" }: { text?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-emerald-200 p-10 text-center text-slate-600 min-h-[220px] flex flex-col items-center justify-center bg-white">
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-6xl">🗒️</div>
        <div className="mt-3 text-base">{text}</div>
      </div>
    </div>
  );
}
function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white shadow-sm border border-emerald-100 overflow-hidden">
          <div className="h-44 bg-emerald-50 animate-pulse" />
          <div className="p-4">
            <div className="h-4 w-3/4 bg-emerald-50 animate-pulse rounded mb-2" />
            <div className="h-3 w-1/2 bg-emerald-50 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CardsGrid({
  items,
  sold,
  isOwner,
}: {
  items: MemberProduct[];
  sold?: boolean;
  isOwner: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((p) => (
        <article
          key={p.id}
          className="group rounded-2xl bg-white shadow-sm border border-emerald-100 overflow-hidden flex flex-col h-full transition hover:shadow-md hover:border-emerald-200 focus-within:border-emerald-300"
        >
          <div className="w-full h-44 bg-emerald-50 overflow-hidden">
            <img
              src={pickProductImage(p)}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/placeholder.png"; }}
              alt={p.title}
              className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col gap-2 p-4 flex-1">
            <h3 className="line-clamp-2 min-h-[3.25rem] font-semibold !text-[#246f67]">
              {p.title}
            </h3>
            <div className="text-red-700 font-semibold">{formatVND(p.price)}</div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {(p.district || "") + (p.district && p.city ? ", " : "") + (p.city || "")}
              </span>
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 pt-3 px-1">
              <Link
                to={`/product/${p.id}`}
                className="inline-flex items-center text-sm px-3 py-1.5 rounded-md bg-[#246f67] text-white hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                Xem chi tiết
              </Link>

              {isOwner && (
                <Link
                  to={`/post/manage`}
                  className="inline-flex items-center text-sm px-3 py-1.5 rounded-md border border-[#246f67] bg-white text-[#246f67] hover:bg-emerald-50"
                >
                  Quản lý
                </Link>
              )}
            </div>
          </div>

        </article>
      ))}
    </div>
  );
}
