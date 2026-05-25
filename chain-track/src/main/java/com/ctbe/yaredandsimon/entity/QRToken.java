package com.ctbe.yaredandsimon.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "qr_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false, unique = true)
    private Batch batch;

    @Column(name = "token_value", nullable = false, unique = true, length = 36)
    private String tokenValue;

    @Column(name = "qr_image", nullable = false, columnDefinition = "TEXT")
    private String qrImageBase64;

    @Builder.Default
    @Column(name = "scan_count", nullable = false)
    private Integer scanCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}