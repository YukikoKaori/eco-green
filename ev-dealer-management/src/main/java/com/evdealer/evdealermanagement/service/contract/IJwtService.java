package com.evdealer.evdealermanagement.service.contract;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.userdetails.UserDetails;

public interface IJwtService {
    String generateToken (UserDetails userDetails);
    boolean validateToken (String token, UserDetails userDetails);
    Claims extractAllClaims (String token);
    String extractUsername (Claims claims);
    boolean isExpired (String token);
}
