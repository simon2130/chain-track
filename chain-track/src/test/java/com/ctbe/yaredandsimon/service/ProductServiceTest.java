package com.ctbe.yaredandsimon.service;
import com.ctbe.yaredandsimon.entity.Organization;
import com.ctbe.yaredandsimon.entity.Product;
import com.ctbe.yaredandsimon.entity.User;
import com.ctbe.yaredandsimon.exception.DuplicateResourceException;
import com.ctbe.yaredandsimon.exception.ResourceNotFoundException;
import com.ctbe.yaredandsimon.repository.ProductRepository;
import com.ctbe.yaredandsimon.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProductService productService;

    private User mockUser;
    private Organization mockOrg;

    @BeforeEach
    void setUp() {
        mockOrg = Organization.builder()
                .id(1L).name("TestOrg")
                .type(Organization.OrgType.MANUFACTURER)
                .contactEmail("test@org.com")
                .address("Test Address")
                .build();

        mockUser = User.builder()
                .id(1L).email("test@test.com")
                .passwordHash("hash")
                .role(User.Role.MANUFACTURER)
                .organization(mockOrg)
                .build();
    }

    @Test
    void createProduct_happyPath_returnsProduct() {
        when(productRepository.existsBySku("SKU-001")).thenReturn(false);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        Product result = productService.createProduct(
                "Test Product", "Description", "SKU-001", "Electronics", "test@test.com");

        assertThat(result.getName()).isEqualTo("Test Product");
        assertThat(result.getSku()).isEqualTo("SKU-001");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_duplicateSku_throwsDuplicateResourceException() {
        when(productRepository.existsBySku("SKU-001")).thenReturn(true);

        assertThatThrownBy(() ->
                productService.createProduct(
                        "Test", "Desc", "SKU-001", "Cat", "test@test.com"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("SKU-001");
    }

    @Test
    void getProductById_notFound_throwsResourceNotFoundException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getProductById_found_returnsProduct() {
        Product product = Product.builder()
                .id(1L).name("Coffee").sku("ETH-001")
                .category("Food").createdBy(mockUser).build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product result = productService.getProductById(1L);
        assertThat(result.getName()).isEqualTo("Coffee");
    }
}