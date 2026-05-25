package com.ctbe.yaredandsimon.repository;

import com.ctbe.yaredandsimon.entity.QRToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QRTokenRepository extends JpaRepository<QRToken, Long> {

    Optional<QRToken> findByTokenValue(String tokenValue);
    boolean existsByBatchId(Long batchId);
}
