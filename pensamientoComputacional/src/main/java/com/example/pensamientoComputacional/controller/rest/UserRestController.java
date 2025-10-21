package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.UserMapper;
import com.example.pensamientoComputacional.model.dto.UserDto;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.security.RequirePermission;
import com.example.pensamientoComputacional.security.RequireRole;
import com.example.pensamientoComputacional.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
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
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Tag(name = "Users", description = "Gestión de usuarios del sistema")
@SecurityRequirement(name = "bearerAuth")
public class UserRestController {

    @Autowired
    private IUserService userService;

    @Autowired
    private UserMapper userMapper;

    @GetMapping
    @PreAuthorize("hasAuthority('READ_USER') or hasRole('ADMIN')")
    @Operation(summary = "Obtener todos los usuarios", description = "Retorna una lista de todos los usuarios del sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida exitosamente", content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDto> userDtos = users.stream()
                .map(userMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_USER') or hasRole('ADMIN')")
    @Operation(summary = "Obtener usuario por ID", description = "Retorna la información de un usuario específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado", content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserDto> getUserById(
            @Parameter(description = "ID del usuario", required = true) @PathVariable Long id) {
        User user = userService.getUser(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(userMapper.entityToDto(user));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    @Operation(summary = "Crear usuario", description = "Crea un nuevo usuario en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario creado exitosamente", content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes"),
            @ApiResponse(responseCode = "409", description = "Usuario ya existe"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserDto> createUser(
            @Parameter(description = "Datos del nuevo usuario", required = true) @Valid @RequestBody UserDto userDto) {
        User user = userMapper.dtoToEntity(userDto);
        User savedUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.entityToDto(savedUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UserDto userDto) {
        User existingUser = userService.getUser(id);
        if (existingUser == null) {
            return ResponseEntity.notFound().build();
        }

        userDto.setId(id);
        User user = userMapper.dtoToEntity(userDto);
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(userMapper.entityToDto(updatedUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_USER') or hasRole('ADMIN')")
    @Operation(summary = "Eliminar usuario", description = "Elimina un usuario del sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Usuario eliminado exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID del usuario", required = true) @PathVariable Long id) {
        User user = userService.getUser(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/role/{roleId}")
    @PreAuthorize("hasAuthority('READ_USER') or hasRole('ADMIN')")
    @Operation(summary = "Obtener usuarios por rol", description = "Retorna una lista de usuarios que tienen un rol específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida exitosamente", content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<List<UserDto>> getUsersByRole(
            @Parameter(description = "ID del rol", required = true) @PathVariable Long roleId) {
        List<User> users = userService.getUsersByRole(roleId);
        List<UserDto> userDtos = users.stream()
                .map(userMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/admin-only")
    @RequireRole({ "ADMIN" })
    public ResponseEntity<String> adminOnlyEndpoint() {
        return ResponseEntity.ok("This endpoint is only accessible to ADMIN users");
    }

    @GetMapping("/permission-required")
    @RequirePermission({ "READ_USER" })
    public ResponseEntity<String> permissionRequiredEndpoint() {
        return ResponseEntity.ok("This endpoint requires READ_USER permission");
    }
}
