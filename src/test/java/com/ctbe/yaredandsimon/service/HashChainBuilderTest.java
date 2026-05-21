package com.ctbe.yaredandsimon.service;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class HashChainBuilderTest {

    private HashChainBuilder hashChainBuilder;

    @BeforeEach
    void setUp() {
        hashChainBuilder = new HashChainBuilder();
    }

    @Test
    void computeHash_shouldReturn64CharHexString() {
        String hash = hashChainBuilder.computeHash(
                "MANUFACTURED", "2026-01-01T09:00:00", null, "1", null);
        assertThat(hash).hasSize(64);
        assertThat(hash).matches("[a-f0-9]+");
    }

    @Test
    void computeHash_sameInputProducesSameHash() {
        String hash1 = hashChainBuilder.computeHash(
                "SHIPPED", "2026-01-02T10:00:00", "1", "2", "abc123");
        String hash2 = hashChainBuilder.computeHash(
                "SHIPPED", "2026-01-02T10:00:00", "1", "2", "abc123");
        assertThat(hash1).isEqualTo(hash2);
    }

    @Test
    void computeHash_differentInputProducesDifferentHash() {
        String hash1 = hashChainBuilder.computeHash(
                "SHIPPED", "2026-01-02T10:00:00", "1", "2", "abc123");
        String hash2 = hashChainBuilder.computeHash(
                "SHIPPED", "2026-01-02T10:00:00", "1", "2", "different");
        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    void computeHash_nullFromOrgIsHandled() {
        assertThatNoException().isThrownBy(() ->
                hashChainBuilder.computeHash(
                        "MANUFACTURED", "2026-01-01T09:00:00", null, "1", null));
    }

    @Test
    void computeHash_changingAnyFieldBreaksChain() {
        String original = hashChainBuilder.computeHash(
                "RECEIVED", "2026-01-05T15:00:00", "2", "3", "prevHash123");
        String tampered = hashChainBuilder.computeHash(
                "RECEIVED", "2026-01-05T15:00:01", "2", "3", "prevHash123");
        assertThat(original).isNotEqualTo(tampered);
    }
}
