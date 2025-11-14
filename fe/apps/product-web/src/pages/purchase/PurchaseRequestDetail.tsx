import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

import {
  type PurchaseRequestDTO,
  respondPurchaseRequest,
  listSellerPurchaseRequests,
} from "@/api/productDetail";
import { currencyVND } from "@/utils/price";

/* --------------------- helpers --------------------- */
function pickErrMessage(err: any) {
  const status = err?.response?.status as number | undefined;
  const serverMsg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message;

  if (status === 409) {
    return (
      serverMsg ||
      "Sản phẩm đã được chấp nhận cho người mua khác hoặc không còn khả dụng."
    );
  }
  if (status === 400) {
    return serverMsg || "Dữ liệu không hợp lệ.";
  }
  return serverMsg || "Thao tác thất bại. Vui lòng thử lại.";
}

/* --------------------- component --------------------- */
export default function PurchaseRequestDetail() {
  const { id = "" } = useParams();
  const loc = useLocation() as { state?: { request?: PurchaseRequestDTO } };
  const nav = useNavigate();

  const passed = loc?.state?.request;
  const [data, setData] = useState<PurchaseRequestDTO | null>(passed ?? null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // popup từ chối
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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
        toast.error(pickErrMessage(e));
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [id]);

  const onRespond = async (accept: boolean, reason?: string) => {
    if (!data) return;

    // Block early nếu đã xử lý
    if (data.status !== "PENDING") {
      toast.info("Yêu cầu này đã được xử lý trước đó.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        requestId: data.id,
        accept,
        responseMessage: accept
          ? "Đồng ý bán với giá bạn đề xuất. Vui lòng ký hợp đồng."
          : (reason && reason.trim()) || "Xin lỗi, tôi không đồng ý bán.",
        ...(accept
          ? {}
          : reason && reason.trim()
          ? { rejectReason: reason.trim() }
          : {}),
      };

      const updated = await respondPurchaseRequest(payload);
      setData(updated);

      if (accept) {
        const url = (updated as any)?.contractUrl as string | undefined;
        if (url && updated.contractStatus === "SENT") {
          toast.success("Đã đồng ý – hợp đồng đã được gửi qua email.", {
            action: {
              label: "Mở hợp đồng",
              onClick: () => window.open(url, "_blank"),
            },
          });
        } else {
          toast.success(
            "Đã đồng ý – hệ thống đã gửi thông báo cho người mua."
          );
        }
      } else {
        toast.success("Đã từ chối yêu cầu.");
      }
    } catch (e: any) {
      toast.error(pickErrMessage(e));
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
        <div className="text-red-600 font-medium">
          Không tìm thấy yêu cầu mua.
        </div>
      </div>
    );
  }

  const contractUrl =
    typeof (data as any).contractUrl === "string"
      ? (data as any).contractUrl
      : undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Button variant="outline" onClick={() => nav(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>

      <h1 className="!text-lg font-bold text-[#246f67] mb-4">
        Chi tiết yêu cầu mua
      </h1>

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
              <div>
                Tên: <b>{data.buyerName ?? "—"}</b>
              </div>
              <div>
                Email:{" "}
                <span className="underline">{data.buyerEmail ?? "—"}</span>
              </div>
            </div>

            <div>
              <div className="font-semibold text-[#246f67] mb-1">
                Thông tin giao dịch
              </div>
              <div>
                Giá đề nghị:{" "}
                <b className="text-[#d4205b]">
                  {currencyVND(data.offeredPrice as any)}
                </b>
              </div>
              <div>
                Trạng thái:{" "}
                <span className="px-2 py-0.5 rounded-full border text-xs ml-1">
                  {data.status}
                </span>
              </div>
              {data.contractStatus && (
                <div>
                  Hợp đồng:{" "}
                  <span className="px-2 py-0.5 rounded-full border text-xs ml-1">
                    {data.contractStatus}
                  </span>
                </div>
              )}
              {contractUrl && data.contractStatus === "SENT" && (
                <div className="mt-1">
                  <a
                    href={contractUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 underline"
                  >
                    Mở hợp đồng Eversign
                  </a>
                </div>
              )}
            </div>
          </div>

          {data.status !== "PENDING" && (
            <>
              <Separator className="my-3" />
              <div className="text-sm text-amber-700">
                Yêu cầu đã ở trạng thái <b>{data.status}</b>. Bạn không thể thay
                đổi nữa.
              </div>
            </>
          )}

          {data.buyerMessage && (
            <>
              <Separator className="my-3" />
              <div className="text-sm">
                <div className="font-semibold text-[#246f67] mb-1">
                  Lời nhắn của người mua
                </div>
                <p className="text-slate-700 whitespace-pre-line">
                  “{data.buyerMessage}”
                </p>
              </div>
            </>
          )}

          {data.status === "REJECTED" && data.rejectReason && (
            <>
              <Separator className="my-3" />
              <div className="text-sm">
                <div className="font-semibold text-[#246f67] mb-1">
                  Lý do bạn từ chối
                </div>
                <p className="text-slate-700 whitespace-pre-line">
                  {data.rejectReason}
                </p>
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
              onClick={() => setRejectOpen(true)}
              disabled={busy || data.status !== "PENDING"}
            >
              <XCircle className="w-4 h-4" />
              Từ chối
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-slate-500">
        Sau khi đồng ý, hệ thống sẽ gửi hợp đồng điện tử qua email để hai bên
        ký.
      </div>

      {/* Popup nhập lý do từ chối */}
      <Dialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) setRejectReason("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do từ chối yêu cầu mua</DialogTitle>
            <DialogDescription>
              Nội dung này sẽ được gửi cho người mua để họ hiểu lý do bạn từ
              chối.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246f67]"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Giá bạn đề nghị quá thấp so với giá trị thực của xe."
            />
            <p className="text-xs text-slate-500">
              Vui lòng nhập ít nhất 10 ký tự.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={busy}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="!bg-red-500 gap-1"
              disabled={busy || rejectReason.trim().length < 10}
              onClick={async () => {
                await onRespond(false, rejectReason.trim());
                setRejectOpen(false);
                setRejectReason("");
              }}
            >
              <XCircle className="w-4 h-4" />
              Xác nhận từ chối
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
