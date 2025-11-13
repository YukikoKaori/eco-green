import api from "@/lib/axios";

export interface SellerReview {
  id: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  productId: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: string;
}

export async function createSellerReview(data: {
  purchaseRequestId: string;
  rating: number;
  comment: string;
  tags: string[];
}) {
  const res = await api.post("/seller-reviews", data);
  return res.data as SellerReview;
}

export async function getSellerReviews(sellerId: string, page = 0, size = 5) {
  const res = await api.get(`/seller-reviews/seller/${sellerId}`, {
    params: { page, size },
  });
  return res.data as {
    items: SellerReview[];
    page: number;
    totalElements: number;
    totalPages: number;
  };
}

export async function getSellerReviewStats(sellerId: string) {
  const res = await api.get(`/seller-reviews/seller/${sellerId}/stats`);
  return res.data as { average: number; total: number };
}
