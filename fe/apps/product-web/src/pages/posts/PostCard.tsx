import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Edit,
  RotateCcw,
  CreditCard,
  EyeOff,
  Info,
  Eye as EyeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  updateProductStatus,
  type BEStatus,
  retryPayment,
} from "@/api/manageStatus";

export type ListingStatus =
  | "active"
  | "pending"
  | "unpaid"
  | "draft"
  | "rejected"
  | "expired"
  | "hidden"
  | "sold";

export type ListingItem = {
  id: string;
  title: string;
  location: string;
  price: number;
  status: ListingStatus;
  cover: string;
  views?: number;
  rejectReason?: string;
};

type Props = {
  item: ListingItem;
  setStatus: (id: string, st: ListingStatus) => void;
  onShowReason: (text?: string) => void;
};

export const tone = {
  outlinePrimary: "border-[#246f67] text-[#246f67] hover:bg-[#246f67]/5",
};

export const currency = (v: number) =>
  v.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

const FE2BE: Record<ListingStatus, BEStatus> = {
  active: "ACTIVE",
  pending: "PENDING_REVIEW",
  unpaid: "PENDING_PAYMENT",
  draft: "DRAFT",
  rejected: "REJECTED",
  expired: "EXPIRED",
  hidden: "HIDDEN",
  sold: "SOLD",
};

export default function PostCard({ item: it, setStatus, onShowReason }: Props) {
  const nav = useNavigate();

  const viewPost = () =>
    window.open(`/product/${it.id}`, "_blank", "noopener,noreferrer");
  const editPost = () => nav(`/post/new?edit=${encodeURIComponent(it.id)}`);

  const handleRetryPayment = async () => {
    try {
      const res = await retryPayment(it.id);
      if (!res?.paymentUrl) {
        toast.error("Không lấy được link thanh toán.");
        return;
      }
      window.location.href = res.paymentUrl; 
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Không thể khởi tạo thanh toán.";
      toast.error(msg);
    }
  };

  const update = async (next: ListingStatus) => {
    try {
      const { status, message } = await updateProductStatus(
        it.id,
        FE2BE[next]
      );

      if (next === "active" && status === "EXPIRED") {
        toast.error(
          message || "Tin đã hết hạn, không thể bật lại. Vui lòng đăng lại tin."
        );
        return;
      }

      setStatus(it.id, next); 
      if (next === "active") toast.success(message || "Đã bật tin thành công.");
      else if (next === "hidden") toast.success(message || "Đã ẩn tin.");
      else if (next === "pending")
        toast.success(message || "Đã chuyển tin sang chờ duyệt/đăng lại.");
      else toast.success(message || "Cập nhật trạng thái thành công.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Cập nhật trạng thái thất bại. Vui lòng thử lại.";
      toast.error(msg);
    }
  };

  const RightActions = () => {
    switch (it.status) {
      case "active":
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-[#246f67] bg-white !border-[#246f67]"
              onClick={viewPost}
            >
              <Eye className="w-4 h-4 mr-1 bg-white" /> Xem tin
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[#246f67] bg-white !border-[#246f67]"
              onClick={() => update("hidden")}
            >
              <EyeOff className="w-4 h-4 mr-1" /> Ẩn tin
            </Button>
          </>
        );

      case "expired":
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-[#246f67] !border-[#246f67] bg-white"
              onClick={viewPost}
            >
              <Eye className="w-4 h-4 mr-1 bg-white" /> Xem tin
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[#246f67] !border-[#246f67] bg-white"
              onClick={() => update("pending")}
            >
              <RotateCcw className="w-4 h-4 mr-1 bg-white" /> Đăng lại
            </Button>
          </>
        );

      case "rejected":
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-[#246f67] !border-[#246f67] bg-white"
              onClick={() => onShowReason(it.rejectReason)}
            >
              <Info className="w-4 h-4 mr-1 bg-white" /> Xem lý do
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[#246f67] !border-[#246f67] bg-white"
              onClick={editPost}
            >
              <Edit className="w-4 h-4 mr-1 bg-white" /> Sửa tin
            </Button>
          </>
        );

      case "draft":
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-[#246f67] !border-[#246f67] bg-white"
              onClick={editPost}
            >
              <Edit className="w-4 h-4 mr-1 bg-white" /> Tiếp tục bản nháp
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[#246f67] !border-[#246f67] bg-white"
              onClick={() => update("pending")}
              title="Gửi tin nháp lên chờ duyệt"
            >
              <RotateCcw className="w-4 h-4 mr-1 bg-white" /> Gửi duyệt
            </Button>
          </>
        );

      case "unpaid":
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-[#246f67] !border-[#246f67] bg-white"
            onClick={handleRetryPayment}
          >
            <CreditCard className="w-4 h-4 mr-1 bg-white" /> Thanh toán
          </Button>
        );

      case "hidden":
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-[#246f67] !border-[#246f67] bg-white"
            onClick={() => update("active")}
          >
            <EyeIcon className="w-4 h-4 mr-1 rotate-180 bg-white" /> Bật tin
          </Button>
        );

      case "sold":
        return (
          <Button
            variant="outline"
            size="sm"
            className="text-[#246f67] !border-[#246f67] bg-white"
            onClick={() => update("pending")}
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Đăng lại
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="w-40 h-28 shrink-0">
          <img src={it.cover} alt="cover" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="pr-2">
              <CardTitle className="text-sm line-clamp-2">{it.title}</CardTitle>
              <div className="mt-1 text-[#246f67] font-semibold">
                {currency(it.price)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {it.location}
              </div>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              {typeof it.views === "number" && (
                <div>
                  Xem: <span className="font-semibold text-gray-800">{it.views}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap justify-end">
            <RightActions />
          </div>
        </div>
      </div>
    </Card>
  );
}
