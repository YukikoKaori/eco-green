import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

import PostCard from "@/pages/posts/PostCard";
import {
    ListingItem,
    ListingStatus,
    TABS,
    loadMock,
    saveMock,
    tone,
} from "@/mocks/listings";

export default function PostManage() {
    const [all, setAll] = useState<ListingItem[]>(loadMock());
    const [tab, setTab] = useState<ListingStatus>("active");
    const { user } = useAuth();
    const DEFAULT_AVATAR = "/images/avatar-default.png";
    const displayName = user?.fullName || user?.username || "Khách";
    const initial = displayName.charAt(0).toUpperCase();

    const [q, setQ] = useState("");
    const handleQ = (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value);

    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [reasonOpen, setReasonOpen] = useState(false);
    const [reasonText, setReasonText] = useState<string>("");

    const counts = useMemo(() => {
        const c: Record<ListingStatus, number> = { active: 0, expired: 0, rejected: 0, unpaid: 0, draft: 0, pending: 0, hidden: 0 };
        all.forEach(x => (c[x.status]++));
        return c;
    }, [all]);

    const filtered = useMemo(() => {
        const base = all.filter(x => x.status === tab);
        const s = q.trim().toLowerCase();
        if (!s) return base;
        return base.filter(x =>
            x.title.toLowerCase().includes(s) ||
            x.location.toLowerCase().includes(s)
        );
    }, [all, tab, q]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => { setPage(1); }, [tab, q]);

    const setStatus = (id: string, status: ListingStatus) => {
        const next = all.map(x => (x.id === id ? { ...x, status } : x));
        setAll(next);
        saveMock(next);
    };

    const showReason = (text?: string) => {
        setReasonText(text || "Không có lý do từ chối.");
        setReasonOpen(true);
    };

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
                    onChange={handleQ}
                    placeholder="Tìm tin theo tiêu đề hoặc địa chỉ..."
                    className="border-0 shadow-none focus-visible:ring-0"
                />
            </div>

            {/* Tabs */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as ListingStatus)} className="!w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 bg-transparent p-0">
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
                    {pageData.length === 0 ? (
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
                            {pageData.map(it => (
                                <PostCard
                                    key={it.id}
                                    item={it}
                                    setStatus={setStatus}
                                    onShowReason={showReason}
                                />
                            ))}
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
                        <Button className="text-[#246f67] !border-[#246f67]" onClick={() => setReasonOpen(false)}>Đã hiểu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
