import { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, CalendarDays, Timer, Info } from "lucide-react";

import type {
  VehiclePostResponse,
  BatteryPostResponse,
  ProductImageResponseFE,
} from "@/api/PostApi";

type CreatedPost = (VehiclePostResponse | BatteryPostResponse) & {
  kind?: "vehicle" | "battery";
};

const COLOR = {
  primary: "bg-[#246f67] hover:bg-[#1e5c55] text-white",
  outlinePrimary: "border-[#246f67] text-[#246f67] hover:bg-[#246f67]/5",
};

const PRICE_POST_BASE = 5000;            // Tin thường (trả phí)
const PRICE_PRIORITY_PER_DAY = 20000;    // Gói Ưu tiên
const PRICE_SPECIAL_PER_DAY = 35000;     // Gói Đặc biệt
const DAY_OPTIONS = [7, 15, 30, 60];

const currency = (v: number) =>
  v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const fmt = (d: Date) =>
  d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

type PostMethod = "free" | "paid";
type PackKey = "" | "priority" | "special";

export default function PostNotice() {
  const nav = useNavigate();
  const location = useLocation();

  // 1) Lấy từ state do trang trước truyền sang
  let created: CreatedPost | undefined = (location.state as any)?.created;

  // 2) Fallback: localStorage (hỗ trợ F5)
  if (!created) {
    try {
      const raw = localStorage.getItem("last_post_created");
      if (raw) created = JSON.parse(raw);
    } catch {}
  }

  // 3) Lấy productId/kind để truyền sang checkout
  const params = new URLSearchParams(location.search);
  const productId =
    (location.state as any)?.productId ||
    created?.productId ||
    params.get("productId") ||
    "";

  const kind: "vehicle" | "battery" =
    (location.state as any)?.type ||
    (created && "batteryTypeName" in created ? "battery" : "vehicle");

  // Ảnh bìa
  const cover =
    (created?.images as ProductImageResponseFE[] | undefined)?.find((i) => i.isPrimary)?.url ||
    (created?.images as ProductImageResponseFE[] | undefined)?.[0]?.url ||
    "https://via.placeholder.com/160x120?text=Image";

  // Giá hiển thị "x,xx triệu"
  const priceMillions =
    typeof created?.price === "number" ? created!.price / 1_000_000 : 0;

  const [method, setMethod] = useState<PostMethod>("free");
  const [days, setDays] = useState<number>(60);
  const [pack, setPack] = useState<PackKey>("");

  // Demo: miễn phí lần đầu
  const isFirstPost = true;

  const { total, breakdown, needPayment } = useMemo(() => {
    const bd: string[] = [];
    let sum = 0;

    if (pack === "priority" || pack === "special") {
      const perDay = pack === "priority" ? PRICE_PRIORITY_PER_DAY : PRICE_SPECIAL_PER_DAY;
      bd.push(`Gói ${pack === "priority" ? "Ưu tiên" : "Đặc biệt"} (${currency(perDay)}/ngày) x ${days} ngày`);
      sum += perDay * days;
    } else {
      if (method === "paid" || !isFirstPost) {
        bd.push(`Phí đăng tin: ${currency(PRICE_POST_BASE)}`);
        sum += PRICE_POST_BASE;
      } else {
        bd.push("Miễn phí phí đăng tin (lần đầu)");
      }
    }

    const pay = pack !== "" || method === "paid" || !isFirstPost;
    return { total: sum, breakdown: bd, needPayment: pay };
  }, [method, days, pack, isFirstPost]);

  const start = new Date();
  const end = addDays(start, days);

  function onPay() {
    nav(
      `/checkout?postId=${encodeURIComponent(productId)}&days=${days}&pack=${pack}&method=${method}&type=${kind}`
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-6 py-5">
      {/* Banner */}
      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 mt-0.5" />
        <div className="text-sm">
          <b>Chúc mừng, bạn được đăng tin miễn phí!</b> Tin sẽ được duyệt trong chốc lát.
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
              <Badge className="mt-2 bg-slate-200 text-slate-700 hover:bg-slate-200">Đợi duyệt</Badge>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid md:grid-cols-3 gap-3">
            {/* Phương thức đăng tin */}
            <div className="rounded-lg border p-3 bg-slate-50">
              <div className="text-sm font-semibold mb-1">Phương thức đăng tin</div>
              <div className="text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    className="accent-[#246f67]"
                    checked={method === "free"}
                    onChange={() => setMethod("free")}
                  />
                  Tin thường (Miễn phí)
                </label>
                <div className="text-[12px] text-slate-500 mt-1">
                  * Tin sẽ hiển thị dạng tin thường trong thời gian đã chọn.
                </div>

                <div className="mt-2" />
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    className="accent-[#246f67]"
                    checked={method === "paid"}
                    onChange={() => setMethod("paid")}
                  />
                  Tin thường (Trả phí)
                </label>
                <div className="text-[12px] text-slate-500 mt-1">
                  Thu phí đăng tin {currency(PRICE_POST_BASE)} (áp dụng khi không dùng gói).
                </div>
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
            </div>

            {/* Thời gian đăng */}
            <div className="rounded-lg border p-3 bg-slate-50">
              <div className="text-sm font-semibold mb-1">Thời gian đăng tin</div>
              <div className="text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-500" />
                {fmt(start)} <span className="mx-1">đến</span> {fmt(end)}
              </div>
              <div className="text-[12px] text-slate-500 mt-1 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" /> Tự động kết thúc sau {days} ngày
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dịch vụ bán nhanh */}
      <Card>
        <CardContent className="p-4">
          <div className="text-[16px] font-bold mb-1">Mua thêm dịch vụ bán nhanh hơn</div>
          <div className="text-sm text-slate-600 mb-3">
            Tiếp cận thêm nhiều khách hàng và bán nhanh hơn
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {/* Tin thường (phí cơ bản) */}
            <div className="rounded-lg border p-3">
              <div className="font-semibold mb-1">Tin thường</div>
              <div className="text-sm text-slate-500">Phí đăng tin (không ưu tiên vị trí).</div>
              <div className="mt-3 text-[#246f67] font-bold">{currency(PRICE_POST_BASE)}</div>
              <Button
                className={`mt-2 w-full ${COLOR.outlinePrimary}`}
                variant="outline"
                onClick={() => { setPack(""); setMethod("paid"); }}
              >
                + Chọn
              </Button>
            </div>

            {/* Ưu tiên */}
            <div className="rounded-lg border p-3">
              <div className="font-semibold mb-1">Tin ưu tiên</div>
              <div className="text-sm text-slate-500">Ưu tiên hiển thị vào mục “Tin mới nhất”.</div>
              <div className="mt-3 text-[#246f67] font-bold">
                {currency(PRICE_PRIORITY_PER_DAY)}/ngày
              </div>
              <Button
                className={`mt-2 w-full ${COLOR.outlinePrimary}`}
                variant="outline"
                onClick={() => setPack("priority")}
              >
                + Chọn
              </Button>
            </div>

            {/* Đặc biệt */}
            <div className="rounded-lg border p-3">
              <div className="font-semibold mb-1">Tin nổi bật - Nhiều hình ảnh</div>
              <div className="text-sm text-slate-500">
                Lên top tìm kiếm, vào “Tin mới nhất” trước “Ưu tiên”, gắn nhãn <b>HOT</b>.
              </div>
              <div className="mt-3 text-[#246f67] font-bold">
                {currency(PRICE_SPECIAL_PER_DAY)}/ngày
              </div>
              <Button
                className={`mt-2 w-full ${COLOR.outlinePrimary}`}
                variant="outline"
                onClick={() => setPack("special")}
              >
                + Chọn
              </Button>
            </div>
          </div>

          {/* Tính tiền + hành động */}
          <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              <div className="font-semibold mb-1">Chi tiết thanh toán</div>
              <ul className="list-disc pl-5">
                {breakdown.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Info className="w-3.5 h-3.5" />
                Gói “Ưu tiên/Đặc biệt” đã bao gồm phí đăng tin.
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm">Tổng thanh toán</div>
              <div className="text-2xl font-bold text-[#246f67]">{currency(total)}</div>
              <div className="flex gap-2 mt-2 justify-end">
                <Button asChild variant="outline" className={COLOR.outlinePrimary}>
                  <Link to="/account/posts">Quản lý tin</Link>
                </Button>

                {needPayment ? (
                  <Button className={COLOR.primary} onClick={onPay}>
                    Thanh toán
                  </Button>
                ) : (
                  <Button asChild className="bg-[#246f67] hover:bg-[#1e5c55] text-white">
                    <Link to="/">Về trang chủ</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
