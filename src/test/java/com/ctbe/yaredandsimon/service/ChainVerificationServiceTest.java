package com.ctbe.yaredandsimon.service;

import com.ctbe.yaredandsimon.entity.*;
import com.ctbe.yaredandsimon.exception.ResourceNotFoundException;
import com.ctbe.yaredandsimon.repository.BatchRepository;
import com.ctbe.yaredandsimon.repository.MovementTransactionRepository;
import com.ctbe.yaredandsimon.repository.QRTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChainVerificationServiceTest {

    @Mock private QRTokenRepository qrTokenRepository;
    @Mock private MovementTransactionRepository transactionRepository;
    @Mock private BatchRepository batchRepository;
    @Mock private HashChainBuilder hashChainBuilder;

    @InjectMocks
    private ChainVerificationService verificationService;

    private Batch mockBatch;
    private QRToken mockQRToken;
    private Organization mockOrg;

    @BeforeEach
    void setUp() {
        mockOrg = Organization.builder()
                .id(1L).name("TestOrg")
                .type(Organization.OrgType.MANUFACTURER)
                .contactEmail("test@org.com")
                .address("addr").build();

        mockBatch = Batch.builder()
                .id(1L).batchNumber("SKU-001-20260101-ABCD1234")
                .status(Batch.BatchStatus.CREATED).build();

        mockQRToken = QRToken.builder()
                .id(1L).tokenValue("test-token-uuid")
                .batch(mockBatch).scanCount(0).build();
    }

    @Test
    void verifyChain_noTransactions_returnsValidWithMessage() {
        when(qrTokenRepository.findByTokenValue("test-token-uuid"))
                .thenReturn(Optional.of(mockQRToken));
        when(qrTokenRepository.save(any())).thenReturn(mockQRToken);
        when(batchRepository.findById(1L)).thenReturn(Optional.of(mockBatch));
        when(transactionRepository.findByBatchIdOrderByTimestampAsc(1L))
                .thenReturn(List.of());

        ChainVerificationService.VerificationResult result =
                verificationService.verifyChain("test-token-uuid");

        assertThat(result.valid()).isTrue();
        assertThat(result.transactionCount()).isEqualTo(0);
    }

    @Test
    void verifyChain_validChain_returnsValid() {
        Organization toOrg = Organization.builder().id(2L).name("ShipOrg")
                .type(Organization.OrgType.SHIPPER)
                .contactEmail("s@s.com").address("addr").build();

        MovementTransaction tx = MovementTransaction.builder()
                .id(1L).batch(mockBatch)
                .eventType(MovementTransaction.EventType.MANUFACTURED)
                .toOrg(toOrg).fromOrg(null)
                .timestamp(LocalDateTime.of(2026, 1, 1, 9, 0))
                .signatureHash("a".repeat(64))
                .previousHash(null).build();

        when(qrTokenRepository.findByTokenValue("test-token-uuid"))
                .thenReturn(Optional.of(mockQRToken));
        when(qrTokenRepository.save(any())).thenReturn(mockQRToken);
        when(batchRepository.findById(1L)).thenReturn(Optional.of(mockBatch));
        when(transactionRepository.findByBatchIdOrderByTimestampAsc(1L))
                .thenReturn(List.of(tx));
        when(hashChainBuilder.computeHash(any(), any(), any(), any(), any()))
                .thenReturn("a".repeat(64));

        ChainVerificationService.VerificationResult result =
                verificationService.verifyChain("test-token-uuid");

        assertThat(result.valid()).isTrue();
        assertThat(result.message()).isEqualTo("Chain is valid");
    }

    @Test
    void verifyChain_tamperedHash_returnsCompromised() {
        Organization toOrg = Organization.builder().id(2L).name("ShipOrg")
                .type(Organization.OrgType.SHIPPER)
                .contactEmail("s@s.com").address("addr").build();

        MovementTransaction tx = MovementTransaction.builder()
                .id(1L).batch(mockBatch)
                .eventType(MovementTransaction.EventType.MANUFACTURED)
                .toOrg(toOrg).fromOrg(null)
                .timestamp(LocalDateTime.of(2026, 1, 1, 9, 0))
                .signatureHash("a".repeat(64))
                .previousHash(null).build();

        when(qrTokenRepository.findByTokenValue("test-token-uuid"))
                .thenReturn(Optional.of(mockQRToken));
        when(qrTokenRepository.save(any())).thenReturn(mockQRToken);
        when(batchRepository.findById(1L)).thenReturn(Optional.of(mockBatch));
        when(transactionRepository.findByBatchIdOrderByTimestampAsc(1L))
                .thenReturn(List.of(tx));
        when(hashChainBuilder.computeHash(any(), any(), any(), any(), any()))
                .thenReturn("b".repeat(64)); // different hash = tampered!
        when(batchRepository.save(any())).thenReturn(mockBatch);

        ChainVerificationService.VerificationResult result =
                verificationService.verifyChain("test-token-uuid");

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).contains("COMPROMISED");
    }

    @Test
    void verifyChain_tokenNotFound_throwsResourceNotFoundException() {
        when(qrTokenRepository.findByTokenValue("bad-token"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> verificationService.verifyChain("bad-token"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}