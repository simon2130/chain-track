package com.ctbe.yaredandsimon.controller;

import com.ctbe.yaredandsimon.config.SecurityConfig;
import com.ctbe.yaredandsimon.dto.request.CreateProductRequest;
import com.ctbe.yaredandsimon.entity.Organization;
import com.ctbe.yaredandsimon.entity.Product;
import com.ctbe.yaredandsimon.entity.User;
import com.ctbe.yaredandsimon.repository.JwtBlacklistRepository;
import com.ctbe.yaredandsimon.security.JWTUtilities;
import com.ctbe.yaredandsimon.service.CustomUserDetailsService;
import com.ctbe.yaredandsimon.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(SecurityConfig.class)
class ProductControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean ProductService productService;
    @MockitoBean JWTUtilities jwtUtils;
    @MockitoBean JwtBlacklistRepository blacklistRepository;
    @MockitoBean CustomUserDetailsService customUserDetailsService;

    private Product mockProduct() {
        Organization org = Organization.builder()
                .id(1L).name("TestOrg")
                .type(Organization.OrgType.MANUFACTURER)
                .contactEmail("org@test.com").address("addr").build();

        User user = User.builder()
                .id(1L).email("mfr@test.com")
                .passwordHash("hash")
                .role(User.Role.MANUFACTURER)
                .organization(org).build();

        return Product.builder()
                .id(1L).name("Test Product")
                .sku("SKU-001").category("Electronics")
                .createdBy(user).build();
    }

    @Test
    @WithMockUser
    void getProducts_public_returns200() throws Exception {
        when(productService.getAllProducts(any())).thenReturn(
                new PageImpl<>(List.of(mockProduct())));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sku").value("SKU-001"));
    }

    @Test
    @WithMockUser(roles = "MANUFACTURER")
    void createProduct_asManufacturer_returns201() throws Exception {
        when(productService.createProduct(any(), any(), any(), any(), any()))
                .thenReturn(mockProduct());

        mockMvc.perform(post("/api/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateProductRequest("Test", "Desc", "SKU-001", "Electronics"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("SKU-001"));
    }

    @Test
    @WithMockUser(roles = "SHIPPER")
    void createProduct_asShipper_returns403() throws Exception {
        mockMvc.perform(post("/api/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateProductRequest("Test", "Desc", "SKU-001", "Electronics"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void createProduct_unauthenticated_returns403() throws Exception {
        mockMvc.perform(post("/api/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateProductRequest("Test", "Desc", "SKU-001", "Electronics"))))
                .andExpect(status().isForbidden());
    }
}