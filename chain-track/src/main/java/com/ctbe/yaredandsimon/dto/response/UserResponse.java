package com.ctbe.yaredandsimon.dto.response;
public record UserResponse(
        Long id,
        String email,
        String role,
        String organizationName
) {}
