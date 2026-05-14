package com.ctbe.yaredandsimon.dto.response;
public record TokenResponse(
        String token,
        String type,
        long expiresIn
) {
    public TokenResponse(String token, long expiresIn) {
        this(token, "Bearer", expiresIn);
    }
}