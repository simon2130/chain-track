package com.ctbe.yaredandsimon.dto.response;
import java.time.LocalDateTime;
public record ProductResponse(
        Long id,
        String name,
        String description,
        String sku,
        String category,
        String createdByEmail,
        LocalDateTime createdAt
) {}