import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarDays, MapPin } from "lucide-react";

import {
  getSellerProfile,
  getSellerActiveProducts,
  getSellerSoldProducts,
  type SellerPublicProfile,
  type SellerProduct,
  pickProductImage,
  formatVND,
} from "@/api/seller";

/* ====== local helpers ====== */
const DEFAULT_AVATAR = "/images/avatar-default.png";
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

export default function SellerPublic() {
  const { userId = "" } = useParams<{ userId: string }>();

  const [profile, setProfile] = useState<SellerPublicProfile | null>(null);
  const [active, setActive] = useState<SellerProduct[]>([]);
  const [sold, setSold] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    (async () => {
      if (!userId) {
        setErr("Không tìm thấy người bán.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErr(null);
        const [p, a, s] = await Promise.all([
          getSellerProfile(userId),
          getSellerActiveProducts(userId),
          getSellerSoldProducts(userId),
        ]);
        if (!on) return;
        setProfile(p);
        setActive(a || []);
        setSold(s || []);
        document.title = `${p?.fullName || p?.username || "Trang người bán"} · Eco Green`;
      } catch (e: any) {
        if (!on) return;
        setErr(e?.message || "Không tải được dữ liệu người bán.");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [userId]);

  const initials = useMemo(
    () => (profile?.fullName || profile?.username || "U").charAt(0).toUpperCase(),
    [profile?.fullName, profile?.username]
  );

  if (loading) return <FullscreenSpinner />;

  if (err) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6 py-12 text-center">
        <div className="text-xl font-semibold mb-2">Có lỗi xảy ra</div>
        <div className="text-slate-600 mb-4">{err}</div>
        <Link to="/" className="underline text-[#246f67]">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8">
      <div className="md:flex md:items-start md:gap-6">
        {/* LEFT – Info */}
        <aside className="w-full md:w-96 md:sticky md:top-24 md:self-start space-y-4">
          <div className="rounded-2xl bg-white shadow-sm border border-emerald-100">
            <div
              className="w-full h-28 rounded-t-2xl bg-center bg-cover bg-no-repeat"
              style={{ backgroundImage: "url('/images/profile-cover.png')" }}
            />
            <div className="p-5">
              <div className="flex items-center gap-4 -mt-20">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow">
                  <AvatarImage
                    src={profile?.avatarUrl || DEFAULT_AVATAR}
                    alt={profile?.fullName || profile?.username || "avatar"}
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR)}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xl bg-emerald-50 text-emerald-800">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="text-[17px] font-semibold truncate text-slate-900">
                    {profile?.fullName || profile?.username || "Người bán"}
                  </div>
                  <div className="text-xs text-slate-500">Chưa có đánh giá</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-800"
                  onClick={async () => {
                    const url = window.location.href;
                    if (navigator.share) {
                      try {
                        await navigator.share({ title: profile?.fullName || "Trang người bán", url });
                        return;
                      } catch {}
                    }
                    await navigator.clipboard?.writeText(url);
                  }}
                >
                  🔗 Chia sẻ trang này
                </Button>

                <div className="rounded-xl border border-emerald-100 p-4 bg-white">
                  <div className="font-medium text-slate-900">Thông tin</div>
                  <ul className="mt-2 space-y-2 text-slate-700">
                    <li className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800">Đã tham gia:</span>{" "}
                      <span>{daysSince(profile?.createdAt)} ngày</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-800">Địa chỉ:</span>{" "}
                        {profile?.address || "Chưa cập nhật"}
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT – Listings */}
        <section className="w-full md:flex-1 mt-6 md:mt-0 bg-white">
          <Tabs defaultValue="active" className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full flex bg-transparent p-0">
                <TabsTrigger
                  value="active"
                  className="relative !rounded-none bg-transparent py-3 text-sm font-semibold
                             text-emerald-800 data-[state=inactive]:text-emerald-700/70
                             after:absolute after:inset-x-0 after:-bottom-[1px] after:h-[2px]
                             after:scale-x-0 after:bg-[#246f67] after:transition
                             data-[state=active]:after:scale-x-100"
                >
                  Đang hiển thị ({active.length})
                </TabsTrigger>
                <TabsTrigger
                  value="sold"
                  className="relative !rounded-none bg-transparent py-3 text-sm font-semibold
                             text-emerald-800 data-[state=inactive]:text-emerald-700/70
                             after:absolute after:inset-x-0 after:-bottom-[1px] after:h-[2px]
                             after:scale-x-0 after:bg-[#246f67] after:transition
                             data-[state=active]:after:scale-x-100"
                >
                  Đã bán ({sold.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="active" className="m-0">
                {active.length === 0 ? (
                  <EmptyState text="Chưa có tin đăng nào" />
                ) : (
                  <CardsGrid items={active} />
                )}
              </TabsContent>

              <TabsContent value="sold" className="m-0">
                {sold.length === 0 ? (
                  <EmptyState text="Chưa có tin đã bán" />
                ) : (
                  <SoldList items={sold} />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </div>
    </div>
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

function CardsGrid({ items }: { items: SellerProduct[] }) {
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
            <h3 className="line-clamp-2 min-h-[3.25rem] font-semibold !text-[#246f67]">{p.title}</h3>
            <div className="font-semibold text-red-700">{formatVND(p.price)}</div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{[p.district, p.city].filter(Boolean).join(", ")}</span>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-3 px-1">
              <Link
                to={`/product/${p.id}`}
                className="inline-flex items-center text-sm px-3 py-1.5 rounded-md bg-[#246f67] text-white hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function SoldList({ items }: { items: SellerProduct[] }) {
  return (
    <div className="space-y-3">
      {items.map((p) => (
        <article
          key={p.id}
          className="flex gap-4 items-stretch rounded-xl border border-emerald-100 bg-white p-3 shadow-sm hover:border-emerald-200 transition"
        >
          <div className="w-40 h-24 rounded-lg overflow-hidden bg-emerald-50 shrink-0">
            <img
              src={pickProductImage(p)}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/placeholder.png";
              }}
              alt={p.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-800 line-clamp-2">{p.title}</div>
            <div className="mt-1 text-sm text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{[p.district, p.city].filter(Boolean).join(", ")}</span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between">
            <div className="text-red-700 font-semibold">{formatVND(p.price)}</div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">ĐÃ BÁN</span>
          </div>
        </article>
      ))}
    </div>
  );
}
