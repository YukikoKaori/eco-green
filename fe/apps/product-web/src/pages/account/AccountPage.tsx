import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function AccountPage() {
  const [email, setEmail] = useState("kaorisme@gmaj.com");
  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);

  const { toast } = useToast();

  const onChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);

    //fake API
    setTimeout(() => {
      setLoadingEmail(false);
      toast({
        title: "Cập nhật thành công",
        description: "Email đã được thay đổi.",
      });
    }, 1200);
  };

  const onChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (n1 !== n2) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu nhập lại không khớp.",
      });
      return;
    }
    setLoadingPwd(true);

    //fake API 
    setTimeout(() => {
      setLoadingPwd(false);
      toast({
        title: "Đổi mật khẩu thành công",
        description: "Bạn có thể đăng nhập bằng mật khẩu mới.",
      });
      setCur("");
      setN1("");
      setN2("");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold border-b pb-2">Tài khoản</h2>

      {/*email*/}
      <section className="space-y-3">
        <Label>Email</Label>
        <form onSubmit={onChangeEmail} className="flex flex-col sm:flex-row gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="sm:max-w-md"
            required
          />
          <Button type="submit" disabled={loadingEmail} className="sm:self-start">
            {loadingEmail ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Dùng email này để nhận thông báo và đăng nhập.
        </p>
      </section>

      {/*password*/}
      <section className="space-y-3">
        <h3 className="font-semibold">Đổi mật khẩu</h3>
        <form onSubmit={onChangePwd} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Mật khẩu hiện tại</Label>
              <Input
                type="password"
                value={cur}
                onChange={(e) => setCur(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <Label>Mật khẩu mới</Label>
              <Input
                type="password"
                value={n1}
                onChange={(e) => setN1(e.target.value)}
                placeholder="Ít nhất 8 ký tự"
                required
              />
            </div>
            <div>
              <Label>Nhập lại mật khẩu mới</Label>
              <Input
                type="password"
                value={n2}
                onChange={(e) => setN2(e.target.value)}
                placeholder="Nhập lại để xác nhận"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={loadingPwd}>
              {loadingPwd ? "Đang đổi..." : "Đổi mật khẩu"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Gợi ý: dùng chữ hoa, số và ký tự đặc biệt.
            </span>
          </div>
        </form>
      </section>

    </div>
  );
}
