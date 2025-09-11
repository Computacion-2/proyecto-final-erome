package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    private User testUser;
    private Role testRole;
    private Permission testPermission;

    @BeforeEach
    void setUp() {
        testPermission = createTestPermission();
        testPermission = entityManager.persistAndFlush(testPermission);
        
        testRole = createTestRole();
        Set<Permission> permissions = new HashSet<>();
        permissions.add(testPermission);
        testRole.setPermissions(permissions);
        testRole = entityManager.persistAndFlush(testRole);
        
        testUser = createTestUser();
        Set<Role> roles = new HashSet<>();
        roles.add(testRole);
        testUser.setRoles(roles);
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

    @Test
    @DisplayName("Should save user successfully")
    void shouldSaveUserSuccessfully() {
        // When
        User savedUser = userRepository.save(testUser);

        // Then
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getName()).isEqualTo("Test User");
        assertThat(savedUser.getEmail()).isEqualTo("test@example.com");
        assertThat(savedUser.getRoles()).hasSize(1);
        assertThat(savedUser.getRoles()).contains(testRole);
    }

    @Test
    @DisplayName("Should find user by id successfully")
    void shouldFindUserByIdSuccessfully() {
        // Given
        User savedUser = userRepository.save(testUser);
        Long userId = savedUser.getId();

        // When
        Optional<User> foundUser = userRepository.findById(userId);

        // Then
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getName()).isEqualTo("Test User");
        assertThat(foundUser.get().getId()).isEqualTo(userId);
        assertThat(foundUser.get().getRoles()).hasSize(1);
    }

    @Test
    @DisplayName("Should return empty when finding non-existent user by id")
    void shouldReturnEmptyWhenFindingNonExistentUserById() {
        // Given
        Long nonExistentId = 999L;

        // When
        Optional<User> foundUser = userRepository.findById(nonExistentId);

        // Then
        assertThat(foundUser).isEmpty();
    }

    @Test
    @DisplayName("Should find user by email successfully")
    void shouldFindUserByEmailSuccessfully() {
        // Given
        User savedUser = userRepository.save(testUser);
        String userEmail = savedUser.getEmail();

        // When
        Optional<User> foundUser = userRepository.findByEmail(userEmail);

        // Then
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getEmail()).isEqualTo(userEmail);
        assertThat(foundUser.get().getId()).isEqualTo(savedUser.getId());
    }

    @Test
    @DisplayName("Should return empty when finding non-existent user by email")
    void shouldReturnEmptyWhenFindingNonExistentUserByEmail() {
        // Given
        String nonExistentEmail = "nonexistent@example.com";

        // When
        Optional<User> foundUser = userRepository.findByEmail(nonExistentEmail);

        // Then
        assertThat(foundUser).isEmpty();
    }

    @Test
    @DisplayName("Should check if user exists by email")
    void shouldCheckIfUserExistsByEmail() {
        // Given
        User savedUser = userRepository.save(testUser);

        // When
        boolean exists = userRepository.existsByEmail(savedUser.getEmail());
        boolean notExists = userRepository.existsByEmail("nonexistent@example.com");

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should find users by name containing ignore case")
    void shouldFindUsersByNameContainingIgnoreCase() {
        // Given
        Permission permission1 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_2"));
        
        Role role1 = createTestRoleWithName("ROLE_1");
        role1.setPermissions(new HashSet<>(Set.of(permission1)));
        role1 = entityManager.persistAndFlush(role1);
        
        Role role2 = createTestRoleWithName("ROLE_2");
        role2.setPermissions(new HashSet<>(Set.of(permission2)));
        role2 = entityManager.persistAndFlush(role2);
        
        User user1 = createTestUserWithEmail("john.doe@example.com");
        user1.setName("John Doe");
        user1.setRoles(new HashSet<>(Set.of(role1)));
        user1 = userRepository.save(user1);
        
        User user2 = createTestUserWithEmail("jane.smith@example.com");
        user2.setName("Jane Smith");
        user2.setRoles(new HashSet<>(Set.of(role2)));
        user2 = userRepository.save(user2);
        
        User user3 = createTestUserWithEmail("johnny.walker@example.com");
        user3.setName("Johnny Walker");
        user3.setRoles(new HashSet<>(Set.of(role1)));
        user3 = userRepository.save(user3);

        // When
        List<User> johnUsers = userRepository.findByNameContainingIgnoreCase("john");
        List<User> smithUsers = userRepository.findByNameContainingIgnoreCase("smith");

        // Then
        assertThat(johnUsers).hasSize(2);
        assertThat(johnUsers).extracting(User::getName)
            .containsExactlyInAnyOrder("John Doe", "Johnny Walker");
        
        assertThat(smithUsers).hasSize(1);
        assertThat(smithUsers.get(0).getName()).isEqualTo("Jane Smith");
    }

    @Test
    @DisplayName("Should find users by role id")
    void shouldFindUsersByRoleId() {
        // Given
        Permission permission1 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_2"));

        Role role1 = createTestRoleWithName("ADMIN_ROLE");
        role1.setPermissions(new HashSet<>(Set.of(permission1)));
        role1 = entityManager.persistAndFlush(role1);

        Role role2 = createTestRoleWithName("USER_ROLE");
        role2.setPermissions(new HashSet<>(Set.of(permission2)));
        role2 = entityManager.persistAndFlush(role2);

        User user1 = createTestUserWithEmail("admin@example.com");
        user1.setName("Admin User");
        user1.setRoles(new HashSet<>(Set.of(role1)));
        user1 = userRepository.save(user1);

        User user2 = createTestUserWithEmail("user1@example.com");
        user2.setName("Regular User 1");
        user2.setRoles(new HashSet<>(Set.of(role2)));
        user2 = userRepository.save(user2);

        User user3 = createTestUserWithEmail("user2@example.com");
        user3.setName("Regular User 2");
        user3.setRoles(new HashSet<>(Set.of(role2)));
        user3 = userRepository.save(user3);

        // When
        List<User> adminUsers = userRepository.findByRoleId(role1.getId());
        List<User> regularUsers = userRepository.findByRoleId(role2.getId());

        // Then
        assertThat(adminUsers).hasSize(1);
        assertThat(adminUsers.get(0).getName()).isEqualTo("Admin User");
        
        assertThat(regularUsers).hasSize(2);
        assertThat(regularUsers).extracting(User::getName)
            .containsExactlyInAnyOrder("Regular User 1", "Regular User 2");
    }

    @Test
    @DisplayName("Should find users without roles")
    void shouldFindUsersWithoutRoles() {
        // Given
        User userWithRoles = createTestUserWithEmail("user.with.roles@example.com");
        userWithRoles.setRoles(new HashSet<>(Set.of(testRole)));
        userWithRoles = userRepository.save(userWithRoles);

        User userWithoutRoles = createTestUserWithEmail("user.without.roles@example.com");
        userWithoutRoles.setRoles(new HashSet<>());
        userWithoutRoles = userRepository.save(userWithoutRoles);

        // When
        List<User> usersWithoutRoles = userRepository.findUsersWithoutRoles();

        // Then
        assertThat(usersWithoutRoles).hasSize(1);
        assertThat(usersWithoutRoles.get(0).getEmail()).isEqualTo("user.without.roles@example.com");
    }

    @Test
    @DisplayName("Should find all active users")
    void shouldFindAllActiveUsers() {
        // Given
        User activeUser1 = createTestUserWithEmail("active1@example.com");
        activeUser1.setIsActive(true);
        activeUser1.setRoles(new HashSet<>(Set.of(testRole)));
        activeUser1 = userRepository.save(activeUser1);

        User activeUser2 = createTestUserWithEmail("active2@example.com");
        activeUser2.setIsActive(true);
        activeUser2.setRoles(new HashSet<>(Set.of(testRole)));
        activeUser2 = userRepository.save(activeUser2);

        User inactiveUser = createTestUserWithEmail("inactive@example.com");
        inactiveUser.setIsActive(false);
        inactiveUser.setRoles(new HashSet<>(Set.of(testRole)));
        inactiveUser = userRepository.save(inactiveUser);

        // When
        List<User> activeUsers = userRepository.findAllActiveUsers();

        // Then
        assertThat(activeUsers).hasSize(2);
        assertThat(activeUsers).extracting(User::getEmail)
            .containsExactlyInAnyOrder("active1@example.com", "active2@example.com");
    }

    @Test
    @DisplayName("Should return empty list when finding users by non-existent role id")
    void shouldReturnEmptyListWhenFindingUsersByNonExistentRoleId() {
        // Given
        Long nonExistentRoleId = 999L;

        // When
        List<User> users = userRepository.findByRoleId(nonExistentRoleId);

        // Then
        assertThat(users).isEmpty();
    }

    @Test
    @DisplayName("Should get all users")
    void shouldGetAllUsers() {
        // Given
        Permission permission1 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_2"));
        
        Role role1 = createTestRoleWithName("ROLE_1");
        role1.setPermissions(new HashSet<>(Set.of(permission1)));
        role1 = entityManager.persistAndFlush(role1);
        
        Role role2 = createTestRoleWithName("ROLE_2");
        role2.setPermissions(new HashSet<>(Set.of(permission2)));
        role2 = entityManager.persistAndFlush(role2);
        
        User user1 = createTestUserWithEmail("user1@example.com");
        user1.setRoles(new HashSet<>(Set.of(role1)));
        user1 = userRepository.save(user1);
        
        User user2 = createTestUserWithEmail("user2@example.com");
        user2.setRoles(new HashSet<>(Set.of(role2)));
        user2 = userRepository.save(user2);
        
        User user3 = createTestUserWithEmail("user3@example.com");
        user3.setRoles(new HashSet<>(Set.of(role1)));
        user3 = userRepository.save(user3);

        // When
        List<User> allUsers = userRepository.findAll();

        // Then
        assertThat(allUsers).hasSize(3);
        assertThat(allUsers).extracting(User::getEmail)
            .containsExactlyInAnyOrder("user1@example.com", "user2@example.com", "user3@example.com");
    }

    @Test
    @DisplayName("Should update user successfully")
    void shouldUpdateUserSuccessfully() {
        // Given
        User savedUser = userRepository.save(testUser);
        Long userId = savedUser.getId();

        // When
        savedUser.setName("Updated User");
        savedUser.setEmail("updated@example.com");
        savedUser.setPhotoUrl("https://example.com/updated-photo.jpg");
        savedUser.setIsActive(false);
        User updatedUser = userRepository.save(savedUser);

        // Then
        assertThat(updatedUser.getId()).isEqualTo(userId);
        assertThat(updatedUser.getName()).isEqualTo("Updated User");
        assertThat(updatedUser.getEmail()).isEqualTo("updated@example.com");
        assertThat(updatedUser.getPhotoUrl()).isEqualTo("https://example.com/updated-photo.jpg");
        assertThat(updatedUser.getIsActive()).isFalse();
        
        // Verify in database
        Optional<User> foundUser = userRepository.findById(userId);
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getName()).isEqualTo("Updated User");
    }

    @Test
    @DisplayName("Should delete user successfully")
    void shouldDeleteUserSuccessfully() {
        // Given
        User savedUser = userRepository.save(testUser);
        Long userId = savedUser.getId();

        // When
        userRepository.delete(savedUser);

        // Then
        Optional<User> foundUser = userRepository.findById(userId);
        assertThat(foundUser).isEmpty();
    }

    @Test
    @DisplayName("Should delete user by id successfully")
    void shouldDeleteUserByIdSuccessfully() {
        // Given
        User savedUser = userRepository.save(testUser);
        Long userId = savedUser.getId();

        // When
        userRepository.deleteById(userId);

        // Then
        Optional<User> foundUser = userRepository.findById(userId);
        assertThat(foundUser).isEmpty();
    }

    @Test
    @DisplayName("Should count users")
    void shouldCountUsers() {
        // Given
        Permission permission1 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_2"));
        
        Role role1 = createTestRoleWithName("ROLE_1");
        role1.setPermissions(new HashSet<>(Set.of(permission1)));
        role1 = entityManager.persistAndFlush(role1);
        
        Role role2 = createTestRoleWithName("ROLE_2");
        role2.setPermissions(new HashSet<>(Set.of(permission2)));
        role2 = entityManager.persistAndFlush(role2);
        
        User user1 = createTestUserWithEmail("user1@example.com");
        user1.setRoles(new HashSet<>(Set.of(role1)));
        userRepository.save(user1);
        
        User user2 = createTestUserWithEmail("user2@example.com");
        user2.setRoles(new HashSet<>(Set.of(role2)));
        userRepository.save(user2);
        
        User user3 = createTestUserWithEmail("user3@example.com");
        user3.setRoles(new HashSet<>(Set.of(role1)));
        userRepository.save(user3);

        // When
        long count = userRepository.count();

        // Then
        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("Should check if user exists by id")
    void shouldCheckIfUserExistsById() {
        // Given
        User savedUser = userRepository.save(testUser);

        // When
        boolean exists = userRepository.existsById(savedUser.getId());
        boolean notExists = userRepository.existsById(999L);

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should handle user-role relationships correctly")
    void shouldHandleUserRoleRelationshipsCorrectly() {
        // Given
        Permission permission1 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_2"));

        Role role1 = createTestRoleWithName("ROLE_1");
        role1.setPermissions(new HashSet<>(Set.of(permission1)));
        role1 = entityManager.persistAndFlush(role1);

        Role role2 = createTestRoleWithName("ROLE_2");
        role2.setPermissions(new HashSet<>(Set.of(permission2)));
        role2 = entityManager.persistAndFlush(role2);

        User user = createTestUserWithEmail("multi.role@example.com");
        Set<Role> roles = new HashSet<>();
        roles.add(role1);
        roles.add(role2);
        user.setRoles(roles);
        user = userRepository.save(user);

        // When
        Optional<User> foundUser = userRepository.findById(user.getId());

        // Then
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getRoles()).hasSize(2);
        assertThat(foundUser.get().getRoles()).contains(role1, role2);
    }
}
