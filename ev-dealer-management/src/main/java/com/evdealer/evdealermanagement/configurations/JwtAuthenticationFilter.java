package com.evdealer.evdealermanagement.configurations;

import com.evdealer.evdealermanagement.dto.account.custom.CustomAccountDetails;
import com.evdealer.evdealermanagement.service.implement.AccountDetailsService;
import com.evdealer.evdealermanagement.service.implement.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@Component

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AccountDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (jwt != null && !jwtService.isExpired(jwt)) { // Add null check
                String username = jwtService.extractUsername(jwt);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    CustomAccountDetails userDetails = (CustomAccountDetails) userDetailsService.loadUserByUsername(username);


                    if (jwtService.validateToken(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authenticationToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("JWT Authentication error: " + e.getMessage());
            // Consider logging more details for debugging
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest (HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
