import api from "@/lib/axios";

export type Role = "ADMIN" | "STAFF" | "MEMBER" | string;
export type Status = "ACTIVE" | "INACTIVE" | string;

export interface Account {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
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
    role: String(a.role || "").toUpperCase(),
    status: String(a.status || "").toUpperCase(),
  };
}

export async function getAllAccounts(): Promise<Account[]> {
  const { data } = await api.get<any[]>("/admin/manage/account");
  const raw = Array.isArray((data as any)?.result) ? (data as any).result : data;
  return (raw ?? []).map(normalize);
}
export async function getMembers() {
  const rows = await getAllAccounts();
  return rows.filter(a => a.role.toUpperCase() === "MEMBER");
}

export async function getStaffs() {
  const rows = await getAllAccounts();
  return rows.filter(a => a.role.toUpperCase() === "STAFF");
}
