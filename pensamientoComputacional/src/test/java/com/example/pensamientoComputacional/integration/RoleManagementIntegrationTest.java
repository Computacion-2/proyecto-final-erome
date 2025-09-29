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
class RoleManagementIntegrationTest extends TestBase {

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
    private JwtTokenProvider tokenProvider;

    private User adminUser;
    private Role testRole;
    private Permission testPermission;
    private String adminToken;

    @BeforeEach
    void setUp() {
        // Limpiar datos de prueba previos
        userRepository.deleteAll();
        roleRepository.deleteAll();
        permissionRepository.deleteAll();

        // Crear permisos de prueba
        testPermission = createTestPermission();
        testPermission = permissionRepository.save(testPermission);

        // Crear rol de prueba
        testRole = createTestRole();
        testRole.setPermissions(Set.of(testPermission));
        testRole = roleRepository.save(testRole);

        // Crear usuario admin
        Role adminRole = createTestRoleWithName("ROLE_ADMIN");
        adminRole = roleRepository.save(adminRole);

        adminUser = createTestUser();
        adminUser.setEmail("admin@u.icesi.edu.co");
        adminUser.setRoles(Set.of(adminRole));
        adminUser = userRepository.save(adminUser);

        // Generar token de admin
        adminToken = tokenProvider.generateToken(adminUser);
    }

    @Test
    void getAllRoles_AsAdmin_ShouldSucceed() throws Exception {
        mockMvc.perform(get("/api/admin/roles")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[*].name", hasItems("ROLE_ADMIN", "TEST_ROLE")));
    }

    @Test
    void getRoleById_AsAdmin_ShouldSucceed() throws Exception {
        mockMvc.perform(get("/api/admin/roles/{id}", testRole.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(testRole.getName()))
                .andExpect(jsonPath("$.permissions", hasSize(1)))
                .andExpect(jsonPath("$.permissions[0].name").value(testPermission.getName()));
    }

    @Test
    void createRole_AsAdmin_ShouldSucceed() throws Exception {
        Role newRole = createTestRoleWithName("NEW_TEST_ROLE");
        newRole.setDescription("New test role description");

        mockMvc.perform(post("/api/admin/roles")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRole)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("NEW_TEST_ROLE"))
                .andExpect(jsonPath("$.description").value("New test role description"));
    }

    @Test
    void updateRole_AsAdmin_ShouldSucceed() throws Exception {
        testRole.setDescription("Updated description");

        mockMvc.perform(put("/api/admin/roles/{id}", testRole.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRole)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated description"));
    }

    @Test
    void deleteRole_AsAdmin_ShouldSucceed() throws Exception {
        // Crear un rol que no esté asignado a ningún usuario
        Role roleToDelete = createTestRoleWithName("ROLE_TO_DELETE");
        roleToDelete = roleRepository.save(roleToDelete);

        mockMvc.perform(delete("/api/admin/roles/{id}", roleToDelete.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/roles/{id}", roleToDelete.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void addPermissionToRole_AsAdmin_ShouldSucceed() throws Exception {
        Permission newPermission = createTestPermissionWithName("NEW_PERMISSION");
        newPermission = permissionRepository.save(newPermission);

        mockMvc.perform(post("/api/admin/roles/{roleId}/permissions/{permissionId}",
                testRole.getId(), newPermission.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/roles/{id}", testRole.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.permissions[*].name", hasItem("NEW_PERMISSION")));
    }

    @Test
    void removePermissionFromRole_AsAdmin_ShouldSucceed() throws Exception {
        mockMvc.perform(delete("/api/admin/roles/{roleId}/permissions/{permissionId}",
                testRole.getId(), testPermission.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/admin/roles/{id}", testRole.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.permissions", hasSize(0)));
    }

    @Test
    void getRoleUsers_AsAdmin_ShouldSucceed() throws Exception {
        // Crear un usuario con el rol de prueba
        User userWithRole = createTestUser();
        userWithRole.setEmail("test.user@u.icesi.edu.co");
        userWithRole.setRoles(Set.of(testRole));
        userRepository.save(userWithRole);

        mockMvc.perform(get("/api/admin/roles/{id}/users", testRole.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].email").value(userWithRole.getEmail()));
    }

    @Test
    void createRole_WithDuplicateName_ShouldFail() throws Exception {
        Role duplicateRole = createTestRoleWithName(testRole.getName());

        mockMvc.perform(post("/api/admin/roles")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateRole)))
                .andExpect(status().isConflict());
    }

    @Test
    void deleteRole_WithAssignedUsers_ShouldFail() throws Exception {
        // Crear un usuario y asignarle el rol de prueba
        User userWithRole = createTestUser();
        userWithRole.setEmail("test.user@u.icesi.edu.co");
        userWithRole.setRoles(Set.of(testRole));
        userRepository.save(userWithRole);

        mockMvc.perform(delete("/api/admin/roles/{id}", testRole.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict());
    }
}