package com.example.jwt_auth.service;

import com.example.jwt_auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        return userRepository.findByUsername(username)
                .map(user -> org.springframework.security.core.userdetails.User
                        .builder()
                        .username(user.getUsername())
                        .password(user.getPassword())
                        .authorities(
                                user.getRoles().stream()
                                        .map(role -> role.name())
                                        .toArray(String[]::new)
                        )
                        .build())
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));
    }
}