import api from "@/lib/axios";
import type { Listing } from "../types";

export const ListingsApi = {
  getLatest: (params?: { type?: "vehicle" | "battery"; page?: number; size?: number }) =>
    api.get<Listing[]>("/product", { params }),
  // khi có endpoint cụ thể: /vehicle, /battery thì tách tiếp
};
