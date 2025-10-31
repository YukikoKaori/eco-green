import api from "@/lib/axios";

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

export interface LoginResult {
  token: string;
  email?: null;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string | null;
  gender?: string;
  role?: string;
  status?: string;
  address?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
export interface LoginResponse extends ApiEnvelope<LoginResult> {}

function unwrap<T>(data: any): T {
  return (data?.result ?? data) as T;
}

function normalizeUser(u: any): UserProfile {
  if (!u) return u;
  return {
    ...u,
    id: u.id,
    username: u.username ?? u.userName ?? "",
    taxCode: u.taxCode ?? u.tax_code ?? null,
    nationalId: u.nationalId ?? null,
    updatedAt: u.updatedAt ?? u.updateAt ?? null,
    avatarUrl: u.avatarUrl ?? u.avatar_url ?? null,
    dateOfBirth: u.dateOfBirth ?? u.date_of_birth ?? null,
  };
}

const compact = (obj: Record<string, any>) => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out;
};

export async function loginApi(payload: {
  phone: string;
  password: string;
  recaptchaToken?: string; 
}) {
  const body = {
    phone: payload.phone,
    password: payload.password,
    recaptchaToken: payload.recaptchaToken ?? "",
  };
  const { data } = await api.post<LoginResponse>("/auth/login", body);
  return unwrap<LoginResult>(data);
}

export async function registerApi(payload: { fullName: string; phone: string; password: string }) {
  const { data } = await api.post<ApiEnvelope<UserProfile>>("/auth/register", payload);
  return unwrap<UserProfile>(data);
}

export async function logoutApi() {
  const { data } = await api.post("/auth/logout");
  return data;
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

export type UpdateMePayload = Partial<{
  fullName: string;
  phone: string;
  address: string;
  email: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  taxCode: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | string;
  nationalId: string | null;
}>;

function buildUpdatePayload(body: UpdateMePayload) {
  const payload: Record<string, any> = { ...body };
  if (payload.gender) payload.gender = String(payload.gender).toUpperCase();
  return compact(payload);
}

export async function updateMe(body: UpdateMePayload) {
  const finalBody = buildUpdatePayload(body);
  const { data } = await api.patch<UserProfile | ApiEnvelope<UserProfile>>("/profile/me/update", finalBody);
  return normalizeUser(unwrap<UserProfile>(data));
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  const { data } = await api.post<ApiEnvelope<unknown>>("/users/change-password", payload);
  return data;
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ url: string } | ApiEnvelope<{ url: string }>>("/users/avatar", form);
  return unwrap<{ url: string }>(data).url;
}
