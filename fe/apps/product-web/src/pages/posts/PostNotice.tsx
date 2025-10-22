import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, CalendarDays, Timer, Info } from "lucide-react";
import api from "@/lib/axios";
import type {
  VehiclePostResponse,
  BatteryPostResponse,
  ProductImageResponseFE,
} from "@/api/PostApi";
import { toast } from "sonner";

/* ====================== Types ====================== */
type PkgOption = {
  id: string;
  name: string;
  durationDays: number | null;
  price: number | null;
  listPrice: number | null;
  isDefault: boolean;
  sortOrder: number | null;
};

type PkgDTO = {
  postPackageId: string;
  postPackageCode: "STANDARD" | "PRIORITY" | "SPECIAL" | string;
  postPackageName: string;
  postPackageDesc?: string | null;
  billingMode: "FIXED" | "PER_DAY" | string;
  category: "BASE" | "ADDON" | string;
  baseDurationDays: number | null;
  price: number | null;       
  dailyPrice: number | null;   
  includesPostFee: boolean;
  priorityLevel: number | null;
  badgeLabel: string | null;
  showInLatest: boolean;
  showTopSearch: boolean;
  listPrice: number | null;
  isDefault: boolean;
  note: string | null;
  options: PkgOption[];
};

type CreatedPost = (VehiclePostResponse | BatteryPostResponse) & {
  kind?: "vehicle" | "battery";
};

/* ====================== UI helpers ====================== */
const COLOR = {
  primary: "bg-[#008377] hover:bg-[#006E64] text-white",   
  outlinePrimary: "border-[#246f67] text-[#246f67] hover:bg-[#246f67]/5",
};

const VI_LABEL: Record<"STANDARD" | "PRIORITY" | "SPECIAL", string> = {
  STANDARD: "Tin thường",
  PRIORITY: "Tin ưu tiên",
  SPECIAL: "Tin nổi bật",
};

const currency = (v: number) =>
  v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const fmt = (d: Date) =>
  d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

/* ====================== Page ====================== */
export default function PostNotice() {
  const nav = useNavigate();
  const location = useLocation();

  // lấy thông tin bài vừa tạo
  let created: CreatedPost | undefined = (location.state as any)?.created;
  if (!created) {
    try {
      const raw = localStorage.getItem("last_post_created");
      if (raw) created = JSON.parse(raw);
    } catch {}
  }

  const params = new URLSearchParams(location.search);
  const productId =
    (location.state as any)?.productId ||
    created?.productId ||
    params.get("productId") ||
    "";

  const cover =
    (created?.images as ProductImageResponseFE[] | undefined)?.find((i) => i.isPrimary)?.url ||
    (created?.images as ProductImageResponseFE[] | undefined)?.[0]?.url ||
    "https://via.placeholder.com/160x120?text=Image";

  const priceMillions = typeof created?.price === "number" ? created!.price / 1_000_000 : 0;

  const [payMethod, setPayMethod] = useState<"VNPAY" | "MOMO">("VNPAY");
  const [isPaying, setIsPaying] = useState(false);
  const [statusText, setStatusText] = useState<string>("PENDING_REVIEW");
  const committedRef = useRef(false);

  const [basePkg, setBasePkg] = useState<PkgDTO | null>(null);
  const [priorityPkg, setPriorityPkg] = useState<PkgDTO | null>(null);
  const [specialPkg, setSpecialPkg] = useState<PkgDTO | null>(null);
  const [loadingPkg, setLoadingPkg] = useState(true);

  type AddonKey = "" | "PRIORITY" | "SPECIAL";
  const [addon, setAddon] = useState<AddonKey>("");
  const [addonOptionId, setAddonOptionId] = useState<string | null>(null);

  const [freeEligible, setFreeEligible] = useState<boolean | null>(null);

  const addonDays = useMemo(() => {
    const pkg = addon === "PRIORITY" ? priorityPkg : addon === "SPECIAL" ? specialPkg : null;
    if (!pkg) return 0;
    const opt =
      pkg.options.find((o) => o.id === addonOptionId) || pkg.options.find((o) => o.isDefault);
    return opt?.durationDays ?? 0;
  }, [addon, addonOptionId, priorityPkg, specialPkg]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingPkg(true);
        const { data } = await api.get<PkgDTO[]>("/post/payments/show");
        const standard =
          data.find((p) => p.postPackageCode === "STANDARD" || p.category === "BASE") || null;
        const priority = data.find((p) => p.postPackageCode === "PRIORITY") || null;
        const special = data.find((p) => p.postPackageCode === "SPECIAL") || null;

        setBasePkg(standard);
        setPriorityPkg(priority);
        setSpecialPkg(special);

        if (priority?.options?.length)
          setAddonOptionId(
            priority.options.find((o) => o.isDefault)?.id ?? priority.options[0].id
          );
        if (special?.options?.length)
          setAddonOptionId((prev) => prev ?? (special.options.find((o) => o.isDefault)?.id ?? special.options[0].id));
      } finally {
        setLoadingPkg(false);
      }
    })();
  }, []);

  // ====== Tính tiền hiển thị ======
  const { total, breakdown } = useMemo(() => {
    const lines: string[] = [];
    let sum = 0;

    if (basePkg?.price != null) {
      sum += basePkg.price;
      lines.push(`${VI_LABEL.STANDARD}: ${currency(basePkg.price)}`);
    }

    if (addon !== "") {
      const pkg = addon === "PRIORITY" ? priorityPkg : specialPkg;
      const opt = pkg?.options.find((o) => o.id === addonOptionId) || null;
      const addonName = addon === "PRIORITY" ? VI_LABEL.PRIORITY : VI_LABEL.SPECIAL;
      const addonPrice =
        opt?.price != null
          ? opt.price
          : pkg?.dailyPrice && opt?.durationDays
          ? pkg.dailyPrice * opt.durationDays
          : 0;
      sum += addonPrice;
      if (opt) lines.push(`${addonName} (${opt.name}): ${currency(addonPrice)}`);
    }

    return { total: sum, breakdown: lines };
  }, [basePkg, addon, addonOptionId, priorityPkg, specialPkg]);

  const shownTotal = freeEligible ? 0 : total;

  const baseDays = basePkg?.baseDurationDays ?? 30;
  const start = new Date();

  async function markDraft() {
    if (!productId) return;
    try {
      await api.put(`/member/product/${productId}/status`, { status: "DRAFT" });
    } catch {}
  }

  async function fetchStatus() {
    if (!productId) return;
    try {
      const { data } = await api.get(`/member/product/${productId}`);
      if (data?.status) setStatusText(String(data.status));
    } catch {}
  }

  useEffect(() => {
    if (!productId) nav("/post/manage", { replace: true });
  }, [productId, nav]);

  useEffect(() => {
    fetchStatus();

    const beforeUnload = async (e: BeforeUnloadEvent) => {
      if (!committedRef.current) {
        e.preventDefault();
        try {
          await markDraft();
        } finally {}
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);

    const onPop = async () => {
      if (!committedRef.current) {
        try {
          await markDraft();
        } finally {}
      }
    };
    window.addEventListener("popstate", onPop);

    return () => {
      if (!committedRef.current) markDraft();
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("popstate", onPop);
    };
  }, [productId]);

  async function createPackageAndPayment() {
    if (!productId) throw new Error("Missing productId");
    if (!basePkg) throw new Error("Thiếu gói STANDARD");

    let pkgId = basePkg.postPackageId;
    let optionId = "";

    if (addon !== "") {
      const pkg = addon === "PRIORITY" ? priorityPkg : specialPkg;
      const opt =
        pkg?.options.find((o) => o.id === addonOptionId) || pkg?.options[0] || null;
      pkgId = pkg!.postPackageId;
      optionId = opt?.id ?? "";
    }

    const paymentMethod = payMethod === "VNPAY" ? "VNPAY" : "MOMO";

    const body = {
      packageId: pkgId,
      paymentMethod,
      optionId, 
    };

    const { data } = await api.put(`/post/payments/${productId}/package`, body);
    return {
      status: data?.status as string | undefined,
      totalPayable: Number(data?.totalPayable ?? 0),
      paymentUrl: data?.paymentUrl as string | null | undefined,
    };
  }

  async function onPay() {
    if (!productId) return;
    setIsPaying(true);
    try {
      committedRef.current = true;
      const { paymentUrl, totalPayable } = await createPackageAndPayment();

      // Lần đầu: miễn phí 
      if (!totalPayable || !paymentUrl) {
        setFreeEligible(true);
        toast.success("Tin của bạn được duyệt miễn phí cho lần đăng đầu tiên.");
        await fetchStatus();
        nav("/post/manage", { replace: true });
        return;
      }

      window.location.href = paymentUrl;
    } catch {
      committedRef.current = false;
    } finally {
      setIsPaying(false);
    }
  }

  function onExitToDraft() {
    (async () => {
      try {
        await markDraft();
      } finally {
        nav("/post/manage", { replace: true });
      }
    })();
  }

  const endBase = addDays(start, baseDays);
  const endAddon = addonDays ? addDays(start, addonDays) : null;

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-6 py-5">
      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 mt-0.5" />
        <div className="text-sm">
          <b>Đăng tin thành công!</b> Vui lòng chọn gói và thanh toán để hoàn tất.
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <img src={cover} alt="cover" className="w-[80px] h-[80px] object-cover rounded-md border" />
            <div className="flex-1">
              <div className="font-semibold text-[15px]">{created?.title || "(Không có tiêu đề)"}</div>
              <div className="text-[#d4205b] font-bold text-[14px] mt-1">
                {priceMillions.toLocaleString("vi-VN")} triệu
              </div>
              <div className="text-xs text-slate-500 mt-1">Mã tin: {productId}</div>
              <Badge className="mt-2 bg-slate-200 text-slate-700 hover:bg-slate-200">
                {statusText === "PENDING_REVIEW" ? "Đợi duyệt" :
                 statusText === "APPROVED" ? "Đã duyệt" :
                 statusText === "REJECTED" ? "Bị từ chối" :
                 statusText === "DRAFT" ? "Tin nháp" :
                 statusText === "PENDING_PAYMENT" ? "Chờ thanh toán" :
                 statusText || "Không rõ"}
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Chọn gói kiểu Chợ Tốt */}
          <div className="grid md:grid-cols-3 gap-3">
            {/* Tin thường (STANDARD) */}
            <div className="rounded-lg border p-3 bg-white">
              <div className="text-sm font-semibold mb-1">Chọn phương thức đăng tin</div>
              <div className="border rounded-lg p-3">
                <label className="flex items-center gap-3">
                  <input type="radio" className="accent-[#246f67]" checked readOnly />
                  <div>
                    <div className="font-semibold">{VI_LABEL.STANDARD}</div>
                    <div className="text-xs text-slate-500">Áp dụng cho {baseDays} ngày</div>
                    <div className="text-[#246f67] font-bold mt-1">
                      {basePkg?.price != null ? currency(basePkg.price) : "--"}
                    </div>
                    {freeEligible && (
                      <div className="text-xs text-emerald-600 mt-1">Miễn phí cho lần đăng đầu tiên</div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Gói ưu tiên hoặc đặc biệt */}
            <div className="rounded-lg border p-3 bg-slate-50 md:col-span-2">
              <div className="text-sm font-semibold mb-2">Mua thêm dịch vụ bán nhanh hơn</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {/* PRIORITY */}
                <div className="border rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        className="accent-[#246f67]"
                        checked={addon === "PRIORITY"}
                        onChange={() => {
                          setAddon("PRIORITY");
                          const def = priorityPkg?.options.find((o) => o.isDefault) || priorityPkg?.options[0];
                          setAddonOptionId(def?.id ?? null);
                        }}
                      />
                      <span className="font-semibold">{VI_LABEL.PRIORITY}</span>
                    </label>
                    <span className="text-xs text-slate-500">
                      {priorityPkg?.dailyPrice ? `${currency(priorityPkg.dailyPrice)}/ngày` : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(priorityPkg?.options ?? []).map((o) => (
                      <Button
                        key={o.id}
                        size="sm"
                        variant={addon === "PRIORITY" && addonOptionId === o.id ? "default" : "outline"}
                        className={addon === "PRIORITY" && addonOptionId === o.id ? COLOR.primary : ""}
                        onClick={() => {
                          setAddon("PRIORITY");
                          setAddonOptionId(o.id);
                        }}
                      >
                        {o.name} {o.price != null ? `• ${currency(o.price)}` : ""}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* SPECIAL */}
                <div className="border rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        className="accent-[#246f67]"
                        checked={addon === "SPECIAL"}
                        onChange={() => {
                          setAddon("SPECIAL");
                          const def = specialPkg?.options.find((o) => o.isDefault) || specialPkg?.options[0];
                          setAddonOptionId(def?.id ?? null);
                        }}
                      />
                      <span className="font-semibold">{VI_LABEL.SPECIAL}</span>
                    </label>
                    <span className="text-xs text-slate-500">
                      {specialPkg?.dailyPrice ? `${currency(specialPkg.dailyPrice)}/ngày` : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(specialPkg?.options ?? []).map((o) => (
                      <Button
                        key={o.id}
                        size="sm"
                        variant={addon === "SPECIAL" && addonOptionId === o.id ? "default" : "outline"}
                        className={addon === "SPECIAL" && addonOptionId === o.id ? COLOR.primary : ""}
                        onClick={() => {
                          setAddon("SPECIAL");
                          setAddonOptionId(o.id);
                        }}
                      >
                        {o.name} {o.price != null ? `• ${currency(o.price)}` : ""}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bỏ chọn add-on */}
              <div className="mt-3">
                <Button size="sm" variant="ghost" onClick={() => setAddon("")}>
                  Bỏ chọn dịch vụ thêm
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tính tiền */}
      <Card>
        <CardContent className="p-4">
          <div className="text-[16px] font-bold mb-1">Thanh toán</div>
          <div className="text-sm text-slate-600 mb-3">
            Vui lòng kiểm tra chi tiết và thanh toán để hoàn tất đăng tin.
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="text-sm text-slate-600">
              <div className="font-semibold mb-1">Chi tiết thanh toán</div>
              <ul className="list-disc pl-5">
                {breakdown.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Info className="w-3.5 h-3.5" />
                {VI_LABEL.PRIORITY}/{VI_LABEL.SPECIAL} là dịch vụ cộng thêm theo ngày.
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Tin thường: {fmt(start)} → {fmt(addDays(start, baseDays))}
                {addonDays ? <> ・ Add-on: {fmt(start)} → {fmt(addDays(start, addonDays))}</> : null}
              </div>
              <div className="text-[12px] text-slate-500 mt-1 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" /> Tự động kết thúc theo thời hạn gói đã chọn
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm">Tổng thanh toán</div>
              <div className="text-2xl font-bold text-[#246f67]">{currency(shownTotal || 0)}</div>
              {freeEligible && (
                <div className="text-xs text-emerald-600 mt-1">Miễn phí cho lần đăng đầu tiên</div>
              )}

              <div className="text-left mt-3">
                <div className="text-sm font-semibold mb-1">Phương thức thanh toán</div>
                <div className="flex flex-col gap-2 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      className="accent-[#246f67]"
                      checked={payMethod === "VNPAY"}
                      onChange={() => setPayMethod("VNPAY")}
                    />
                    VNPay
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      className="accent-[#246f67]"
                      checked={payMethod === "MOMO"}
                      onChange={() => setPayMethod("MOMO")}
                    />
                    MoMo
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 justify-end">
                <Button variant="outline" className={COLOR.outlinePrimary} onClick={onExitToDraft}>
                  Thoát (Lưu nháp)
                </Button>
                <Button
                  className={COLOR.primary}
                  onClick={onPay}
                  disabled={!productId || isPaying || loadingPkg || !basePkg}
                >
                  {isPaying ? "Đang tạo thanh toán..." : loadingPkg ? "Đang tải gói..." : "Thanh toán"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
