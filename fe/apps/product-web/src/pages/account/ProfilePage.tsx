import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

  const fileRef = useRef<HTMLInputElement | null>(null);
  const onPickAvatar = () => fileRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setProfile((p) => ({ ...p, avatarDataUrl: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };
  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    alert("Đã lưu thay đổi (demo).");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Tiêu đề */}
      <h2 className="text-xl font-semibold border-b pb-2">Hồ sơ cá nhân</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          {profile.avatarDataUrl ? (
            <AvatarImage src={profile.avatarDataUrl} alt="avatar" />
          ) : (
            <AvatarFallback>Avatar</AvatarFallback>
          )}
        </Avatar>
        <div className="space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onPickAvatar}
          >
            Tải ảnh
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          {profile.avatarDataUrl && (
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setProfile((p) => ({ ...p, avatarDataUrl: "" }))
              }
            >
              Xóa ảnh
            </Button>
          )}
        </div>
      </div>

      {/* Họ tên / SĐT */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Họ và tên</Label>
          <Input
            value={profile.name}
            onChange={(e) =>
              setProfile((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Nhập họ tên"
            required
          />
        </div>
        <div>
          <Label>Điện thoại</Label>
          <Input
            value={profile.phone}
            onChange={(e) =>
              setProfile((p) => ({ ...p, phone: e.target.value }))
            }
            placeholder="Thêm số điện thoại"
          />
        </div>
      </div>

      {/* Địa chỉ */}
      <div>
        <Label>Địa chỉ</Label>
        <Input
          value={profile.address}
          onChange={(e) =>
            setProfile((p) => ({ ...p, address: e.target.value }))
          }
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
        />
      </div>

      {/* Email (readonly) */}
      <div className="rounded-md border px-3 py-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <Label>Email</Label>
          <Button variant="link" type="button" className="px-0">
            Thay đổi
          </Button>
        </div>
        <Input value={profile.email} readOnly className="mt-1" />
      </div>

      {/* CCCD / Hóa đơn */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>CCCD/CMND/Hộ chiếu</Label>
          <Input
            value={profile.idNumber}
            onChange={(e) =>
              setProfile((p) => ({ ...p, idNumber: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Thông tin xuất hóa đơn</Label>
          <Input
            value={profile.invoiceInfo}
            onChange={(e) =>
              setProfile((p) => ({ ...p, invoiceInfo: e.target.value }))
            }
            placeholder="Tên công ty, MST, địa chỉ..."
          />
        </div>
      </div>

      {/* Giới tính / Ngày sinh */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Giới tính</Label>
          <Select
            value={profile.gender}
            onValueChange={(val) =>
              setProfile((p) => ({ ...p, gender: val as Profile["gender"] }))
            }
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
        <div>
          <Label>Ngày sinh</Label>
          <Input
            type="date"
            value={profile.birthday}
            onChange={(e) =>
              setProfile((p) => ({ ...p, birthday: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" className="px-6">
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
