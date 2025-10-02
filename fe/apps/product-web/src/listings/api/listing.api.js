import api from "@/lib/axios";
export const ListingsApi = {
    getLatest: (params) => api.get("/product", { params }),
};
