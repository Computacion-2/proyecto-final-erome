package com.example.pensamientoComputacional.service;

import com.example.pensamientoComputacional.TestBase;
import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.repository.PermissionRepository;
import com.example.pensamientoComputacional.service.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Import(com.example.pensamientoComputacional.service.impl.PermissionServiceImpl.class)
@ActiveProfiles("test")
class PermissionServiceTest {

    @Autowired
    private IPermissionService permissionService;

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

    @Test
    @DisplayName("Should create permission successfully")
    void shouldCreatePermissionSuccessfully() {
        // When
        Permission savedPermission = permissionService.createPermission(testPermission);

        // Then
        assertThat(savedPermission).isNotNull();
        assertThat(savedPermission.getId()).isNotNull();
        assertThat(savedPermission.getName()).isEqualTo("TEST_PERMISSION");
        assertThat(savedPermission.getDescription()).isEqualTo("Test Permission Description");
        
        // Verify it was saved in database
        Optional<Permission> foundPermission = permissionRepository.findById(savedPermission.getId());
        assertThat(foundPermission).isPresent();
        assertThat(foundPermission.get().getName()).isEqualTo("TEST_PERMISSION");
    }

    @Test
    @DisplayName("Should throw BusinessException when creating permission with duplicate name")
    void shouldThrowBusinessExceptionWhenCreatingPermissionWithDuplicateName() {
        // Given
        permissionService.createPermission(testPermission);
        
        Permission duplicatePermission = createTestPermissionWithName("TEST_PERMISSION");

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> permissionService.createPermission(duplicatePermission));
        
        assertThat(exception.getMessage()).contains("Permission with name TEST_PERMISSION already exists");
    }

    @Test
    @DisplayName("Should update permission successfully")
    void shouldUpdatePermissionSuccessfully() {
        // Given
        Permission savedPermission = permissionService.createPermission(testPermission);
        Permission updatedPermission = createTestPermissionWithName("UPDATED_PERMISSION");
        updatedPermission.setDescription("Updated Description");

        // When
        Permission result = permissionService.updatePermission(savedPermission.getId(), updatedPermission);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(savedPermission.getId());
        assertThat(result.getName()).isEqualTo("UPDATED_PERMISSION");
        assertThat(result.getDescription()).isEqualTo("Updated Description");
        
        // Verify in database
        Optional<Permission> foundPermission = permissionRepository.findById(savedPermission.getId());
        assertThat(foundPermission).isPresent();
        assertThat(foundPermission.get().getName()).isEqualTo("UPDATED_PERMISSION");
    }

    @Test
    @DisplayName("Should throw BusinessException when updating non-existent permission")
    void shouldThrowBusinessExceptionWhenUpdatingNonExistentPermission() {
        // Given
        Permission updatedPermission = createTestPermissionWithName("UPDATED_PERMISSION");
        Long nonExistentId = 999L;

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> permissionService.updatePermission(nonExistentId, updatedPermission));
        
        assertThat(exception.getMessage()).contains("Permission not found with id: 999");
    }

    @Test
    @DisplayName("Should throw BusinessException when updating permission with duplicate name")
    void shouldThrowBusinessExceptionWhenUpdatingPermissionWithDuplicateName() {
        // Given
        Permission permission1 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_2"));
        
        Permission updatedPermission = createTestPermissionWithName("PERMISSION_1");

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> permissionService.updatePermission(permission2.getId(), updatedPermission));
        
        assertThat(exception.getMessage()).contains("Permission with name PERMISSION_1 already exists");
    }

    @Test
    @DisplayName("Should delete permission successfully")
    void shouldDeletePermissionSuccessfully() {
        // Given
        Permission savedPermission = permissionService.createPermission(testPermission);
        Long permissionId = savedPermission.getId();

        // When
        permissionService.deletePermission(permissionId);

        // Then
        Optional<Permission> foundPermission = permissionRepository.findById(permissionId);
        assertThat(foundPermission).isEmpty();
    }

    @Test
    @DisplayName("Should throw BusinessException when deleting non-existent permission")
    void shouldThrowBusinessExceptionWhenDeletingNonExistentPermission() {
        // Given
        Long nonExistentId = 999L;

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> permissionService.deletePermission(nonExistentId));
        
        assertThat(exception.getMessage()).contains("Permission not found with id: 999");
    }

    @Test
    @DisplayName("Should get permission by id successfully")
    void shouldGetPermissionByIdSuccessfully() {
        // Given
        Permission savedPermission = permissionService.createPermission(testPermission);
        Long permissionId = savedPermission.getId();

        // When
        Permission foundPermission = permissionService.getPermission(permissionId);

        // Then
        assertThat(foundPermission).isNotNull();
        assertThat(foundPermission.getId()).isEqualTo(permissionId);
        assertThat(foundPermission.getName()).isEqualTo("TEST_PERMISSION");
    }

    @Test
    @DisplayName("Should throw BusinessException when getting non-existent permission")
    void shouldThrowBusinessExceptionWhenGettingNonExistentPermission() {
        // Given
        Long nonExistentId = 999L;

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> permissionService.getPermission(nonExistentId));
        
        assertThat(exception.getMessage()).contains("Permission not found with id: 999");
    }

    @Test
    @DisplayName("Should get all permissions successfully")
    void shouldGetAllPermissionsSuccessfully() {
        // Given
        Permission permission1 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_2"));
        Permission permission3 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_3"));

        // When
        List<Permission> allPermissions = permissionService.getAllPermissions();

        // Then
        assertThat(allPermissions).hasSize(3);
        assertThat(allPermissions).extracting(Permission::getName)
            .containsExactlyInAnyOrder("PERMISSION_1", "PERMISSION_2", "PERMISSION_3");
    }

    @Test
    @DisplayName("Should return empty list when no permissions exist")
    void shouldReturnEmptyListWhenNoPermissionsExist() {
        // When
        List<Permission> allPermissions = permissionService.getAllPermissions();

        // Then
        assertThat(allPermissions).isEmpty();
    }

    @Test
    @DisplayName("Should find permission by name successfully")
    void shouldFindPermissionByNameSuccessfully() {
        // Given
        Permission savedPermission = permissionService.createPermission(testPermission);
        String permissionName = savedPermission.getName();

        // When
        Permission foundPermission = permissionService.findByName(permissionName);

        // Then
        assertThat(foundPermission).isNotNull();
        assertThat(foundPermission.getName()).isEqualTo(permissionName);
        assertThat(foundPermission.getId()).isEqualTo(savedPermission.getId());
    }

    @Test
    @DisplayName("Should throw BusinessException when finding permission by non-existent name")
    void shouldThrowBusinessExceptionWhenFindingPermissionByNonExistentName() {
        // Given
        String nonExistentName = "NON_EXISTENT_PERMISSION";

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> permissionService.findByName(nonExistentName));
        
        assertThat(exception.getMessage()).contains("Permission not found with name: NON_EXISTENT_PERMISSION");
    }

    @Test
    @DisplayName("Should handle case-sensitive permission names")
    void shouldHandleCaseSensitivePermissionNames() {
        // Given
        Permission savedPermission = permissionService.createPermission(createTestPermissionWithName("Test_Permission"));

        // When
        Permission foundPermission = permissionService.findByName("Test_Permission");

        // Then
        assertThat(foundPermission).isNotNull();
        assertThat(foundPermission.getName()).isEqualTo("Test_Permission");
        
        // Verify case sensitivity
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> permissionService.findByName("test_permission"));
        
        assertThat(exception.getMessage()).contains("Permission not found with name: test_permission");
    }
}
