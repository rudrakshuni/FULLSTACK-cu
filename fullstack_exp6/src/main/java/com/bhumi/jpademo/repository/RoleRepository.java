package com.bhumi.jpademo.repository;

import com.bhumi.jpademo.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
}