package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.ResolutionDto;
import com.example.pensamientoComputacional.model.entities.Resolution;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {StudentMapper.class, ExerciseMapper.class, ProfessorMapper.class})
public interface ResolutionMapper {
    
    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "exerciseId", source = "exercise.id")
    @Mapping(target = "awardedBy", source = "awardedBy.id")
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "exercise", ignore = true)
    @Mapping(target = "awardedByProfessor", ignore = true)
    ResolutionDto entityToDto(Resolution resolution);
    
    @Mapping(target = "student", ignore = true)
    @Mapping(target = "exercise", ignore = true)
    @Mapping(target = "awardedBy", ignore = true)
    @Mapping(target = "code", ignore = true)
    Resolution dtoToEntity(ResolutionDto resolutionDto);
}

