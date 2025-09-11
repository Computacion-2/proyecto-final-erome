package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.model.entities.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class PermissionRepositoryTest {

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Permission testPermission;

    @BeforeEach
    void setUp() {
        testPermission = createTestPermission();
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

    @Test
    @DisplayName("Should save permission successfully")
    void shouldSavePermissionSuccessfully() {
        // When
        Permission savedPermission = permissionRepository.save(testPermission);

        // Then
        assertThat(savedPermission).isNotNull();
        assertThat(savedPermission.getId()).isNotNull();
        assertThat(savedPermission.getName()).isEqualTo("TEST_PERMISSION");
        assertThat(savedPermission.getDescription()).isEqualTo("Test Permission Description");
    }

    @Test
    @DisplayName("Should find permission by id successfully")
    void shouldFindPermissionByIdSuccessfully() {
        // Given
        Permission savedPermission = permissionRepository.save(testPermission);
        Long permissionId = savedPermission.getId();

        // When
        Optional<Permission> foundPermission = permissionRepository.findById(permissionId);

        // Then
        assertThat(foundPermission).isPresent();
        assertThat(foundPermission.get().getName()).isEqualTo("TEST_PERMISSION");
        assertThat(foundPermission.get().getId()).isEqualTo(permissionId);
    }

    @Test
    @DisplayName("Should return empty when finding non-existent permission by id")
    void shouldReturnEmptyWhenFindingNonExistentPermissionById() {
        // Given
        Long nonExistentId = 999L;

        // When
        Optional<Permission> foundPermission = permissionRepository.findById(nonExistentId);

        // Then
        assertThat(foundPermission).isEmpty();
    }

    @Test
    @DisplayName("Should find permission by name successfully")
    void shouldFindPermissionByNameSuccessfully() {
        // Given
        Permission savedPermission = permissionRepository.save(testPermission);
        String permissionName = savedPermission.getName();

        // When
        Optional<Permission> foundPermission = permissionRepository.findByName(permissionName);

        // Then
        assertThat(foundPermission).isPresent();
        assertThat(foundPermission.get().getName()).isEqualTo(permissionName);
        assertThat(foundPermission.get().getId()).isEqualTo(savedPermission.getId());
    }

    @Test
    @DisplayName("Should return empty when finding non-existent permission by name")
    void shouldReturnEmptyWhenFindingNonExistentPermissionByName() {
        // Given
        String nonExistentName = "NON_EXISTENT_PERMISSION";

        // When
        Optional<Permission> foundPermission = permissionRepository.findByName(nonExistentName);

        // Then
        assertThat(foundPermission).isEmpty();
    }

    @Test
    @DisplayName("Should check if permission exists by name")
    void shouldCheckIfPermissionExistsByName() {
        // Given
        Permission savedPermission = permissionRepository.save(testPermission);

        // When
        boolean exists = permissionRepository.existsByName(savedPermission.getName());
        boolean notExists = permissionRepository.existsByName("NON_EXISTENT");

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should find permissions by name containing ignore case")
    void shouldFindPermissionsByNameContainingIgnoreCase() {
        // Given
        Permission permission1 = permissionRepository.save(createTestPermissionWithName("CREATE_USER"));
        Permission permission2 = permissionRepository.save(createTestPermissionWithName("UPDATE_USER"));
        Permission permission3 = permissionRepository.save(createTestPermissionWithName("DELETE_USER"));
        Permission permission4 = permissionRepository.save(createTestPermissionWithName("CREATE_ROLE"));

        // When
        List<Permission> userPermissions = permissionRepository.findByNameContainingIgnoreCase("user");
        List<Permission> createPermissions = permissionRepository.findByNameContainingIgnoreCase("create");

        // Then
        assertThat(userPermissions).hasSize(3);
        assertThat(userPermissions).extracting(Permission::getName)
            .containsExactlyInAnyOrder("CREATE_USER", "UPDATE_USER", "DELETE_USER");
        
        assertThat(createPermissions).hasSize(2);
        assertThat(createPermissions).extracting(Permission::getName)
            .containsExactlyInAnyOrder("CREATE_USER", "CREATE_ROLE");
    }

    @Test
    @DisplayName("Should find permissions by role id")
    void shouldFindPermissionsByRoleId() {
        // Given
        Permission permission1 = permissionRepository.save(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = permissionRepository.save(createTestPermissionWithName("PERMISSION_2"));
        Permission permission3 = permissionRepository.save(createTestPermissionWithName("PERMISSION_3"));

        Role role1 = createTestRoleWithName("ROLE_1");
        Set<Permission> permissions1 = new HashSet<>();
        permissions1.add(permission1);
        permissions1.add(permission2);
        role1.setPermissions(permissions1);
        role1 = entityManager.persistAndFlush(role1);

        Role role2 = createTestRoleWithName("ROLE_2");
        Set<Permission> permissions2 = new HashSet<>();
        permissions2.add(permission2);
        permissions2.add(permission3);
        role2.setPermissions(permissions2);
        role2 = entityManager.persistAndFlush(role2);

        // When
        List<Permission> role1Permissions = permissionRepository.findByRoleId(role1.getId());
        List<Permission> role2Permissions = permissionRepository.findByRoleId(role2.getId());

        // Then
        assertThat(role1Permissions).hasSize(2);
        assertThat(role1Permissions).extracting(Permission::getName)
            .containsExactlyInAnyOrder("PERMISSION_1", "PERMISSION_2");
        
        assertThat(role2Permissions).hasSize(2);
        assertThat(role2Permissions).extracting(Permission::getName)
            .containsExactlyInAnyOrder("PERMISSION_2", "PERMISSION_3");
    }

    @Test
    @DisplayName("Should return empty list when finding permissions by non-existent role id")
    void shouldReturnEmptyListWhenFindingPermissionsByNonExistentRoleId() {
        // Given
        Long nonExistentRoleId = 999L;

        // When
        List<Permission> permissions = permissionRepository.findByRoleId(nonExistentRoleId);

        // Then
        assertThat(permissions).isEmpty();
    }

    @Test
    @DisplayName("Should get all permissions")
    void shouldGetAllPermissions() {
        // Given
        Permission permission1 = permissionRepository.save(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = permissionRepository.save(createTestPermissionWithName("PERMISSION_2"));
        Permission permission3 = permissionRepository.save(createTestPermissionWithName("PERMISSION_3"));

        // When
        List<Permission> allPermissions = permissionRepository.findAll();

        // Then
        assertThat(allPermissions).hasSize(3);
        assertThat(allPermissions).extracting(Permission::getName)
            .containsExactlyInAnyOrder("PERMISSION_1", "PERMISSION_2", "PERMISSION_3");
    }

    @Test
    @DisplayName("Should update permission successfully")
    void shouldUpdatePermissionSuccessfully() {
        // Given
        Permission savedPermission = permissionRepository.save(testPermission);
        Long permissionId = savedPermission.getId();

        // When
        savedPermission.setName("UPDATED_PERMISSION");
        savedPermission.setDescription("Updated Description");
        Permission updatedPermission = permissionRepository.save(savedPermission);

        // Then
        assertThat(updatedPermission.getId()).isEqualTo(permissionId);
        assertThat(updatedPermission.getName()).isEqualTo("UPDATED_PERMISSION");
        assertThat(updatedPermission.getDescription()).isEqualTo("Updated Description");
        
        // Verify in database
        Optional<Permission> foundPermission = permissionRepository.findById(permissionId);
        assertThat(foundPermission).isPresent();
        assertThat(foundPermission.get().getName()).isEqualTo("UPDATED_PERMISSION");
    }

    @Test
    @DisplayName("Should delete permission successfully")
    void shouldDeletePermissionSuccessfully() {
        // Given
        Permission savedPermission = permissionRepository.save(testPermission);
        Long permissionId = savedPermission.getId();

        // When
        permissionRepository.delete(savedPermission);

        // Then
        Optional<Permission> foundPermission = permissionRepository.findById(permissionId);
        assertThat(foundPermission).isEmpty();
    }

    @Test
    @DisplayName("Should delete permission by id successfully")
    void shouldDeletePermissionByIdSuccessfully() {
        // Given
        Permission savedPermission = permissionRepository.save(testPermission);
        Long permissionId = savedPermission.getId();

        // When
        permissionRepository.deleteById(permissionId);

        // Then
        Optional<Permission> foundPermission = permissionRepository.findById(permissionId);
        assertThat(foundPermission).isEmpty();
    }

    @Test
    @DisplayName("Should count permissions")
    void shouldCountPermissions() {
        // Given
        permissionRepository.save(createTestPermissionWithName("PERMISSION_1"));
        permissionRepository.save(createTestPermissionWithName("PERMISSION_2"));
        permissionRepository.save(createTestPermissionWithName("PERMISSION_3"));

        // When
        long count = permissionRepository.count();

        // Then
        assertThat(count).isEqualTo(3);
    }

    @Test
    @DisplayName("Should check if permission exists by id")
    void shouldCheckIfPermissionExistsById() {
        // Given
        Permission savedPermission = permissionRepository.save(testPermission);

        // When
        boolean exists = permissionRepository.existsById(savedPermission.getId());
        boolean notExists = permissionRepository.existsById(999L);

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }
}
