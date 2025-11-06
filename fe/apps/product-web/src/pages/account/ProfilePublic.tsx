import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, CalendarDays, MessageSquare } from "lucide-react";
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
function BadgeDot({ ok, label }: { ok?: boolean | null; label: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded border ${
        ok ? "border-[#246f67] text-[#246f67]" : "border-slate-300 text-slate-400"
      }`}
    >
      {label}
    </span>
  );
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
  const nav = useNavigate();
  if (authLoading) return <FullscreenSpinner />;
  if (!user) return <PageError text="Bạn cần đăng nhập để xem trang này." />;

  /* ---- PROFILE LEFT ---- */
  const [me, setMe] = useState<UserProfile | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!user) return; 

    (async () => {
      try {
        const p = await getMe();
        if (mounted) setMe(p);
      } catch {
        if (mounted)
          setMe({
            id: user.id,
            username: user.username,
            email: user.email ?? null,
            fullName: user.fullName,
            phone: user.phone ?? "",
            address: user.address,
            avatarUrl: user.avatarUrl,
            createdAt: null,
            updatedAt:null,
            dateOfBirth: user.dateOfBirth ?? null,
            taxCode: null,
            nationalId: null,
            gender: user.gender ?? "OTHER",
            status: "ACTIVE",
            role: user.role,
          } as UserProfile);
      } finally {
        if (mounted) setLoadingMe(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  const initials = (me?.fullName || me?.username || "U").charAt(0).toUpperCase();
  const DEFAULT_AVATAR = "/images/avatar-default.png";

  async function sharePage() {
    const username = me?.username ?? user?.username ?? "";
    const title =
      me?.fullName ?? me?.username ?? user?.fullName ?? user?.username ?? "Trang cá nhân";
    const url = `${window.location.origin}/profile/${encodeURIComponent(username)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {}
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
    if (!user) return; 

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [a, s] = await Promise.all([
          getMemberProducts("ACTIVE"),
          getMemberProducts("SOLD"),
        ]);
        if (mounted) {
          setActive(a);
          setSold(s);
        }
      } catch (e: any) {
        if (mounted) {
          const msg =
            e?.response?.status === 401
              ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              : e?.response?.data?.message || e?.message || "Không tải được danh sách tin.";
          setErr(msg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8">
      <div className="md:flex md:items-start md:gap-6">
        {/* LEFT */}
        <aside className="w-full md:w-96 rounded-2xl bg-white shadow-sm border border-emerald-100 md:sticky md:top-24 md:self-start">
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
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow">
                    <AvatarImage
                      src={me?.avatarUrl ?? DEFAULT_AVATAR}
                      alt={me?.fullName || me?.username}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xl bg-emerald-50 text-emerald-800">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 grid place-content-center h-6 w-6 rounded-full bg-white border shadow hover:shadow-md"
                    title="Đổi ảnh đại diện"
                  >
                    <Camera className="w-4 h-4 text-gray-700" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="text-[17px] font-semibold truncate text-slate-900">
                    {me?.fullName || me?.username}
                  </div>
                  <div className="text-xs text-slate-500">Chưa có đánh giá</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Người theo dõi: <span className="font-medium">0</span>
                    <span className="mx-2 text-slate-300">|</span>
                    Đang theo dõi: <span className="font-medium">0</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-3 text-sm">
              <Button
                size="sm"
                className="w-full bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600"
                onClick={sharePage}
              >
                🔗 Chia sẻ trang của bạn
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-800"
                onClick={() => nav("/account/profile")}
              >
                Chỉnh sửa trang cá nhân
              </Button>

              <div className="rounded-xl border border-emerald-100 p-4 bg-white">
                <div className="font-medium text-slate-900">Thông tin</div>
                <ul className="mt-2 space-y-2 text-slate-700">
                  <li className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-800">Đã tham gia:</span>{" "}
                    <span>{daysSince(me?.createdAt)} ngày</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-800">Phản hồi chat:</span>{" "}
                    <span className="text-slate-500">Chưa có thông tin</span>
                  </li>
                  <li className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-800">Đã xác thực:</span>
                    <div className="flex items-center gap-2">
                      <BadgeDot ok={!!me?.phone} label="SĐT" />
                      <BadgeDot ok={!!me?.email} label="Email" />
                      <BadgeDot ok={false} label="Google" />
                      <BadgeDot ok={false} label="Facebook" />
                    </div>
                  </li>
                  <li>
                    <span className="font-medium text-slate-800">Địa chỉ:</span>{" "}
                    {me?.address || "Chưa cập nhật"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <section className="w-full md:flex-1 mt-6 md:mt-0 rounded-2xl bg-white shadow-sm border border-emerald-100">
          <Tabs defaultValue="active">
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-2 gap-2 bg-emerald-50 p-1 rounded-xl border border-emerald-100">
                <TabsTrigger
                  value="active"
                  className="rounded-lg px-6 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm"
                >
                  Đang hiển thị ({active.length})
                </TabsTrigger>
                <TabsTrigger
                  value="sold"
                  className="rounded-lg px-6 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm"
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
                  <EmptyState
                    text="Bạn chưa có tin đăng nào"
                    ctaLabel="ĐĂNG TIN NGAY"
                    onCta={() => nav("/post/new")}
                  />
                ) : (
                  <CardsGrid items={active} />
                )}
              </TabsContent>

              {/* SOLD */}
              <TabsContent value="sold" className="m-0">
                {loading ? (
                  <CardsSkeleton />
                ) : err ? (
                  <BlockError text={err} />
                ) : sold.length === 0 ? (
                  <EmptyState
                    text="Bạn chưa có tin đã bán"
                    ctaLabel="ĐĂNG TIN NGAY"
                    onCta={() => nav("/post/new")}
                  />
                ) : (
                  <CardsGrid items={sold} sold />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </div>
    </div>
  );
}


function PageError({ text }: { text: string }) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{text}</div>
    </div>
  );
}
function BlockError({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{text}</div>
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
    <div className="relative overflow-hidden rounded-xl border border-dashed border-emerald-200 p-10 text-center text-slate-600 min-h-[260px] flex flex-col items-center justify-center bg-white">
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-6xl">🗒️</div>
        <div className="mt-3 text-base">{text}</div>
        {ctaLabel && onCta && (
          <Button
            type="button"
            onClick={onCta}
            className="mt-6 px-6 h-11 rounded-md bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600 font-semibold"
          >
            {ctaLabel}
          </Button>
        )}
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
function CardsGrid({ items, sold }: { items: MemberProduct[]; sold?: boolean }) {
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
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/placeholder.png";
              }}
              alt={p.title}
              className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col gap-2 p-4 flex-1">
            <h3 className="line-clamp-2 font-semibold text-slate-900">{p.title}</h3>
            <div className="h-0.5 w-6 bg-emerald-600 rounded" />
            <div className="text-emerald-700 font-semibold">{formatVND(p.price)}</div>
            <div className="text-xs text-slate-600">
              {(p.district || "") + (p.district && p.city ? ", " : "") + (p.city || "")}
            </div>
            <div className="mt-auto flex items-center gap-2 pt-2">
              <Link
                to={`/product/${p.id}`}
                className="inline-flex items-center text-sm px-3 py-1.5 rounded-md bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                Xem chi tiết
              </Link>
              <Link
                to={`/post/manage`}
                className="inline-flex items-center text-sm px-3 py-1.5 rounded-md border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
              >
                Quản lý
              </Link>
              {sold && (
                <span className="ml-auto inline-flex items-center text-[11px] px-2 py-1 rounded bg-emerald-700 text-white">
                  ĐÃ BÁN
                </span>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
