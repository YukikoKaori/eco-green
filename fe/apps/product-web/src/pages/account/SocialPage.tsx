import { Button } from "@/components/ui/button";

export default function SocialPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">Liên kết mạng xã hội</h2>
      <p className="text-sm text-muted-foreground">
        Những thông tin dưới đây chỉ mang tính xác thực. Người dùng khác sẽ không thể thấy thông tin này.
      </p>

      {/* Facebook */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Facebook</h3>
        <Button variant="outline" className="w-full sm:w-auto justify-start">
          {/* có thể thêm icon */}
          Liên kết với Facebook
        </Button>
      </div>

      {/* Google */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Google</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none justify-start bg-gray-50"
          >
            Đã liên kết với Google
          </Button>
          <Button variant="ghost" className="text-sm text-blue-600">
            Huỷ
          </Button>
        </div>
      </div>

      {/* Apple */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Apple ID</h3>
        <Button variant="outline" className="w-full sm:w-auto justify-start">
          Liên kết với Apple ID
        </Button>
      </div>
    </div>
  );
}
