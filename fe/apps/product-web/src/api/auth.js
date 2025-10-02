import api from "@/lib/axios";
export async function loginApi(data) {
    const res = await api.post("/auth/login", data);
    return res.data;
}
export async function registerApi(data) {
    const res = await api.post("/auth/register", data);
    return res.data;
}
export const oauthUrls = {
    google: `${import.meta.env.VITE_API_URL}/auth/google`,
    facebook: `${import.meta.env.VITE_API_URL}/auth/facebook`,
};
