package com.ctbe.yaredandsimon.controller;
import com.ctbe.yaredandsimon.dto.request.LoginRequest;
import com.ctbe.yaredandsimon.dto.request.RegisterRequest;
import com.ctbe.yaredandsimon.dto.response.TokenResponse;
import com.ctbe.yaredandsimon.dto.response.UserResponse;
import com.ctbe.yaredandsimon.entity.JwtBlacklist;
import com.ctbe.yaredandsimon.entity.Organization;
import com.ctbe.yaredandsimon.entity.User;
import com.ctbe.yaredandsimon.exception.DuplicateResourceException;
import com.ctbe.yaredandsimon.exception.ResourceNotFoundException;
import com.ctbe.yaredandsimon.repository.JwtBlacklistRepository;
import com.ctbe.yaredandsimon.repository.OrganizationRepository;
import com.ctbe.yaredandsimon.repository.UserRepository;
import com.ctbe.yaredandsimon.security.JWTUtilities;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTUtilities jwtUtils;
    private final JwtBlacklistRepository blacklistRepository;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already registered: " + request.email());
        }

        Organization org = organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(User.Role.valueOf(request.role().toUpperCase()))
                .organization(org)
                .build();

        User saved = userRepository.save(user);

        return ResponseEntity.status(201).body(new UserResponse(
                saved.getId(), saved.getEmail(),
                saved.getRole().name(), saved.getOrganization().getName()));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        // Load user to get role
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtUtils.generateToken(request.email(), user.getRole().name());
        return ResponseEntity.ok(new TokenResponse(token, expirationMs / 1000));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);

        blacklistRepository.save(JwtBlacklist.builder()
                .token(token)
                .expiredAt(LocalDateTime.now().plusSeconds(86400))
                .build());

        return ResponseEntity.ok("Logged out successfully");
    }
}
