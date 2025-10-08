import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { getMe, updateMe, uploadAvatar, UserProfile } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
const DEFAULT_AVATAR = "/images/avatar-default.png";

type Profile = {
  name: string;
  phone: string;
  address: string;
  email: string;
  taxCode: string;
  gender: "male" | "female" | "other" | "";
  birthday: string;
  avatarDataUrl?: string;
  nationalId: string;
};

const toProfile = (u: UserProfile | null): Profile => {
  const g = u?.gender ? u.gender.toLowerCase() : "";
  const gender: Profile["gender"] =
    g === "male" || g === "female" || g === "other" ? (g as any) : "";

  return {
    name: u?.fullName ?? "",
    phone: u?.phone ?? "",
    address: u?.address ?? "",
    email: u?.email ?? "",
    taxCode: u?.taxCode ?? "",
    gender,
    birthday: u?.dateOfBirth ? u.dateOfBirth.substring(0, 10) : "",
    avatarDataUrl: u?.avatarUrl ?? "",
    nationalId: u?.nationalId ?? ""
  };
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(user ? toProfile(user as any) : null);
  const [loading, setLoading] = useState(!user);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile && user) setProfile(toProfile(user as any));

    const needHydrate =
      !user ||
      !(user as any).gender ||
      !(user as any).dateOfBirth ||
      (user as any).address === undefined ||
      (user as any).avatarUrl === undefined ||
      (user as any).taxCode === undefined ||
      (user as any).nationalId === undefined;

    let cancelled = false;

    async function hydrate() {
      try {
        if (!user) setLoading(true);
        const me = await getMe();
        if (cancelled) return;

        setProfile(toProfile(me));

        setUser(
          {
            username: me.username,
            fullName: me.fullName,
            email: me.email ?? "",
            phone: me.phone,
            status: me.status,
            gender: me.gender,
            dateOfBirth: me.dateOfBirth,
            address: me.address,
            avatarUrl: me.avatarUrl,
            taxCode: me.taxCode ?? null,
            nationalId: me.nationalId ?? null
          },
          { remember: "local" }
        );
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          (e?.response?.status === 401
            ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            : "Không tải được hồ sơ.");
        setFetchError(msg);
      } finally {
        setLoading(false);
      }
    }

    if (needHydrate) hydrate();
    return () => { cancelled = true; };
  }, [user]);

  // ===== Avatar =====
  const fileRef = useRef<HTMLInputElement | null>(null);
  const onPickAvatar = () => fileRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) return alert("Chỉ hỗ trợ file ảnh.");
    if (file.size > 2 * 1024 * 1024) return alert("Ảnh tối đa 2MB.");

    const reader = new FileReader();
    reader.onload = () =>
      setProfile((p) => (p ? { ...p, avatarDataUrl: String(reader.result || "") } : p));
    reader.readAsDataURL(file);

    try {
      const url = await uploadAvatar(file);
      setProfile((p) => (p ? { ...p, avatarDataUrl: url } : p));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Tải ảnh thất bại");
    }
  };

  const [errors, setErrors] = useState<{ phone?: string; nationalId?: string }>({});
  const phoneRe = /^(\+84|0)(3|5|7|8|9)\d{8}$/;
  const idRe = /^(?:\d{9}|\d{12}|[A-Z0-9]{8,9})$/i;

  const validatePhone = (v: string) =>
    !v ? undefined : phoneRe.test(v) ? undefined : "Số điện thoại không hợp lệ (VD: 0981234567 hoặc +84981234567)";
  const validateId = (v: string) =>
    !v ? undefined : idRe.test(v) ? undefined : "CCCD/CMND 9 hoặc 12 số, hoặc hộ chiếu 8-9 ký tự (A-Z,0-9)";

  // ===== Submit lưu hồ sơ =====
  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!profile) return;

    const next = { phone: validatePhone(profile.phone), idNumber: validateId(profile.nationalId) };
    setErrors(next);
    if (next.phone || next.idNumber) return;

    try {
      await updateMe({
        fullName: profile.name,
        phone: profile.phone,
        address: profile.address,
        email: profile.email,
        dateOfBirth: profile.birthday,
        avatarUrl: profile.avatarDataUrl,
        gender: profile.gender ? profile.gender.toUpperCase() : undefined,
        taxCode: profile.taxCode,
        nationalId: profile.nationalId
      });
      alert("Đã lưu thay đổi");

      setUser(
        {
          username: user?.username || "",
          fullName: profile.name,
          email: profile.email,
          phone: profile.phone,
          status: user?.status || "ACTIVE",
          gender: profile.gender ? profile.gender.toUpperCase() : undefined,
          dateOfBirth: profile.birthday,
          address: profile.address,
          avatarUrl: profile.avatarDataUrl,
          taxCode: profile.taxCode || null,
          nationalId: profile.nationalId
        },
        { remember: "local" }
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lưu thất bại");
    }
  };

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Đang tải hồ sơ...</div>;
  if (!profile) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-[#246f67]">Hồ sơ cá nhân</h2>
        {fetchError && (
          <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
            {fetchError}
          </div>
        )}
        <Button onClick={() => window.location.reload()} className="px-6 bg-[#246f67] text-white hover:bg-[#1f5c55]">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 md:max-w-3xl">
      {/* Tiêu đề */}
      <h2 className="text-xl font-semibold border-b pb-2 text-[#246f67]">Hồ sơ cá nhân</h2>
      {fetchError && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
          {fetchError}
        </div>
      )}
      <section className="bg-white rounded-lg border shadow p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-[#2ba195]/30 overflow-hidden">
            <AvatarImage
              src={profile.avatarDataUrl || DEFAULT_AVATAR}
              alt="avatar"
              className="object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <AvatarFallback className="text-sm bg-gray-100">
              {(profile.name || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-x-2">
            <Button type="button" variant="secondary" onClick={onPickAvatar} className="!shadow-sm !bg-white">
              Tải ảnh
            </Button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="!hidden" />
            {profile.avatarDataUrl && (
              <Button
                type="button"
                variant="ghost"
                className="!shadow-sm !bg-white"
                onClick={() => setProfile((p) => (p ? { ...p, avatarDataUrl: "" } : p))}
              >
                Xóa ảnh
              </Button>
            )}
          </div>
        </div>
      </section>
      {/* Thông tin cơ bản */}
      <section className="bg-white rounded-lg border shadow p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Họ và tên – khóa cứng */}
          <div className="flex flex-col space-y-2">
            <Label>
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              value={profile.name}
              readOnly
              aria-readonly="true"
              className="cursor-not-allowed bg-neutral-50 text-neutral-700"
            />
          </div>

          {/* Điện thoại – khóa cứng */}
          <div className="flex flex-col space-y-2">
            <Label>
              Điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              value={profile.phone}
              readOnly
              aria-readonly="true"
              className="cursor-not-allowed bg-neutral-50 text-neutral-700"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Label>Địa chỉ</Label>
          <Input
            value={profile.address}
            onChange={(e) => setProfile((p) => (p ? { ...p, address: e.target.value } : p))}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          />
        </div>
      </section>

      {/* Email (readonly) */}
      <section className="bg-white rounded-lg border shadow p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="font-medium">Email</Label>
          <Button variant="link" type="button" className="!px-0 !text-[#246f67] !text-sm !hover:underline !bg-white">
            Thay đổi
          </Button>
        </div>
        <Input value={profile.email} readOnly />
        <p className="text-xs text-gray-500">Dùng email này để nhận thông báo và đăng nhập.</p>
      </section>

      {/* CCCD / Hóa đơn */}
      <section className="bg-white rounded-lg border shadow p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <Label>CCCD/CMND/Hộ chiếu</Label>
            <Input
              value={profile.nationalId}
              onChange={(e) => {
                const v = e.target.value.trim();
                setProfile((p) => (p ? { ...p, nationalId: v } : p));
                setErrors((er) => ({ ...er, nationalId: validateId(v) }));
              }}
              onBlur={(e) => setErrors((er) => ({ ...er, nationalId: validateId(e.target.value.trim()) }))}
              placeholder="VD: 0790xxxxxxx / B1234567"
              aria-invalid={!!errors.nationalId}
              className={errors.nationalId ? "ring-2 ring-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.nationalId && <p className="text-xs text-red-500">{errors.nationalId}</p>}
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Thông tin xuất hóa đơn</Label>
            <Input
              value={profile.taxCode}
              onChange={(e) => setProfile((p) => (p ? { ...p, taxCode: e.target.value } : p))}
              placeholder="Tên công ty, MST, địa chỉ..."
            />
          </div>
        </div>
      </section>

      {/* Giới tính / Ngày sinh */}
      <section className="bg-white rounded-lg border shadow p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2 text-sm">
            <Label>Giới tính</Label>
            <Select
              value={profile.gender}
              onValueChange={(val) => setProfile((p) => (p ? { ...p, gender: val as Profile["gender"] } : p))}
            >
              <SelectTrigger className="!bg-white">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Ngày sinh</Label>
            <Input
              type="date"
              value={profile.birthday}
              onChange={(e) => setProfile((p) => (p ? { ...p, birthday: e.target.value } : p))}
            />
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="pt-1">
        <Button
          type="submit"
          className="px-6 bg-gradient-to-r from-[#246f67] to-[#2ba195] text-white hover:from-[#1e5c55] hover:to-[#238678]"
        >
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
