package com.example.pensamientoComputacional.integration;

import com.example.pensamientoComputacional.TestBase;
import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.repository.PermissionRepository;
import com.example.pensamientoComputacional.repository.RoleRepository;
import com.example.pensamientoComputacional.repository.UserRepository;
import com.example.pensamientoComputacional.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@AutoConfigureMockMvc
class UserManagementIntegrationTest extends TestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User adminUser;
    private User regularUser;
    private Role adminRole;
    private Role userRole;
    private String adminToken;

    @BeforeEach
    void setUp() {
        // Limpiar datos de prueba previos
        userRepository.deleteAll();
        roleRepository.deleteAll();
        permissionRepository.deleteAll();

        // Crear roles
        adminRole = createTestRoleWithName("ROLE_ADMIN");
        userRole = createTestRoleWithName("ROLE_USER");
        adminRole = roleRepository.save(adminRole);
        userRole = roleRepository.save(userRole);

        // Crear usuarios de prueba
        adminUser = createTestUser();
        adminUser.setEmail("admin@u.icesi.edu.co");
        adminUser.setPasswordHash(passwordEncoder.encode("adminPass123"));
        adminUser.setRoles(Set.of(adminRole));
        adminUser = userRepository.save(adminUser);

        regularUser = createTestUser();
        regularUser.setEmail("user@u.icesi.edu.co");
        regularUser.setPasswordHash(passwordEncoder.encode("userPass123"));
        regularUser.setRoles(Set.of(userRole));
        regularUser = userRepository.save(regularUser);

        // Generar token de admin para las pruebas
        adminToken = tokenProvider.generateToken(adminUser);
    }

    @Test
    void getAllUsers_AsAdmin_ShouldSucceed() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[*].email", hasItems(adminUser.getEmail(), regularUser.getEmail())));
    }

    @Test
    void getAllUsers_AsRegularUser_ShouldFail() throws Exception {
        String userToken = tokenProvider.generateToken(regularUser);

        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUserById_AsAdmin_ShouldSucceed() throws Exception {
        mockMvc.perform(get("/api/admin/users/{id}", regularUser.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(regularUser.getEmail()))
                .andExpect(jsonPath("$.name").value(regularUser.getName()));
    }

    @Test
    void createUser_AsAdmin_ShouldSucceed() throws Exception {
        User newUser = createTestUser();
        newUser.setEmail("new.user@u.icesi.edu.co");
        newUser.setRoles(Set.of(userRole));

        mockMvc.perform(post("/api/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(newUser.getEmail()))
                .andExpect(jsonPath("$.name").value(newUser.getName()));
    }

    @Test
    void updateUser_AsAdmin_ShouldSucceed() throws Exception {
        regularUser.setName("Updated Name");

        mockMvc.perform(put("/api/admin/users/{id}", regularUser.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regularUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    void deleteUser_AsAdmin_ShouldSucceed() throws Exception {
        mockMvc.perform(delete("/api/admin/users/{id}", regularUser.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/users/{id}", regularUser.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void addRoleToUser_AsAdmin_ShouldSucceed() throws Exception {
        Role newRole = createTestRoleWithName("NEW_ROLE");
        newRole = roleRepository.save(newRole);

        mockMvc.perform(post("/api/admin/users/{userId}/roles/{roleId}", regularUser.getId(), newRole.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/users/{id}", regularUser.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles[*].name", hasItem("NEW_ROLE")));
    }

    @Test
    void removeRoleFromUser_AsAdmin_ShouldSucceed() throws Exception {
        // Primero agregamos un rol adicional
        Role extraRole = createTestRoleWithName("EXTRA_ROLE");
        extraRole = roleRepository.save(extraRole);
        regularUser.getRoles().add(extraRole);
        userRepository.save(regularUser);

        mockMvc.perform(delete("/api/admin/users/{userId}/roles/{roleId}", regularUser.getId(), extraRole.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/users/{id}", regularUser.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles[*].name", not(hasItem("EXTRA_ROLE"))));
    }

    @Test
    void getUsersByGroup_AsAdmin_ShouldSucceed() throws Exception {
        regularUser.setGroup("G1");
        userRepository.save(regularUser);

        mockMvc.perform(get("/api/admin/users/group/{group}", "G1")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].email", hasItem(regularUser.getEmail())))
                .andExpect(jsonPath("$[*].group", everyItem(is("G1"))));
    }
}