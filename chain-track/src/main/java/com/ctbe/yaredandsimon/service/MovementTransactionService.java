package com.ctbe.yaredandsimon.service;

import com.ctbe.yaredandsimon.entity.*;
import com.ctbe.yaredandsimon.exception.InvalidOperationException;
import com.ctbe.yaredandsimon.exception.ResourceNotFoundException;
import com.ctbe.yaredandsimon.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovementTransactionService {

    private final MovementTransactionRepository transactionRepository;
    private final BatchRepository batchRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final HashChainBuilder hashChainBuilder;

    @Transactional
    public MovementTransaction logEvent(Long batchId,
                                        MovementTransaction.EventType eventType,
                                        Long toOrgId,
                                        String notes,
                                        String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        if (batch.getStatus() == Batch.BatchStatus.COMPROMISED) {
            throw new InvalidOperationException("Cannot log events on a COMPROMISED batch");
        }

        Organization toOrg = organizationRepository.findById(toOrgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        // Get the last transaction to chain from
        Optional<MovementTransaction> lastTx =
                transactionRepository.findTopByBatchIdOrderByTimestampDesc(batchId);

        String previousHash = lastTx.map(MovementTransaction::getSignatureHash).orElse(null);
        Organization fromOrg = lastTx.map(MovementTransaction::getToOrg).orElse(null);

        LocalDateTime now = LocalDateTime.now();

        // Compute the hash for this transaction
        String signatureHash = hashChainBuilder.computeHash(
                eventType.name(),
                now.toString(),
                fromOrg != null ? fromOrg.getId().toString() : null,
                toOrg.getId().toString(),
                previousHash
        );

        MovementTransaction tx = MovementTransaction.builder()
                .batch(batch)
                .eventType(eventType)
                .fromOrg(fromOrg)
                .toOrg(toOrg)
                .timestamp(now)
                .signatureHash(signatureHash)
                .previousHash(previousHash)
                .performedBy(user)
                .notes(notes)
                .build();

        // Update batch status based on event type
        switch (eventType) {
            case SHIPPED, IN_TRANSIT -> batch.setStatus(Batch.BatchStatus.IN_TRANSIT);
            case RECEIVED -> batch.setStatus(Batch.BatchStatus.DELIVERED);
            default -> { }
        }
        batchRepository.save(batch);

        return transactionRepository.save(tx);
    }

    @Transactional(readOnly = true)
    public Page<MovementTransaction> getTransactionsByBatch(Long batchId, Pageable pageable) {
        return transactionRepository.findByBatchId(batchId, pageable);
    }
}