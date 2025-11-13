import api from "@/lib/axios";

export type ProductImage = {
  url: string;
  isPrimary?: boolean;
};

export type ProductBoughtItem = {
  id: string;              
  productId: string;      
  productName: string;
  price: string;
  status: string;
  createdAt: string;
  images: ProductImage[];

  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string;
  hasReview?: boolean;
};

/* ---------------- Normalizer ---------------- */
function normalizeBought(it: any): ProductBoughtItem {
  return {
    id: it.id,
    productId: it.id,
    productName: it.title ?? "(Không có tên)",
    price: it.price ?? "—",
    status: it.status ?? "—",
    createdAt: it.createdAt ?? "",
    images: Array.isArray(it.productImagesList)
      ? it.productImagesList.map((img: any) => ({
          url: img.imageUrl,
          isPrimary: img.isPrimary,
        }))
      : [],

    sellerId: it.sellerId ?? undefined,
    sellerName: it.sellerName ?? undefined,
    sellerPhone: it.sellerPhone ?? undefined,
    hasReview: it.hasReview ?? false,
  };
}

/* ---------------- API ---------------- */
export async function fetchBoughtProducts(page = 0, size = 20) {
  const { data } = await api.get("/member/product/bought-products", {
    params: { page, size },
  });

  if (!Array.isArray(data?.content)) return [];
  return data.content.map(normalizeBought);
}

export async function submitReview(payload: {
  productId: string;
  rating: number;
  comment: string;
  tags: string[];
}) {
  const { data } = await api.post("/seller-reviews", payload);
  return data;
}
