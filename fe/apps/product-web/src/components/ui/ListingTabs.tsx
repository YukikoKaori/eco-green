import { useMemo, useState } from "react";
import ListingCard from "@/listings/components/ListingCard";
import type { Listing } from "@/listings/types";
import { cn } from "@/lib/utils";
import styles from "@/styles/ListingTabs.module.css";

type Props = {
  forYou: (Listing & { _key: string })[];
  latest: (Listing & { _key: string })[];
  className?: string;
  pageSize?: number;
};

export default function ListingTabs({
  forYou,
  latest,
  className = "",
  pageSize = 8,
}: Props) {
  const [tab, setTab] = useState<"foryou" | "latest">("foryou");
  const data = useMemo(() => (tab === "foryou" ? forYou : latest), [tab, forYou, latest]);

  return (
    <section className={cn(styles.container, className)}>
      {/* Tabs (text-only) + separator */}
      <div className={styles.tabsBar}>
        <div className={styles.tabsWrapper}>
          <Tab active={tab === "foryou"} onClick={() => setTab("foryou")} label="Dành cho bạn" />
          <Tab active={tab === "latest"} onClick={() => setTab("latest")} label="Mới nhất" />
        </div>
      </div>

      {/* Grid */}
      <div className={styles.contentContainer}>
        <div className={styles.grid}>
          {data.slice(0, pageSize).map((item) => (
            <div key={item._key} className={styles.cardWrapper}>
              <div className={styles.card}>
                <div className={styles.cardReset}>
                  <ListingCard item={item} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={styles.ctaContainer}>
          <button className={styles.ctaButton}>Xem thêm</button>
        </div>
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
      onClick={onClick}
      className={cn(styles.tabButton, active && styles.tabButtonActive)}
    >
      {label}
    </button>
  );
}
