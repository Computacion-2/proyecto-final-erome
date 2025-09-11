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

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class RoleRepositoryTest {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TestEntityManager entityManager;

    @PersistenceContext
    private EntityManager em;

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
    @DisplayName("Should save role successfully")
    void shouldSaveRoleSuccessfully() {
        // When
        Role savedRole = roleRepository.save(testRole);

        // Then
        assertThat(savedRole).isNotNull();
        assertThat(savedRole.getId()).isNotNull();
        assertThat(savedRole.getName()).isEqualTo("TEST_ROLE");
        assertThat(savedRole.getDescription()).isEqualTo("Test Role Description");
        assertThat(savedRole.getPermissions()).hasSize(1);
        assertThat(savedRole.getPermissions()).contains(testPermission);
    }

    @Test
    @DisplayName("Should find role by id successfully")
    void shouldFindRoleByIdSuccessfully() {
        // Given
        Role savedRole = roleRepository.save(testRole);
        Long roleId = savedRole.getId();

        // When
        Optional<Role> foundRole = roleRepository.findById(roleId);

        // Then
        assertThat(foundRole).isPresent();
        assertThat(foundRole.get().getName()).isEqualTo("TEST_ROLE");
        assertThat(foundRole.get().getId()).isEqualTo(roleId);
        assertThat(foundRole.get().getPermissions()).hasSize(1);
    }

    @Test
    @DisplayName("Should return empty when finding non-existent role by id")
    void shouldReturnEmptyWhenFindingNonExistentRoleById() {
        // Given
        Long nonExistentId = 999L;

        // When
        Optional<Role> foundRole = roleRepository.findById(nonExistentId);

        // Then
        assertThat(foundRole).isEmpty();
    }

    @Test
    @DisplayName("Should find role by name successfully")
    void shouldFindRoleByNameSuccessfully() {
        // Given
        Role savedRole = roleRepository.save(testRole);
        String roleName = savedRole.getName();

        // When
        Optional<Role> foundRole = roleRepository.findByName(roleName);

        // Then
        assertThat(foundRole).isPresent();
        assertThat(foundRole.get().getName()).isEqualTo(roleName);
        assertThat(foundRole.get().getId()).isEqualTo(savedRole.getId());
    }

    @Test
    @DisplayName("Should return empty when finding non-existent role by name")
    void shouldReturnEmptyWhenFindingNonExistentRoleByName() {
        // Given
        String nonExistentName = "NON_EXISTENT_ROLE";

        // When
        Optional<Role> foundRole = roleRepository.findByName(nonExistentName);

        // Then
        assertThat(foundRole).isEmpty();
    }

    @Test
    @DisplayName("Should check if role exists by name")
    void shouldCheckIfRoleExistsByName() {
        // Given
        Role savedRole = roleRepository.save(testRole);

        // When
        boolean exists = roleRepository.existsByName(savedRole.getName());
        boolean notExists = roleRepository.existsByName("NON_EXISTENT");

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should find roles by name containing ignore case")
    void shouldFindRolesByNameContainingIgnoreCase() {
        // Given
        Permission permission1 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_2"));
        
        Role role1 = createTestRoleWithName("ADMIN_ROLE");
        Set<Permission> permissions1 = new HashSet<>();
        permissions1.add(permission1);
        role1.setPermissions(permissions1);
        role1 = roleRepository.save(role1);
        
        Role role2 = createTestRoleWithName("USER_ROLE");
        Set<Permission> permissions2 = new HashSet<>();
        permissions2.add(permission2);
        role2.setPermissions(permissions2);
        role2 = roleRepository.save(role2);
        
        Role role3 = createTestRoleWithName("MANAGER_ROLE");
        Set<Permission> permissions3 = new HashSet<>();
        permissions3.add(permission1);
        role3.setPermissions(permissions3);
        role3 = roleRepository.save(role3);

        // When
        List<Role> adminRoles = roleRepository.findByNameContainingIgnoreCase("admin");
        List<Role> userRoles = roleRepository.findByNameContainingIgnoreCase("user");

        // Then
        assertThat(adminRoles).hasSize(1);
        assertThat(adminRoles.get(0).getName()).isEqualTo("ADMIN_ROLE");
        
        assertThat(userRoles).hasSize(1);
        assertThat(userRoles.get(0).getName()).isEqualTo("USER_ROLE");
    }

    @Test
    @DisplayName("Should find roles by permission id")
    void shouldFindRolesByPermissionId() {
        // Given
        Permission permission1 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_2"));

        Role role1 = createTestRoleWithName("ROLE_1");
        Set<Permission> permissions1 = new HashSet<>();
        permissions1.add(permission1);
        permissions1.add(permission2);
        role1.setPermissions(permissions1);
        role1 = roleRepository.save(role1);

        Role role2 = createTestRoleWithName("ROLE_2");
        Set<Permission> permissions2 = new HashSet<>();
        permissions2.add(permission2);
        role2.setPermissions(permissions2);
        role2 = roleRepository.save(role2);

        Role role3 = createTestRoleWithName("ROLE_3");
        Set<Permission> permissions3 = new HashSet<>();
        permissions3.add(permission1);
        role3.setPermissions(permissions3);
        role3 = roleRepository.save(role3);

        // When
        List<Role> rolesWithPermission1 = roleRepository.findByPermissionId(permission1.getId());
        List<Role> rolesWithPermission2 = roleRepository.findByPermissionId(permission2.getId());

        // Then
        assertThat(rolesWithPermission1).hasSize(2);
        assertThat(rolesWithPermission1).extracting(Role::getName)
            .containsExactlyInAnyOrder("ROLE_1", "ROLE_3");
        
        assertThat(rolesWithPermission2).hasSize(2);
        assertThat(rolesWithPermission2).extracting(Role::getName)
            .containsExactlyInAnyOrder("ROLE_1", "ROLE_2");
    }

    @Test
    @DisplayName("Should find roles without permissions")
    void shouldFindRolesWithoutPermissions() {
        // Given
        Role roleWithPermissions = createTestRoleWithName("ROLE_WITH_PERMISSIONS");
        roleWithPermissions.setPermissions(new HashSet<>(Set.of(testPermission)));
        roleWithPermissions = roleRepository.save(roleWithPermissions);

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

        // When
        List<Role> rolesWithoutPermissions = roleRepository.findRolesWithoutPermissions();

        // Then
        assertThat(rolesWithoutPermissions).hasSize(1);
        assertThat(rolesWithoutPermissions.get(0).getName()).isEqualTo("ROLE_WITHOUT_PERMISSIONS");
    }

    @Test
    @DisplayName("Should return empty list when finding roles by non-existent permission id")
    void shouldReturnEmptyListWhenFindingRolesByNonExistentPermissionId() {
        // Given
        Long nonExistentPermissionId = 999L;

        // When
        List<Role> roles = roleRepository.findByPermissionId(nonExistentPermissionId);

        // Then
        assertThat(roles).isEmpty();
    }

    @Test
    @DisplayName("Should get all roles")
    void shouldGetAllRoles() {
        // Given
        Permission permission1 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_2"));
        
        Role role1 = createTestRoleWithName("ROLE_1");
        role1.setPermissions(new HashSet<>(Set.of(permission1)));
        role1 = roleRepository.save(role1);
        
        Role role2 = createTestRoleWithName("ROLE_2");
        role2.setPermissions(new HashSet<>(Set.of(permission2)));
        role2 = roleRepository.save(role2);
        
        Role role3 = createTestRoleWithName("ROLE_3");
        role3.setPermissions(new HashSet<>(Set.of(permission1)));
        role3 = roleRepository.save(role3);

        // When
        List<Role> allRoles = roleRepository.findAll();

        // Then
        assertThat(allRoles).hasSize(3);
        assertThat(allRoles).extracting(Role::getName)
            .containsExactlyInAnyOrder("ROLE_1", "ROLE_2", "ROLE_3");
    }

    @Test
    @DisplayName("Should update role successfully")
    void shouldUpdateRoleSuccessfully() {
        // Given
        Role savedRole = roleRepository.save(testRole);
        Long roleId = savedRole.getId();

        // When
        savedRole.setName("UPDATED_ROLE");
        savedRole.setDescription("Updated Description");
        Role updatedRole = roleRepository.save(savedRole);

        // Then
        assertThat(updatedRole.getId()).isEqualTo(roleId);
        assertThat(updatedRole.getName()).isEqualTo("UPDATED_ROLE");
        assertThat(updatedRole.getDescription()).isEqualTo("Updated Description");
        
        // Verify in database
        Optional<Role> foundRole = roleRepository.findById(roleId);
        assertThat(foundRole).isPresent();
        assertThat(foundRole.get().getName()).isEqualTo("UPDATED_ROLE");
    }

    @Test
    @DisplayName("Should delete role successfully")
    void shouldDeleteRoleSuccessfully() {
        // Given
        Role savedRole = roleRepository.save(testRole);
        Long roleId = savedRole.getId();

        // When
        roleRepository.delete(savedRole);

        // Then
        Optional<Role> foundRole = roleRepository.findById(roleId);
        assertThat(foundRole).isEmpty();
    }

    @Test
    @DisplayName("Should delete role by id successfully")
    void shouldDeleteRoleByIdSuccessfully() {
        // Given
        Role savedRole = roleRepository.save(testRole);
        Long roleId = savedRole.getId();

        // When
        roleRepository.deleteById(roleId);

        // Then
        Optional<Role> foundRole = roleRepository.findById(roleId);
        assertThat(foundRole).isEmpty();
    }

    @Test
    @DisplayName("Should count roles")
    void shouldCountRoles() {
        // Given
        Permission permission1 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_2"));
        
        Role role1 = createTestRoleWithName("ROLE_1");
        role1.setPermissions(new HashSet<>(Set.of(permission1)));
        roleRepository.save(role1);
        
        Role role2 = createTestRoleWithName("ROLE_2");
        role2.setPermissions(new HashSet<>(Set.of(permission2)));
        roleRepository.save(role2);
        
        Role role3 = createTestRoleWithName("ROLE_3");
        role3.setPermissions(new HashSet<>(Set.of(permission1)));
        roleRepository.save(role3);

        // When
        long count = roleRepository.count();

        // Then
        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("Should check if role exists by id")
    void shouldCheckIfRoleExistsById() {
        // Given
        Role savedRole = roleRepository.save(testRole);

        // When
        boolean exists = roleRepository.existsById(savedRole.getId());
        boolean notExists = roleRepository.existsById(999L);

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should handle role-permission relationships correctly")
    void shouldHandleRolePermissionRelationshipsCorrectly() {
        // Given
        Permission permission1 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = entityManager.persistAndFlush(createTestPermissionWithName("PERMISSION_2"));

        Role role = createTestRoleWithName("TEST_ROLE");
        Set<Permission> permissions = new HashSet<>();
        permissions.add(permission1);
        permissions.add(permission2);
        role.setPermissions(permissions);
        role = roleRepository.save(role);

        // When
        Optional<Role> foundRole = roleRepository.findById(role.getId());

        // Then
        assertThat(foundRole).isPresent();
        assertThat(foundRole.get().getPermissions()).hasSize(2);
        assertThat(foundRole.get().getPermissions()).contains(permission1, permission2);
    }
}
