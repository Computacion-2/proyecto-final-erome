package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.ExerciseDto;
import com.example.pensamientoComputacional.model.entities.Exercise;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ActivityMapper.class})
public interface ExerciseMapper {
    
    @Mapping(target = "activityId", source = "activity.id")
    ExerciseDto entityToDto(Exercise exercise);
    
    @Mapping(target = "activity", ignore = true)
    Exercise dtoToEntity(ExerciseDto exerciseDto);
}
