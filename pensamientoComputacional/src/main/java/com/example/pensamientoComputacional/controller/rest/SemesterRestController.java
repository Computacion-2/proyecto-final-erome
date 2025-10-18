package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.SemesterMapper;
import com.example.pensamientoComputacional.model.dto.SemesterDto;
import com.example.pensamientoComputacional.model.entities.Semester;
import com.example.pensamientoComputacional.repository.SemesterRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/semesters")
@CrossOrigin(origins = "*")
public class SemesterRestController {

    @Autowired
    private SemesterRepository semesterRepository;

    @Autowired
    private SemesterMapper semesterMapper;

    @GetMapping
    @PreAuthorize("hasAuthority('READ_USER') or hasRole('ADMIN')")
    public ResponseEntity<List<SemesterDto>> getAllSemesters() {
        List<Semester> semesters = semesterRepository.findAll();
        List<SemesterDto> semesterDtos = semesters.stream()
                .map(semesterMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(semesterDtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_USER') or hasRole('ADMIN')")
    public ResponseEntity<SemesterDto> getSemesterById(@PathVariable Long id) {
        return semesterRepository.findById(id)
                .map(semester -> ResponseEntity.ok(semesterMapper.entityToDto(semester)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    public ResponseEntity<SemesterDto> createSemester(@Valid @RequestBody SemesterDto semesterDto) {
        Semester semester = semesterMapper.dtoToEntity(semesterDto);
        Semester savedSemester = semesterRepository.save(semester);
        return ResponseEntity.status(HttpStatus.CREATED).body(semesterMapper.entityToDto(savedSemester));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    public ResponseEntity<SemesterDto> updateSemester(@PathVariable Long id, @Valid @RequestBody SemesterDto semesterDto) {
        return semesterRepository.findById(id)
                .map(existingSemester -> {
                    semesterDto.setId(id);
                    Semester semester = semesterMapper.dtoToEntity(semesterDto);
                    Semester updatedSemester = semesterRepository.save(semester);
                    return ResponseEntity.ok(semesterMapper.entityToDto(updatedSemester));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSemester(@PathVariable Long id) {
        if (!semesterRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        semesterRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('READ_USER') or hasRole('ADMIN')")
    public ResponseEntity<List<SemesterDto>> getActiveSemesters() {
        List<Semester> activeSemesters = semesterRepository.findByIsActiveTrue();
        List<SemesterDto> semesterDtos = activeSemesters.stream()
                .map(semesterMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(semesterDtos);
    }
}
