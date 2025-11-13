import { useEffect, useState } from "react";
import {
  getSellerReviews,
  getSellerReviewStats,
  SellerReview,
} from "@/api/feedback";
import { Star } from "lucide-react";

export default function SellerFeedback({ sellerId }: { sellerId: string }) {
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [stats, setStats] = useState<{ average: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [r, s] = await Promise.all([
          getSellerReviews(sellerId),
          getSellerReviewStats(sellerId),
        ]);
        setReviews(r.items || []);
        setStats(s);
      } catch (e) {
        console.error("Không thể tải đánh giá:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [sellerId]);

  if (loading)
    return (
      <div className="py-4 text-center text-sm text-slate-500 animate-pulse">
        Đang tải đánh giá...
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-emerald-100">
        <h3 className="text-[16px] font-semibold text-emerald-800 flex items-center gap-2">
          ⭐ Đánh giá người bán
        </h3>
        {stats ? (
          <p className="text-sm text-slate-600 mt-1">
            Trung bình:{" "}
            <span className="font-semibold text-emerald-700">
              {stats.average.toFixed(1)}
            </span>{" "}
            / 5 ({stats.total} lượt)
          </p>
        ) : (
          <p className="text-sm text-slate-500 mt-1">Chưa có thống kê.</p>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-slate-500 text-sm italic text-center py-3">
          Chưa có đánh giá nào cho người bán này.
        </div>
      ) : (
        <ul className="divide-y divide-emerald-50">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="py-3 px-2 transition hover:bg-emerald-50/60 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div className="font-medium text-slate-800">{r.buyerName}</div>
                <div className="flex gap-0.5">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-700 mt-1">{r.comment}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(r.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
