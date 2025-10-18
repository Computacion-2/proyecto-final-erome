package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.UserDto;
import com.example.pensamientoComputacional.model.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface UserMapper {
    
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roleIds", ignore = true)
    UserDto entityToDto(User user);
    
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    User dtoToEntity(UserDto userDto);
    
    @Named("roleIdsToRoles")
    default Set<Long> extractRoleIds(User user) {
        if (user.getRoles() == null) {
            return null;
        }
        return user.getRoles().stream()
                .map(role -> role.getId())
                .collect(Collectors.toSet());
    }
}
