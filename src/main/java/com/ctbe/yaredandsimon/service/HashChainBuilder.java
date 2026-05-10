package com.ctbe.yaredandsimon.service;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Component
public class HashChainBuilder {

    public String computeHash(String eventType,
                              String timestamp,
                              String fromOrgId,
                              String toOrgId,
                              String previousHash) {
        String input = eventType
                + "|" + timestamp
                + "|" + (fromOrgId != null ? fromOrgId : "null")
                + "|" + toOrgId
                + "|" + (previousHash != null ? previousHash : "null");

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hashBytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
