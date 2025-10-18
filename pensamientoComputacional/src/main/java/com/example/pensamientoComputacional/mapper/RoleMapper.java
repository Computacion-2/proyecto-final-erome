package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.RoleDto;
import com.example.pensamientoComputacional.model.entities.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {PermissionMapper.class})
public interface RoleMapper {
    
    @Mapping(target = "permissionIds", ignore = true)
    RoleDto entityToDto(Role role);
    
    @Mapping(target = "permissions", ignore = true)
    Role dtoToEntity(RoleDto roleDto);
}
