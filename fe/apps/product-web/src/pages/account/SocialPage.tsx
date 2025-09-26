import { Button } from "@/components/ui/button";

export default function SocialPage() {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Liên kết mạng xã hội</h2>
      <p className="text-sm text-muted-foreground">
        Kết nối tài khoản để đăng nhập nhanh và bảo mật hơn.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="secondary">Kết nối Google</Button>
        <Button variant="secondary">Kết nối Facebook</Button>
        <Button variant="secondary">Kết nối Apple</Button>
      </div>
    </div>
  );
}
