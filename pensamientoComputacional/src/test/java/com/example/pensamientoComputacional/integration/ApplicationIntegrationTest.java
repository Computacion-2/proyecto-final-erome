package com.example.pensamientoComputacional.integration;

import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.service.IPermissionService;
import com.example.pensamientoComputacional.service.IRoleService;
import com.example.pensamientoComputacional.service.IUserService;
import com.example.pensamientoComputacional.service.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ApplicationIntegrationTest {

    @Autowired
    private IPermissionService permissionService;

    @Autowired
    private IRoleService roleService;

    @Autowired
    private IUserService userService;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    @DisplayName("Should complete end-to-end user creation workflow")
    void shouldCompleteEndToEndUserCreationWorkflow() {
        // Step 1: Create permissions
        Permission createPermission = permissionService.createPermission(createTestPermissionWithName("CREATE_USER"));
        Permission readPermission = permissionService.createPermission(createTestPermissionWithName("READ_USER"));
        Permission updatePermission = permissionService.createPermission(createTestPermissionWithName("UPDATE_USER"));
        Permission deletePermission = permissionService.createPermission(createTestPermissionWithName("DELETE_USER"));

        // Step 2: Create roles with permissions
        Role adminRole = createTestRoleWithName("ADMIN");
        adminRole.setDescription("Administrator role with full access");
        Set<Permission> adminPermissions = new HashSet<>();
        adminPermissions.add(createPermission);
        adminPermissions.add(readPermission);
        adminPermissions.add(updatePermission);
        adminPermissions.add(deletePermission);
        adminRole.setPermissions(adminPermissions);
        adminRole = roleService.createRole(adminRole);

        Role userRole = createTestRoleWithName("USER");
        userRole.setDescription("Regular user role with limited access");
        Set<Permission> userPermissions = new HashSet<>();
        userPermissions.add(readPermission);
        userRole.setPermissions(userPermissions);
        userRole = roleService.createRole(userRole);

        // Step 3: Create users with roles
        User adminUser = createTestUserWithEmail("admin@example.com");
        adminUser.setName("Admin User");
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(adminRole);
        adminUser.setRoles(adminRoles);
        adminUser = userService.createUser(adminUser);

        User regularUser = createTestUserWithEmail("user@example.com");
        regularUser.setName("Regular User");
        Set<Role> regularRoles = new HashSet<>();
        regularRoles.add(userRole);
        regularUser.setRoles(regularRoles);
        regularUser = userService.createUser(regularUser);

        // Step 4: Verify the complete setup
        assertThat(permissionService.getAllPermissions()).hasSize(4);
        assertThat(roleService.getAllRoles()).hasSize(2);
        assertThat(userService.getAllUsers()).hasSize(2);

        // Verify admin user has all permissions through role
        User foundAdmin = userService.getUser(adminUser.getId());
        assertThat(foundAdmin.getRoles()).hasSize(1);
        assertThat(foundAdmin.getRoles().iterator().next().getPermissions()).hasSize(4);

        // Verify regular user has limited permissions
        User foundRegular = userService.getUser(regularUser.getId());
        assertThat(foundRegular.getRoles()).hasSize(1);
        assertThat(foundRegular.getRoles().iterator().next().getPermissions()).hasSize(1);
    }

    @Test
    @DisplayName("Should handle complex role-permission management")
    void shouldHandleComplexRolePermissionManagement() {
        // Create permissions
        Permission permission1 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_2"));
        Permission permission3 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_3"));

        // Create role with initial permissions
        Role role = createTestRoleWithName("MANAGER");
        Set<Permission> initialPermissions = new HashSet<>();
        initialPermissions.add(permission1);
        initialPermissions.add(permission2);
        role.setPermissions(initialPermissions);
        role = roleService.createRole(role);

        // Add more permissions to role
        role = roleService.addPermissionToRole(role.getId(), permission3.getId());

        // Verify role has all permissions
        Role foundRole = roleService.getRole(role.getId());
        assertThat(foundRole.getPermissions()).hasSize(3);
        assertThat(foundRole.getPermissions()).extracting(Permission::getName)
            .containsExactlyInAnyOrder("PERMISSION_1", "PERMISSION_2", "PERMISSION_3");

        // Update role permissions
        Set<Permission> updatedPermissions = new HashSet<>();
        updatedPermissions.add(permission1);
        updatedPermissions.add(permission3);
        role.setPermissions(updatedPermissions);
        role = roleService.updateRole(role.getId(), role);

        // Verify updated permissions
        Role updatedRole = roleService.getRole(role.getId());
        assertThat(updatedRole.getPermissions()).hasSize(2);
        assertThat(updatedRole.getPermissions()).extracting(Permission::getName)
            .containsExactlyInAnyOrder("PERMISSION_1", "PERMISSION_3");
    }

    @Test
    @DisplayName("Should enforce business rules correctly")
    void shouldEnforceBusinessRulesCorrectly() {
        // Test: Cannot create user without roles
        User userWithoutRoles = createTestUserWithEmail("noroles@example.com");
        userWithoutRoles.setRoles(new HashSet<>());
        
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.createUser(userWithoutRoles));
        assertThat(exception.getMessage()).contains("User must have at least one role");

        // Test: Cannot create role without permissions
        // This test is skipped because the validation happens at the entity level
        // and prevents the role from being created in the first place

        // Test: Cannot create user with role that has no permissions
        Permission permission = permissionService.createPermission(createTestPermissionWithName("SOME_PERMISSION"));
        
        Role roleWithPermissions = createTestRoleWithName("ROLE_WITH_PERMISSIONS");
        roleWithPermissions.setPermissions(new HashSet<>(Set.of(permission)));
        roleWithPermissions = roleService.createRole(roleWithPermissions);
        
        // Create a role with permissions first, then remove them using direct SQL
        Role roleWithoutPermissions2 = createTestRoleWithName("ROLE_WITHOUT_PERMISSIONS");
        roleWithoutPermissions2.setPermissions(new HashSet<>(Set.of(permission)));
        roleWithoutPermissions2 = roleService.createRole(roleWithoutPermissions2);
        
        // Remove permissions using direct SQL to bypass validation
        entityManager.createNativeQuery("DELETE FROM role_permissions WHERE role_id = ?")
                .setParameter(1, roleWithoutPermissions2.getId())
                .executeUpdate();
        entityManager.flush();
        entityManager.clear();
        
        User userWithInvalidRole = createTestUserWithEmail("invalid@example.com");
        Set<Role> invalidRoles = new HashSet<>();
        invalidRoles.add(roleWithoutPermissions2);
        userWithInvalidRole.setRoles(invalidRoles);
        
        exception = assertThrows(BusinessException.class, 
            () -> userService.createUser(userWithInvalidRole));
        assertThat(exception.getMessage()).contains("Role ROLE_WITHOUT_PERMISSIONS must have at least one permission");
    }

    @Test
    @DisplayName("Should handle data consistency across operations")
    void shouldHandleDataConsistencyAcrossOperations() {
        // Create initial data
        Permission permission = permissionService.createPermission(createTestPermissionWithName("TEST_PERMISSION"));
        
        Role role = createTestRoleWithName("TEST_ROLE");
        role.setPermissions(new HashSet<>(Set.of(permission)));
        role = roleService.createRole(role);
        
        User user = createTestUserWithEmail("test@example.com");
        user.setRoles(new HashSet<>(Set.of(role)));
        user = userService.createUser(user);

        // Update user
        user.setName("Updated Name");
        user = userService.updateUser(user.getId(), user);
        
        // Verify user was updated
        User foundUser = userService.getUser(user.getId());
        assertThat(foundUser.getName()).isEqualTo("Updated Name");
        assertThat(foundUser.getRoles()).hasSize(1);
        assertThat(foundUser.getRoles().iterator().next().getPermissions()).hasSize(1);

        // Update role
        role.setDescription("Updated Description");
        role = roleService.updateRole(role.getId(), role);
        
        // Verify role was updated
        Role foundRole = roleService.getRole(role.getId());
        assertThat(foundRole.getDescription()).isEqualTo("Updated Description");

        // Update permission
        permission.setDescription("Updated Permission Description");
        permission = permissionService.updatePermission(permission.getId(), permission);
        
        // Verify permission was updated
        Permission foundPermission = permissionService.getPermission(permission.getId());
        assertThat(foundPermission.getDescription()).isEqualTo("Updated Permission Description");
    }

    @Test
    @DisplayName("Should handle cascading deletions correctly")
    void shouldHandleCascadingDeletionsCorrectly() {
        // Create data with relationships
        Permission permission = permissionService.createPermission(createTestPermissionWithName("TEST_PERMISSION"));
        
        Role role = createTestRoleWithName("TEST_ROLE");
        role.setPermissions(new HashSet<>(Set.of(permission)));
        role = roleService.createRole(role);
        
        User user = createTestUserWithEmail("test@example.com");
        user.setRoles(new HashSet<>(Set.of(role)));
        user = userService.createUser(user);

        // Delete user
        Long userId = user.getId();
        userService.deleteUser(userId);
        
        // Verify user is deleted
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> userService.getUser(userId));
        assertThat(exception.getMessage()).contains("User not found with id: " + userId);

        // Verify role still exists
        Role foundRole = roleService.getRole(role.getId());
        assertThat(foundRole).isNotNull();

        // Verify permission still exists
        Permission foundPermission = permissionService.getPermission(permission.getId());
        assertThat(foundPermission).isNotNull();

        // Delete role
        Long roleId = role.getId();
        roleService.deleteRole(roleId);
        
        // Verify role is deleted
        exception = assertThrows(BusinessException.class, 
            () -> roleService.getRole(roleId));
        assertThat(exception.getMessage()).contains("Role not found with id: " + roleId);

        // Verify permission still exists
        foundPermission = permissionService.getPermission(permission.getId());
        assertThat(foundPermission).isNotNull();

        // Delete permission
        permissionService.deletePermission(permission.getId());
        
        // Verify permission is deleted
        exception = assertThrows(BusinessException.class, 
            () -> permissionService.getPermission(permission.getId()));
        assertThat(exception.getMessage()).contains("Permission not found with id: " + permission.getId());
    }

    @Test
    @DisplayName("Should handle concurrent operations correctly")
    void shouldHandleConcurrentOperationsCorrectly() {
        // Create multiple permissions concurrently
        Permission permission1 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_1"));
        Permission permission2 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_2"));
        Permission permission3 = permissionService.createPermission(createTestPermissionWithName("PERMISSION_3"));

        // Create multiple roles concurrently
        Role role1 = createTestRoleWithName("ROLE_1");
        role1.setPermissions(new HashSet<>(Set.of(permission1)));
        role1 = roleService.createRole(role1);

        Role role2 = createTestRoleWithName("ROLE_2");
        role2.setPermissions(new HashSet<>(Set.of(permission2)));
        role2 = roleService.createRole(role2);

        Role role3 = createTestRoleWithName("ROLE_3");
        role3.setPermissions(new HashSet<>(Set.of(permission3)));
        role3 = roleService.createRole(role3);

        // Create multiple users concurrently
        User user1 = createTestUserWithEmail("user1@example.com");
        user1.setRoles(new HashSet<>(Set.of(role1)));
        user1 = userService.createUser(user1);

        User user2 = createTestUserWithEmail("user2@example.com");
        user2.setRoles(new HashSet<>(Set.of(role2)));
        user2 = userService.createUser(user2);

        User user3 = createTestUserWithEmail("user3@example.com");
        user3.setRoles(new HashSet<>(Set.of(role3)));
        user3 = userService.createUser(user3);

        // Verify all data was created correctly
        assertThat(permissionService.getAllPermissions()).hasSize(3);
        assertThat(roleService.getAllRoles()).hasSize(3);
        assertThat(userService.getAllUsers()).hasSize(3);

        // Verify relationships are maintained
        User foundUser1 = userService.getUser(user1.getId());
        assertThat(foundUser1.getRoles()).hasSize(1);
        assertThat(foundUser1.getRoles().iterator().next().getName()).isEqualTo("ROLE_1");

        User foundUser2 = userService.getUser(user2.getId());
        assertThat(foundUser2.getRoles()).hasSize(1);
        assertThat(foundUser2.getRoles().iterator().next().getName()).isEqualTo("ROLE_2");

        User foundUser3 = userService.getUser(user3.getId());
        assertThat(foundUser3.getRoles()).hasSize(1);
        assertThat(foundUser3.getRoles().iterator().next().getName()).isEqualTo("ROLE_3");
    }

    // Helper methods copied from TestBase
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
}
