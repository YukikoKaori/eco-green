import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, RotateCcw, CreditCard, EyeOff, Info, Eye as EyeIcon } from "lucide-react";
import {
  ListingItem,
  ListingStatus,
  currency,
  tone,
  apiView, apiEdit, apiRepost, apiPay, apiUnhide, apiHide,
} from "@/mocks/listings";
import { JSX } from "react";

type Props = {
  item: ListingItem;
  setStatus: (id: string, st: ListingStatus) => void;
  onShowReason: (text?: string) => void;
};

export default function PostCard({ item: it, setStatus, onShowReason }: Props) {
  const RightActions = (): JSX.Element | null => {
    switch (it.status) {
      case "active":
        return (
          <>
            <Button variant="outline" size="sm" className={tone.outlinePrimary} onClick={() => apiView(it.id)}>
              <Eye className="w-4 h-4 mr-1" /> Xem tin
            </Button>
            <Button variant="outline" size="sm" className={tone.outlinePrimary} onClick={() => apiEdit(it.id)}>
              <Edit className="w-4 h-4 mr-1" /> Sửa tin
            </Button>
            <Button size="sm" className="text-[#246f67] !border-[#246f67" onClick={async () => { await apiHide(it.id); setStatus(it.id, "hidden"); }}>
              <EyeOff className="w-4 h-4 mr-1" /> Ẩn tin
            </Button>
          </>
        );
      case "expired":
        return (
          <>
            <Button variant="outline" size="sm" className={tone.outlinePrimary} onClick={() => apiView(it.id)}>
              <Eye className="w-4 h-4 mr-1" /> Xem tin
            </Button>
            <Button size="sm" className="text-[#246f67] !border-[#246f67" onClick={async () => { await apiRepost(it.id); setStatus(it.id, "active"); }}>
              <RotateCcw className="w-4 h-4 mr-1" /> Đăng lại
            </Button>
          </>
        );
      case "rejected":
        return (
          <>
            <Button variant="outline" size="sm" className={tone.outlinePrimary} onClick={() => onShowReason(it.rejectReason)}>
              <Info className="w-4 h-4 mr-1" /> Xem lý do
            </Button>
            <Button variant="outline" size="sm" className={tone.outlinePrimary} onClick={() => apiEdit(it.id)}>
              <Edit className="w-4 h-4 mr-1" /> Sửa tin
            </Button>
          </>
        );
      case "draft":
        return (
          <Button variant="outline" size="sm" className={tone.outlinePrimary} onClick={() => apiEdit(it.id)}>
            <Edit className="w-4 h-4 mr-1" /> Sửa tin
          </Button>
        );
      case "unpaid":
        return (
          <>
            <Button variant="outline" size="sm" className={tone.outlinePrimary} onClick={() => apiView(it.id)}>
              <Eye className="w-4 h-4 mr-1" /> Xem tin
            </Button>
            <Button size="sm" className="text-[#246f67] !border-[#246f67" onClick={() => apiPay(it.id)}>
              <CreditCard className="w-4 h-4 mr-1" /> Thanh toán
            </Button>
          </>
        );
      case "pending":
        return (
          <Button variant="outline" size="sm" className={tone.outlinePrimary} onClick={() => apiView(it.id)}>
            <Eye className="w-4 h-4 mr-1" /> Xem tin
          </Button>
        );
      case "hidden":
        return (
          <>
            <Button variant="outline" size="sm" className={tone.outlinePrimary} onClick={() => apiView(it.id)}>
              <Eye className="w-4 h-4 mr-1" /> Xem tin
            </Button>
            <Button size="sm" className="text-[#246f67] !border-[#246f67" onClick={async () => { await apiUnhide(it.id); setStatus(it.id, "active"); }}>
              <EyeIcon className="w-4 h-4 mr-1 rotate-180" /> Bật tin
            </Button>
          </>
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
              <div className="mt-1 text-[#246f67] font-semibold">{currency(it.price)}</div>
              <div className="text-xs text-muted-foreground mt-1">{it.location}</div>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              <div>
                Xem: <span className="font-semibold text-gray-800">{it.views}</span>
              </div>
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
