package com.example.pensamientoComputacional.service;

import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.repository.PermissionRepository;
import com.example.pensamientoComputacional.service.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PermissionService {
    
    private final PermissionRepository permissionRepository;
    
    @Autowired
    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }
    
    public Permission createPermission(Permission permission) {
        if (permissionRepository.existsByName(permission.getName())) {
            throw new BusinessException("Permission with name " + permission.getName() + " already exists");
        }
        return permissionRepository.save(permission);
    }
    
    public Permission updatePermission(Long id, Permission permission) {
        Permission existingPermission = permissionRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Permission not found with id: " + id));
            
        if (!existingPermission.getName().equals(permission.getName()) &&
            permissionRepository.existsByName(permission.getName())) {
            throw new BusinessException("Permission with name " + permission.getName() + " already exists");
        }
        
        existingPermission.setName(permission.getName());
        existingPermission.setDescription(permission.getDescription());
        
        return permissionRepository.save(existingPermission);
    }
    
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Permission not found with id: " + id));
        permissionRepository.delete(permission);
    }
    
    public Permission getPermission(Long id) {
        return permissionRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Permission not found with id: " + id));
    }
    
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }
    
    public Permission findByName(String name) {
        return permissionRepository.findByName(name)
            .orElseThrow(() -> new BusinessException("Permission not found with name: " + name));
    }
}
