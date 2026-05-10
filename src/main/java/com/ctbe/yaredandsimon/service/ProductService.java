package com.ctbe.yaredandsimon.service;

import com.ctbe.yaredandsimon.entity.Product;
import com.ctbe.yaredandsimon.entity.User;
import com.ctbe.yaredandsimon.exception.AccessDeniedException;
import com.ctbe.yaredandsimon.exception.DuplicateResourceException;
import com.ctbe.yaredandsimon.exception.ResourceNotFoundException;
import com.ctbe.yaredandsimon.repository.ProductRepository;
import com.ctbe.yaredandsimon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public Product createProduct(String name, String description,
                                 String sku, String category, String userEmail) {
        if (productRepository.existsBySku(sku)) {
            throw new DuplicateResourceException("Product with SKU already exists: " + sku);
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = Product.builder()
                .name(name)
                .description(description)
                .sku(sku.toUpperCase())
                .category(category)
                .createdBy(user)
                .build();

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, String name, String description,
                                 String category, String userEmail) {
        Product product = getProductById(id);

        // BOLA check — only the creator can update
        if (!product.getCreatedBy().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("You can only update your own products");
        }

        if (name != null) product.setName(name);
        if (description != null) product.setDescription(description);
        if (category != null) product.setCategory(category);

        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public Page<Product> searchProducts(String name, String category,
                                        String sku, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();

        if (name != null && !name.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
        }
        if (category != null && !category.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.lower(root.get("category")), category.toLowerCase()));
        }
        if (sku != null && !sku.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("sku")), "%" + sku.toLowerCase() + "%"));
        }

        return productRepository.findAll(spec, pageable);
    }
}
