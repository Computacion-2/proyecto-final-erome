package com.example.pensamientoComputacional.service;

import com.example.pensamientoComputacional.model.entities.Permission;
import java.util.List;

public interface IPermissionService {
    Permission createPermission(Permission permission);
    Permission updatePermission(Long id, Permission permission);
    void deletePermission(Long id);
    Permission getPermission(Long id);
    List<Permission> getAllPermissions();
    Permission findByName(String name);
}
