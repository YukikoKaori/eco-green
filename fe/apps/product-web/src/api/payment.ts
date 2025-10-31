import api from "@/lib/axios";

export type VNPayVerifyResponse = {
  success: boolean;
  message?: string;
  vnpTxnRef?: string;
  vnpTransactionNo?: string;
  vnpResponseCode?: string;
  bankCode?: string;
  payDate?: string;        
  amount?: number;          
  status?: "PAID" | "FAILED" | "PENDING" | string;
};

export async function verifyVNPay(productId: string, rawQuery: string) {
  const res = await api.post<VNPayVerifyResponse>(
    "/vnpayment/verify",
    { productId, rawQuery },
    { timeout: 20000 } 
  );
  return res.data;
}
