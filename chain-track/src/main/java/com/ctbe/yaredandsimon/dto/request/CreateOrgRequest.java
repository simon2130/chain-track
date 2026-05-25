package com.ctbe.yaredandsimon.dto.request;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOrgRequest(
        @NotBlank String name,
        @NotNull String type,
        @NotBlank @Email String contactEmail,
        @NotBlank String address
) {}
