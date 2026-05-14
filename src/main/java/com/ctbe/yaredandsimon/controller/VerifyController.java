package com.ctbe.yaredandsimon.controller;
import com.ctbe.yaredandsimon.service.ChainVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verify")
@RequiredArgsConstructor
public class VerifyController {

    private final ChainVerificationService verificationService;

    @GetMapping("/{token}")
    public ResponseEntity<ChainVerificationService.VerificationResult> verify(
            @PathVariable String token) {
        return ResponseEntity.ok(verificationService.verifyChain(token));
    }
}