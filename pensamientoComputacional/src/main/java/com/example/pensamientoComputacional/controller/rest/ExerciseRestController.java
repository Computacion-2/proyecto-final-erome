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
import jakarta.validation.Valid;
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
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes")
    })
    public ResponseEntity<ExerciseDto> createExercise(@Valid @RequestBody ExerciseDto exerciseDto) {
        Activity activity = activityRepository.findById(exerciseDto.getActivityId())
                .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));

        Exercise exercise = exerciseMapper.dtoToEntity(exerciseDto);
        exercise.setActivity(activity);

        Exercise savedExercise = exerciseRepository.save(exercise);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(exerciseMapper.entityToDto(savedExercise));
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
    public ResponseEntity<ExerciseDto> updateExercise(@PathVariable Long id, @Valid @RequestBody ExerciseDto exerciseDto) {
        return exerciseRepository.findById(id)
                .map(existingExercise -> {
                    exerciseDto.setId(id);
                    
                    if (exerciseDto.getActivityId() != null) {
                        Activity activity = activityRepository.findById(exerciseDto.getActivityId())
                                .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));
                        existingExercise.setActivity(activity);
                    }
                    
                    if (exerciseDto.getTitle() != null) {
                        existingExercise.setTitle(exerciseDto.getTitle());
                    }
                    if (exerciseDto.getStatement() != null) {
                        existingExercise.setStatement(exerciseDto.getStatement());
                    }
                    if (exerciseDto.getDifficulty() != null) {
                        existingExercise.setDifficulty(exerciseDto.getDifficulty());
                    }
                    if (exerciseDto.getMaxPoints() != null) {
                        existingExercise.setMaxPoints(exerciseDto.getMaxPoints());
                    }

                    Exercise updatedExercise = exerciseRepository.save(existingExercise);
                    return ResponseEntity.ok(exerciseMapper.entityToDto(updatedExercise));
                })
                .orElse(ResponseEntity.notFound().build());
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

