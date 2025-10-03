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
  gender?: "MALE" | "FEMALE" | "OTHER" | string;
  status: "ACTIVE" | "INACTIVE" | string;
  role?: string;
}

export interface LoginResult extends UserProfile { token: string }
export interface LoginResponse extends ApiEnvelope<LoginResult> {}

function unwrap<T>(data: any): T {
  return (data?.result ?? data) as T;
}

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

export async function getMe() {
  const { data } = await api.get<UserProfile | ApiEnvelope<UserProfile>>("/profile/me");
  return unwrap<UserProfile>(data);
}

export type UpdateMePayload = Partial<
  Pick<UserProfile,
    "fullName" | "phone" | "address" | "email" |
    "dateOfBirth" | "avatarUrl" | "taxCode" | "gender">
>;

export async function updateMe(body: UpdateMePayload) {
  const { data } = await api.patch<UserProfile | ApiEnvelope<UserProfile>>("/profile/me", body);
  return unwrap<UserProfile>(data);
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
