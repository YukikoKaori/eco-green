import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, MapPin, Phone, Clock, CheckCircle2 } from "lucide-react";
import LikeButton from "@/listings/components/LikeButton";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import ReportAbuse from "@/listings/report/ReportAbuse";

import {
  fetchProductDetail,
  fetchVehicleCatalog,
  fetchSimilarVehicles,
  fetchSimilarBatteries,
  createPurchaseRequest,
  type ProductDetailDTO,
  type VehicleCatalogEnvelope,
  type NormalizedSimilarItem,
} from "@/api/productDetail";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addRecentView } from "@/api/recent";

/* --------------------------- Helpers ---------------------------- */
function timeAgoVi(iso?: string | null) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return "Vừa đăng";
  const m = Math.floor(s / 60);
  if (m < 60) return `Đăng ${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Đăng ${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `Đăng ${d} ngày trước`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `Đăng ${mo} tháng trước`;
  const y = Math.floor(d / 365);
  return `Đăng ${y} năm trước`;
}

function maskPhone(p?: string | null) {
  if (!p) return "";
  if (p.length < 7) return p;
  return p.slice(0, 5) + "****";
}

function currencyVND(v?: number | string | null) {
  if (v == null) return "--";
  const n = typeof v === "string" ? Number(v.replaceAll(".", "").replaceAll(",", "")) : v;
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}
const hasNum = (n: number | null | undefined) => typeof n === "number" && Number.isFinite(n);
const toNumberPrice = (v?: number | string | null): number | null => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(v.replaceAll(".", "").replaceAll(",", ""));
  return Number.isFinite(n) ? n : null;
};

/* ============================== Page ============================== */
export default function ProductDetail() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const { user } = useAuth();
  const { isLiked, toggle, refresh } = useWishlist();

  const [prod, setProd] = useState<ProductDetailDTO | null>(null);
  const [catalog, setCatalog] = useState<VehicleCatalogEnvelope | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showPhone, setShowPhone] = useState(false);

  const [similar, setSimilar] = useState<NormalizedSimilarItem[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Mua
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("Đã gửi yêu cầu đến người bán");
  const [offerPrice, setOfferPrice] = useState<number | "">("");
  const [buyerMessage, setBuyerMessage] = useState("");
  const [buying, setBuying] = useState(false);

  const liked = useMemo(() => (id ? isLiked(id) : false), [id, isLiked]);

  // images
  const imgs = useMemo(() => {
    const list = (prod?.productImagesList ?? []).filter(Boolean);
    if (!list.length) return [{ imageUrl: "https://via.placeholder.com/1200x675?text=No+Image" }];
    return [...list].sort(
      (a, b) => Number(!!b.isPrimary) - Number(!!a.isPrimary) || (a.position ?? 0) - (b.position ?? 0)
    );
  }, [prod?.productImagesList]);

  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((p) => (p - 1 + imgs.length) % imgs.length);
  const next = () => setIdx((p) => (p + 1) % imgs.length);

  const postedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!id || !user) return;
    if (postedRef.current === id) return;
    postedRef.current = id;

    (async () => {
      try {
        await addRecentView(id);
      } catch {
      }
    })();
  }, [id, user]);

  // fetch data
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const p = await fetchProductDetail(id);
        if (off) return;
        setProd(p);
        if (user) refresh().catch(() => {});

        if (p?.type?.toUpperCase() === "VEHICLE") {
          fetchVehicleCatalog(id)
            .then((c) => !off && setCatalog(c))
            .catch(() => {});
        } else {
          setCatalog(null);
        }

        // Similar
        setLoadingSimilar(true);
        const similarPromise =
          p?.type?.toUpperCase() === "VEHICLE"
            ? fetchSimilarVehicles(id)
            : p?.type?.toUpperCase() === "BATTERY"
            ? fetchSimilarBatteries(id)
            : Promise.resolve<NormalizedSimilarItem[]>([]);
        similarPromise
          .then((s) => !off && setSimilar(s))
          .catch(() => !off && setSimilar([]))
          .finally(() => !off && setLoadingSimilar(false));
      } catch (e: any) {
        if (!off) setErr(e?.response?.data?.message || "Không tải được sản phẩm.");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [id, user, refresh]);

  async function handleToggleLike() {
    if (!id) return;
    if (!user) {
      const nextUrl = encodeURIComponent(loc.pathname + loc.search + loc.hash);
      nav(`/login?next=${nextUrl}`);
      toast.info("Vui lòng đăng nhập để theo dõi tin.");
      return;
    }
    await toggle(id);
  }

  const handleOpenBuy = () => {
    if (!id) return;
    if (!user) {
      const nextUrl = encodeURIComponent(loc.pathname + loc.search + loc.hash);
      nav(`/login?next=${nextUrl}`);
      toast.info("Vui lòng đăng nhập để gửi yêu cầu mua.");
      return;
    }
    // Chặn người bán tự mua tin của mình
    if (user.id && prod?.sellerId && user.id === prod.sellerId) {
      toast.info("Bạn đang là người bán của tin này.");
      return;
    }
    const p = toNumberPrice(prod?.price ?? catalog?.productPrice ?? null);
    setOfferPrice(p ?? "");
    setOpenConfirm(true);
  };

  // Xác nhận mua
  const handleConfirmBuy = async () => {
    if (!id) return;
    const numberPrice = typeof offerPrice === "number" ? offerPrice : toNumberPrice(offerPrice);
    if (!numberPrice || numberPrice <= 0) {
      toast.error("Giá đề nghị không hợp lệ.");
      return;
    }
    setBuying(true);
    try {
      await createPurchaseRequest({
        productId: id,
        offeredPrice: numberPrice,
        buyerMessage: buyerMessage?.trim() || undefined,
      });
      setSuccessMsg("Đã gửi yêu cầu đến người bán");
      setOpenConfirm(false);
      setOpenSuccess(true);
      toast.success("Đã gửi yêu cầu mua.");
      setBuyerMessage("");
      setOfferPrice("");
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gửi yêu cầu thất bại.";
      if (/đã gửi yêu cầu mua/i.test(msg)) {
        setSuccessMsg("Bạn đã gửi yêu cầu cho sản phẩm này. Vui lòng chờ người bán phản hồi.");
        setOpenConfirm(false);
        setOpenSuccess(true);
        toast.info(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setBuying(false);
    }
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-6 space-y-4">
        <Skeleton className="h-72 w-full rounded-xl" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-80 rounded-xl md:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );

  if (err || !prod)
    return (
      <div className="max-w-4xl mx-auto px-3 md:px-6 py-10 text-center">
        <div className="text-xl font-semibold mb-2">Có lỗi xảy ra</div>
        <div className="text-slate-600 mb-4">{err || "Không tìm thấy sản phẩm."}</div>
        <Link to="/" className="underline text-[#246f67]">Về trang chủ</Link>
      </div>
    );

  const c = catalog?.vehicleCatalog;
  const title = prod.title || catalog?.productTitle || "";
  const price = prod.price ?? catalog?.productPrice ?? null;

  const brandName = prod.brandName ?? catalog?.brandName ?? null;
  const modelName = prod.modelName ?? catalog?.modelName ?? null;
  const version = prod.version ?? catalog?.versionName ?? null;

  const address = [prod.ward, prod.district, prod.city].filter(Boolean).join(", ");
  const metaYear = (prod.year ?? c?.year) ? String(prod.year ?? c?.year) : null;
  const metaKm =
    (prod.odometerKm ?? catalog?.mileageKm) != null
      ? `${prod.odometerKm ?? catalog?.mileageKm} km`
      : null;
  const metaLine = [metaYear, metaKm].filter(Boolean).join(" · ");

  /* ------------------------------ UI ------------------------------ */
  return (
    <div className="max-w-[1200px] mx-auto px-3 md:px-6 py-4">
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left */}
        <div className="lg:col-span-3">
          <div className="rounded-xl overflow-hidden relative">
            <div className="aspect-video bg-slate-100 max-h-[480px] md:max-h-[440px]">
              <img
                src={imgs[idx]?.imageUrl}
                alt={`image-${idx}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {imgs.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Prev"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <ReportAbuse productId={prod.id} className="absolute right-3 top-3" />
          </div>

          {/* thumbs */}
          {imgs.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {imgs.map((im, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-16 w-28 shrink-0 rounded-lg overflow-hidden border ${
                    i === idx ? "border-[#246f67]" : "border-slate-200"
                  }`}
                >
                  <img src={im.imageUrl} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {/* description */}
          {prod.description && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-lg font-semibold mb-2">Mô tả chi tiết</div>
                <p className="whitespace-pre-line leading-relaxed text-[15px] text-slate-700">
                  {prod.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* specs */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="text-lg font-semibold mb-3">Thông số chi tiết</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[13px]">
                {brandName && <Spec label="Hãng" value={brandName} />}
                {modelName && <Spec label="Dòng xe" value={modelName} />}
                {version && <Spec label="Phiên bản" value={version} />}
                {(c?.type || null) && <Spec label="Kiểu dáng" value={c!.type!} />}
                {(prod.color || c?.color) && <Spec label="Màu" value={(prod.color || c?.color)!} />}
                {typeof prod.seats === "number" && <Spec label="Số chỗ ngồi" value={`${prod.seats}`} />}
                {hasNum(prod.odometerKm ?? catalog?.mileageKm) && (
                  <Spec label="Số km đã đi" value={`${prod.odometerKm ?? catalog?.mileageKm} km`} />
                )}
                {hasNum(c?.batteryCapacityKwh ?? prod.batteryCapacityKwh) && (
                  <Spec label="Dung lượng pin" value={`${c?.batteryCapacityKwh ?? prod.batteryCapacityKwh} kWh`} />
                )}
                {hasNum(c?.rangeKm) && <Spec label="Tầm hoạt động" value={`${c!.rangeKm} km`} />}
                {hasNum(c?.powerHp) && <Spec label="Công suất" value={`${c!.powerHp} HP`} />}
                {hasNum(c?.topSpeedKmh ?? prod.topSpeedKmh) && (
                  <Spec label="Tốc độ tối đa" value={`${c?.topSpeedKmh ?? prod.topSpeedKmh} km/h`} />
                )}
                {hasNum(c?.weightKg) && <Spec label="Trọng lượng bản thân" value={`${c!.weightKg} kg`} />}
                {hasNum(c?.grossWeightKg) && (
                  <Spec label="Trọng lượng toàn bộ" value={`${c!.grossWeightKg} kg`} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-3 lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h1 className="!text-[26px] md:text-[34px] font-bold leading-tight">{title}</h1>

                <button
                  type="button"
                  onClick={handleToggleLike}
                  className="shrink-0 inline-flex items-center gap-2 rounded-full border !px-3 !py-1.5
                             !text-sm !text-slate-700 !bg-white !hover:bg-slate-50
                             border-slate-200 shadow-sm"
                  aria-pressed={liked}
                >
                  <LikeButton liked={liked} onToggle={handleToggleLike} className="p-0" size={18} outlineWidth={3} />
                  <span className="whitespace-nowrap">{liked ? "Đã lưu" : "Lưu"}</span>
                </button>
              </div>

              <div className="text-[28px] font-bold text-[#d4205b] mt-3">{currencyVND(price)}</div>

              {metaLine && <div className="text-slate-500 text-sm mt-2">{metaLine}</div>}

              {/* Địa chỉ */}
              <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span>{address || "—"}</span>
              </div>

              {/* Thời gian đăng */}
              {prod.createdAt && (
                <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{timeAgoVi(prod.createdAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-lg font-semibold mb-2">Người bán</div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 grid place-items-center font-semibold">
                  {(prod.sellerName || "?").charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{prod.sellerName || "Người bán"}</div>
                  <div className="text-xs text-slate-500">{address || "—"}</div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-2">
                {/* Nút Mua */}
                <Button
                  className="!bg-[#246f67] hover:bg-[#1f5f58] text-white"
                  onClick={handleOpenBuy}
                >
                  Mua
                </Button>

                <Button
                  variant="outline"
                  className="!border-slate-300"
                  onClick={() => setShowPhone((s) => !s)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {showPhone ? (prod.sellerPhone || "Chưa có SĐT") : `Hiện số ${maskPhone(prod.sellerPhone)}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===================== Similar Listings ===================== */}
      {similar.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">Tin đăng tương tự</div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  to={`/product/${s.id}`}
                  className="min-w-[280px] max-w-[280px] bg-white rounded-xl border border-slate-200 hover:shadow-md transition"
                >
                  <div className="aspect-video rounded-t-xl overflow-hidden bg-slate-100">
                    <img
                      src={s.image || "https://via.placeholder.com/640x360?text=No+Image"}
                      alt={s.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-sm text-slate-500 mb-0.5">
                      {[s.brandName, s.modelName].filter(Boolean).join(" · ")}
                    </div>
                    <div className="font-medium line-clamp-2">{s.title}</div>
                    <div className="mt-2 text-[#d4205b] font-bold">
                      {currencyVND(s.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {loadingSimilar && (
              <div className="flex gap-3 mt-2">
                <Skeleton className="h-44 w-[280px] rounded-xl" />
                <Skeleton className="h-44 w-[280px] rounded-xl" />
                <Skeleton className="h-44 w-[280px] rounded-xl" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận mua sản phẩm</DialogTitle>
            <DialogDescription>
              Gửi yêu cầu mua đến người bán. Họ sẽ nhận email và liên hệ lại với bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm text-slate-600">Giá đề nghị (VND)</label>
              <Input
                type="number"
                min={0}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Lời nhắn cho người bán (tuỳ chọn)</label>
              <Textarea
                placeholder="Tôi muốn mua xe này, thanh toán qua chuyển khoản…"
                value={buyerMessage}
                onChange={(e) => setBuyerMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConfirm(false)}>Huỷ</Button>
            <Button
              className="text-white"
              style={{ backgroundColor: "#246f67" }}
              onClick={handleConfirmBuy}
              disabled={buying}
            >
              {buying ? "Đang gửi..." : "Xác nhận mua"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ----------------------------- Small UI ----------------------------- */
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg px-3 py-2 flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
