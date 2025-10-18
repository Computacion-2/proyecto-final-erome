package com.example.pensamientoComputacional.mapper;

import com.example.pensamientoComputacional.model.dto.StudentDto;
import com.example.pensamientoComputacional.model.entities.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface StudentMapper {
    
    @Mapping(target = "userId", source = "user.id")
    StudentDto entityToDto(Student student);
    
    @Mapping(target = "user", ignore = true)
    Student dtoToEntity(StudentDto studentDto);
}
