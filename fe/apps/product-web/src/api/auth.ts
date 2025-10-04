// src/api/auth.ts
import api from "@/lib/axios";

/* ===================== Types ===================== */
export type ApiEnvelope<T> = { code: number; message: string; result: T };

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
  phone: string;
  address?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  dateOfBirth?: string | null;
  taxCode?: string | null;
  nationalId?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | string;
  status: "ACTIVE" | "INACTIVE" | string;
  role?: string;
}

/** Login chỉ trả token + một số field cơ bản */
export interface LoginResult {
  token: string;
  email?: string | null;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string | null;
  gender?: string;
  role?: string;
  status?: string;
  address?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null; // BE hiện trả "updateAt"
}

export interface LoginResponse extends ApiEnvelope<LoginResult> {}

/* ===================== Utils ===================== */
function unwrap<T>(data: any): T {
  return (data?.result ?? data) as T;
}

/** Chuẩn hóa key từ BE (nếu snake_case / sai chính tả) */
function normalizeUser(u: any): UserProfile {
  if (!u) return u;
  return {
    ...u,
    taxCode: u.taxCode ?? u.tax_code ?? null,
    nationalId: u.nationalId ?? u.national_id ?? null,
    updatedAt: u.updatedAt ?? u.updateAt ?? null,
    avatarUrl: u.avatarUrl ?? u.avatar_url ?? null,
    dateOfBirth: u.dateOfBirth ?? u.date_of_birth ?? null,
  };
}

/* ===================== APIs ===================== */
export async function loginApi(payload: { phone: string; password: string }) {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return unwrap<LoginResult>(data);
}

export async function registerApi(payload: { fullName: string; phone: string; password: string }) {
  const { data } = await api.post<ApiEnvelope<UserProfile>>("/auth/register", payload);
  return unwrap<UserProfile>(data);
}

export const oauthUrls = {
  google: `${import.meta.env.VITE_API_URL}/auth/google`,
  facebook: `${import.meta.env.VITE_API_URL}/auth/facebook`,
};

export async function getMe(opts?: { signal?: AbortSignal }) {
  const { data } = await api.get<UserProfile | ApiEnvelope<UserProfile>>("/profile/me", {
    signal: opts?.signal,
  });
  return normalizeUser(unwrap<UserProfile>(data));
}

export type UpdateMePayload = Partial<
  Pick<
    UserProfile,
    | "fullName"
    | "phone"
    | "address"
    | "email"
    | "dateOfBirth"
    | "avatarUrl"
    | "taxCode"
    | "gender"
    | "nationalId"
  >
>;

export async function updateMe(body: UpdateMePayload) {
  const { data } = await api.patch<UserProfile | ApiEnvelope<UserProfile>>("/profile/me", body);
  return normalizeUser(unwrap<UserProfile>(data));
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  const { data } = await api.post<ApiEnvelope<unknown>>("/users/change-password", payload);
  return data;
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ url: string } | ApiEnvelope<{ url: string }>>(
    "/users/avatar",
    form
  );
  return unwrap<{ url: string }>(data).url;
}
