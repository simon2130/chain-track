package com.ctbe.yaredandsimon.controller;
import com.ctbe.yaredandsimon.dto.request.CreateProductRequest;
import com.ctbe.yaredandsimon.dto.response.ProductResponse;
import com.ctbe.yaredandsimon.entity.Product;
import com.ctbe.yaredandsimon.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProducts(pageable).map(this::toResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(productService.getProductById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sku,
            Pageable pageable) {
        return ResponseEntity.ok(
                productService.searchProducts(name, category, sku, pageable).map(this::toResponse));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANUFACTURER', 'ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Product product = productService.createProduct(
                request.name(), request.description(),
                request.sku(), request.category(), userDetails.getUsername());
        return ResponseEntity.status(201).body(toResponse(product));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANUFACTURER', 'ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody CreateProductRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Product product = productService.updateProduct(
                id, request.name(), request.description(),
                request.category(), userDetails.getUsername());
        return ResponseEntity.ok(toResponse(product));
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(),
                p.getSku(), p.getCategory(), p.getCreatedBy().getEmail(), p.getCreatedAt());
    }
}