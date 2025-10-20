// src/pages/posts/PostNotice.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, CalendarDays, Timer, Info } from "lucide-react";
import api from "@/lib/axios";

import type {
  VehiclePostResponse,
  BatteryPostResponse,
  ProductImageResponseFE,
} from "@/api/PostApi";

type CreatedPost = (VehiclePostResponse | BatteryPostResponse) & { kind?: "vehicle" | "battery" };

const COLOR = {
  primary: "bg-[#246f67] hover:bg-[#1e5c55] text-white",
  outlinePrimary: "border-[#246f67] text-[#246f67] hover:bg-[#246f67]/5",
};

// ====== Pricing (FE hiển thị; BE vẫn tự tính lại) ======
const BASE_PRICE = 10_000;             // luôn thu
const PRICE_PRIORITY_PER_DAY = 20_000; // gói Ưu tiên
const PRICE_SPECIAL_PER_DAY = 30_000;  // gói Đặc biệt
const DAY_OPTIONS = [7, 15, 30, 60] as const;

type PackKey = "" | "priority" | "special";
type PayMethod = "VNPAY" | "MOMO";

// BE cần "Vnpay"/"Momo" (viết đúng case)
const PAY_METHOD_MAP: Record<PayMethod, "Vnpay" | "Momo"> = {
  VNPAY: "Vnpay",
  MOMO:  "Momo",
};

// Tên gói hiển thị tiếng Việt
const VI_LABEL: Record<"BASIC" | "PRIORITY" | "SPECIAL", string> = {
  BASIC: "Cơ bản",
  PRIORITY: "Ưu tiên",
  SPECIAL: "Đặc biệt",
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

// Chuẩn hoá tên gói để map (bỏ dấu & khoảng trắng, lower-case)
function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export default function PostNotice() {
  const nav = useNavigate();
  const location = useLocation();

  // 1) Lấy created từ state hoặc localStorage (để F5 không mất)
  let created: CreatedPost | undefined = (location.state as any)?.created;
  if (!created) {
    try {
      const raw = localStorage.getItem("last_post_created");
      if (raw) created = JSON.parse(raw);
    } catch {}
  }

  // 2) productId + kind
  const params = new URLSearchParams(location.search);
  const productId =
    (location.state as any)?.productId ||
    created?.productId ||
    params.get("productId") ||
    "";

  const kind: "vehicle" | "battery" =
    (location.state as any)?.type ||
    (created && "batteryTypeName" in created ? "battery" : "vehicle");

  // Ảnh bìa & giá hiển thị
  const cover =
    (created?.images as ProductImageResponseFE[] | undefined)?.find((i) => i.isPrimary)?.url ||
    (created?.images as ProductImageResponseFE[] | undefined)?.[0]?.url ||
    "https://via.placeholder.com/160x120?text=Image";

  const priceMillions = typeof created?.price === "number" ? created!.price / 1_000_000 : 0;

  // UI state
  const [days, setDays] = useState<number>(30);
  const [pack, setPack] = useState<PackKey>("");
  const [payMethod, setPayMethod] = useState<PayMethod>("VNPAY");
  const [isPaying, setIsPaying] = useState(false);
  const [statusText, setStatusText] = useState<string>("PENDING_REVIEW");

  // biết user đã “commit” thanh toán chưa (để quyết định lưu nháp khi rời)
  const committedRef = useRef(false);

  // ====== Fetch động danh sách gói từ BE ======
  type PackageItem = { id: string; name: string; description?: string; durationDays?: number; price?: number };
  const [pkgMap, setPkgMap] = useState<Record<"BASIC" | "PRIORITY" | "SPECIAL", string> | null>(null);
  const [loadingPkg, setLoadingPkg] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<PackageItem[]>("/post/payments/show");
        // Map theo tên (hỗ trợ cả tiếng Anh & tiếng Việt)
        // Các cách match phổ biến: BASIC|COBAN, PRIORITY|UUTIEN, SPECIAL|DACBIET
        const map: Partial<Record<"BASIC" | "PRIORITY" | "SPECIAL", string>> = {};
        for (const p of data ?? []) {
          const n = norm(String(p.name ?? ""));
          if (["basic", "coban"].includes(n)) map.BASIC = p.id;
          else if (["priority", "uutien"].includes(n)) map.PRIORITY = p.id;
          else if (["special", "dacbiet"].includes(n)) map.SPECIAL = p.id;
        }
        // fallback thêm: thử match theo từ khoá chứa
        if (!map.BASIC) {
          const found = (data ?? []).find(p => norm(p.name ?? "").includes("basic") || norm(p.name ?? "").includes("coban"));
          if (found) map.BASIC = found.id;
        }
        if (!map.PRIORITY) {
          const found = (data ?? []).find(p => norm(p.name ?? "").includes("priority") || norm(p.name ?? "").includes("uutien"));
          if (found) map.PRIORITY = found.id;
        }
        if (!map.SPECIAL) {
          const found = (data ?? []).find(p => norm(p.name ?? "").includes("special") || norm(p.name ?? "").includes("dacbiet"));
          if (found) map.SPECIAL = found.id;
        }

        setPkgMap(map as Record<"BASIC" | "PRIORITY" | "SPECIAL", string>);
      } finally {
        setLoadingPkg(false);
      }
    })();
  }, []);

  // Tính tiền (hiển thị)
  const { total, breakdown } = useMemo(() => {
    let sum = BASE_PRICE; // luôn có base
    const bd: string[] = [`Phí đăng tin cơ bản: ${currency(BASE_PRICE)}`];

    if (pack === "priority" || pack === "special") {
      const perDay = pack === "priority" ? PRICE_PRIORITY_PER_DAY : PRICE_SPECIAL_PER_DAY;
      bd.push(`Gói ${pack === "priority" ? VI_LABEL.PRIORITY : VI_LABEL.SPECIAL} (${currency(perDay)}/ngày) x ${days} ngày`);
      sum += perDay * days;
    }
    return { total: sum, breakdown: bd };
  }, [pack, days]);

  const start = new Date();
  const end = addDays(start, days);
  const startDate = fmt(start);
  const endDate = fmt(end);

  // ====== API helpers ======
  async function createPackageAndPayment() {
    if (!productId) throw new Error("Missing productId");
    if (!pkgMap?.BASIC || !pkgMap?.PRIORITY || !pkgMap?.SPECIAL) {
      throw new Error("Không tìm thấy mã gói từ BE");
    }

    // map pack -> packageId của BE (lấy từ pkgMap)
    const packageId =
      pack === "" ? pkgMap.BASIC : pack === "priority" ? pkgMap.PRIORITY : pkgMap.SPECIAL;

    const paymentMethod = PAY_METHOD_MAP[payMethod]; // "Vnpay" | "Momo"

    // ✅ Dùng endpoint BE cung cấp: PUT /post/payments/{productId}/package
    const { data } = await api.put(`/post/payments/${productId}/package`, {
      packageId,
      paymentMethod,
      durationDays: days,
    });

    // BE trả về paymentUrl -> FE redirect sang gateway
    return { paymentUrl: data?.paymentUrl as string, qrCodeUrl: undefined as string | undefined };
  }

  // Đánh dấu tin là “DRAFT” nếu user thoát khi chưa thanh toán
  async function markDraft() {
    if (!productId) return;
    try {
      // Nếu BE của bạn có path khác để set draft, sửa lại dòng dưới:
      await api.put(`/member/product/${productId}/status`, { status: "DRAFT" });
    } catch {
      // nuốt lỗi, không chặn điều hướng
    }
  }

  // (Optional) Lấy trạng thái tin để hiển thị badge thực
  async function fetchStatus() {
    if (!productId) return;
    try {
      const { data } = await api.get(`/member/product/${productId}`);
      if (data?.status) setStatusText(String(data.status));
    } catch {}
  }

  // Nếu thiếu productId → quay về quản lý tin
  useEffect(() => {
    if (!productId) nav("/post/manage", { replace: true });
  }, [productId, nav]);

  useEffect(() => {
    fetchStatus();

    // nếu rời trang mà chưa commit thanh toán → lưu nháp
    const beforeUnload = async (e: BeforeUnloadEvent) => {
      if (!committedRef.current) {
        e.preventDefault();
        try { await markDraft(); } finally {}
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);

    const onPop = async () => {
      if (!committedRef.current) {
        try { await markDraft(); } finally {}
      }
    };
    window.addEventListener("popstate", onPop);

    return () => {
      if (!committedRef.current) markDraft();
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("popstate", onPop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function onPay() {
    if (!productId) return;
    setIsPaying(true);
    try {
      committedRef.current = true; // đã bấm thanh toán

      const { paymentUrl, qrCodeUrl } = await createPackageAndPayment();

      if (qrCodeUrl) window.open(qrCodeUrl, "_blank", "noopener,noreferrer");

      if (paymentUrl) {
        // BE đã cấu hình returnUrl về trang quản lý tin
        window.location.href = paymentUrl;
      } else {
        nav("/post/manage", { replace: true });
      }
    } catch (e) {
      committedRef.current = false; // fail -> cho phép lưu nháp khi rời
    } finally {
      setIsPaying(false);
    }
  }

  function onExitToDraft() {
    (async () => {
      try { await markDraft(); } finally { nav("/post/manage", { replace: true }); }
    })();
  }

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-6 py-5">
      {/* Banner */}
      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 mt-0.5" />
        <div className="text-sm">
          <b>Đăng tin thành công!</b> Vui lòng chọn gói và thanh toán để hoàn tất.
        </div>
      </div>

      {/* Tổng quan bài đăng */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <img src={cover} alt="cover" className="w-[80px] h-[80px] object-cover rounded-md border" />
            <div className="flex-1">
              <div className="font-semibold text-[15px]">
                {created?.title || "(Không có tiêu đề)"}
              </div>
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

          <div className="grid md:grid-cols-3 gap-3">
            {/* Gói tin */}
            <div className="rounded-lg border p-3 bg-slate-50">
              <div className="text-sm font-semibold mb-1">Gói tin</div>
              <div className="flex flex-col gap-2 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    className="accent-[#246f67]"
                    checked={pack === ""}
                    onChange={() => setPack("")}
                  />
                  {VI_LABEL.BASIC} (không thêm gói)
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    className="accent-[#246f67]"
                    checked={pack === "priority"}
                    onChange={() => setPack("priority")}
                  />
                  {VI_LABEL.PRIORITY} ({currency(PRICE_PRIORITY_PER_DAY)}/ngày)
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    className="accent-[#246f67]"
                    checked={pack === "special"}
                    onChange={() => setPack("special")}
                  />
                  {VI_LABEL.SPECIAL} ({currency(PRICE_SPECIAL_PER_DAY)}/ngày)
                </label>
              </div>
            </div>

            {/* Số ngày */}
            <div className="rounded-lg border p-3 bg-slate-50">
              <div className="text-sm font-semibold mb-1">Số ngày đăng tin</div>
              <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Chọn số ngày" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OPTIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>{d} ngày</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm flex items-center gap-2 mt-2">
                <CalendarDays className="w-4 h-4 text-slate-500" />
                {startDate} <span className="mx-1">đến</span> {fmt(end)}
              </div>
              <div className="text-[12px] text-slate-500 mt-1 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" /> Tự động kết thúc sau {days} ngày
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="rounded-lg border p-3 bg-slate-50">
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
          </div>
        </CardContent>
      </Card>

      {/* Tính tiền + hành động */}
      <Card>
        <CardContent className="p-4">
          <div className="text-[16px] font-bold mb-1">Thanh toán</div>
          <div className="text-sm text-slate-600 mb-3">Vui lòng kiểm tra chi tiết và thanh toán để hoàn tất đăng tin.</div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="text-sm text-slate-600">
              <div className="font-semibold mb-1">Chi tiết thanh toán</div>
              <ul className="list-disc pl-5">
                {breakdown.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Info className="w-3.5 h-3.5" />
                Gói {VI_LABEL.PRIORITY}/{VI_LABEL.SPECIAL} tính theo ngày và cộng thêm vào phí cơ bản.
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm">Tổng thanh toán</div>
              <div className="text-2xl font-bold text-[#246f67]">{currency(total)}</div>

              <div className="flex flex-wrap gap-2 mt-3 justify-end">
                <Button variant="outline" className={COLOR.outlinePrimary} onClick={onExitToDraft}>
                  Thoát (Lưu nháp)
                </Button>

                <Button
                  className={COLOR.primary}
                  onClick={onPay}
                  disabled={!productId || isPaying || loadingPkg || !pkgMap}
                >
                  {isPaying ? "Đang tạo thanh toán..." : loadingPkg ? "Đang tải gói..." : "Thanh toán"}
                </Button>
              </div>

              {/* Sau thanh toán, BE redirect về /post/manage (đã cấu hình trong vnp_ReturnUrl/momo return) */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
