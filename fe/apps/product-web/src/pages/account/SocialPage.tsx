import { Button } from "@/components/ui/button";

function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24H12.82v-9.294H9.692V11.06h3.128V8.414c0-3.1 1.893-4.788 4.658-4.788 1.324 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.315h3.59l-.467 3.646h-3.123V24h6.127C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/>
    </svg>
  );
}

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.3-1.66 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.6 2.4 14.5 1.5 12 1.5 6.75 1.5 2.5 5.75 2.5 11S6.75 20.5 12 20.5c7 0 9.5-4.9 9.5-7.5 0-.5-.05-.85-.1-1.2H12z"/>
      <path fill="#34A853" d="M3.8 7.5l3.2 2.3C7.8 8 9.7 6.5 12 6.5c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.6 3.4 14.5 2.5 12 2.5 8.6 2.5 5.7 4.4 3.8 7.5z"/>
      <path fill="#FBBC05" d="M12 21.5c3.5 0 6.4-2.3 7.4-5.4l-3.9-3c-.6 1.8-2.1 3-3.5 3-2.1 0-3.9-1.4-4.5-3.4l-3.9 3C4.2 19.2 7.8 21.5 12 21.5z"/>
      <path fill="#4285F4" d="M21.5 13c0-.5-.05-.85-.1-1.2H12v3.9h5.5c-.24 1.3-1.66 3.8-5.5 3.8v2c7 0 9.5-4.9 9.5-7.5z"/>
    </svg>
  );
}

export default function SocialPage() {
  return (
    <div className="space-y-4 md:max-w-3xl">
       <h2 className="text-xl font-semibold border-b pb-2 text-[#246f67]">Liên kết mạng xã hội</h2>
      <p className="text-sm text-muted-foreground">
        Những thông tin dưới đây chỉ dùng để xác thực. Người dùng khác không thể xem được.
      </p>

      {/* Facebook */}
      <section className="bg-white rounded-lg border shadow p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Facebook</h3>
        <Button
          className="w-full sm:w-auto justify-start gap-2
                     bg-gradient-to-r from-[#246f67] to-[#2ba195] text-white
                     hover:from-[#1e5c55] hover:to-[#238678]"
        >
          <FacebookIcon className="w-4 h-4" />
          Liên kết với Facebook
        </Button>
      </section>

      {/* Google (ví dụ đã liên kết) */}
      <section className="bg-white rounded-lg border shadow p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Google</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none justify-start gap-2
                       bg-green-50 border-green-200 text-green-700"
            disabled
          >
            <GoogleIcon className="w-4 h-4" />
            Đã liên kết với Google
          </Button>
          <Button
            variant="ghost"
            className="text-sm text-red-600 hover:bg-red-50"
          >
            Huỷ liên kết
          </Button>
        </div>
      </section>
    </div>
  );
}
