export type Listing = {
  id: string | number;
  title: string;
  price: number;
  thumbnail?: string;
  brand?: string;       // VinFast, BYD...
  location?: string;
  distance?: string;    // 100km, 160km...
  postedAt?: string;    // ISO string
  sellerName?: string;
  type: "vehicle" | "battery";
};
