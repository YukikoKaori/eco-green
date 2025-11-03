import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

import {
  type PurchaseRequestDTO,
  respondPurchaseRequest,
  listSellerPurchaseRequests,
} from "@/api/productDetail";

function parseNumberLoose(v?: number | string | null): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}
function currencyVND(v?: number | string | null) {
  const n = parseNumberLoose(v);
  if (n == null) return "--";
  return n.toLocaleString("vi-VN") + " đ";
}

export default function PurchaseRequestDetail() {
  const { id = "" } = useParams();
  const loc = useLocation() as { state?: { request?: PurchaseRequestDTO } };
  const nav = useNavigate();
  const passed = loc?.state?.request;
  const [data, setData] = useState<PurchaseRequestDTO | null>(passed ?? null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        setLoading(true);
        const res = await listSellerPurchaseRequests({ page: 0, size: 50 });
        const found = res?.content?.find((x) => x.id === id) || null;
        if (!off) {
          setData(found ? { ...(passed ?? {}), ...found } : passed ?? null);
          if (!found && !passed) toast.error("Không tìm thấy yêu cầu mua.");
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Không tải được dữ liệu.");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => { off = true; };
  }, [id]); 

  const onRespond = async (accept: boolean) => {
    if (!data) return;
    setBusy(true);
    try {
      const updated = await respondPurchaseRequest({
        requestId: data.id,
        accept,
        responseMessage: accept
          ? "Đồng ý bán với giá bạn đề xuất. Vui lòng ký hợp đồng."
          : "Xin lỗi, tôi không đồng ý bán.",
      });
      setData(updated);
      toast.success(accept ? "Đã đồng ý – hệ thống đã gửi hợp đồng qua email." : "Đã từ chối yêu cầu.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Thao tác thất bại.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-slate-600">Đang tải…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Button variant="outline" onClick={() => nav(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
        </div>
        <div className="text-red-600 font-medium">Không tìm thấy yêu cầu mua.</div>
      </div>
    );
  }

  const contractUrl =
    typeof (data as any).contractUrl === "string" ? (data as any).contractUrl : undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Button variant="outline" onClick={() => nav(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>

      <h1 className="!text-lg font-bold text-[#246f67] mb-4">Chi tiết yêu cầu mua</h1>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-lg font-semibold">{data.productTitle}</div>
          <div className="text-red-600 text-sm">
            Giá tin đăng: {currencyVND(data.productPrice ?? null)}
          </div>

          <Separator className="my-3" />

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="font-semibold text-[#246f67] mb-1">Người mua</div>
              <div>Tên: <b>{data.buyerName ?? "—"}</b></div>
              <div>Email: <span className="underline">{data.buyerEmail ?? "—"}</span></div>
            </div>

            <div>
              <div className="font-semibold text-[#246f67] mb-1">Thông tin giao dịch</div>
              <div>Giá đề nghị: <b className="text-[#d4205b]">
                {currencyVND(data.offeredPrice as any)}
              </b></div>
              <div>Trạng thái: <span className="px-2 py-0.5 rounded-full border text-xs ml-1">
                {data.status}
              </span></div>
              {data.contractStatus && (
                <div>Hợp đồng: <span className="px-2 py-0.5 rounded-full border text-xs ml-1">
                  {data.contractStatus}
                </span></div>
              )}
              {contractUrl && data.contractStatus === "SENT" && (
                <div className="mt-1">
                  <a href={contractUrl} target="_blank" rel="noreferrer" className="text-teal-700 underline">
                    Mở hợp đồng Eversign
                  </a>
                </div>
              )}
            </div>
          </div>

          {data.buyerMessage && (
            <>
              <Separator className="my-3" />
              <div className="text-sm">
                <div className="font-semibold text-[#246f67] mb-1">Lời nhắn của người mua</div>
                <p className="text-slate-700 whitespace-pre-line">“{data.buyerMessage}”</p>
              </div>
            </>
          )}

          <Separator className="my-4" />

          <div className="flex flex-wrap gap-2">
            <Button
              className="!bg-[#246f67] text-white hover:bg-emerald-700 gap-1"
              onClick={() => onRespond(true)}
              disabled={busy || data.status !== "PENDING"}
            >
              <CheckCircle2 className="w-4 h-4" />
              Đồng ý bán
            </Button>

            <Button
              variant="destructive"
              className="gap-1 !bg-red-500"
              onClick={() => onRespond(false)}
              disabled={busy || data.status !== "PENDING"}
            >
              <XCircle className="w-4 h-4" />
              Từ chối
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-slate-500">
        Sau khi đồng ý, hệ thống sẽ gửi hợp đồng điện tử qua email để hai bên ký.
      </div>
    </div>
  );
}
