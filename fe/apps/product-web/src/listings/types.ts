export type ListingType = "BATTERY" | "VEHICLE";
export type Condition = "NEW" | "USED" | "LIKE_NEW";
export type ListingStatus = "ACTIVE" | "INACTIVE" | "SOLD";

export interface SellerInfo {
  id: string;
  name: string;
  phone?: string | null;
}

export interface ListingMedia {
  cover?: string | null;
  images?: string[];
}

export interface Listing {
  id: string;
  title: string;
  description?: string | null;

  type: ListingType;
  price: string | number | null;
  condition?: Condition;
  status?: ListingStatus;

  createdAt?: string;
  updatedAt?: string;

  seller?: SellerInfo;
  media?: ListingMedia;

  thumbnail?: string | null;

  location?: string | null;
  distance?: string | number | null;

  slug?: string;
  isHot?: boolean;

  vehicleSpec?: {
    brand?: string;
    model?: string;
    year?: number | string;
    odo?: number | string;
    seats?: number | string;
    color?: string;
  };

  batterySpec?: {
    capacityKWh?: number | string;
    chemistry?: string;
    cycles?: number | string;
  };
}

export type ListingWithKey = Listing & { _key: string };

export interface RawListing {
  id: string;
  title: string;
  description?: string | null;

  type: "BATTERY" | "VEHICLE" | string;
  price?: string | number | null;

  conditionType?: "NEW" | "USED" | "LIKE_NEW" | string;
  status?: "ACTIVE" | "INACTIVE" | "SOLD" | string;

  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string | null;

  createdAt?: string;
  updatedAt?: string | null;

  // MEDIA
  productImagesList?: Array<{
    id?: string;
    imageUrl?: string;
    publicId?: string;
    isPrimary?: boolean;
    position?: number;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
  }>;

  addressDetail?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;

  isHot?: boolean | null;
}
