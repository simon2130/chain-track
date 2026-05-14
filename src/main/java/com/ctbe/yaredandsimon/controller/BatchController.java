package com.ctbe.yaredandsimon.controller;

import com.ctbe.yaredandsimon.dto.request.CreateBatchRequest;
import com.ctbe.yaredandsimon.entity.Batch;
import com.ctbe.yaredandsimon.entity.QRToken;
import com.ctbe.yaredandsimon.service.BatchService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANUFACTURER', 'ADMIN')")
    public ResponseEntity<Batch> createBatch(
            @Valid @RequestBody CreateBatchRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Batch batch = batchService.createBatch(
                request.productId(), request.quantity(),
                request.manufacturedDate(), request.expiryDate(),
                userDetails.getUsername());
        return ResponseEntity.status(201).body(batch);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Batch> getBatch(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatchById(id));
    }

    @PostMapping("/{id}/qr")
    @PreAuthorize("hasAnyRole('MANUFACTURER', 'ADMIN')")
    public ResponseEntity<QRToken> generateQR(
            @PathVariable Long id,
            HttpServletRequest request) {
        String baseUrl = request.getScheme() + "://" + request.getServerName()
                + ":" + request.getServerPort();
        return ResponseEntity.status(201).body(batchService.generateQRCode(id, baseUrl));
    }
}

