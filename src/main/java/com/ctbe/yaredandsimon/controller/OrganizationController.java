package com.ctbe.yaredandsimon.controller;

import com.ctbe.yaredandsimon.dto.request.CreateOrgRequest;
import com.ctbe.yaredandsimon.entity.Organization;
import com.ctbe.yaredandsimon.exception.DuplicateResourceException;
import com.ctbe.yaredandsimon.repository.OrganizationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationRepository organizationRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Organization>> getAllOrganizations(Pageable pageable) {
        return ResponseEntity.ok(organizationRepository.findAll(pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Organization> createOrganization(
            @Valid @RequestBody CreateOrgRequest request) {

        if (organizationRepository.existsByName(request.name())) {
            throw new DuplicateResourceException(
                    "Organization already exists: " + request.name());
        }

        Organization org = Organization.builder()
                .name(request.name())
                .type(Organization.OrgType.valueOf(request.type().toUpperCase()))
                .contactEmail(request.contactEmail())
                .address(request.address())
                .build();

        return ResponseEntity.status(201).body(organizationRepository.save(org));
    }
}