package com.evdealer.evdealermanagement.service.impl;

import com.evdealer.evdealermanagement.service.contract.IJwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtServiceImpl implements IJwtService {

    private static final String SECRET_KEY = "MySuperSecretKey1234567890MySuperSecretKey";

    @Override
    public Key getSignKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 10*60*60*1000))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();

    }

    @Override
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    @Override
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    @Override
    public boolean isExpired(String token) {
       Date expiration = Jwts.parserBuilder()
               .setSigningKey(getSignKey())
               .build()
               .parseClaimsJws(token)
               .getBody().getExpiration();
       return expiration.before(new Date());
    }

    @Override
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token);
            String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isExpired(token);
        }catch (IllegalArgumentException exception) {
            System.out.println("Error at validate token: " + exception);
            return false;
        }
    }
}
