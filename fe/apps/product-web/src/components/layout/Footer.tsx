import "@/styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Hỗ trợ khách hàng */}
        <div>
          <h3 className="footer-title">HỖ TRỢ KHÁCH HÀNG</h3>
          <ul className="footer-links">
            <li>
              <a href="/tro-giup">Trợ giúp</a>
            </li>
            <li>
              <a href="/quy-dinh-dang-tin">Quy định đăng tin</a>
            </li>
            <li>
              <a href="/lien-he">Liên hệ</a>
            </li>
          </ul>
        </div>

        {/* Về chúng tôi */}
        <div>
          <h3 className="footer-title">VỀ CHÚNG TÔI</h3>
          <ul className="footer-links">
            <li>
              <a href="/gioi-thieu">Giới thiệu</a>
            </li>
            <li>
              <a href="/quy-che-hoat-dong">Quy chế hoạt động</a>
            </li>
            <li>
              <a href="/chinh-sach">Chính sách bảo mật</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Thông tin công ty */}
      <div className="footer-company">
        <p className="mb-2">
          CÔNG TY TNHH ECOGREEN - Chịu trách nhiệm nội dung: Nguyễn Thị Tuyết
          Hương
        </p>
        <p className="mb-2">
          Địa chỉ: C144 đường Lê Thị Riêng, phường Thới An, quận 12, TP.HCM.{" "}
          Email: <a href="mailto:hotro@ecogreen.vn">hotro@ecogreen.vn</a>,{" "}
          Hotline: <a href="tel:097970000">097 970 000</a>
        </p>
        <p className="font-semibold text-teal-700">
          EcoGreen không bán xe trực tiếp, quý khách mua xe vui lòng liên hệ
          trực tiếp người đăng tin.
        </p>
        <p className="mt-2">Copyright © 2022-2025 Ecogreen.vn</p>
      </div>
    </footer>
  );
}
