import { useState } from "react";

export default function SeoAbout() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="border rounded-xl shadow-sm bg-white">
      <header className="px-4 md:px-6 pt-4 md:pt-6">
        <h3 className="text-xl md:text-2xl font-semibold text-teal-800 text-center">
          EcoGreen - Giao dịch pin và xe điện qua sử dụng hàng đầu Việt Nam
        </h3>
        <hr className="mt-3 border-t" />
      </header>

      <div className="px-4 md:px-6 pb-4 md:pb-6">
        <div className={`${expanded ? "" : "line-clamp-5"} text-sm md:text-base text-muted-foreground space-y-3`}>
          <p>
            Trong thế giới hiện đại, năng lượng xanh và di chuyển bền vững đang dần trở thành xu hướng tất yếu.
            Nhưng bên cạnh những chiếc xe mới lăn bánh hay những viên pin mới xuất xưởng, vẫn còn vô số phương tiện
            và nguồn năng lượng cũ có thể tiếp tục đồng hành, tiếp tục cống hiến. Chính vì vậy, EcoGreen ra đời – để biến
            những gì đã qua sử dụng trở thành cơ hội mới, giá trị mới.
          </p>
          <p>
            Với EcoGreen, chúng tôi không chỉ xây dựng một nền tảng giao dịch. Chúng tôi kiến tạo một cộng đồng kết nối
            người mua và người bán – nơi bạn có thể dễ dàng tìm thấy chiếc xe điện phù hợp, viên pin tiết kiệm, hoặc đơn giản
            là chia sẻ lại tài sản mình không còn dùng tới. Mỗi giao dịch không chỉ là sự trao đổi, mà còn là một bước tiến nhỏ
            trong hành trình chung tay bảo vệ môi trường và lan tỏa lối sống xanh.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Đăng tin nhanh chóng:</strong> chỉ vài thao tác, sản phẩm của bạn đã có mặt trước hàng nghìn người quan tâm.</li>
            <li><strong>Định giá thông minh bằng AI:</strong> giúp bạn an tâm về giá trị, minh bạch và công bằng cho cả đôi bên.</li>
            <li><strong>Mua bán an toàn:</strong> hỗ trợ thanh toán online, hợp đồng điện tử rõ ràng, tránh rủi ro và phiền toái.</li>
            <li><strong>Trải nghiệm trọn vẹn:</strong> từ tìm kiếm, so sánh, đấu giá cho đến đánh giá sau giao dịch – tất cả đều đơn giản, tiện lợi.</li>
          </ul>
          <p>
            EcoGreen tự hào là hành trình tái sinh – nơi mỗi chiếc xe điện, mỗi viên pin cũ đều có thể tìm thấy chủ nhân mới,
            tiếp tục đồng hành trên những cung đường xanh.
          </p>
        </div>

        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="!px-4 !py-1.5 !rounded-xl !border-black !text-sm !text-teal-700 !hover:bg-accent !bg-white"
          >
            {expanded ? "Thu gọn" : "Mở rộng"}
          </button>
        </div>
      </div>
    </section>
  );
}
