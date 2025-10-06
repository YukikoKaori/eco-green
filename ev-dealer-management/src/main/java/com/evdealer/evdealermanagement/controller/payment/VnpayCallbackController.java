package com.evdealer.evdealermanagement.controller.payment;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.evdealer.evdealermanagement.configurations.VnpayConfig;

@RestController
@RequestMapping("/api/vnpayment")
public class VnpayCallbackController {

    @GetMapping("/return")
    public ResponseEntity<?> handleReturn(@RequestParam Map<String, String> params) {
        // 1) Verify HMAC
        if (!VnpayConfig.isValidSignature(params)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        // 2) Đọc mã kết quả
        String code = params.getOrDefault("vnp_ResponseCode", "");
        if ("00".equals(code)) {
            // TODO: đánh dấu đơn hàng (theo vnp_TxnRef) đã thanh toán thành công
            return ResponseEntity.ok("Thanh toán thành công!");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Thanh toán thất bại! Mã lỗi: " + code);
    }

    @PostMapping("/ipn")
    public ResponseEntity<String> handleIpn(@RequestParam Map<String, String> params) {
        if (!VnpayConfig.isValidSignature(params)) {
            return ResponseEntity.ok("INVALID_SIGNATURE");
        }
        // TODO: cập nhật trạng thái đơn hàng (idempotent)
        return ResponseEntity.ok("OK");
    }
}