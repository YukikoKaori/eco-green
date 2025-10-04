export type Listing = {
  id: string | number;
  title: string;
  price: number;
  thumbnail?: string;
  brand?: string;       
  location?: string;
  distance?: string;    
  postedAt?: string;
  sellerName?: string;
  type: "vehicle" | "battery";
};
