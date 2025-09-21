package com.example.pensamientoComputacional.service;

import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.repository.PermissionRepository;
import com.example.pensamientoComputacional.repository.RoleRepository;
import com.example.pensamientoComputacional.service.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Import(com.example.pensamientoComputacional.service.impl.RoleServiceImpl.class)
@ActiveProfiles("test")
class RoleServiceTest {

    @Autowired
    private IRoleService roleService;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Role testRole;
    private Permission testPermission;

    @BeforeEach
    void setUp() {
        testPermission = createTestPermission();
        testPermission = permissionRepository.save(testPermission);
        
        testRole = createTestRole();
        Set<Permission> permissions = new HashSet<>();
        permissions.add(testPermission);
        testRole.setPermissions(permissions);
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
    @DisplayName("Should create role successfully")
    void shouldCreateRoleSuccessfully() {
        // When
        Role savedRole = roleService.createRole(testRole);

        // Then
        assertThat(savedRole).isNotNull();
        assertThat(savedRole.getId()).isNotNull();
        assertThat(savedRole.getName()).isEqualTo("TEST_ROLE");
        assertThat(savedRole.getDescription()).isEqualTo("Test Role Description");
        assertThat(savedRole.getPermissions()).hasSize(1);
        assertThat(savedRole.getPermissions()).contains(testPermission);
        
        // Verify it was saved in database
        Optional<Role> foundRole = roleRepository.findById(savedRole.getId());
        assertThat(foundRole).isPresent();
        assertThat(foundRole.get().getName()).isEqualTo("TEST_ROLE");
    }

    @Test
    @DisplayName("Should throw BusinessException when creating role with duplicate name")
    void shouldThrowBusinessExceptionWhenCreatingRoleWithDuplicateName() {
        // Given
        roleService.createRole(testRole);
        
        Role duplicateRole = createTestRoleWithName("TEST_ROLE");
        duplicateRole.setPermissions(testRole.getPermissions());

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> roleService.createRole(duplicateRole));
        
        assertThat(exception.getMessage()).contains("Role with name TEST_ROLE already exists");
    }

    @Test
    @DisplayName("Should throw BusinessException when creating role without permissions")
    void shouldThrowBusinessExceptionWhenCreatingRoleWithoutPermissions() {
        // Given
        Role roleWithoutPermissions = createTestRole();
        roleWithoutPermissions.setPermissions(new HashSet<>());

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> roleService.createRole(roleWithoutPermissions));
        
        assertThat(exception.getMessage()).contains("Role must have at least one permission");
    }

    @Test
    @DisplayName("Should throw BusinessException when creating role with non-existent permission")
    void shouldThrowBusinessExceptionWhenCreatingRoleWithNonExistentPermission() {
        // Given
        Role roleWithNonExistentPermission = createTestRole();
        Set<Permission> nonExistentPermissions = new HashSet<>();
        Permission nonExistentPermission = createTestPermissionWithName("NON_EXISTENT");
        nonExistentPermission.setId(999L);
        nonExistentPermissions.add(nonExistentPermission);
        roleWithNonExistentPermission.setPermissions(nonExistentPermissions);

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> roleService.createRole(roleWithNonExistentPermission));
        
        assertThat(exception.getMessage()).contains("Permission not found with id: 999");
    }

    @Test
    @DisplayName("Should update role successfully")
    void shouldUpdateRoleSuccessfully() {
        // Given
        Role savedRole = roleService.createRole(testRole);
        
        Permission newPermission = createTestPermissionWithName("NEW_PERMISSION");
        newPermission = permissionRepository.save(newPermission);
        
        Role updatedRole = createTestRoleWithName("UPDATED_ROLE");
        updatedRole.setDescription("Updated Description");
        Set<Permission> updatedPermissions = new HashSet<>();
        updatedPermissions.add(testPermission);
        updatedPermissions.add(newPermission);
        updatedRole.setPermissions(updatedPermissions);

        // When
        Role result = roleService.updateRole(savedRole.getId(), updatedRole);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(savedRole.getId());
        assertThat(result.getName()).isEqualTo("UPDATED_ROLE");
        assertThat(result.getDescription()).isEqualTo("Updated Description");
        assertThat(result.getPermissions()).hasSize(2);
        
        // Verify in database
        Optional<Role> foundRole = roleRepository.findById(savedRole.getId());
        assertThat(foundRole).isPresent();
        assertThat(foundRole.get().getName()).isEqualTo("UPDATED_ROLE");
    }

    @Test
    @DisplayName("Should throw BusinessException when updating non-existent role")
    void shouldThrowBusinessExceptionWhenUpdatingNonExistentRole() {
        // Given
        Role updatedRole = createTestRoleWithName("UPDATED_ROLE");
        updatedRole.setPermissions(testRole.getPermissions());
        Long nonExistentId = 999L;

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> roleService.updateRole(nonExistentId, updatedRole));
        
        assertThat(exception.getMessage()).contains("Role not found with id: 999");
    }

    @Test
    @DisplayName("Should delete role successfully")
    void shouldDeleteRoleSuccessfully() {
        // Given
        Role savedRole = roleService.createRole(testRole);
        Long roleId = savedRole.getId();

        // When
        roleService.deleteRole(roleId);

        // Then
        Optional<Role> foundRole = roleRepository.findById(roleId);
        assertThat(foundRole).isEmpty();
    }

    @Test
    @DisplayName("Should throw BusinessException when deleting non-existent role")
    void shouldThrowBusinessExceptionWhenDeletingNonExistentRole() {
        // Given
        Long nonExistentId = 999L;

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> roleService.deleteRole(nonExistentId));
        
        assertThat(exception.getMessage()).contains("Role not found with id: 999");
    }

    @Test
    @DisplayName("Should get role by id successfully")
    void shouldGetRoleByIdSuccessfully() {
        // Given
        Role savedRole = roleService.createRole(testRole);
        Long roleId = savedRole.getId();

        // When
        Role foundRole = roleService.getRole(roleId);

        // Then
        assertThat(foundRole).isNotNull();
        assertThat(foundRole.getId()).isEqualTo(roleId);
        assertThat(foundRole.getName()).isEqualTo("TEST_ROLE");
    }

    @Test
    @DisplayName("Should get all roles successfully")
    void shouldGetAllRolesSuccessfully() {
        // Given
        Permission permission2 = permissionRepository.save(createTestPermissionWithName("PERMISSION_2"));
        Permission permission3 = permissionRepository.save(createTestPermissionWithName("PERMISSION_3"));
        
        Role role1 = roleService.createRole(testRole);
        
        Role role2 = createTestRoleWithName("ROLE_2");
        Set<Permission> permissions2 = new HashSet<>();
        permissions2.add(permission2);
        role2.setPermissions(permissions2);
        role2 = roleService.createRole(role2);
        
        Role role3 = createTestRoleWithName("ROLE_3");
        Set<Permission> permissions3 = new HashSet<>();
        permissions3.add(permission3);
        role3.setPermissions(permissions3);
        role3 = roleService.createRole(role3);

        // When
        List<Role> allRoles = roleService.getAllRoles();

        // Then
        assertThat(allRoles).hasSize(3);
        assertThat(allRoles).extracting(Role::getName)
            .containsExactlyInAnyOrder("TEST_ROLE", "ROLE_2", "ROLE_3");
    }

    @Test
    @DisplayName("Should find role by name successfully")
    void shouldFindRoleByNameSuccessfully() {
        // Given
        Role savedRole = roleService.createRole(testRole);
        String roleName = savedRole.getName();

        // When
        Role foundRole = roleService.findByName(roleName);

        // Then
        assertThat(foundRole).isNotNull();
        assertThat(foundRole.getName()).isEqualTo(roleName);
        assertThat(foundRole.getId()).isEqualTo(savedRole.getId());
    }

    @Test
    @DisplayName("Should add permission to role successfully")
    void shouldAddPermissionToRoleSuccessfully() {
        // Given
        Role savedRole = roleService.createRole(testRole);
        Permission newPermission = permissionRepository.save(createTestPermissionWithName("NEW_PERMISSION"));

        // When
        Role updatedRole = roleService.addPermissionToRole(savedRole.getId(), newPermission.getId());

        // Then
        assertThat(updatedRole.getPermissions()).hasSize(2);
        assertThat(updatedRole.getPermissions()).contains(testPermission);
        assertThat(updatedRole.getPermissions()).contains(newPermission);
    }

    @Test
    @DisplayName("Should throw BusinessException when adding non-existent permission to role")
    void shouldThrowBusinessExceptionWhenAddingNonExistentPermissionToRole() {
        // Given
        Role savedRole = roleService.createRole(testRole);
        Long nonExistentPermissionId = 999L;

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> roleService.addPermissionToRole(savedRole.getId(), nonExistentPermissionId));
        
        assertThat(exception.getMessage()).contains("Permission not found with id: 999");
    }

    @Test
    @DisplayName("Should throw BusinessException when adding permission to non-existent role")
    void shouldThrowBusinessExceptionWhenAddingPermissionToNonExistentRole() {
        // Given
        Permission permission = permissionRepository.save(createTestPermissionWithName("NEW_PERMISSION"));
        Long nonExistentRoleId = 999L;

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> roleService.addPermissionToRole(nonExistentRoleId, permission.getId()));
        
        assertThat(exception.getMessage()).contains("Role not found with id: 999");
    }

    @Test
    @DisplayName("Should handle duplicate permission addition gracefully")
    void shouldHandleDuplicatePermissionAdditionGracefully() {
        // Given
        Role savedRole = roleService.createRole(testRole);
        Long existingPermissionId = testPermission.getId();

        // When
        Role updatedRole = roleService.addPermissionToRole(savedRole.getId(), existingPermissionId);

        // Then
        assertThat(updatedRole.getPermissions()).hasSize(1); // Should remain 1, not duplicate
        assertThat(updatedRole.getPermissions()).contains(testPermission);
    }

    @Test
    @DisplayName("Should get roles by permission successfully")
    void shouldGetRolesByPermissionSuccessfully() {
        // Given
        Role role1 = roleService.createRole(testRole);
        
        Permission permission2 = permissionRepository.save(createTestPermissionWithName("PERMISSION_2"));
        Role role2 = createTestRoleWithName("ROLE_2");
        Set<Permission> permissions2 = new HashSet<>();
        permissions2.add(permission2);
        role2.setPermissions(permissions2);
        role2 = roleService.createRole(role2);

        // When
        List<Role> rolesWithTestPermission = roleService.getRolesByPermission(testPermission.getId());

        // Then
        assertThat(rolesWithTestPermission).hasSize(1);
        assertThat(rolesWithTestPermission.get(0).getName()).isEqualTo("TEST_ROLE");
    }

    @Test
    @DisplayName("Should get roles without permissions successfully")
    void shouldGetRolesWithoutPermissionsSuccessfully() {
        // Given
        Role roleWithPermissions = roleService.createRole(testRole);
        
        // Create a role with permissions first, then remove them using direct SQL to bypass validation
        Role roleWithoutPermissions = createTestRoleWithName("ROLE_WITHOUT_PERMISSIONS");
        roleWithoutPermissions.setPermissions(new HashSet<>(Set.of(testPermission)));
        roleWithoutPermissions = roleRepository.save(roleWithoutPermissions);
        
        // Remove permissions using direct SQL to bypass validation
        entityManager.getEntityManager().createNativeQuery("DELETE FROM role_permissions WHERE role_id = ?")
                .setParameter(1, roleWithoutPermissions.getId())
                .executeUpdate();
        entityManager.flush();
        entityManager.clear();

        // When
        List<Role> rolesWithoutPermissions = roleService.getRolesWithoutPermissions();

        // Then
        assertThat(rolesWithoutPermissions).hasSize(1);
        assertThat(rolesWithoutPermissions.get(0).getName()).isEqualTo("ROLE_WITHOUT_PERMISSIONS");
    }
}
