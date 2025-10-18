package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.PermissionDto;
import com.example.pensamientoComputacional.model.entities.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    
    PermissionDto entityToDto(Permission permission);
    
    Permission dtoToEntity(PermissionDto permissionDto);
}
