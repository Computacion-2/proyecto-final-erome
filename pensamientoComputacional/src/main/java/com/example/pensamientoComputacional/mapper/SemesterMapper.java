package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.SemesterDto;
import com.example.pensamientoComputacional.model.entities.Semester;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SemesterMapper {
    
    SemesterDto entityToDto(Semester semester);
    
    Semester dtoToEntity(SemesterDto semesterDto);
}
