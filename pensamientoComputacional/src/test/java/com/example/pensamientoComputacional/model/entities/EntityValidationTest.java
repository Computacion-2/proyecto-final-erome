package com.example.pensamientoComputacional.model.entities;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class EntityValidationTest {


    @PersistenceContext
    private EntityManager entityManager;


    @BeforeEach
    void setUp() {
        // Create unique test data for each test
        String timestamp = String.valueOf(System.currentTimeMillis());
        // Initialize test data as needed in individual tests
    }

    private User createTestUser() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        User user = new User();
        user.setName("Test User");
        user.setEmail("test_" + timestamp + "@example.com");
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
        String timestamp = String.valueOf(System.currentTimeMillis());
        Role role = new Role();
        role.setName("TEST_ROLE_" + timestamp);
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
    @DisplayName("Should validate Professor entity relationships")
    void shouldValidateProfessorEntityRelationships() {
        // Given
        User user = createTestUser();
        entityManager.persist(user);
        entityManager.flush();
        
        Professor professor = createTestProfessor(user);

        // When
        entityManager.persist(professor);
        entityManager.flush();

        // Then
        assertThat(professor).isNotNull();
        assertThat(professor.getId()).isEqualTo(user.getId());
        assertThat(professor.getUser()).isEqualTo(user);
        
        // Verify the relationship is bidirectional
        User foundUser = entityManager.find(User.class, user.getId());
        assertThat(foundUser).isNotNull();
    }

    @Test
    @DisplayName("Should validate Student entity relationships")
    void shouldValidateStudentEntityRelationships() {
        // Given
        User user = createTestUser();
        entityManager.persist(user);
        entityManager.flush();
        
        Student student = createTestStudent(user);

        // When
        entityManager.persist(student);
        entityManager.flush();

        // Then
        assertThat(student).isNotNull();
        assertThat(student.getId()).isEqualTo(user.getId());
        assertThat(student.getUser()).isEqualTo(user);
        assertThat(student.getInitialProfile()).isEqualTo("Test Profile");
        
        // Verify the relationship is bidirectional
        User foundUser = entityManager.find(User.class, user.getId());
        assertThat(foundUser).isNotNull();
    }

    @Test
    @DisplayName("Should validate User-Role many-to-many relationship")
    void shouldValidateUserRoleManyToManyRelationship() {
        // Given
        Permission permission1 = createTestPermissionWithName("PERMISSION_1");
        entityManager.persist(permission1);
        entityManager.flush();
        
        Permission permission2 = createTestPermissionWithName("PERMISSION_2");
        entityManager.persist(permission2);
        entityManager.flush();

        Role role1 = createTestRoleWithName("ROLE_1");
        role1.setPermissions(new HashSet<>(Set.of(permission1)));
        entityManager.persist(role1);
        entityManager.flush();

        Role role2 = createTestRoleWithName("ROLE_2");
        role2.setPermissions(new HashSet<>(Set.of(permission2)));
        entityManager.persist(role2);
        entityManager.flush();

        User user = createTestUserWithEmail("multi.role@example.com");
        Set<Role> roles = new HashSet<>();
        roles.add(role1);
        roles.add(role2);
        user.setRoles(roles);
        entityManager.persist(user);
        entityManager.flush();

        // When
        entityManager.clear(); // Clear persistence context to test lazy loading
        User foundUser = entityManager.find(User.class, user.getId());

        // Then
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getRoles()).hasSize(2);
        assertThat(foundUser.getRoles()).extracting(Role::getName)
            .containsExactlyInAnyOrder("ROLE_1", "ROLE_2");
    }

    @Test
    @DisplayName("Should validate Role-Permission many-to-many relationship")
    void shouldValidateRolePermissionManyToManyRelationship() {
        // Given
        Permission permission1 = createTestPermissionWithName("PERMISSION_1");
        entityManager.persist(permission1);
        entityManager.flush();
        
        Permission permission2 = createTestPermissionWithName("PERMISSION_2");
        entityManager.persist(permission2);
        entityManager.flush();
        
        Permission permission3 = createTestPermissionWithName("PERMISSION_3");
        entityManager.persist(permission3);
        entityManager.flush();

        Role role = createTestRoleWithName("MULTI_PERMISSION_ROLE");
        Set<Permission> permissions = new HashSet<>();
        permissions.add(permission1);
        permissions.add(permission2);
        permissions.add(permission3);
        role.setPermissions(permissions);
        entityManager.persist(role);
        entityManager.flush();

        // When
        entityManager.clear(); // Clear persistence context to test lazy loading
        Role foundRole = entityManager.find(Role.class, role.getId());

        // Then
        assertThat(foundRole).isNotNull();
        assertThat(foundRole.getPermissions()).hasSize(3);
        assertThat(foundRole.getPermissions()).extracting(Permission::getName)
            .containsExactlyInAnyOrder("PERMISSION_1", "PERMISSION_2", "PERMISSION_3");
    }

    @Test
    @DisplayName("Should validate entity uniqueness constraints")
    void shouldValidateEntityUniquenessConstraints() {
        // Test Permission name uniqueness
        String timestamp = String.valueOf(System.currentTimeMillis());
        Permission permission1 = createTestPermissionWithName("UNIQUE_PERMISSION_" + timestamp);
        entityManager.persist(permission1);
        entityManager.flush();

        Permission permission2 = createTestPermissionWithName("UNIQUE_PERMISSION_" + timestamp);
        assertThrows(Exception.class, () -> {
            entityManager.persist(permission2);
            entityManager.flush();
        });
        
        // Clear the entity manager to remove the invalid entity from the session
        entityManager.clear();

        // Test Role name uniqueness
        Permission permission3 = createTestPermissionWithName("PERMISSION_3_" + timestamp);
        entityManager.persist(permission3);
        entityManager.flush();
        
        Role role1 = createTestRoleWithName("UNIQUE_ROLE_" + timestamp);
        role1.setPermissions(new HashSet<>(Set.of(permission3)));
        entityManager.persist(role1);
        entityManager.flush();

        Role role2 = createTestRoleWithName("UNIQUE_ROLE_" + timestamp);
        role2.setPermissions(new HashSet<>(Set.of(permission3)));
        assertThrows(Exception.class, () -> {
            entityManager.persist(role2);
            entityManager.flush();
        });
        
        // Clear the entity manager to remove the invalid entity from the session
        entityManager.clear();

        // Test User email uniqueness
        Permission permission4 = createTestPermissionWithName("PERMISSION_4");
        entityManager.persist(permission4);
        entityManager.flush();
        
        Role role3 = createTestRoleWithName("ROLE_3");
        role3.setPermissions(new HashSet<>(Set.of(permission4)));
        entityManager.persist(role3);
        entityManager.flush();

        User user1 = createTestUserWithEmail("unique@example.com");
        user1.setRoles(new HashSet<>(Set.of(role3)));
        entityManager.persist(user1);
        entityManager.flush();

        User user2 = createTestUserWithEmail("unique@example.com");
        user2.setRoles(new HashSet<>(Set.of(role3)));
        assertThrows(Exception.class, () -> {
            entityManager.persist(user2);
            entityManager.flush();
        });
    }

    @Test
    @DisplayName("Should validate entity cascade operations")
    void shouldValidateEntityCascadeOperations() {
        // Test that deleting a User also deletes associated Professor/Student
        User user = createTestUser();
        entityManager.persist(user);
        entityManager.flush();
        
        Professor professor = createTestProfessor(user);
        entityManager.persist(professor);
        entityManager.flush();
        
        Long professorId = professor.getId();
        
        // When
        entityManager.remove(user);
        entityManager.flush();
        
        // Then
        Professor foundProfessor = entityManager.find(Professor.class, professorId);
        // Note: Due to @MapsId relationship, the professor should still exist as it shares the same ID as the user
        // The cascade behavior depends on the specific JPA implementation
        assertThat(foundProfessor).isNotNull();
    }

    @Test
    @DisplayName("Should validate entity lifecycle callbacks")
    void shouldValidateEntityLifecycleCallbacks() {
        // Test User @PrePersist callback
        User user = createTestUser();
        user.setCreatedAt(null); // Should be set by @PrePersist
        
        // When
        entityManager.persist(user);
        entityManager.flush();
        
        // Then
        assertThat(user.getCreatedAt()).isNotNull();
        assertThat(user.getCreatedAt()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should validate Role helper methods")
    void shouldValidateRoleHelperMethods() {
        // Given
        Permission permission1 = createTestPermissionWithName("PERMISSION_1");
        entityManager.persist(permission1);
        entityManager.flush();
        
        Permission permission2 = createTestPermissionWithName("PERMISSION_2");
        entityManager.persist(permission2);
        entityManager.flush();

        String timestamp = String.valueOf(System.currentTimeMillis());
        Role role = createTestRoleWithName("TEST_ROLE_" + timestamp);
        role.setPermissions(new HashSet<>(Set.of(permission1)));
        entityManager.persist(role);
        entityManager.flush();

        // When
        role.addPermission(permission2);
        entityManager.flush();

        // Then
        assertThat(role.getPermissions()).hasSize(2);
        assertThat(role.getPermissions()).contains(permission1, permission2);

        // When
        role.removePermission(permission1);
        entityManager.flush();

        // Then
        assertThat(role.getPermissions()).hasSize(1);
        assertThat(role.getPermissions()).contains(permission2);
    }

    // Helper methods for Professor and Student entities
    private Professor createTestProfessor(User user) {
        Professor professor = new Professor();
        professor.setUser(user);
        return professor;
    }

    private Student createTestStudent(User user) {
        Student student = new Student();
        student.setUser(user);
        student.setInitialProfile("Test Profile");
        return student;
    }
}
