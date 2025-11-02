import api from "@/lib/axios";

export type Role = "ADMIN" | "STAFF" | "MEMBER" | string;
export type Status = "ACTIVE" | "INACTIVE" | "BANNED" | "LOCKED" | string;

export interface Account {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
  passwordHash: string;
  phone: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  nationalId?: string | null;
  taxCode?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  gender?: string | null;
  role: Role;
  status: Status;
}

export type PageResp<T> = {
  items: T[];
  page: number;        
  size: number;
  totalItems: number;
  totalPages: number;
};

/* ------------ Helpers ------------ */
function normalize(a: any): Account {
  return {
    id: a.id,
    username: a.username,
    email: a.email ?? null,
    fullName: a.fullName ?? a.full_name ?? "",
    phone: a.phone ?? null,
    dateOfBirth: a.dateOfBirth ?? a.date_of_birth ?? null,
    address: a.address ?? null,
    nationalId: a.nationalId ?? null,
    taxCode: a.taxCode ?? null,
    avatarUrl: a.avatarUrl ?? a.avatar_url ?? null,
    createdAt: a.createdAt ?? null,
    updatedAt: a.updatedAt ?? null,
    gender: a.gender ?? null,
    passwordHash: a.passwordHash,
    role: String(a.role || "").toUpperCase(),
    status: String(a.status || "").toUpperCase(),
  };
}

function unwrap<T = any>(data: any): T {
  return (data && (data.result ?? data)) as T;
}

function toPage<T>(raw: any, mapItem: (x: any) => T): PageResp<T> {
  const p = unwrap<any>(raw);
  const items = Array.isArray(p?.items) ? p.items.map(mapItem) : [];
  return {
    items,
    page: Number(p?.page ?? 0),
    size: Number(p?.size ?? items.length ?? 0),
    totalItems: Number(p?.totalItems ?? items.length ?? 0),
    totalPages: Number(p?.totalPages ?? 1),
  };
}

export async function getStaffsPaged(params: { page?: number; size?: number }) {
  const { page = 0, size = 10 } = params || {};
  const { data } = await api.get("/admin/manage/account/staff", {
    params: { page, size },
  });
  return toPage<Account>(data, normalize);
}

export async function getMembersPaged(params: { page?: number; size?: number }) {
  const { page = 0, size = 10 } = params || {};
  const { data } = await api.get("/admin/manage/account/member", {
    params: { page, size },
  });
  return toPage<Account>(data, normalize);
}

export async function getStaffs(): Promise<Account[]> {
  const { data } = await api.get<any[]>("/admin/manage/account/staff");
  const p = unwrap<any>(data);
  const items = Array.isArray(p?.items) ? p.items : Array.isArray(p) ? p : [];
  return (items ?? []).map(normalize);
}
export async function getMembers(): Promise<Account[]> {
  const { data } = await api.get<any[]>("/admin/manage/account/member");
  const p = unwrap<any>(data);
  const items = Array.isArray(p?.items) ? p.items : Array.isArray(p) ? p : [];
  return (items ?? []).map(normalize);
}

/* ------------ Mutations ------------ */
export type CreateStaffPayload = {
  phone: string;
  password: string;
  fullName: string;
  email?: string | null;
};

export async function createStaff(payload: CreateStaffPayload): Promise<Account> {
  const { data } = await api.post("/admin/register/staff", payload);
  return normalize(unwrap(data));
}

export async function banAccount(id: string, reason: string): Promise<string> {
  const { data } = await api.put(`/admin/ban/${id}`, { reason });
  return unwrap<any>(data)?.message || `Account banned with reason: ${reason}`;
}

export async function unbanAccount(id: string): Promise<string> {
  const { data } = await api.put(`/admin/unban/${id}`);
  return unwrap<any>(data)?.message || "Account has been unbanned";
}

export async function deleteAccount(id: string, adminPassword: string): Promise<string> {
  const { data } = await api.delete(`/admin/delete/${id}`, {
    data: { adminPassword },
  });
  return unwrap<any>(data)?.message || "Account deleted successfully";
}
