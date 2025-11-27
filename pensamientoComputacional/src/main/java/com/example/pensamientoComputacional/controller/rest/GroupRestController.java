package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.GroupMapper;
import com.example.pensamientoComputacional.model.dto.GroupDto;
import com.example.pensamientoComputacional.model.entities.Group;
import com.example.pensamientoComputacional.repository.GroupRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
@Tag(name = "Groups", description = "Gestión de grupos")
@SecurityRequirement(name = "bearerAuth")
public class GroupRestController {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMapper groupMapper;

    @GetMapping
    @Operation(summary = "Obtener todos los grupos", description = "Retorna una lista de todos los grupos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de grupos obtenida exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<List<GroupDto>> getAllGroups() {
        List<Group> groups = groupRepository.findAll();
        List<GroupDto> groupDtos = groups.stream()
                .map(groupMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(groupDtos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener grupo por ID", description = "Retorna un grupo específico por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Grupo obtenido exitosamente"),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<GroupDto> getGroupById(@PathVariable Long id) {
        return groupRepository.findById(id)
                .map(group -> ResponseEntity.ok(groupMapper.entityToDto(group)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Obtener grupo por nombre", description = "Retorna un grupo específico por su nombre (ej: G1, G2)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Grupo obtenido exitosamente"),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado"),
            @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<GroupDto> getGroupByName(@PathVariable String name) {
        return groupRepository.findAll().stream()
                .filter(g -> g.getName().equalsIgnoreCase(name))
                .findFirst()
                .map(group -> ResponseEntity.ok(groupMapper.entityToDto(group)))
                .orElse(ResponseEntity.notFound().build());
    }
}

