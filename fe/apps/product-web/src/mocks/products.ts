import { Listing } from "@/listings/types";

export const mockListings: Listing[] = [
  {
    id: 1,
    title: "VinFast Klara S trắng ngọc trai",
    price: 45_000_000,
    brand: "VinFast",
    distance: "160km",
    location: "HCM",
    type: "vehicle",
    thumbnail: "/placeholder.png",
  },
  {
    id: 2,
    title: "Pin Lithium 40 kWh",
    price: 50_000_000,
    brand: "EcoCell",
    distance: "—",
    location: "HN",
    type: "battery",
    thumbnail: "/placeholder.png",
  },
  {
    id: 3,
    title: "Xe máy điện YADEA G5",
    price: 32_000_000,
    brand: "YADEA",
    distance: "150km",
    location: "Đà Nẵng",
    type: "vehicle",
    thumbnail: "/placeholder.png",
  },
  {
    id: 4,
    title: "Pin sạc dự phòng 5kWh",
    price: 12_000_000,
    brand: "EcoCell",
    distance: "—",
    location: "Cần Thơ",
    type: "battery",
    thumbnail: "/placeholder.png",
  },
];
