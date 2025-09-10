package com.example.pensamientoComputacional.service;

import com.example.pensamientoComputacional.model.entities.Role;
import java.util.List;

public interface IRoleService {
    Role createRole(Role role);
    Role updateRole(Long id, Role role);
    void deleteRole(Long id);
    Role getRole(Long id);
    List<Role> getAllRoles();
    Role findByName(String name);
    Role addPermissionToRole(Long roleId, Long permissionId);
}
