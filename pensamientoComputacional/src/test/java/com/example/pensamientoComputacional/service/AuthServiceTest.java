package com.example.pensamientoComputacional.service;

import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.repository.RoleRepository;
import com.example.pensamientoComputacional.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Test
    void registerUser_shouldPersistEncodedPasswordAndRole() {
        Role role = roleRepository.findByName("STUDENT").orElseGet(() -> {
            Role r = new Role();
            r.setName("STUDENT");
            return roleRepository.save(r);
        });

        User user = authService.registerUser("Alice", "alice@example.com", "password123", "STUDENT");
        User saved = userRepository.findByEmail("alice@example.com").orElseThrow();

        assertThat(saved.getPasswordHash()).isNotEqualTo("password123");
        assertThat(saved.getRoles()).extracting("name").contains("STUDENT");
    }
}


