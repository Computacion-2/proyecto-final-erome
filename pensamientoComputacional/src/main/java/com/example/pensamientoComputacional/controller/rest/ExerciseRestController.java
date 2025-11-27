package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.ExerciseMapper;
import com.example.pensamientoComputacional.model.dto.ExerciseDto;
import com.example.pensamientoComputacional.model.entities.Activity;
import com.example.pensamientoComputacional.model.entities.Exercise;
import com.example.pensamientoComputacional.repository.ActivityRepository;
import com.example.pensamientoComputacional.repository.ExerciseRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = "*")
@Tag(name = "Exercises", description = "Gestión de ejercicios")
@SecurityRequirement(name = "bearerAuth")
public class ExerciseRestController {

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseMapper exerciseMapper;

    @Autowired
    private ActivityRepository activityRepository;

    @GetMapping
    @Operation(summary = "Obtener todos los ejercicios", description = "Retorna una lista de todos los ejercicios")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de ejercicios obtenida exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<List<ExerciseDto>> getAllExercises() {
        List<Exercise> exercises = exerciseRepository.findAll();
        List<ExerciseDto> exerciseDtos = exercises.stream()
                .map(exerciseMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(exerciseDtos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener ejercicio por ID", description = "Retorna un ejercicio específico por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ejercicio obtenido exitosamente"),
            @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<ExerciseDto> getExerciseById(@PathVariable Long id) {
        return exerciseRepository.findById(id)
                .map(exercise -> ResponseEntity.ok(exerciseMapper.entityToDto(exercise)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/activity/{activityId}")
    @Operation(summary = "Obtener ejercicios por actividad", description = "Retorna todos los ejercicios de una actividad específica")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de ejercicios obtenida exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<List<ExerciseDto>> getExercisesByActivity(@PathVariable Long activityId) {
        List<Exercise> exercises = exerciseRepository.findAll().stream()
                .filter(exercise -> exercise.getActivity().getId().equals(activityId))
                .collect(Collectors.toList());

        List<ExerciseDto> exerciseDtos = exercises.stream()
                .map(exerciseMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(exerciseDtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    @Operation(summary = "Crear ejercicio", description = "Crea un nuevo ejercicio (solo profesores)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Ejercicio creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<ExerciseDto> createExercise(@RequestBody ExerciseDto exerciseDto) {
        try {
            // Validate required fields
            if (exerciseDto.getTitle() == null || exerciseDto.getTitle().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            if (exerciseDto.getStatement() == null || exerciseDto.getStatement().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            if (exerciseDto.getDifficulty() == null || exerciseDto.getDifficulty() < 1 || exerciseDto.getDifficulty() > 10) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            if (exerciseDto.getMaxPoints() == null || exerciseDto.getMaxPoints() < 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            
            Exercise exercise = exerciseMapper.dtoToEntity(exerciseDto);
            
            // Activity is optional - exercises can be created first and assigned to activities later
            // Only set activity if activityId is provided and > 0
            if (exerciseDto.getActivityId() != null && exerciseDto.getActivityId() > 0) {
                Activity activity = activityRepository.findById(exerciseDto.getActivityId())
                        .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));
                exercise.setActivity(activity);
            }

            Exercise savedExercise = exerciseRepository.save(exercise);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(exerciseMapper.entityToDto(savedExercise));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    @Operation(summary = "Actualizar ejercicio", description = "Actualiza un ejercicio existente (solo profesores)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ejercicio actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes")
    })
    public ResponseEntity<ExerciseDto> updateExercise(@PathVariable Long id,
            @RequestBody ExerciseDto exerciseDto) {
        try {
            return exerciseRepository.findById(id)
                    .map(existingExercise -> {
                    // IMPORTANT: Get the existing activity ID before any updates
                    // This ensures we preserve it even if the DTO doesn't include it
                    Long existingActivityId = existingExercise.getActivity() != null 
                            ? existingExercise.getActivity().getId() 
                            : null;
                    
                    System.out.println("=== UPDATE EXERCISE DEBUG ===");
                    System.out.println("Exercise ID: " + id);
                    System.out.println("Existing Activity ID: " + existingActivityId);
                    System.out.println("DTO Activity ID: " + exerciseDto.getActivityId());
                    System.out.println("DTO Title: " + exerciseDto.getTitle());
                    
                    exerciseDto.setId(id);

                    // Only update activity if activityId is explicitly provided and > 0
                    // If activityId is null, 0, or not provided, preserve the existing activity
                    if (exerciseDto.getActivityId() != null && exerciseDto.getActivityId() > 0) {
                        // User wants to change the activity
                        System.out.println("Changing activity to: " + exerciseDto.getActivityId());
                        Activity activity = activityRepository.findById(exerciseDto.getActivityId())
                                .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));
                        existingExercise.setActivity(activity);
                    } else if (existingActivityId != null) {
                        // Preserve the existing activity - reload it from database
                        System.out.println("Preserving existing activity: " + existingActivityId);
                        Activity existingActivity = activityRepository.findById(existingActivityId)
                                .orElse(null);
                        if (existingActivity != null) {
                            existingExercise.setActivity(existingActivity);
                            System.out.println("Activity preserved successfully");
                        } else {
                            System.out.println("WARNING: Existing activity not found in database!");
                        }
                    } else {
                        System.out.println("No activity to preserve (exercise has no activity)");
                    }
                    // If both are null, exercise has no activity (which is allowed)

                    // Update other fields only if provided
                    if (exerciseDto.getTitle() != null && !exerciseDto.getTitle().trim().isEmpty()) {
                        existingExercise.setTitle(exerciseDto.getTitle());
                    }
                    if (exerciseDto.getStatement() != null && !exerciseDto.getStatement().trim().isEmpty()) {
                        existingExercise.setStatement(exerciseDto.getStatement());
                    }
                    if (exerciseDto.getDifficulty() != null) {
                        existingExercise.setDifficulty(exerciseDto.getDifficulty());
                    }
                    if (exerciseDto.getMaxPoints() != null) {
                        existingExercise.setMaxPoints(exerciseDto.getMaxPoints());
                    }

                    Exercise updatedExercise = exerciseRepository.save(existingExercise);
                    System.out.println("Final Activity ID after save: " + 
                            (updatedExercise.getActivity() != null ? updatedExercise.getActivity().getId() : "null"));
                    System.out.println("=== END UPDATE EXERCISE DEBUG ===");
                    return ResponseEntity.ok(exerciseMapper.entityToDto(updatedExercise));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            System.err.println("Error updating exercise: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            System.err.println("Unexpected error updating exercise: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    @Operation(summary = "Eliminar ejercicio", description = "Elimina un ejercicio (solo profesores)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Ejercicio eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes")
    })
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        if (!exerciseRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        exerciseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
