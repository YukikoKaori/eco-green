import api from "@/lib/axios";

export type PageResp<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

/* ---------- Contracts ---------- */
export type ContractItem = {
  title?: string;
  sellerName?: string;
  buyerName?: string;
  signedAt?: string;
  contractUrl?: string;
};

export async function fetchContractsHistory(
  page = 0,
  size = 10
): Promise<PageResp<ContractItem>> {
  const r = await api.get<PageResp<ContractItem> | ContractItem[] | ContractItem>(
    "/staff/product/transaction/history",
    { params: { page, size } }
  );

  const data = r.data as any;
  if (Array.isArray(data)) {
    return {
      items: data,
      page,
      size: data.length,
      totalElements: data.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }
  if (data && !Array.isArray(data) && !("items" in data)) {
    return {
      items: [data],
      page,
      size: 1,
      totalElements: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }
  return data as PageResp<ContractItem>;
}

/* ---------- Commissions ---------- */
export type CommissionItem = {
  paymentId?: string;
  createdAt?: string;
  amount?: number;
  paymentMethod?: string;
  packageName?: string;
  durationDays?: number | null;
  productId?: string;
  productName?: string;
};

export async function fetchCommissions(
  page = 0,
  size = 10
): Promise<PageResp<CommissionItem>> {
  const r = await api.get<PageResp<CommissionItem> | CommissionItem[]>(
    "/transactions/show",
    { params: { page, size } }
  );

  const data = r.data as any;
  if (Array.isArray(data)) {
    return {
      items: data,
      page,
      size: data.length,
      totalElements: data.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }
  return data as PageResp<CommissionItem>;
}
