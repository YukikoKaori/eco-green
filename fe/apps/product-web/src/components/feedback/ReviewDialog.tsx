import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/api/boughtProducts";
import { Star, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  onSuccess: (productId: string) => void; 
}

const tagOptions = [
  { key: "UY_TIN", label: "Uy tín" },
  { key: "GIAO_NHANH", label: "Giao nhanh" },
  { key: "CHAT_LUONG_TOT", label: "Chất lượng tốt" },
  { key: "NHIET_TINH", label: "Nhiệt tình" },
];

export function ReviewDialog({
  open,
  onClose,
  productName,
  productId,
  onSuccess,
}: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  async function handleSubmit() {
    if (!comment.trim()) {
      toast({
        title: "Thiếu nội dung nhận xét",
        description: "Vui lòng nhập nhận xét trước khi gửi.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      await submitReview({
        productId,
        rating,
        comment: comment.trim(),
        tags,
      });

      toast({
        title: "Gửi đánh giá thành công",
        description: "Cảm ơn bạn đã đánh giá sản phẩm này.",
      });

      onSuccess(productId); 
      onClose();
    } catch (err: any) {
      console.error("Submit review error:", err);

      const status =
        err?.response?.status ??
        err?.status ??
        err?.responseStatus;

      const code =
        err?.response?.data?.code ??
        err?.code ??
        err?.responseCode;

      if (status === 409 || code === 1602) {
        toast({
          title: "Bạn đã đánh giá sản phẩm này rồi",
          description: "Mỗi sản phẩm chỉ được đánh giá một lần.",
          variant: "destructive",
        });
        onSuccess(productId);
        onClose();
      } else {
        toast({
          title: "Không gửi được đánh giá",
          description: "Đã xảy ra lỗi, vui lòng thử lại sau.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="
          w-full sm:max-w-2xl
          max-h-screen overflow-y-auto 
          rounded-xl 
          border border-slate-200
          bg-white
          shadow-[0_18px_45px_rgba(15,23,42,0.12)]
          px-6 !my-8 sm:px-8 sm:py-7
        "
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold text-emerald-800 flex items-center gap-2">
            <span className="inline-block h-6 w-1 rounded-full bg-emerald-600" />
            <span>Đánh giá sản phẩm</span>
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {productName}
          </p>
        </DialogHeader>

        {/* Rating */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-emerald-800 text-sm">Chọn số sao</p>
            <span className="text-[11px] text-emerald-800 font-medium bg-emerald-100 border border-emerald-100 rounded-full px-5 py-0.5">
              {rating}/5
            </span>
          </div>
          <div className="flex gap-0">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                className="p-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                onClick={() => setRating(r)}
                disabled={loading}
              >
                <Star
                  className={`h-4 w-4 ${
                    r <= rating
                      ? "fill-yellow-500 text-yellow-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <p className="font-medium text-emerald-800 mb-1.5 text-sm">
            Nhận xét
          </p>
          <Textarea
            className="
              rounded-2xl 
              border border-slate-200 
              bg-white
              text-sm
              placeholder:text-slate-400
              focus-visible:ring-2 focus-visible:ring-emerald-300 
              focus-visible:border-emerald-400
              min-h-[96px]
            "
            rows={3}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
          />
          <p className="mt-1 text-[11px] text-slate-400">
            Hãy viết chân thật và cụ thể để người bán và người mua khác hiểu rõ
            hơn.
          </p>
        </div>

        {/* Tags */}
        <div>
          <p className="font-medium text-emerald-800 mb-2 text-sm">Gắn thẻ</p>

          <div className="flex flex-wrap gap-2">
            {tagOptions.map((t) => {
              const active = tags.includes(t.key);

              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() =>
                    setTags((prev) =>
                      active ? prev.filter((x) => x !== t.key) : [...prev, t.key]
                    )
                  }
                  disabled={loading}
                  className={`
                    px-3.5 py-1.5 rounded-full text-xs
                    border transition
                    flex items-center gap-1.5
                    ${
                      active
                        ? "bg-emerald-50 text-emerald-800 border-emerald-500 font-medium"
                        : "bg-white text-slate-700 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50"
                    }
                  `}
                >
                  {active && <Check className="h-3 w-3" />}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-7">
          <Button
            variant="outline"
            className="
              rounded-2xl border-slate-200 
              text-slate-700 bg-emerald-50
              hover:bg-slate-50
            "
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>

          <Button
            className="
              rounded-2xl 
              bg-emerald-800 hover:bg-emerald-800 
              text-white px-5
            "
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
