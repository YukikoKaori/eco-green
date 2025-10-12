export type ListingStatus =
  | "active"
  | "expired"
  | "rejected"
  | "unpaid"
  | "draft"
  | "pending"
  | "hidden";

export interface ListingItem {
  id: string;
  title: string;
  price: number;
  cover: string;
  location: string;
  createdAt: string;   
  views: number;
  status: ListingStatus;
  rejectReason?: string;
}

export const TABS: { key: ListingStatus; title: string }[] = [
  { key: "active",  title: "ĐANG HIỂN THỊ" },
  { key: "expired", title: "HẾT HẠN" },
  { key: "rejected",title: "BỊ TỪ CHỐI" },
  { key: "unpaid",  title: "CẦN THANH TOÁN" },
  { key: "draft",   title: "TIN NHÁP" },
  { key: "pending", title: "CHỜ DUYỆT" },
  { key: "hidden",  title: "ĐÃ ẨN" },
];

export const tone = {
  primary: "bg-[#246f67] hover:bg-[#1e5c55] text-white",
  outlinePrimary: "border-[#246f67] text-[#246f67] hover:bg-[#246f67]/5",
};

export const currency = (v: number) =>
  v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

// ---- Mock data ----
function genMock(n = 48): ListingItem[] {
  const statuses: ListingStatus[] = ["active","expired","rejected","unpaid","draft","pending","hidden"];
  return Array.from({ length: n }).map((_, i) => {
    const st = statuses[i % statuses.length];
    return {
      id: String(i + 1),
      title: `Xe điện gấp gọn ${i + 1}`,
      price: 4500000 + Math.round(Math.random() * 2500000),
      cover: `https://picsum.photos/seed/eg${i}/320/200`,
      location: ["Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"][i % 4],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      views: 10 + (i % 40),
      status: st,
      rejectReason: st === "rejected" ? "Ảnh mờ/thiếu thông tin bắt buộc." : undefined,
    };
  });
}

const STORAGE_KEY = "ecogreen_listings_mock_v3";

export const loadMock = (): ListingItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ListingItem[];
  } catch {}
  const seed = genMock();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
};

export const saveMock = (data: ListingItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};
export async function apiView(id: string) { console.log("VIEW", id); }
export async function apiEdit(id: string) { console.log("EDIT", id); }
export async function apiRepost(id: string) { console.log("REPOST", id); }
export async function apiPay(id: string) { console.log("PAY", id); }
export async function apiUnhide(id: string) { console.log("UNHIDE", id); }
export async function apiHide(id: string) { console.log("HIDE", id); }
