package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.UserDto;
import com.example.pensamientoComputacional.model.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface UserMapper {
    
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roleIds", ignore = true)
    @Mapping(target = "role", source = "user", qualifiedByName = "extractPrimaryRole")
    @Mapping(target = "studentRole", ignore = true)
    @Mapping(target = "performanceCategory", ignore = true)
    @Mapping(target = "totalPoints", ignore = true)
    @Mapping(target = "groups", source = "user", qualifiedByName = "extractProfessorGroups")
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
    
    @Named("extractPrimaryRole")
    default String extractPrimaryRole(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return null;
        }
        // Return the first role name (usually there's only one)
        return user.getRoles().iterator().next().getName();
    }
    
    @Named("extractProfessorGroups")
    default List<String> extractProfessorGroups(User user) {
        // This mapping will be handled in the controller/service layer
        // since User entity doesn't have direct access to Professor
        return null;
    }
}
