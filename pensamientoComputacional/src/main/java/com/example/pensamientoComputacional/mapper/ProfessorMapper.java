package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.ProfessorDto;
import com.example.pensamientoComputacional.model.entities.Professor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ProfessorMapper {
    
    @Mapping(target = "userId", source = "user.id")
    ProfessorDto entityToDto(Professor professor);
    
    @Mapping(target = "user", ignore = true)
    Professor dtoToEntity(ProfessorDto professorDto);
}
