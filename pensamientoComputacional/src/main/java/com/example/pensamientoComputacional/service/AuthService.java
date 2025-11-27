package com.example.pensamientoComputacional.service;

import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.Student;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.repository.RoleRepository;
import com.example.pensamientoComputacional.repository.StudentRepository;
import com.example.pensamientoComputacional.repository.UserRepository;
import com.example.pensamientoComputacional.service.exception.BusinessException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Registra un nuevo usuario en el sistema.
     * Si el rol es STUDENT, también crea la entidad Student asociada.
     */
    public User registerUser(String name, String email, String rawPassword, String defaultRoleName, String group, String studentRole) {
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("User with email " + email + " already exists");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setIsActive(true);
        
        // Set group if provided
        if (group != null && !group.isEmpty()) {
            user.setGroup(group);
        }

        if (defaultRoleName != null) {
            Role role = roleRepository.findByName(defaultRoleName)
                .orElseThrow(() -> new BusinessException("Role not found: " + defaultRoleName));
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
        }

        // Save user first
        user = userRepository.save(user);

        // Create Student entity if role is STUDENT
        if ("STUDENT".equals(defaultRoleName)) {
            if (!studentRepository.existsById(user.getId())) {
                Student student = new Student();
                student.setUser(user);
                if (studentRole != null) {
                    student.setInitialProfile(studentRole);
                }
                studentRepository.save(student);
            }
        }

        return user;
    }
    
    /**
     * Versión simplificada para compatibilidad con código existente.
     */
    public User registerUser(String name, String email, String rawPassword, String defaultRoleName) {
        return registerUser(name, email, rawPassword, defaultRoleName, null, null);
    }

    public Authentication authenticate(String email, String rawPassword) {
        UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(email, rawPassword);
        return authenticationManager.authenticate(authToken);
    }
}


