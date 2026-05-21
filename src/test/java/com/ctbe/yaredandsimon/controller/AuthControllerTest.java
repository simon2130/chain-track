package com.ctbe.yaredandsimon.controller;

import com.ctbe.yaredandsimon.config.SecurityConfig;
import com.ctbe.yaredandsimon.dto.request.LoginRequest;
import com.ctbe.yaredandsimon.dto.request.RegisterRequest;
import com.ctbe.yaredandsimon.entity.Organization;
import com.ctbe.yaredandsimon.entity.User;
import com.ctbe.yaredandsimon.repository.JwtBlacklistRepository;
import com.ctbe.yaredandsimon.repository.OrganizationRepository;
import com.ctbe.yaredandsimon.repository.UserRepository;
import com.ctbe.yaredandsimon.security.JWTUtilities;
import com.ctbe.yaredandsimon.service.CustomUserDetailsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean UserRepository userRepository;
    @MockitoBean OrganizationRepository organizationRepository;
    @MockitoBean PasswordEncoder passwordEncoder;
    @MockitoBean AuthenticationManager authenticationManager;
    @MockitoBean JWTUtilities jwtUtils;
    @MockitoBean JwtBlacklistRepository blacklistRepository;
    @MockitoBean CustomUserDetailsService customUserDetailsService;

    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        when(authenticationManager.authenticate(any())).thenReturn(
                new UsernamePasswordAuthenticationToken("admin@test.com", "password"));
        when(jwtUtils.generateToken("admin@test.com")).thenReturn("mock.jwt.token");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("admin@test.com", "password"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.type").value("Bearer"));
    }

    @Test
    void login_invalidCredentials_returns401() throws Exception {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("wrong@test.com", "wrongpass"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_validRequest_returns201() throws Exception {
        Organization org = Organization.builder()
                .id(1L).name("TestOrg")
                .type(Organization.OrgType.MANUFACTURER)
                .contactEmail("org@test.com").address("addr").build();

        User saved = User.builder()
                .id(1L).email("new@test.com")
                .passwordHash("hashed")
                .role(User.Role.MANUFACTURER)
                .organization(org).build();

        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(organizationRepository.findById(1L)).thenReturn(Optional.of(org));
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("new@test.com", "Password1!", 1L, "MANUFACTURER"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("new@test.com"));
    }

    @Test
    void register_duplicateEmail_returns409() throws Exception {
        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("existing@test.com", "Password1!", 1L, "MANUFACTURER"))))
                .andExpect(status().isConflict());
    }

    @Test
    void login_missingEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"pass\"}"))
                .andExpect(status().isBadRequest());
    }
}