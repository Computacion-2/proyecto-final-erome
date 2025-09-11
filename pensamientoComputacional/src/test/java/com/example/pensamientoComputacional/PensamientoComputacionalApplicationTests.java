package com.example.pensamientoComputacional;

import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.service.IPermissionService;
import com.example.pensamientoComputacional.service.IRoleService;
import com.example.pensamientoComputacional.service.IUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class PensamientoComputacionalApplicationTests {

	@Autowired
	private IPermissionService permissionService;

	@Autowired
	private IRoleService roleService;

	@Autowired
	private IUserService userService;

	@Test
	void contextLoads() {
		assertThat(permissionService).isNotNull();
		assertThat(roleService).isNotNull();
		assertThat(userService).isNotNull();
	}

	@Test
	void shouldCreateBasicEntitiesSuccessfully() {
		// Create permission
		Permission permission = new Permission();
		permission.setName("TEST_PERMISSION");
		permission.setDescription("Test Permission");
		permission = permissionService.createPermission(permission);

		// Create role with permission
		Role role = new Role();
		role.setName("TEST_ROLE");
		role.setDescription("Test Role");
		Set<Permission> permissions = new HashSet<>();
		permissions.add(permission);
		role.setPermissions(permissions);
		role = roleService.createRole(role);

		// Create user with role
		User user = new User();
		user.setName("Test User");
		user.setEmail("test@example.com");
		user.setPasswordHash("hashedPassword");
		user.setIsActive(true);
		Set<Role> roles = new HashSet<>();
		roles.add(role);
		user.setRoles(roles);
		user = userService.createUser(user);

		// Verify entities were created
		assertThat(permission.getId()).isNotNull();
		assertThat(role.getId()).isNotNull();
		assertThat(user.getId()).isNotNull();

		// Verify relationships
		assertThat(user.getRoles()).hasSize(1);
		assertThat(user.getRoles().iterator().next().getPermissions()).hasSize(1);
		assertThat(user.getRoles().iterator().next().getPermissions().iterator().next().getName())
			.isEqualTo("TEST_PERMISSION");
	}
}
