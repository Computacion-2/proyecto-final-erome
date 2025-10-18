package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.GroupDto;
import com.example.pensamientoComputacional.model.entities.Group;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {SemesterMapper.class})
public interface GroupMapper {
    
    @Mapping(target = "semesterId", source = "semester.id")
    GroupDto entityToDto(Group group);
    
    @Mapping(target = "semester", ignore = true)
    Group dtoToEntity(GroupDto groupDto);
}
