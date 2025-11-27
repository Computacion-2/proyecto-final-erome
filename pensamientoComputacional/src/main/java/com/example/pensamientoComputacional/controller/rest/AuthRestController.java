package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.UserMapper;
import com.example.pensamientoComputacional.model.dto.LoginRequest;
import com.example.pensamientoComputacional.model.dto.LoginResponse;
import com.example.pensamientoComputacional.model.dto.RegisterRequest;
import com.example.pensamientoComputacional.model.dto.TokenRefreshRequest;
import com.example.pensamientoComputacional.model.dto.TokenRefreshResponse;
import com.example.pensamientoComputacional.model.dto.UserDto;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.security.JwtTokenProvider;
import com.example.pensamientoComputacional.service.AuthService;
import com.example.pensamientoComputacional.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Authentication", description = "Endpoints para autenticación y gestión de tokens JWT")
public class AuthRestController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthService authService;

    @Autowired
    private IUserService userService;

    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private com.example.pensamientoComputacional.repository.ProfessorRepository professorRepository;
    
    @Autowired
    private com.example.pensamientoComputacional.repository.ProfessorAssignmentRepository professorAssignmentRepository;
    
    @Autowired
    private com.example.pensamientoComputacional.repository.StudentRepository studentRepository;
    
    @Autowired
    private com.example.pensamientoComputacional.repository.StudentEnrollmentRepository studentEnrollmentRepository;
    
    @Autowired
    private com.example.pensamientoComputacional.repository.StudentPerformanceRepository studentPerformanceRepository;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y retorna tokens JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login exitoso", content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<LoginResponse> login(
            @Parameter(description = "Credenciales de login", required = true) @Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userService.findByEmail(loginRequest.getEmail());
            String token = tokenProvider.generateToken(user);

            String refreshToken = tokenProvider.generateRefreshToken(user);

            // Map user to DTO and enrich with group information
            UserDto userDto = userMapper.entityToDto(user);
            enrichUserDtoWithGroups(userDto, user);

            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setRefreshToken(refreshToken);
            response.setUser(userDto);
            response.setExpiresIn(86400000L); // 24 hours in milliseconds

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar usuario", description = "Registra un nuevo usuario en el sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente", content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "409", description = "El correo ya está registrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserDto> register(
            @Parameter(description = "Datos del nuevo usuario", required = true) @Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // El AuthService ahora maneja todo: crear usuario, asignar grupo, y crear Student si aplica
            User user = authService.registerUser(
                    registerRequest.getName(),
                    registerRequest.getEmail(),
                    registerRequest.getPassword(),
                    registerRequest.getRole(),
                    registerRequest.getGroup(),
                    registerRequest.getStudentRole());

            UserDto userDto = userMapper.entityToDto(user);
            enrichUserDtoWithGroups(userDto, user);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(userDto);
        } catch (com.example.pensamientoComputacional.service.exception.BusinessException be) {
            // Caso típico: correo ya existe u otra validación de negocio
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión", description = "Cierra la sesión del usuario actual")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Logout exitoso"),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Void> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar token", description = "Renueva el token de acceso usando el refresh token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token renovado exitosamente", content = @Content(schema = @Schema(implementation = TokenRefreshResponse.class))),
            @ApiResponse(responseCode = "401", description = "Refresh token inválido o expirado"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<TokenRefreshResponse> refreshToken(
            @Parameter(description = "Refresh token para renovar", required = true) @Valid @RequestBody TokenRefreshRequest refreshRequest) {
        try {
            String refreshToken = refreshRequest.getRefreshToken();

            if (!tokenProvider.validateToken(refreshToken) || !tokenProvider.isRefreshToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String email = tokenProvider.getUserEmailFromToken(refreshToken);
            User user = userService.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String newAccessToken = tokenProvider.generateToken(user);
            String newRefreshToken = tokenProvider.generateRefreshToken(user);

            TokenRefreshResponse response = new TokenRefreshResponse(
                    newAccessToken,
                    newRefreshToken,
                    86400000L // 24 hours in milliseconds
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener usuario actual", description = "Obtiene la información del usuario autenticado")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario obtenido exitosamente", content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserDto> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            User user = userService.findByEmail(email);
            if (user != null) {
                UserDto userDto = userMapper.entityToDto(user);
                enrichUserDtoWithGroups(userDto, user);
                return ResponseEntity.ok(userDto);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    
    /**
     * Enriches UserDto with group information from StudentEnrollment or ProfessorAssignment
     */
    private void enrichUserDtoWithGroups(UserDto userDto, User user) {
        if (userDto.getRole() != null) {
            String roleUpper = userDto.getRole().toUpperCase();
            
            if ("PROFESSOR".equals(roleUpper)) {
                // Get professor groups from ProfessorAssignment
                com.example.pensamientoComputacional.model.entities.Professor professor = 
                    professorRepository.findById(user.getId()).orElse(null);
                if (professor != null) {
                    List<com.example.pensamientoComputacional.model.entities.ProfessorAssignment> assignments = 
                        professorAssignmentRepository.findByProfessorId(professor.getId());
                    List<String> groupNames = assignments.stream()
                            .map(assignment -> assignment.getGroup().getName())
                            .collect(java.util.stream.Collectors.toList());
                    userDto.setGroups(groupNames);
                }
            } else if ("STUDENT".equals(roleUpper)) {
                // Get student's group from StudentEnrollment (preferred) or User.group (fallback)
                com.example.pensamientoComputacional.model.entities.Student student = 
                    studentRepository.findById(user.getId()).orElse(null);
                if (student != null) {
                    List<com.example.pensamientoComputacional.model.entities.StudentEnrollment> enrollments = 
                        studentEnrollmentRepository.findByStudentAndIsActiveTrue(student);
                    if (!enrollments.isEmpty()) {
                        // Use the first active enrollment's group
                        String groupName = enrollments.get(0).getGroup().getName();
                        userDto.setGroup(groupName);
                    } else {
                        // Fallback to User.group if no enrollment found
                        String userGroup = user.getGroup();
                        if (userGroup != null && !userGroup.isEmpty()) {
                            userDto.setGroup(userGroup);
                        }
                    }
                    
                    // Get totalPoints from StudentPerformance
                    com.example.pensamientoComputacional.model.entities.StudentPerformance performance = 
                        studentPerformanceRepository.findByStudent(student);
                    if (performance != null) {
                        userDto.setTotalPoints(performance.getTotalPoints());
                        userDto.setPerformanceCategory(performance.getCategory());
                    }
                } else {
                    // If student entity doesn't exist, use User.group
                    String userGroup = user.getGroup();
                    if (userGroup != null && !userGroup.isEmpty()) {
                        userDto.setGroup(userGroup);
                    }
                }
            }
        }
    }
}
