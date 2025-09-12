package com.example.pensamientoComputacional.service.impl;

import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.repository.RoleRepository;
import com.example.pensamientoComputacional.repository.PermissionRepository;
import com.example.pensamientoComputacional.service.IRoleService;
import com.example.pensamientoComputacional.service.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class RoleServiceImpl implements IRoleService {
    
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    
    @Autowired
    public RoleServiceImpl(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }
    
    @Override
    public Role createRole(Role role) {
        if (roleRepository.existsByName(role.getName())) {
            throw new BusinessException("Role with name " + role.getName() + " already exists");
        }
        
        validatePermissions(role.getPermissions());
        return roleRepository.save(role);
    }
    
    @Override
    public Role updateRole(Long id, Role role) {
        Role existingRole = roleRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Role not found with id: " + id));
            
        if (!existingRole.getName().equals(role.getName()) &&
            roleRepository.existsByName(role.getName())) {
            throw new BusinessException("Role with name " + role.getName() + " already exists");
        }
        
        validatePermissions(role.getPermissions());
        
        existingRole.setName(role.getName());
        existingRole.setDescription(role.getDescription());
        existingRole.setPermissions(role.getPermissions());
        
        return roleRepository.save(existingRole);
    }
    
    @Override
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Role not found with id: " + id));
        roleRepository.delete(role);
    }
    
    @Override
    public Role getRole(Long id) {
        return roleRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Role not found with id: " + id));
    }
    
    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
    
    @Override
    public Role findByName(String name) {
        return roleRepository.findByName(name)
            .orElseThrow(() -> new BusinessException("Role not found with name: " + name));
    }
    
    @Override
    public Role addPermissionToRole(Long roleId, Long permissionId) {
        Role role = getRole(roleId);
        Permission permission = permissionRepository.findById(permissionId)
            .orElseThrow(() -> new BusinessException("Permission not found with id: " + permissionId));
            
        role.addPermission(permission);
        return roleRepository.save(role);
    }
    
    @Override
    public List<Role> getRolesByPermission(Long permissionId) {
        return roleRepository.findByPermissionId(permissionId);
    }
    
    @Override
    public List<Role> getRolesWithoutPermissions() {
        return roleRepository.findRolesWithoutPermissions();
    }
    
    private void validatePermissions(Set<Permission> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            throw new BusinessException("Role must have at least one permission");
        }
        
        for (Permission permission : permissions) {
            if (!permissionRepository.existsById(permission.getId())) {
                throw new BusinessException("Permission not found with id: " + permission.getId());
            }
        }
    }
}
