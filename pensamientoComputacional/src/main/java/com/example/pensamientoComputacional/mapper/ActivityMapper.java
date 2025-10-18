package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.ActivityDto;
import com.example.pensamientoComputacional.model.entities.Activity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {GroupMapper.class, ProfessorMapper.class})
public interface ActivityMapper {
    
    @Mapping(target = "groupId", source = "group.id")
    @Mapping(target = "professorId", source = "professor.id")
    ActivityDto entityToDto(Activity activity);
    
    @Mapping(target = "group", ignore = true)
    @Mapping(target = "professor", ignore = true)
    Activity dtoToEntity(ActivityDto activityDto);
}
