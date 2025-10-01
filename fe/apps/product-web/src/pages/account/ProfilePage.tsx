import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Eye, EyeOff } from "lucide-react";

type Profile = {
  name: string;
  phone: string;
  address: string;
  email: string;
  idNumber: string;
  invoiceInfo: string;
  gender: "male" | "female" | "other" | "";
  birthday: string;
  avatarDataUrl?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: "Kaori Hzemou",
    phone: "",
    address: "",
    email: "kaorisme@gmaj.com",
    idNumber: "",
    invoiceInfo: "",
    gender: "",
    birthday: "",
    avatarDataUrl: "",
  });

  // ===== Avatar =====
  const fileRef = useRef<HTMLInputElement | null>(null);
  const onPickAvatar = () => fileRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) return alert("Chỉ hỗ trợ file ảnh.");
    if (file.size > 2 * 1024 * 1024) return alert("Ảnh tối đa 2MB.");

    const reader = new FileReader();
    reader.onload = () =>
      setProfile((p) => ({ ...p, avatarDataUrl: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };

  // ===== Validate phone / idNumber =====
  const [errors, setErrors] = useState<{ phone?: string; idNumber?: string }>({});
  const phoneRe = /^(\+84|0)(3|5|7|8|9)\d{8}$/; // VN mobile
  const idRe = /^(?:\d{9}|\d{12}|[A-Z0-9]{8,9})$/i; // CMND 9, CCCD 12, Passport 8-9

  const validatePhone = (v: string) =>
    !v ? undefined : phoneRe.test(v) ? undefined : "Số điện thoại không hợp lệ (VD: 0981234567 hoặc +84981234567)";
  const validateId = (v: string) =>
    !v ? undefined : idRe.test(v) ? undefined : "CCCD/CMND 9 hoặc 12 số, hoặc hộ chiếu 8-9 ký tự (A-Z,0-9)";

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    const next = { phone: validatePhone(profile.phone), idNumber: validateId(profile.idNumber) };
    setErrors(next);
    if (next.phone || next.idNumber) return;
    alert("Đã lưu thay đổi (demo).");
  };

  // ===== Đổi mật khẩu (inline, không dùng Dialog) =====
  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [show, setShow] = useState<{ cur: boolean; n1: boolean; n2: boolean }>({
    cur: false, n1: false, n2: false,
  });
  const [pwdLoading, setPwdLoading] = useState(false);

  const onChangePwd: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (n1.length < 8) return alert("Mật khẩu mới tối thiểu 8 ký tự.");
    if (n1 !== n2) return alert("Mật khẩu xác nhận không khớp.");
    setPwdLoading(true);
    // TODO: gọi API đổi mật khẩu
    setTimeout(() => {
      setPwdLoading(false);
      setCur(""); setN1(""); setN2("");
      alert("Đổi mật khẩu thành công (demo).");
    }, 600);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 md:max-w-3xl">
      {/* Tiêu đề */}
      <h2 className="text-xl font-semibold border-b pb-2 text-[#246f67]">Hồ sơ cá nhân</h2>

      {/* Avatar card */}
      <section className="bg-white rounded-lg border shadow p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-[#2ba195]/30">
            {profile.avatarDataUrl ? (
              <AvatarImage src={profile.avatarDataUrl} alt="avatar" />
            ) : (
              <AvatarFallback>Avatar</AvatarFallback>
            )}
          </Avatar>

          <div className="space-x-2">
            <Button type="button" variant="secondary" onClick={onPickAvatar} className="shadow-sm">
              Tải ảnh
            </Button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            {profile.avatarDataUrl && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setProfile((p) => ({ ...p, avatarDataUrl: "" }))}
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
          <div className="flex flex-col space-y-2">
            <Label>Họ và tên</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nhập họ tên"
              required
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label>Điện thoại</Label>
            <Input
              value={profile.phone}
              onChange={(e) => {
                const v = e.target.value.trim();
                setProfile((p) => ({ ...p, phone: v }));
                setErrors((er) => ({ ...er, phone: validatePhone(v) }));
              }}
              onBlur={(e) => setErrors((er) => ({ ...er, phone: validatePhone(e.target.value.trim()) }))}
              placeholder="VD: 0981234567"
              aria-invalid={!!errors.phone}
              className={errors.phone ? "ring-2 ring-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Label>Địa chỉ</Label>
          <Input
            value={profile.address}
            onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          />
        </div>
      </section>

      {/* Email (readonly) */}
      <section className="bg-white rounded-lg border shadow p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="font-medium">Email</Label>
          <Button variant="link" type="button" className="px-0 text-[#246f67] hover:underline">
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
              value={profile.idNumber}
              onChange={(e) => {
                const v = e.target.value.trim();
                setProfile((p) => ({ ...p, idNumber: v }));
                setErrors((er) => ({ ...er, idNumber: validateId(v) }));
              }}
              onBlur={(e) => setErrors((er) => ({ ...er, idNumber: validateId(e.target.value.trim()) }))}
              placeholder="VD: 0790xxxxxxx / B1234567"
              aria-invalid={!!errors.idNumber}
              className={errors.idNumber ? "ring-2 ring-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.idNumber && <p className="text-xs text-red-500">{errors.idNumber}</p>}
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Thông tin xuất hóa đơn</Label>
            <Input
              value={profile.invoiceInfo}
              onChange={(e) => setProfile((p) => ({ ...p, invoiceInfo: e.target.value }))}
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
              onValueChange={(val) => setProfile((p) => ({ ...p, gender: val as Profile["gender"] }))}
            >
              <SelectTrigger>
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
              onChange={(e) => setProfile((p) => ({ ...p, birthday: e.target.value }))}
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
