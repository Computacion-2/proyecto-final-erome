package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.ActivityMapper;
import com.example.pensamientoComputacional.model.dto.ActivityDto;
import com.example.pensamientoComputacional.model.entities.Activity;
import com.example.pensamientoComputacional.model.entities.Group;
import com.example.pensamientoComputacional.model.entities.Professor;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.repository.ActivityRepository;
import com.example.pensamientoComputacional.repository.GroupRepository;
import com.example.pensamientoComputacional.repository.ProfessorRepository;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "*")
@Tag(name = "Activities", description = "Gestión de actividades")
@SecurityRequirement(name = "bearerAuth")
public class ActivityRestController {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private ActivityMapper activityMapper;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private IUserService userService;

    @GetMapping
    @Operation(summary = "Obtener todas las actividades", description = "Retorna una lista de todas las actividades")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de actividades obtenida exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<List<ActivityDto>> getAllActivities() {
        List<Activity> activities = activityRepository.findAll();
        List<ActivityDto> activityDtos = activities.stream()
                .map(activityMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(activityDtos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener actividad por ID", description = "Retorna una actividad específica por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Actividad obtenida exitosamente"),
            @ApiResponse(responseCode = "404", description = "Actividad no encontrada"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<ActivityDto> getActivityById(@PathVariable Long id) {
        return activityRepository.findById(id)
                .map(activity -> ResponseEntity.ok(activityMapper.entityToDto(activity)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    @Operation(summary = "Obtener actividades activas", description = "Retorna las actividades que están actualmente activas")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de actividades activas obtenida exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<List<ActivityDto>> getActiveActivities() {
        LocalDateTime now = LocalDateTime.now();
        List<Activity> activities = activityRepository.findAll().stream()
                .filter(activity -> {
                    LocalDateTime start = activity.getStartTime();
                    LocalDateTime end = activity.getEndTime();
                    return now.isAfter(start) && now.isBefore(end) && "ACTIVE".equals(activity.getStatus());
                })
                .collect(Collectors.toList());
        
        List<ActivityDto> activityDtos = activities.stream()
                .map(activityMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(activityDtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    @Operation(summary = "Crear actividad", description = "Crea una nueva actividad (solo profesores)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Actividad creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes")
    })
    public ResponseEntity<ActivityDto> createActivity(@RequestBody ActivityDto activityDto) {
        try {
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

            Group group = groupRepository.findById(activityDto.getGroupId())
                    .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));

            Activity activity = activityMapper.dtoToEntity(activityDto);
            activity.setProfessor(professor);
            activity.setGroup(group);
            
            if (activity.getStatus() == null) {
                activity.setStatus("PENDING");
            }
            
            // Set default start and end times if not provided
            if (activity.getStartTime() == null) {
                activity.setStartTime(LocalDateTime.now());
            }
            if (activity.getEndTime() == null) {
                activity.setEndTime(LocalDateTime.now().plusDays(7)); // Default: 7 days from now
            }

            Activity savedActivity = activityRepository.save(activity);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(activityMapper.entityToDto(savedActivity));
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
    @Operation(summary = "Actualizar actividad", description = "Actualiza una actividad existente (solo profesores)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Actividad actualizada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Actividad no encontrada"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes")
    })
    public ResponseEntity<ActivityDto> updateActivity(@PathVariable Long id, @Valid @RequestBody ActivityDto activityDto) {
        return activityRepository.findById(id)
                .map(existingActivity -> {
                    activityDto.setId(id);
                    
                    if (activityDto.getGroupId() != null) {
                        Group group = groupRepository.findById(activityDto.getGroupId())
                                .orElseThrow(() -> new RuntimeException("Grupo no encontrado"));
                        existingActivity.setGroup(group);
                    }
                    
                    if (activityDto.getTitle() != null) {
                        existingActivity.setTitle(activityDto.getTitle());
                    }
                    if (activityDto.getStartTime() != null) {
                        existingActivity.setStartTime(activityDto.getStartTime());
                    }
                    if (activityDto.getEndTime() != null) {
                        existingActivity.setEndTime(activityDto.getEndTime());
                    }
                    if (activityDto.getStatus() != null) {
                        existingActivity.setStatus(activityDto.getStatus());
                    }

                    Activity updatedActivity = activityRepository.save(existingActivity);
                    return ResponseEntity.ok(activityMapper.entityToDto(updatedActivity));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROFESSOR') or hasRole('ADMIN')")
    @Operation(summary = "Eliminar actividad", description = "Elimina una actividad (solo profesores)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Actividad eliminada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Actividad no encontrada"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes")
    })
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        if (!activityRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        activityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

