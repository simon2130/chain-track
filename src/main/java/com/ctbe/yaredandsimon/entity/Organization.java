package com.ctbe.yaredandsimon.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrgType type;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.PERSIST, fetch = FetchType.LAZY)
    private List<User> users;

    public enum OrgType {
        MANUFACTURER, SHIPPER, RETAILER
    }
}