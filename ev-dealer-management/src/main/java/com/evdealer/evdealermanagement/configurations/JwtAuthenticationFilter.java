package com.evdealer.evdealermanagement.configurations;

import com.evdealer.evdealermanagement.service.implement.AccountDetailsService;
import com.evdealer.evdealermanagement.service.implement.JwtService;
import com.evdealer.evdealermanagement.service.implement.RedisService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final AccountDetailsService userDetailsService;
    private final RedisService redisService;

    public JwtAuthenticationFilter(JwtService jwtService, AccountDetailsService userDetailsService, RedisService redisService, RedisService redisService1) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.redisService = redisService1;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        logger.debug("Processing request: {} {}", method, requestURI);

        // Bỏ qua filter cho các public API - sửa lại logic kiểm tra
        if (isPublicEndpoint(requestURI)) {
            logger.debug("Skipping JWT filter for public endpoint: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = getJwtFromRequest(request);
        logger.debug("JWT token present: {}", jwt != null);

        if(redisService.isBlacklisted(jwt)) {
            throw  new AuthenticationServiceException("Blacklisted JWT token");
        }

        if (jwt != null) {
            try {
                if (!jwtService.isExpired(jwt)) {
                    String username = jwtService.extractUsername(jwt);
                    logger.debug("Extracted username from JWT: {}", username);

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                        if (jwtService.validateToken(jwt, userDetails)) {
                            UsernamePasswordAuthenticationToken authenticationToken =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                            logger.debug("Successfully authenticated user: {}", username);
                        } else {
                            logger.warn("JWT validation failed for user: {}", username);
                        }
                    }
                } else {
                    logger.warn("JWT token is expired");
                }
            } catch (Exception e) {
                logger.error("Error processing JWT token: {}", e.getMessage());
                // Clear any partial authentication
                SecurityContextHolder.clearContext();
            }
        } else {
            logger.debug("No JWT token found in request");
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Kiểm tra xem endpoint có phải là public không
     */
    private boolean isPublicEndpoint(String requestURI) {
        return requestURI.startsWith("/auth/") ||
                requestURI.startsWith("/vehicle/") ||
                requestURI.startsWith("/battery/") ||
                requestURI.startsWith("/product/");
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}