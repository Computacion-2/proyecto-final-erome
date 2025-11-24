package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.ResolutionMapper;
import com.example.pensamientoComputacional.model.dto.ResolutionDto;
import com.example.pensamientoComputacional.model.entities.Exercise;
import com.example.pensamientoComputacional.model.entities.Professor;
import com.example.pensamientoComputacional.model.entities.Resolution;
import com.example.pensamientoComputacional.model.entities.Student;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.repository.ExerciseRepository;
import com.example.pensamientoComputacional.repository.ProfessorRepository;
import com.example.pensamientoComputacional.repository.ResolutionRepository;
import com.example.pensamientoComputacional.repository.StudentRepository;
import com.example.pensamientoComputacional.service.IUserService;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resolutions")
@CrossOrigin(origins = "*")
@Tag(name = "Resolutions", description = "Gestión de resoluciones de ejercicios")
@SecurityRequirement(name = "bearerAuth")
public class ResolutionRestController {

    @Autowired
    private ResolutionRepository resolutionRepository;

    @Autowired
    private ResolutionMapper resolutionMapper;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private IUserService userService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    @Operation(summary = "Enviar resolución", description = "Envía una resolución de ejercicio (solo estudiantes)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Resolución enviada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes")
    })
    public ResponseEntity<ResolutionDto> submitResolution(@Valid @RequestBody ResolutionDto resolutionDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Student student = studentRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no es un estudiante"));

        Exercise exercise = exerciseRepository.findById(resolutionDto.getExerciseId())
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        // Count previous attempts
        long attemptCount = resolutionRepository.findAll().stream()
                .filter(r -> r.getStudent().getId().equals(student.getId()) 
                        && r.getExercise().getId().equals(exercise.getId()))
                .count();

        Resolution resolution = resolutionMapper.dtoToEntity(resolutionDto);
        resolution.setStudent(student);
        resolution.setExercise(exercise);
        resolution.setAttemptNo((int) (attemptCount + 1));
        resolution.setStatus("PENDING");
        if (resolution.getCode() == null) {
            resolution.setCode("");
        }

        Resolution savedResolution = resolutionRepository.save(resolution);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resolutionMapper.entityToDto(savedResolution));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Obtener resoluciones de un estudiante", description = "Retorna todas las resoluciones de un estudiante específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de resoluciones obtenida exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<List<ResolutionDto>> getStudentResolutions(@PathVariable Long studentId) {
        List<Resolution> resolutions = resolutionRepository.findAll().stream()
                .filter(r -> r.getStudent().getId().equals(studentId))
                .collect(Collectors.toList());
        
        List<ResolutionDto> resolutionDtos = resolutions.stream()
                .map(resolutionMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resolutionDtos);
    }

    @GetMapping("/activity/{activityId}")
    @Operation(summary = "Obtener resoluciones de una actividad", description = "Retorna todas las resoluciones de una actividad específica")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de resoluciones obtenida exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<List<ResolutionDto>> getActivityResolutions(@PathVariable Long activityId) {
        List<Resolution> resolutions = resolutionRepository.findAll().stream()
                .filter(r -> r.getExercise().getActivity().getId().equals(activityId))
                .collect(Collectors.toList());
        
        List<ResolutionDto> resolutionDtos = resolutions.stream()
                .map(resolutionMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resolutionDtos);
    }

    @PutMapping("/{id}/points")
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    @Operation(summary = "Asignar puntos", description = "Asigna puntos a una resolución (solo profesores)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Puntos asignados exitosamente"),
            @ApiResponse(responseCode = "404", description = "Resolución no encontrada"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes")
    })
    public ResponseEntity<ResolutionDto> assignPoints(
            @PathVariable Long id,
            @RequestBody ResolutionDto resolutionDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Professor professor = professorRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no es un profesor"));

        return resolutionRepository.findById(id)
                .map(existingResolution -> {
                    if (resolutionDto.getPointsAwarded() != null) {
                        existingResolution.setPointsAwarded(resolutionDto.getPointsAwarded());
                    }
                    existingResolution.setAwardedBy(professor);
                    existingResolution.setStatus("COMPLETED");

                    Resolution updatedResolution = resolutionRepository.save(existingResolution);
                    return ResponseEntity.ok(resolutionMapper.entityToDto(updatedResolution));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

