package com.example.pensamientoComputacional.service.impl;

import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.repository.PermissionRepository;
import com.example.pensamientoComputacional.service.IPermissionService;
import com.example.pensamientoComputacional.service.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class PermissionServiceImpl implements IPermissionService {
    
    private final PermissionRepository permissionRepository;
    
    @Autowired
    public PermissionServiceImpl(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }
    
    @Override
    public Permission createPermission(Permission permission) {
        if (permissionRepository.existsByName(permission.getName())) {
            throw new BusinessException("Permission with name " + permission.getName() + " already exists");
        }
        return permissionRepository.save(permission);
    }
    
    @Override
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
    
    @Override
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Permission not found with id: " + id));
        permissionRepository.delete(permission);
    }
    
    @Override
    public Permission getPermission(Long id) {
        return permissionRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Permission not found with id: " + id));
    }
    
    @Override
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }
    
    @Override
    public Permission findByName(String name) {
        return permissionRepository.findByName(name)
            .orElseThrow(() -> new BusinessException("Permission not found with name: " + name));
    }
}
