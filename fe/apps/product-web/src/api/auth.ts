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
    if (v === null) { out[k] = null; continue; }
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
  avatarFile: File | null;    
  taxCode: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | string;
  nationalId: string | null;
}>;

function buildUpdatePayload(body: UpdateMePayload) {
  const payload: Record<string, any> = { ...body };
  if (payload.gender) payload.gender = String(payload.gender).toUpperCase();
  return compact(payload);
}

function appendIfPresent(fd: FormData, key: string, val: unknown) {
  if (val === undefined || val === null) return;
  if (typeof val === "string" && val.trim() === "") return;
  fd.append(key, val as any);
}

function buildFormData(body: UpdateMePayload) {
  const fd = new FormData();

  appendIfPresent(fd, "fullName", body.fullName);
  appendIfPresent(fd, "phone", body.phone);
  appendIfPresent(fd, "address", body.address);
  appendIfPresent(fd, "email", body.email ?? undefined);
  appendIfPresent(fd, "dateOfBirth", body.dateOfBirth ?? undefined);
  appendIfPresent(fd, "taxCode", body.taxCode ?? undefined);
  appendIfPresent(fd, "nationalId", body.nationalId ?? undefined);

  if (body.gender !== undefined) {
    appendIfPresent(fd, "gender", String(body.gender).toUpperCase());
  }
  if (body.avatarFile instanceof File) {
    fd.append("avatarUrl", body.avatarFile);
  } else if (body.avatarUrl !== undefined && body.avatarUrl !== null && body.avatarUrl !== "") {
    fd.append("avatarUrl", body.avatarUrl);
  }

  return fd;
}

export async function updateMe(body: UpdateMePayload) {
  const hasFile = body.avatarFile instanceof File;

  if (hasFile) {
    const form = buildFormData(body);
    const { data } = await api.patch<UserProfile | ApiEnvelope<UserProfile>>(
      "/profile/me/update",
      form
    );
    return normalizeUser(unwrap<UserProfile>(data));
  }

  const finalBody = buildUpdatePayload(body);
  const { data } = await api.patch<UserProfile | ApiEnvelope<UserProfile>>(
    "/profile/me/update",
    finalBody
  );
  return normalizeUser(unwrap<UserProfile>(data));
}

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ url: string } | ApiEnvelope<{ url: string }>>("/users/avatar", form);
  return unwrap<{ url: string }>(data).url;
}
//product for profile
export type MemberProduct = {
  id: string;
  title: string;
  description?: string;
  type?: "VEHICLE" | "BATTERY" | string;
  productImagesList?: Array<{ url?: string; imageUrl?: string; isPrimary?: boolean }>;
  price?: string | number | null;
  conditionType?: "NEW" | "USED" | string;
  status?: string;
  createdAt?: string;

  addressDetail?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;

  brandName?: string | null;
  modelName?: string | null;
};

export type MemberProductStatus = "ACTIVE" | "SOLD";

function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.items)) return data.items as T[];
  if (Array.isArray(data?.content)) return data.content as T[];
  return [];
}

export async function getMemberProducts(
  status: MemberProductStatus,
  opts?: { page?: number; size?: number },
  signal?: AbortSignal
): Promise<MemberProduct[]> {
  const params: Record<string, any> = { status };
  if (Number.isFinite(opts?.page)) params.page = opts!.page;
  if (Number.isFinite(opts?.size)) params.size = opts!.size;

  const { data } = await api.get<any>("/member/product", { params, signal });
  return toArray<MemberProduct>(unwrap<any>(data));
}

export function pickProductImage(p?: MemberProduct) {
  return (
    p?.productImagesList?.find(x => x.isPrimary)?.imageUrl ||
    p?.productImagesList?.[0]?.imageUrl ||
    p?.productImagesList?.[0]?.url ||
    "/images/placeholder.png"
  );
}

export function formatVND(v?: string | number | null) {
  if (v == null || v === "") return "—";

  if (typeof v === "number") {
    return Number.isFinite(v) ? Math.round(v).toLocaleString("vi-VN") + " đ" : "—";
  }

  const s = String(v).trim();
  const digits = s.replace(/[^0-9]/g, "");
  if (!digits) return "—";

  const n = Number(digits);
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") + " đ" : "—";
}
