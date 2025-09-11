package com.example.pensamientoComputacional.service;

import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.repository.PermissionRepository;
import com.example.pensamientoComputacional.repository.RoleRepository;
import com.example.pensamientoComputacional.repository.UserRepository;
import com.example.pensamientoComputacional.service.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Import(com.example.pensamientoComputacional.service.impl.UserServiceImpl.class)
@ActiveProfiles("test")
class UserServiceTest {

    @Autowired
    private IUserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private TestEntityManager entityManager;

    @PersistenceContext
    private EntityManager em;

    private User testUser;
    private Role testRole;
    private Permission testPermission;

    @BeforeEach
    void setUp() {
        // Create permission
        testPermission = createTestPermission();
        testPermission = permissionRepository.save(testPermission);
        
        // Create role with permission
        testRole = createTestRole();
        Set<Permission> permissions = new HashSet<>();
        permissions.add(testPermission);
        testRole.setPermissions(permissions);
        testRole = roleRepository.save(testRole);
        
        // Create user with role
        testUser = createTestUser();
        Set<Role> roles = new HashSet<>();
        roles.add(testRole);
        testUser.setRoles(roles);
    }

    private Permission createTestPermission() {
        Permission permission = new Permission();
        permission.setName("TEST_PERMISSION");
        permission.setDescription("Test Permission Description");
        return permission;
    }

    private Permission createTestPermissionWithName(String name) {
        Permission permission = createTestPermission();
        permission.setName(name);
        return permission;
    }

    private Role createTestRole() {
        Role role = new Role();
        role.setName("TEST_ROLE");
        role.setDescription("Test Role Description");
        return role;
    }

    private Role createTestRoleWithName(String name) {
        Role role = createTestRole();
        role.setName(name);
        return role;
    }

    private User createTestUser() {
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword123");
        user.setPhotoUrl("https://example.com/photo.jpg");
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    private User createTestUserWithEmail(String email) {
        User user = createTestUser();
        user.setEmail(email);
        return user;
    }

    @Test
    @DisplayName("Should create user successfully")
    void shouldCreateUserSuccessfully() {
        // When
        User savedUser = userService.createUser(testUser);

        // Then
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getName()).isEqualTo("Test User");
        assertThat(savedUser.getEmail()).isEqualTo("test@example.com");
        assertThat(savedUser.getRoles()).hasSize(1);
        assertThat(savedUser.getRoles()).contains(testRole);
        
        // Verify it was saved in database
        Optional<User> foundUser = userRepository.findById(savedUser.getId());
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("Should throw BusinessException when creating user with duplicate email")
    void shouldThrowBusinessExceptionWhenCreatingUserWithDuplicateEmail() {
        // Given
        userService.createUser(testUser);
        
        User duplicateUser = createTestUserWithEmail("test@example.com");
        duplicateUser.setRoles(testUser.getRoles());

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.createUser(duplicateUser));
        
        assertThat(exception.getMessage()).contains("User with email test@example.com already exists");
    }

    @Test
    @DisplayName("Should throw BusinessException when creating user without roles")
    void shouldThrowBusinessExceptionWhenCreatingUserWithoutRoles() {
        // Given
        User userWithoutRoles = createTestUser();
        userWithoutRoles.setRoles(new HashSet<>());

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.createUser(userWithoutRoles));
        
        assertThat(exception.getMessage()).contains("User must have at least one role");
    }

    @Test
    @DisplayName("Should throw BusinessException when creating user with non-existent role")
    void shouldThrowBusinessExceptionWhenCreatingUserWithNonExistentRole() {
        // Given
        User userWithNonExistentRole = createTestUser();
        Set<Role> nonExistentRoles = new HashSet<>();
        Role nonExistentRole = createTestRoleWithName("NON_EXISTENT");
        nonExistentRole.setId(999L);
        nonExistentRoles.add(nonExistentRole);
        userWithNonExistentRole.setRoles(nonExistentRoles);

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.createUser(userWithNonExistentRole));
        
        assertThat(exception.getMessage()).contains("Role not found with id: 999");
    }

    @Test
    @DisplayName("Should throw BusinessException when creating user with role without permissions")
    void shouldThrowBusinessExceptionWhenCreatingUserWithRoleWithoutPermissions() {
        // Given
        // Create a role with permissions first, then remove them using direct SQL
        Role roleWithoutPermissions = createTestRoleWithName("ROLE_WITHOUT_PERMISSIONS");
        roleWithoutPermissions.setPermissions(new HashSet<>(Set.of(testPermission)));
        roleWithoutPermissions = roleRepository.save(roleWithoutPermissions);
        
        // Remove permissions using direct SQL to bypass validation
        em.createNativeQuery("DELETE FROM role_permissions WHERE role_id = ?")
                .setParameter(1, roleWithoutPermissions.getId())
                .executeUpdate();
        em.flush();
        em.clear();
        
        User userWithRoleWithoutPermissions = createTestUser();
        Set<Role> roles = new HashSet<>();
        roles.add(roleWithoutPermissions);
        userWithRoleWithoutPermissions.setRoles(roles);

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.createUser(userWithRoleWithoutPermissions));
        
        assertThat(exception.getMessage()).contains("Role ROLE_WITHOUT_PERMISSIONS must have at least one permission");
    }

    @Test
    @DisplayName("Should update user successfully")
    void shouldUpdateUserSuccessfully() {
        // Given
        User savedUser = userService.createUser(testUser);
        
        Permission newPermission = permissionRepository.save(createTestPermissionWithName("NEW_PERMISSION"));
        Role newRole = createTestRoleWithName("NEW_ROLE");
        Set<Permission> newPermissions = new HashSet<>();
        newPermissions.add(newPermission);
        newRole.setPermissions(newPermissions);
        newRole = roleRepository.save(newRole);
        
        User updatedUser = createTestUserWithEmail("updated@example.com");
        updatedUser.setName("Updated User");
        updatedUser.setPhotoUrl("https://example.com/updated-photo.jpg");
        updatedUser.setIsActive(false);
        Set<Role> updatedRoles = new HashSet<>();
        updatedRoles.add(testRole);
        updatedRoles.add(newRole);
        updatedUser.setRoles(updatedRoles);

        // When
        User result = userService.updateUser(savedUser.getId(), updatedUser);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(savedUser.getId());
        assertThat(result.getName()).isEqualTo("Updated User");
        assertThat(result.getEmail()).isEqualTo("updated@example.com");
        assertThat(result.getPhotoUrl()).isEqualTo("https://example.com/updated-photo.jpg");
        assertThat(result.getIsActive()).isFalse();
        assertThat(result.getRoles()).hasSize(2);
        
        // Verify in database
        Optional<User> foundUser = userRepository.findById(savedUser.getId());
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getName()).isEqualTo("Updated User");
    }

    @Test
    @DisplayName("Should throw BusinessException when updating non-existent user")
    void shouldThrowBusinessExceptionWhenUpdatingNonExistentUser() {
        // Given
        User updatedUser = createTestUserWithEmail("updated@example.com");
        updatedUser.setRoles(testUser.getRoles());
        Long nonExistentId = 999L;

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.updateUser(nonExistentId, updatedUser));
        
        assertThat(exception.getMessage()).contains("User not found with id: 999");
    }

    @Test
    @DisplayName("Should allow updating user with same email")
    void shouldAllowUpdatingUserWithSameEmail() {
        // Given
        User savedUser = userService.createUser(testUser);
        
        User updatedUser = createTestUserWithEmail("test@example.com"); // Same email
        updatedUser.setName("Updated Name");
        updatedUser.setRoles(testUser.getRoles());

        // When
        User result = userService.updateUser(savedUser.getId(), updatedUser);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Updated Name");
        assertThat(result.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("Should delete user successfully")
    void shouldDeleteUserSuccessfully() {
        // Given
        User savedUser = userService.createUser(testUser);
        Long userId = savedUser.getId();

        // When
        userService.deleteUser(userId);

        // Then
        Optional<User> foundUser = userRepository.findById(userId);
        assertThat(foundUser).isEmpty();
    }

    @Test
    @DisplayName("Should throw BusinessException when deleting non-existent user")
    void shouldThrowBusinessExceptionWhenDeletingNonExistentUser() {
        // Given
        Long nonExistentId = 999L;

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.deleteUser(nonExistentId));
        
        assertThat(exception.getMessage()).contains("User not found with id: 999");
    }

    @Test
    @DisplayName("Should get user by id successfully")
    void shouldGetUserByIdSuccessfully() {
        // Given
        User savedUser = userService.createUser(testUser);
        Long userId = savedUser.getId();

        // When
        User foundUser = userService.getUser(userId);

        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getId()).isEqualTo(userId);
        assertThat(foundUser.getName()).isEqualTo("Test User");
        assertThat(foundUser.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("Should get all users successfully")
    void shouldGetAllUsersSuccessfully() {
        // Given
        Permission permission2 = permissionRepository.save(createTestPermissionWithName("PERMISSION_2"));
        Permission permission3 = permissionRepository.save(createTestPermissionWithName("PERMISSION_3"));
        
        Role role2 = createTestRoleWithName("ROLE_2");
        Set<Permission> permissions2 = new HashSet<>();
        permissions2.add(permission2);
        role2.setPermissions(permissions2);
        role2 = roleRepository.save(role2);
        
        Role role3 = createTestRoleWithName("ROLE_3");
        Set<Permission> permissions3 = new HashSet<>();
        permissions3.add(permission3);
        role3.setPermissions(permissions3);
        role3 = roleRepository.save(role3);
        
        User user1 = userService.createUser(testUser);
        
        User user2 = createTestUserWithEmail("user2@example.com");
        Set<Role> roles2 = new HashSet<>();
        roles2.add(role2);
        user2.setRoles(roles2);
        user2 = userService.createUser(user2);
        
        User user3 = createTestUserWithEmail("user3@example.com");
        Set<Role> roles3 = new HashSet<>();
        roles3.add(role3);
        user3.setRoles(roles3);
        user3 = userService.createUser(user3);

        // When
        List<User> allUsers = userService.getAllUsers();

        // Then
        assertThat(allUsers).hasSize(3);
        assertThat(allUsers).extracting(User::getEmail)
            .containsExactlyInAnyOrder("test@example.com", "user2@example.com", "user3@example.com");
    }

    @Test
    @DisplayName("Should find user by email successfully")
    void shouldFindUserByEmailSuccessfully() {
        // Given
        User savedUser = userService.createUser(testUser);
        String userEmail = savedUser.getEmail();

        // When
        User foundUser = userService.findByEmail(userEmail);

        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getEmail()).isEqualTo(userEmail);
        assertThat(foundUser.getId()).isEqualTo(savedUser.getId());
    }

    @Test
    @DisplayName("Should throw BusinessException when finding user by non-existent email")
    void shouldThrowBusinessExceptionWhenFindingUserByNonExistentEmail() {
        // Given
        String nonExistentEmail = "nonexistent@example.com";

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.findByEmail(nonExistentEmail));
        
        assertThat(exception.getMessage()).contains("User not found with email: nonexistent@example.com");
    }

    @Test
    @DisplayName("Should handle case-sensitive email addresses")
    void shouldHandleCaseSensitiveEmailAddresses() {
        // Given
        User savedUser = userService.createUser(testUser);

        // When
        User foundUser = userService.findByEmail("test@example.com");

        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getEmail()).isEqualTo("test@example.com");
        
        // Verify case sensitivity
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.findByEmail("TEST@EXAMPLE.COM"));
        
        assertThat(exception.getMessage()).contains("User not found with email: TEST@EXAMPLE.COM");
    }

    @Test
    @DisplayName("Should validate user roles and permissions on update")
    void shouldValidateUserRolesAndPermissionsOnUpdate() {
        // Given
        User savedUser = userService.createUser(testUser);
        
        // Create a role with permissions first, then remove them using direct SQL
        Role roleWithoutPermissions = createTestRoleWithName("ROLE_WITHOUT_PERMISSIONS");
        roleWithoutPermissions.setPermissions(new HashSet<>(Set.of(testPermission)));
        roleWithoutPermissions = roleRepository.save(roleWithoutPermissions);
        
        // Remove permissions using direct SQL to bypass validation
        em.createNativeQuery("DELETE FROM role_permissions WHERE role_id = ?")
                .setParameter(1, roleWithoutPermissions.getId())
                .executeUpdate();
        em.flush();
        em.clear();
        
        User updatedUser = createTestUserWithEmail("test@example.com");
        Set<Role> invalidRoles = new HashSet<>();
        invalidRoles.add(roleWithoutPermissions);
        updatedUser.setRoles(invalidRoles);

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.updateUser(savedUser.getId(), updatedUser));
        
        assertThat(exception.getMessage()).contains("Role ROLE_WITHOUT_PERMISSIONS must have at least one permission");
    }
}
