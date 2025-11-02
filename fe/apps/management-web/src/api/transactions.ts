import api from "@/lib/axios";

export type ContractItem = {
  title?: string;
  sellerName?: string;
  buyerName?: string;
  signedAt?: string;     
  contractUrl?: string;  
};

export async function fetchContractsHistory(): Promise<ContractItem[]> {
  const r = await api.get<ContractItem[] | ContractItem>("/staff/product/transaction/history");
  return Array.isArray(r.data) ? r.data : (r.data ? [r.data] : []);
}

export type CommissionItem = {
  paymentId?: string;
  createdAt?: string;      
  amount?: number;         
  paymentMethod?: string;  
  durationDays?: number | null;
  productId?: string;
  productName?: string;
};

export async function fetchCommissions(): Promise<CommissionItem[]> {
  const r = await api.get<CommissionItem[]>("/transactions/show");
  return Array.isArray(r.data) ? r.data : [];
}
