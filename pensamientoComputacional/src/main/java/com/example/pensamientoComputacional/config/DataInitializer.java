package com.example.pensamientoComputacional.config;

import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.repository.RoleRepository;
import com.example.pensamientoComputacional.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedKnownPasswords(UserRepository userRepository,
                                                RoleRepository roleRepository,
                                                PasswordEncoder passwordEncoder) {
        return args -> {
            // Ensure roles exist (ADMIN, PROFESSOR, STUDENT) — they should be created by data.sql
            Optional<Role> adminRole = roleRepository.findByName("ADMIN");
            Optional<Role> profRole = roleRepository.findByName("PROFESSOR");
            Optional<Role> studentRole = roleRepository.findByName("STUDENT");

            // Set known passwords for seeded users for testing
            setPasswordAndRole(userRepository, roleRepository, passwordEncoder,
                "admin@u.icesi.edu.co", "admin123", adminRole.orElse(null));

            setPasswordAndRole(userRepository, roleRepository, passwordEncoder,
                "professor@u.icesi.edu.co", "prof123", profRole.orElse(null));

            setPasswordAndRole(userRepository, roleRepository, passwordEncoder,
                "student@u.icesi.edu.co", "student123", studentRole.orElse(null));
        };
    }

    private void setPasswordAndRole(UserRepository userRepository,
                                    RoleRepository roleRepository,
                                    PasswordEncoder passwordEncoder,
                                    String email,
                                    String rawPassword,
                                    Role desiredRole) {
        userRepository.findByEmail(email).ifPresent(user -> {
            boolean changed = false;
            String encoded = passwordEncoder.encode(rawPassword);
            if (!encoded.equals(user.getPasswordHash())) {
                user.setPasswordHash(encoded);
                changed = true;
            }
            if (desiredRole != null) {
                Set<Role> roles = new HashSet<>(user.getRoles());
                if (!roles.contains(desiredRole)) {
                    roles.add(desiredRole);
                    user.setRoles(roles);
                    changed = true;
                }
            }
            if (changed) {
                userRepository.save(user);
            }
        });
    }
}


