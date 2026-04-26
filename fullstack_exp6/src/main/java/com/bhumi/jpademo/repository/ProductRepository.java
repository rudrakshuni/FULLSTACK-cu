package com.bhumi.jpademo.repository;

import com.bhumi.jpademo.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByPriceBetween(double min, double max, Pageable pageable);
}