package com.example.pensamientoComputacional.integration;

import com.example.pensamientoComputacional.TestBase;
import com.example.pensamientoComputacional.model.dto.LoginRequest;
import com.example.pensamientoComputacional.model.dto.RegisterRequest;
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
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@AutoConfigureMockMvc
class AuthenticationIntegrationTest extends TestBase {

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

    private User testUser;
    private Role testRole;
    private Permission testPermission;
    private String testPassword = "testPassword123";

    @BeforeEach
    void setUp() {
        // Limpiar datos de prueba previos
        userRepository.deleteAll();
        roleRepository.deleteAll();
        permissionRepository.deleteAll();

        // Crear permiso de prueba
        testPermission = createTestPermission();
        testPermission = permissionRepository.save(testPermission);

        // Crear rol de prueba
        testRole = createTestRole();
        testRole.setPermissions(Set.of(testPermission));
        testRole = roleRepository.save(testRole);

        // Crear usuario de prueba
        testUser = createTestUser();
        testUser.setEmail("test@u.icesi.edu.co");
        testUser.setPasswordHash(passwordEncoder.encode(testPassword));
        testUser.setRoles(Set.of(testRole));
        testUser = userRepository.save(testUser);
    }

    @Test
    void register_WithValidData_ShouldSucceed() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("New User");
        request.setEmail("new.user@u.icesi.edu.co");
        request.setPassword("password123");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(request.getEmail()))
                .andExpect(jsonPath("$.name").value(request.getName()));
    }

    @Test
    void register_WithInvalidEmail_ShouldFail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("New User");
        request.setEmail("invalid@gmail.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_WithValidCredentials_ShouldReturnToken() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(testUser.getEmail());
        request.setPassword(testPassword);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String token = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(testUser.getEmail(), tokenProvider.getUserEmailFromToken(token));
    }

    @Test
    void login_WithInvalidCredentials_ShouldFail() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(testUser.getEmail());
        request.setPassword("wrongPassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getProfile_WithValidToken_ShouldReturnUserData() throws Exception {
        String token = tokenProvider.generateToken(testUser);

        mockMvc.perform(get("/api/auth/profile")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(testUser.getEmail()))
                .andExpect(jsonPath("$.name").value(testUser.getName()));
    }

    @Test
    void getProfile_WithInvalidToken_ShouldFail() throws Exception {
        mockMvc.perform(get("/api/auth/profile")
                .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void changePassword_WithValidToken_ShouldSucceed() throws Exception {
        String token = tokenProvider.generateToken(testUser);
        String newPassword = "newPassword123";

        mockMvc.perform(post("/api/auth/change-password")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "oldPassword", testPassword,
                        "newPassword", newPassword))))
                .andExpect(status().isOk());

        // Verificar que el nuevo password funciona
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(testUser.getEmail());
        loginRequest.setPassword(newPassword);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }
}