package com.ctbe.yaredandsimon.repository;

import com.ctbe.yaredandsimon.entity.Batch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByBatchNumber(String batchNumber);
    Page<Batch> findByProductId(Long productId, Pageable pageable);
}