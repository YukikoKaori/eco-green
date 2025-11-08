import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function OAuthPopupBridge() {
  const [q] = useSearchParams();

  useEffect(() => {
    const token = q.get("token");   
    const email = q.get("email");   
    const error = q.get("error");   

    if (window.opener) {
      window.opener.postMessage({ token, email, error }, window.location.origin);
    }
    window.close();
  }, [q]);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      Đang xử lý đăng nhập…
    </div>
  );
}
