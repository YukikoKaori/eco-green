import api from "@/lib/axios";
export type PageResp<T> = {
  items: T[];
  page?: number;
  size?: number;
  totalItems?: number;
  totalPages?: number;
};

type AnyEnvelope<T> = PageResp<T> | { result: PageResp<T> } | { items: T[] };

function unwrap<T>(data: AnyEnvelope<T>): PageResp<T> {
  const raw: any = (data as any)?.result ?? data;
  if (Array.isArray((raw as any)?.items)) return raw as PageResp<T>;
  if (Array.isArray(raw)) return { items: raw as T[] };
  return { items: [] };
}

/* ---------- Contracts ---------- */
export type ContractItem = {
  documentId: string;
  title: string;
  pdfUrl: string;
  signedAt?: string;
};

export async function fetchContractsHistory(params?: { page?: number; size?: number; q?: string }) {
  const { data } = await api.get<AnyEnvelope<ContractItem>>("/transactions/contract/history", {
    params,
  });
  return unwrap<ContractItem>(data);
}
export type PackageHistoryItem = {
  paymentId: string;
  createdAt: string;
  amount: number;
  paymentMethod: string; 
  packageName: string;
  productId?: string;
  productName?: string;
};

export async function fetchPackageHistory(params?: { page?: number; size?: number }) {
  const { data } = await api.get<AnyEnvelope<PackageHistoryItem>>("/transactions/package/history", {
    params,
  });
  return unwrap<PackageHistoryItem>(data);
}
