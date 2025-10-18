package com.example.pensamientoComputacional.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDto {
    
    private Long id;
    private String name;
    private String description;
    private Set<PermissionDto> permissions;
    
    // For creation/update requests
    private Set<Long> permissionIds;
}
