package com.example.pensamientoComputacional.config;

import com.example.pensamientoComputacional.model.entities.Professor;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.repository.ProfessorRepository;
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
                                                ProfessorRepository professorRepository,
                                                PasswordEncoder passwordEncoder) {
        return args -> {
            // Ensure roles exist (ADMIN, PROFESSOR, STUDENT) — they should be created by data.sql
            Optional<Role> adminRole = roleRepository.findByName("ADMIN");
            Optional<Role> profRole = roleRepository.findByName("PROFESSOR");
            Optional<Role> studentRole = roleRepository.findByName("STUDENT");

            // Set known passwords for seeded users for testing
            setPasswordAndRole(userRepository, roleRepository, professorRepository, passwordEncoder,
                "admin@u.icesi.edu.co", "admin123", adminRole.orElse(null), null);

            setPasswordAndRole(userRepository, roleRepository, professorRepository, passwordEncoder,
                "professor@u.icesi.edu.co", "prof123", profRole.orElse(null), null);

            setPasswordAndRole(userRepository, roleRepository, professorRepository, passwordEncoder,
                "jorge.quesada@icesi.edu.co", "prof123", profRole.orElse(null), "Jorge Quesada");

            setPasswordAndRole(userRepository, roleRepository, professorRepository, passwordEncoder,
                "student@u.icesi.edu.co", "student123", studentRole.orElse(null), null);
        };
    }

    private void setPasswordAndRole(UserRepository userRepository,
                                    RoleRepository roleRepository,
                                    ProfessorRepository professorRepository,
                                    PasswordEncoder passwordEncoder,
                                    String email,
                                    String rawPassword,
                                    Role desiredRole,
                                    String userName) {
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
            
            // Ensure Professor entity exists if role is PROFESSOR
            if (desiredRole != null && desiredRole.getName().equals("PROFESSOR")) {
                try {
                    if (!professorRepository.existsById(user.getId())) {
                        Professor professor = new Professor();
                        professor.setId(user.getId());
                        professor.setUser(user);
                        professorRepository.save(professor);
                    }
                } catch (Exception e) {
                    // Ignore if professor already exists or other error
                    System.out.println("Warning: Could not create Professor entity for user " + email + ": " + e.getMessage());
                }
            }
        });
        
        // If user doesn't exist, create it
        if (!userRepository.existsByEmail(email) && desiredRole != null) {
            User newUser = new User();
            newUser.setName(userName != null ? userName : email.split("@")[0]);
            newUser.setEmail(email);
            newUser.setPasswordHash(passwordEncoder.encode(rawPassword));
            newUser.setIsActive(true);
            Set<Role> roles = new HashSet<>();
            roles.add(desiredRole);
            newUser.setRoles(roles);
            newUser = userRepository.save(newUser);
            
            // If it's a professor, create the professor entity
            if (desiredRole.getName().equals("PROFESSOR")) {
                try {
                    if (!professorRepository.existsById(newUser.getId())) {
                        Professor professor = new Professor();
                        professor.setId(newUser.getId());
                        professor.setUser(newUser);
                        professorRepository.save(professor);
                    }
                } catch (Exception e) {
                    // Ignore if professor already exists or other error
                    System.out.println("Warning: Could not create Professor entity for new user " + email + ": " + e.getMessage());
                }
            }
        }
    }
}


