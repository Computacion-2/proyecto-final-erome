package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.StudentMapper;
import com.example.pensamientoComputacional.model.dto.StudentDto;
import com.example.pensamientoComputacional.model.entities.Student;
import com.example.pensamientoComputacional.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
@Tag(name = "Students", description = "Gestión de estudiantes")
@SecurityRequirement(name = "bearerAuth")
public class StudentRestController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentMapper studentMapper;

    @GetMapping
    @PreAuthorize("hasAuthority('READ_USER') or hasRole('ADMIN') or hasRole('PROFESSOR')")
    public ResponseEntity<List<StudentDto>> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        List<StudentDto> studentDtos = students.stream()
                .map(studentMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(studentDtos);
    }

    @GetMapping("/group/{groupName}")
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    @Operation(summary = "Obtener estudiantes por grupo", description = "Retorna todos los estudiantes de un grupo específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de estudiantes obtenida exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes")
    })
    public ResponseEntity<List<StudentDto>> getStudentsByGroup(@PathVariable String groupName) {
        List<Student> students = studentRepository.findAll().stream()
                .filter(student -> {
                    String studentGroup = student.getUser().getGroup();
                    return studentGroup != null && studentGroup.equalsIgnoreCase(groupName);
                })
                .collect(Collectors.toList());
        
        List<StudentDto> studentDtos = students.stream()
                .map(studentMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(studentDtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_USER') or hasRole('ADMIN')")
    public ResponseEntity<StudentDto> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(student -> ResponseEntity.ok(studentMapper.entityToDto(student)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    public ResponseEntity<StudentDto> createStudent(@Valid @RequestBody StudentDto studentDto) {
        Student student = studentMapper.dtoToEntity(studentDto);
        Student savedStudent = studentRepository.save(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(studentMapper.entityToDto(savedStudent));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    public ResponseEntity<StudentDto> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentDto studentDto) {
        return studentRepository.findById(id)
                .map(existingStudent -> {
                    studentDto.setId(id);
                    Student student = studentMapper.dtoToEntity(studentDto);
                    Student updatedStudent = studentRepository.save(student);
                    return ResponseEntity.ok(studentMapper.entityToDto(updatedStudent));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
