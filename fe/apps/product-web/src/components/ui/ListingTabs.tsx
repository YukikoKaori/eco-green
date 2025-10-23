import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ListingCard from "@/listings/components/ListingCard";
import type { ListingWithKey } from "@/listings/types";
import { cn } from "@/lib/utils";
import styles from "@/styles/ListingTabs.module.css";

type Props = {
  forYou: ListingWithKey[];
  latest: ListingWithKey[];
  className?: string;
  pageSize?: number;
  /** Đang tải dữ liệu? -> hiển thị skeleton đẹp hơn */
  isLoading?: boolean;
};

export default function ListingTabs({
  forYou,
  latest,
  className = "",
  pageSize = 8,
  isLoading = false,
}: Props) {
  const [tab, setTab] = useState<"foryou" | "latest">("foryou");

  const [counts, setCounts] = useState<{ foryou: number; latest: number }>({
    foryou: pageSize,
    latest: pageSize,
  });

  useEffect(() => {
    setCounts((c) => ({
      foryou: Math.max(pageSize, c.foryou),
      latest: Math.max(pageSize, c.latest),
    }));
  }, [pageSize]);

  const data = useMemo(() => (tab === "foryou" ? forYou : latest), [tab, forYou, latest]);
  const visibleCount = tab === "foryou" ? counts.foryou : counts.latest;
  const visible = useMemo(() => data.slice(0, visibleCount), [data, visibleCount]);
  const canLoadMore = visibleCount < data.length;

  const handleChangeTab = (t: "foryou" | "latest") => setTab(t);

  const handleLoadMore = () => {
    setCounts((c) =>
      tab === "foryou"
        ? { ...c, foryou: Math.min(c.foryou + pageSize, forYou.length) }
        : { ...c, latest: Math.min(c.latest + pageSize, latest.length) }
    );
  };

  return (
    <section className={cn(styles.container, className)}>
      {/* Tabs */}
      <div className={styles.tabsBar}>
        <div className={styles.tabsWrapper} role="tablist" aria-label="Bộ lọc tin">
          <Tab active={tab === "foryou"} onClick={() => handleChangeTab("foryou")} label="Dành cho bạn" />
          <Tab active={tab === "latest"} onClick={() => handleChangeTab("latest")} label="Mới nhất" />
        </div>
      </div>

      {/* Content */}
      <div className={styles.contentContainer}>
        {isLoading ? (
          // Skeleton grid
          <div className={styles.grid}>
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className={styles.cardWrapper}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className={styles.empty}>Chưa có tin phù hợp.</div>
        ) : (
          <div className={styles.grid}>
            {visible.map((item) => {
              const pid =
                (item as any).productId ??
                (item as any).id ??
                (item as any).productID ??
                (item as any).product_id ??
                null;

              if (!pid) {
                return (
                  <div key={item._key} className={styles.cardWrapper}>
                    <div className={styles.card}>
                      <div className={styles.cardReset}>
                        <ListingCard item={item} />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item._key} className={styles.cardWrapper}>
                  <Link
                    to={`/product/${pid}`}
                    className={cn(
                      styles.card,
                      "block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-lg"
                    )}
                    aria-label={`Xem chi tiết ${((item as any).title ?? "sản phẩm")}`}
                  >
                    <div className={styles.cardReset}>
                      <ListingCard item={item} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        {!isLoading && canLoadMore && (
          <div className={styles.ctaContainer}>
            <button
              type="button"
              className={styles.ctaButton}
              onClick={handleLoadMore}
              aria-label="Xem thêm tin"
            >
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Tab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(styles.tabButton, active && styles.tabButtonActive)}
    >
      {label}
    </button>
  );
}

/** Khung skeleton cho 1 card */
function SkeletonCard() {
  return (
    <div className={cn("rounded-lg overflow-hidden shadow-sm border", "bg-background")}>
      {/* ảnh */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div className="h-full w-full animate-pulse bg-muted" />
      </div>
      {/* nội dung */}
      <div className="p-3 space-y-2">
        <div className="h-4 w-5/6 animate-pulse bg-muted rounded" />
        <div className="h-4 w-2/5 animate-pulse bg-muted rounded" />
        <div className="mt-3 h-4 w-1/3 animate-pulse bg-muted rounded" />
      </div>
    </div>
  );
}
