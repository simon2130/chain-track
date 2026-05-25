package com.ctbe.yaredandsimon.controller;

import com.ctbe.yaredandsimon.dto.request.CreateTransactionRequest;
import com.ctbe.yaredandsimon.entity.MovementTransaction;
import com.ctbe.yaredandsimon.service.MovementTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final MovementTransactionService transactionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANUFACTURER', 'SHIPPER', 'RETAILER', 'ADMIN')")
    public ResponseEntity<MovementTransaction> logTransaction(
            @Valid @RequestBody CreateTransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        MovementTransaction tx = transactionService.logEvent(
                request.batchId(),
                MovementTransaction.EventType.valueOf(request.eventType().toUpperCase()),
                request.toOrgId(),
                request.notes(),
                userDetails.getUsername());

        return ResponseEntity.status(201).body(tx);
    }

    @GetMapping("/batch/{batchId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MovementTransaction>> getTransactionsByBatch(
            @PathVariable Long batchId,
            Pageable pageable) {
        return ResponseEntity.ok(
                transactionService.getTransactionsByBatch(batchId, pageable));
    }
}