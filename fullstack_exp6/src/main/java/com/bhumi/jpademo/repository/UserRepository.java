package com.bhumi.jpademo.repository;

import com.bhumi.jpademo.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRolesRoleName(String roleName);
}