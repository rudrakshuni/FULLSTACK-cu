package com.bhumi.jpademo.repository;

import com.bhumi.jpademo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}