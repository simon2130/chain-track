package com.ctbe.yaredandsimon.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTransactionRequest(
        @NotNull Long batchId,
        @NotBlank String eventType,
        @NotNull Long toOrgId,
        String notes
) {}