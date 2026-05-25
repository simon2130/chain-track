package com.ctbe.yaredandsimon.dto.request;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record CreateBatchRequest(
        @NotNull Long productId,
        @NotNull @Positive Integer quantity,
        @NotNull LocalDate manufacturedDate,
        LocalDate expiryDate
) {}