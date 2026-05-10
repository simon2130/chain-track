package com.ctbe.yaredandsimon.service;

import com.ctbe.yaredandsimon.entity.Batch;
import com.ctbe.yaredandsimon.entity.MovementTransaction;
import com.ctbe.yaredandsimon.entity.QRToken;
import com.ctbe.yaredandsimon.exception.ResourceNotFoundException;
import com.ctbe.yaredandsimon.repository.BatchRepository;
import com.ctbe.yaredandsimon.repository.MovementTransactionRepository;
import com.ctbe.yaredandsimon.repository.QRTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChainVerificationService {

    private final QRTokenRepository qrTokenRepository;
    private final MovementTransactionRepository transactionRepository;
    private final BatchRepository batchRepository;
    private final HashChainBuilder hashChainBuilder;

    @Transactional
    public VerificationResult verifyChain(String tokenValue) {

        // 1. Find the QR token
        QRToken qrToken = qrTokenRepository.findByTokenValue(tokenValue)
                .orElseThrow(() -> new ResourceNotFoundException("QR token not found"));

        // 2. Increment scan count
        qrToken.setScanCount(qrToken.getScanCount() + 1);
        qrTokenRepository.save(qrToken);

        // 3. Get the batch and all its transactions in order
        Batch batch = qrToken.getBatch();
        List<MovementTransaction> transactions =
                transactionRepository.findByBatchIdOrderByTimestampAsc(batch.getId());

        if (transactions.isEmpty()) {
            return new VerificationResult(false, batch, transactions, "No transactions found");
        }

        // 4. Re-compute and validate every hash in the chain
        String previousHash = null;
        for (MovementTransaction tx : transactions) {
            String expectedHash = hashChainBuilder.computeHash(
                    tx.getEventType().name(),
                    tx.getTimestamp().toString(),
                    tx.getFromOrg() != null ? tx.getFromOrg().getId().toString() : null,
                    tx.getToOrg().getId().toString(),
                    previousHash
            );

            if (!expectedHash.equals(tx.getSignatureHash())) {
                // Chain is broken — mark batch as COMPROMISED
                batch.setStatus(Batch.BatchStatus.COMPROMISED);
                batchRepository.save(batch);
                return new VerificationResult(false, batch, transactions, "Chain integrity check failed — batch is COMPROMISED");
            }

            previousHash = tx.getSignatureHash();
        }

        return new VerificationResult(true, batch, transactions, "Chain is valid");
    }

    public record VerificationResult(
            boolean valid,
            Batch batch,
            List<MovementTransaction> transactions,
            String message
    ) {}
}