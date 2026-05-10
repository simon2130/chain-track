package com.ctbe.yaredandsimon.repository;

import com.ctbe.yaredandsimon.entity.MovementTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovementTransactionRepository extends JpaRepository<MovementTransaction, Long> {

    List<MovementTransaction> findByBatchIdOrderByTimestampAsc(Long batchId);
    Page<MovementTransaction> findByBatchId(Long batchId, Pageable pageable);
    Optional<MovementTransaction> findTopByBatchIdOrderByTimestampDesc(Long batchId);
}