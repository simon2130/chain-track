package com.ctbe.yaredandsimon.controller;
import com.ctbe.yaredandsimon.dto.response.UserResponse;
import com.ctbe.yaredandsimon.entity.Organization;
import com.ctbe.yaredandsimon.entity.User;
import com.ctbe.yaredandsimon.exception.ResourceNotFoundException;
import com.ctbe.yaredandsimon.repository.BatchRepository;
import com.ctbe.yaredandsimon.repository.MovementTransactionRepository;
import com.ctbe.yaredandsimon.repository.OrganizationRepository;
import com.ctbe.yaredandsimon.repository.ProductRepository;
import com.ctbe.yaredandsimon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final ProductRepository productRepository;
    private final BatchRepository batchRepository;
    private final MovementTransactionRepository transactionRepository;

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        Page<UserResponse> users = userRepository.findAll(pageable)
                .map(u -> new UserResponse(
                        u.getId(), u.getEmail(),
                        u.getRole().name(), u.getOrganization().getName()));
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(
                user.getId(), user.getEmail(),
                user.getRole().name(), user.getOrganization().getName()));
    }

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<UserResponse> activateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(true);
        userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(
                user.getId(), user.getEmail(),
                user.getRole().name(), user.getOrganization().getName()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        long totalProducts = productRepository.count();
        long totalBatches = batchRepository.count();
        long totalTransactions = transactionRepository.count();
        long totalOrganizations = organizationRepository.count();
        long totalUsers = userRepository.count();
        long compromisedBatches = batchRepository
                .findAll()
                .stream()
                .filter(b -> b.getStatus().name().equals("COMPROMISED"))
                .count();

        return ResponseEntity.ok(Map.of(
                "totalProducts", totalProducts,
                "totalBatches", totalBatches,
                "totalTransactions", totalTransactions,
                "totalOrganizations", totalOrganizations,
                "totalUsers", totalUsers,
                "compromisedBatches", compromisedBatches
        ));
    }
}
