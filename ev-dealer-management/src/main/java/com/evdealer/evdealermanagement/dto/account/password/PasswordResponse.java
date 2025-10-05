package com.evdealer.evdealermanagement.dto.account.password;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResponse {
    @Schema(description = "Đổi mật khẩu thành công hay không", example = "true")
    private boolean success;

    @Schema(description = "Thông điệp cho người dùng", example = "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.")
    private String message;
}
