package com.ctbe.yaredandsimon.repository;

import com.ctbe.yaredandsimon.entity.Product;
import com.ctbe.yaredandsimon.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
}