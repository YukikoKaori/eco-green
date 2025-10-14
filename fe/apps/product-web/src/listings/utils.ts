import type {
  RawListing,
  Listing,
  ListingWithKey,
  Condition,
  ListingStatus,
} from "@/listings/types";

export function onlyActive(arr: RawListing[]): RawListing[] {
  return arr.filter((x) => String(x.status ?? "ACTIVE").toUpperCase() === "ACTIVE");
}

export function sortByNewest<T extends { createdAt?: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return tb - ta;
  });
}

function toNumberOrString(v: unknown): number | string | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const s = String(v);
  const cleaned = s.replace(/[^\d]/g, "");
  if (!cleaned) return s; 
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : s;
}

function pickCover(x: RawListing): string | null {
  const imgs = x.productImagesList ?? [];
  const primary = imgs.find((it) => it?.isPrimary && it?.imageUrl)?.imageUrl;
  if (primary) return primary!;
  const first = imgs.find((it) => it?.imageUrl)?.imageUrl;
  return first ?? null;
}

function pickImages(x: RawListing): string[] {
  return (x.productImagesList ?? [])
    .map((it) => it?.imageUrl)
    .filter(Boolean) as string[];
}

function joinLocation(x: RawListing): string | null {
  const parts = [x.ward, x.district, x.city].filter(Boolean) as string[];
  if (parts.length) return parts.join(", ");
  return x.addressDetail ? String(x.addressDetail) : null;
}

export function mapRawToListing(x: RawListing): ListingWithKey {
  const conditionMap: Record<string, Condition> = {
    NEW: "NEW",
    USED: "USED",
    LIKE_NEW: "LIKE_NEW",
  };

  const statusMap: Record<string, ListingStatus> = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    SOLD: "SOLD",
  };

  const cover = pickCover(x);
  const images = pickImages(x);

  const listing: Listing = {
    id: x.id,
    title: x.title,
    description: x.description ?? null,

    type: String(x.type).toUpperCase() === "VEHICLE" ? "VEHICLE" : "BATTERY",
    price: toNumberOrString(x.price),

    condition: conditionMap[String(x.conditionType ?? "").toUpperCase()] ?? undefined,
    status: statusMap[String(x.status ?? "").toUpperCase()] ?? undefined,

    createdAt: x.createdAt,
    updatedAt: x.updatedAt ?? undefined,

    seller:
      x.sellerId || x.sellerName || x.sellerPhone
        ? {
            id: x.sellerId ?? "",
            name: x.sellerName ?? "",
            phone: x.sellerPhone ?? null,
          }
        : undefined,

    media: { cover, images },
    thumbnail: cover,

    location: joinLocation(x),
    distance: null,

    slug: undefined,
    vehicleSpec: undefined,
    batterySpec: undefined,
  };

  return { ...listing, _key: `${listing.id}-${listing.createdAt ?? "na"}` };
}
