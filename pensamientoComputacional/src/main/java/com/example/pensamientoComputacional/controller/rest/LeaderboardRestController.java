package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.model.dto.StudentDto;
import com.example.pensamientoComputacional.model.entities.Resolution;
import com.example.pensamientoComputacional.model.entities.Student;
import com.example.pensamientoComputacional.mapper.StudentMapper;
import com.example.pensamientoComputacional.repository.ResolutionRepository;
import com.example.pensamientoComputacional.repository.StudentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*")
@Tag(name = "Leaderboard", description = "Tablero de clasificación")
@SecurityRequirement(name = "bearerAuth")
public class LeaderboardRestController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentMapper studentMapper;

    @Autowired
    private ResolutionRepository resolutionRepository;

    @GetMapping("/group/{groupName}")
    @Operation(summary = "Obtener leaderboard por grupo", description = "Retorna el top 5 de estudiantes de un grupo específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Leaderboard obtenido exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<List<StudentDto>> getGroupLeaderboard(@PathVariable String groupName) {
        // Get all students in the group
        List<Student> students = studentRepository.findAll().stream()
                .filter(student -> {
                    String studentGroup = student.getUser().getGroup();
                    return studentGroup != null && studentGroup.equals(groupName);
                })
                .collect(Collectors.toList());

        // Calculate total points for each student
        Map<Long, Integer> studentPoints = new HashMap<>();
        List<Resolution> resolutions = resolutionRepository.findAll();
        
        for (Resolution resolution : resolutions) {
            if (resolution.getPointsAwarded() != null && resolution.getStatus().equals("COMPLETED")) {
                Long studentId = resolution.getStudent().getId();
                studentPoints.put(studentId, 
                    studentPoints.getOrDefault(studentId, 0) + resolution.getPointsAwarded());
            }
        }

        // Sort students by points (descending) and get top 5
        List<StudentDto> leaderboard = students.stream()
                .map(student -> {
                    StudentDto dto = studentMapper.entityToDto(student);
                    // Set total points if available (would need to add this to StudentDto or query StudentPerformance)
                    return dto;
                })
                .sorted((s1, s2) -> {
                    int points1 = studentPoints.getOrDefault(s1.getId(), 0);
                    int points2 = studentPoints.getOrDefault(s2.getId(), 0);
                    return Integer.compare(points2, points1);
                })
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    @Operation(summary = "Obtener leaderboard de todos los grupos", description = "Retorna el top 5 de estudiantes de todos los grupos (solo profesores)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Leaderboard obtenido exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes")
    })
    public ResponseEntity<Map<String, List<StudentDto>>> getAllGroupsLeaderboard() {
        Map<String, List<StudentDto>> allLeaderboards = new HashMap<>();
        
        // Get all unique group names
        Set<String> groupNames = studentRepository.findAll().stream()
                .map(student -> student.getUser().getGroup())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Calculate leaderboard for each group
        for (String groupName : groupNames) {
            ResponseEntity<List<StudentDto>> groupLeaderboard = getGroupLeaderboard(groupName);
            allLeaderboards.put(groupName, groupLeaderboard.getBody());
        }

        return ResponseEntity.ok(allLeaderboards);
    }
}

