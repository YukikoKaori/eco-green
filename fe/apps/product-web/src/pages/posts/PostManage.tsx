import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Search, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import PostCard from "@/pages/posts/PostCard";

export type ListingStatus =
  | "active"
  | "pending"
  | "unpaid"
  | "draft"
  | "rejected"
  | "expired"
  | "hidden"
  | "sold";

type BEStatus =
  | "ACTIVE"
  | "PENDING_REVIEW"
  | "PENDING_PAYMENT"
  | "DRAFT"
  | "REJECTED"
  | "EXPIRED"
  | "HIDDEN"
  | "SOLD";

const FE2BE: Record<ListingStatus, BEStatus> = {
  active: "ACTIVE",
  pending: "PENDING_REVIEW",
  unpaid: "PENDING_PAYMENT",
  draft: "DRAFT",
  rejected: "REJECTED",
  expired: "EXPIRED",
  hidden: "HIDDEN",
  sold: "SOLD",
};

const BE2FE: Record<BEStatus, ListingStatus> = {
  ACTIVE: "active",
  PENDING_REVIEW: "pending",
  PENDING_PAYMENT: "unpaid",
  DRAFT: "draft",
  REJECTED: "rejected",
  EXPIRED: "expired",
  HIDDEN: "hidden",
  SOLD: "sold",
};

const TABS: { key: ListingStatus; title: string }[] = [
  { key: "active",   title: "Đang hiển thị" },
  { key: "pending",  title: "Đợi duyệt" },
  { key: "unpaid",   title: "Chờ thanh toán" },
  { key: "draft",    title: "Tin nháp" },
  { key: "rejected", title: "Bị từ chối" },
  { key: "expired",  title: "Hết hạn" },
  { key: "hidden",   title: "Đã ẩn" },
  { key: "sold",     title: "Đã bán" },
];

type ProductImage = { url: string; isPrimary?: boolean };
type ProductListItem = {
  id: string;
  title: string;
  type?: "VEHICLE" | "BATTERY";
  price: number | string;           
  status: BEStatus;
  createdAt?: string;

  addressesDetail?: string;
  city?: string; district?: string; ward?: string;

  brandName?: string; modelName?: string; versionName?: string;

  productImagesList?: ProductImage[];
  rejectReason?: string;
  views?: number;
};

type PageResp = ProductListItem[];

export default function PostManage() {
  const { user } = useAuth();
  const DEFAULT_AVATAR = "/images/avatar-default.png";
  const displayName = user?.fullName || user?.username || "Khách";
  const initial = displayName.charAt(0).toUpperCase();

  const [tab, setTab] = useState<ListingStatus>("active");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ProductListItem[]>([]);
  const [counts, setCounts] = useState<Record<ListingStatus, number>>({
    active: 0, pending: 0, unpaid: 0, draft: 0, rejected: 0, expired: 0, hidden: 0, sold: 0,
  });

  const [reasonOpen, setReasonOpen] = useState(false);
  const [reasonText, setReasonText] = useState<string>("");

  useEffect(() => {
    let stop = false;
    (async () => {
      setLoading(true);
      try {
        const beStatus = FE2BE[tab];
        const { data } = await api.get<PageResp>("/member/product", { params: { status: beStatus } });
        if (!stop) setList(Array.isArray(data) ? data : []);
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => { stop = true; };
  }, [tab]);

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const entries = await Promise.all(
          (TABS.map(t => t.key) as ListingStatus[]).map(async (k) => {
            const { data } = await api.get<PageResp>("/member/product", { params: { status: FE2BE[k] } });
            return [k, Array.isArray(data) ? data.length : 0] as const;
          })
        );
        if (!stop) {
          const next: Record<ListingStatus, number> = { ...counts };
          for (const [k, v] of entries) next[k] = v;
          setCounts(next);
        }
      } catch {
        
      }
    })();
    return () => { stop = true; };
  }, []); 

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((x) => {
      const title = (x.title || "").toLowerCase();
      const location = `${x.addressesDetail || ""} ${x.ward || ""} ${x.district || ""} ${x.city || ""}`.toLowerCase();
      return title.includes(s) || location.includes(s);
    });
  }, [list, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [tab, q]);

  async function setStatus(id: string, next: ListingStatus) {
    try {
      await api.put(`/member/product/${id}/status`, { status: FE2BE[next] });
      setList((prev) => prev.filter((it) => it.id !== id));
      setCounts((c) => ({
        ...c,
        [tab]: Math.max(0, c[tab] - 1),
        [next]: (c[next] ?? 0) + 1,
      }));
    } catch (e) {
    }
  }
  function onShowReason(item?: ProductListItem) {
    if (item?.rejectReason) {
      setReasonText(item.rejectReason);
      setReasonOpen(true);
    } else if (item?.id) {
      (async () => {
        try {
          const { data } = await api.get<ProductListItem>(`/member/product/${item.id}`);
          setReasonText(data?.rejectReason || "Không có lý do từ chối.");
        } catch {
          setReasonText("Không đọc được lý do từ chối.");
        } finally {
          setReasonOpen(true);
        }
      })();
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="!text-xl !font-bold !text-[#246f67]">Quản lý tin đăng</h1>
          <p className="text-sm text-muted-foreground">Theo dõi, chỉnh sửa và quản lý tin đăng của bạn.</p>
        </div>
      </div>

      {/* User header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-[#2ba195]/20">
            <AvatarImage
              src={user?.avatarUrl || DEFAULT_AVATAR}
              alt={displayName}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
            />
            <AvatarFallback className="bg-[#bf3b16] text-white font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="text-xl font-semibold">{displayName}</div>
            <Link
              to="/store/create"
              className="text-sm !text-[#246f67] hover:underline inline-flex items-center gap-1"
            >
              <span className="text-lg leading-none text-[#246f67]">＋</span> Tạo cửa hàng
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-xl border px-3 py-2 mb-3">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm tin theo tiêu đề hoặc địa chỉ..."
          className="border-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as ListingStatus)} className="!w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 bg-transparent p-0">
          {TABS.map(t => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="!bg-white !data-[state=active]:bg-[#246f67] !data-[state=active]:text-white text-[#246f67] !border-[#246f67"
            >
              <span className="text-xs md:text-sm font-semibold">
                {t.title} ({counts[t.key] || 0})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-3">
          {loading ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Đang tải...
              </CardContent>
            </Card>
          ) : pageData.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <div className="text-xl font-semibold mb-2">Không có tin phù hợp</div>
                <p className="text-muted-foreground mb-4">Hãy đăng tin để bắt đầu bán nhé!</p>
                <Button
                  asChild
                  className="text-[#246f67] border border-[#246f67] bg-white hover:bg-[#f3fdfa]
                  inline-flex items-center gap-2 px-6 py-2 font-semibold rounded-xl mx-auto"
                >
                  <Link to="/post/new">
                    <PlusCircle className="w-4 h-4" />
                    <span>Đăng tin</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pageData.map((it) => {
                const cover =
                  it.productImagesList?.find(x => x.isPrimary)?.url ??
                  it.productImagesList?.[0]?.url ??
                  "/images/placeholder-160x120.png";

                const priceNum =
                  typeof it.price === "number"
                    ? it.price
                    : Number(String(it.price).replace(/[^\d]/g, "")) || 0;

                const location = [it.addressesDetail, it.ward, it.district, it.city]
                  .filter(Boolean).join(", ");

                return (
                  <PostCard
                    key={it.id}
                    item={{
                      id: it.id,
                      title: it.title,
                      location,
                      price: priceNum,
                      status: BE2FE[it.status],
                      cover,
                      views: it.views,
                      rejectReason: it.rejectReason,
                    }}
                    setStatus={setStatus}
                    onShowReason={() => onShowReason(it)}
                  />
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
                  </PaginationItem>
                  <div className="px-3 text-sm self-center">Trang {page}/{totalPages}</div>
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Popup lý do bị từ chối */}
      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do từ chối</DialogTitle>
            <DialogDescription className="text-sm">{reasonText}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="text-[#246f67] !border-[#246f67]" onClick={() => setReasonOpen(false)}>
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
