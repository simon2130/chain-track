package com.ctbe.yaredandsimon.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateProductRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 1000) String description,
        @NotBlank @Pattern(regexp = "^[A-Za-z0-9\\-]{1,50}$",
                message = "SKU must be alphanumeric with hyphens, max 50 chars") String sku,
        @NotBlank @Size(max = 100) String category
) {}