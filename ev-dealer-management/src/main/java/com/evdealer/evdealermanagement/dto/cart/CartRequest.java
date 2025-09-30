package com.evdealer.evdealermanagement.dto.cart;

import com.evdealer.evdealermanagement.entity.cart.CartStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartRequest {
    @NotNull(message = "status is required")
    private CartStatus status;
}
