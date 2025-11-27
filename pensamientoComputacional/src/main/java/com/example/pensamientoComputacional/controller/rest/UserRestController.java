package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.UserMapper;
import com.example.pensamientoComputacional.model.dto.UserDto;
import com.example.pensamientoComputacional.model.entities.*;
import com.example.pensamientoComputacional.repository.*;
import com.example.pensamientoComputacional.repository.StudentPerformanceRepository;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ProfessorRepository professorRepository;
    
    @Autowired
    private GroupRepository groupRepository;
    
    @Autowired
    private ProfessorAssignmentRepository professorAssignmentRepository;
    
    @Autowired
    private SemesterRepository semesterRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private StudentEnrollmentRepository studentEnrollmentRepository;
    
    @Autowired
    private StudentPerformanceRepository studentPerformanceRepository;

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
                .map(user -> {
                    UserDto dto = userMapper.entityToDto(user);
                    // Check roles to determine if user is a professor or student
                    boolean isProfessor = false;
                    boolean isStudent = false;
                    if (dto.getRole() != null) {
                        String roleUpper = dto.getRole().toUpperCase();
                        isProfessor = roleUpper.equals("PROFESSOR");
                        isStudent = roleUpper.equals("STUDENT");
                    } else {
                        // Check user roles directly
                        Set<Role> roles = user.getRoles();
                        if (roles != null) {
                            isProfessor = roles.stream()
                                    .anyMatch(role -> "PROFESSOR".equalsIgnoreCase(role.getName()));
                            isStudent = roles.stream()
                                    .anyMatch(role -> "STUDENT".equalsIgnoreCase(role.getName()));
                        }
                    }
                    
                    if (isProfessor) {
                        Professor professor = professorRepository.findById(user.getId()).orElse(null);
                        if (professor != null) {
                            List<ProfessorAssignment> assignments = professorAssignmentRepository.findByProfessorId(professor.getId());
                            System.out.println("Professor " + user.getId() + " has " + assignments.size() + " assignments");
                            List<String> groupNames = assignments.stream()
                                    .map(assignment -> {
                                        String name = assignment.getGroup().getName();
                                        System.out.println("Found group: " + name);
                                        return name;
                                    })
                                    .collect(Collectors.toList());
                            dto.setGroups(groupNames);
                            System.out.println("Setting groups for professor " + user.getId() + ": " + groupNames);
                        } else {
                            System.out.println("Professor entity not found for user " + user.getId());
                        }
                    } else if (isStudent) {
                        // Get student's group from StudentEnrollment (preferred) or User.group (fallback)
                        Student student = studentRepository.findById(user.getId()).orElse(null);
                        if (student != null) {
                            List<StudentEnrollment> enrollments = studentEnrollmentRepository.findByStudentAndIsActiveTrue(student);
                            if (!enrollments.isEmpty()) {
                                // Use the first active enrollment's group
                                String groupName = enrollments.get(0).getGroup().getName();
                                dto.setGroup(groupName);
                                System.out.println("Setting group for student " + user.getId() + " from enrollment: " + groupName);
                            } else {
                                // Fallback to User.group if no enrollment found
                                String userGroup = user.getGroup();
                                if (userGroup != null && !userGroup.isEmpty()) {
                                    dto.setGroup(userGroup);
                                    System.out.println("Setting group for student " + user.getId() + " from user.group: " + userGroup);
                                }
                            }
                            
                            // Get totalPoints from StudentPerformance
                            StudentPerformance performance = studentPerformanceRepository.findByStudent(student);
                            if (performance != null) {
                                dto.setTotalPoints(performance.getTotalPoints());
                                dto.setPerformanceCategory(performance.getCategory());
                            }
                        } else {
                            // If student entity doesn't exist, use User.group
                            String userGroup = user.getGroup();
                            if (userGroup != null && !userGroup.isEmpty()) {
                                dto.setGroup(userGroup);
                                System.out.println("Setting group for student " + user.getId() + " from user.group (no student entity): " + userGroup);
                            }
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.domainUser.id or hasAuthority('READ_USER') or hasRole('ADMIN')")
    @Operation(summary = "Obtener usuario por ID", description = "Retorna la información de un usuario específico. Los usuarios pueden ver su propio perfil.")
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
        UserDto dto = userMapper.entityToDto(user);
        // Add professor groups if user is a professor
        if (dto.getRole() != null && dto.getRole().equalsIgnoreCase("PROFESSOR")) {
            Professor professor = professorRepository.findById(id).orElse(null);
            if (professor != null) {
                List<ProfessorAssignment> assignments = professorAssignmentRepository.findByProfessorId(professor.getId());
                List<String> groupNames = assignments.stream()
                        .map(assignment -> assignment.getGroup().getName())
                        .collect(Collectors.toList());
                dto.setGroups(groupNames);
            }
        } else if (dto.getRole() != null && dto.getRole().equalsIgnoreCase("STUDENT")) {
            // Get student's group from StudentEnrollment (preferred) or User.group (fallback)
            Student student = studentRepository.findById(id).orElse(null);
            if (student != null) {
                List<StudentEnrollment> enrollments = studentEnrollmentRepository.findByStudentAndIsActiveTrue(student);
                if (!enrollments.isEmpty()) {
                    // Use the first active enrollment's group
                    String groupName = enrollments.get(0).getGroup().getName();
                    dto.setGroup(groupName);
                } else {
                    // Fallback to User.group if no enrollment found
                    String userGroup = user.getGroup();
                    if (userGroup != null && !userGroup.isEmpty()) {
                        dto.setGroup(userGroup);
                    }
                }
                
                // Get totalPoints from StudentPerformance
                StudentPerformance performance = studentPerformanceRepository.findByStudent(student);
                if (performance != null) {
                    dto.setTotalPoints(performance.getTotalPoints());
                    dto.setPerformanceCategory(performance.getCategory());
                }
            } else {
                // If student entity doesn't exist, use User.group
                String userGroup = user.getGroup();
                if (userGroup != null && !userGroup.isEmpty()) {
                    dto.setGroup(userGroup);
                }
            }
        }
        return ResponseEntity.ok(dto);
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
            @Parameter(description = "Datos del nuevo usuario", required = true) @RequestBody UserDto userDto) {
        try {
        User user = userMapper.dtoToEntity(userDto);
            
            // Set password if provided
            if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
                user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));
            } else {
                // Default password for admin-created users
                user.setPasswordHash(passwordEncoder.encode("changeme123"));
            }
            
            // Set role based on the role field in DTO
            if (userDto.getRole() != null) {
                String roleName = userDto.getRole().toUpperCase();
                Role role = roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.findByName("STUDENT").orElse(null));
                if (role != null) {
                    Set<Role> roles = new HashSet<>();
                    roles.add(role);
                    user.setRoles(roles);
                }
            }
            
            // Set active by default
            if (user.getIsActive() == null) {
                user.setIsActive(true);
            }
            
        User savedUser = userService.createUser(user);
        
        // Create Student entity if user is a student
        if ("STUDENT".equalsIgnoreCase(userDto.getRole())) {
            if (!studentRepository.existsById(savedUser.getId())) {
                Student newStudent = new Student();
                newStudent.setUser(savedUser);
                studentRepository.save(newStudent);
            }
        }
        
        // Create Professor entity if user is a professor
        if ("PROFESSOR".equalsIgnoreCase(userDto.getRole())) {
            if (!professorRepository.existsById(savedUser.getId())) {
                Professor newProfessor = new Professor();
                newProfessor.setUser(savedUser);
                professorRepository.save(newProfessor);
            }
        }
        
        // Handle student group enrollment if user is a student
        if ("STUDENT".equalsIgnoreCase(userDto.getRole()) && userDto.getGroup() != null && !userDto.getGroup().isEmpty()) {
            System.out.println("Processing student group enrollment for user " + savedUser.getId() + ": " + userDto.getGroup());
            
            Student student = studentRepository.findById(savedUser.getId())
                    .orElseThrow(() -> new RuntimeException("Student entity not found"));
            
            // Get active semester
            List<Semester> activeSemesters = semesterRepository.findByIsActiveTrue();
            Semester activeSemester = activeSemesters.isEmpty() ? null : activeSemesters.get(0);
            
            if (activeSemester == null) {
                System.out.println("WARNING: No active semester found. Cannot enroll student in group.");
            } else {
                // Find or create group
                Group group = groupRepository.findByName(userDto.getGroup())
                        .orElseGet(() -> {
                            List<Group> allGroups = groupRepository.findAll();
                            Group found = allGroups.stream()
                                    .filter(g -> g.getName().equalsIgnoreCase(userDto.getGroup()))
                                    .findFirst()
                                    .orElse(null);
                            
                            if (found == null) {
                                System.out.println("Group '" + userDto.getGroup() + "' not found. Creating it...");
                                Group newGroup = new Group();
                                newGroup.setName(userDto.getGroup());
                                newGroup.setSemester(activeSemester);
                                found = groupRepository.save(newGroup);
                                System.out.println("Created new group: " + found.getName() + " (ID: " + found.getId() + ")");
                            }
                            
                            return found;
                        });
                
                if (group != null) {
                    // Update User's group field for backward compatibility
                    savedUser.setGroup(group.getName());
                    userService.updateUser(savedUser.getId(), savedUser);
                    
                    // Check if enrollment already exists
                    java.util.Optional<StudentEnrollment> existingEnrollment = 
                            studentEnrollmentRepository.findByStudentAndGroupAndIsActiveTrue(student, group);
                    
                    if (existingEnrollment.isEmpty()) {
                        // Deactivate any existing enrollments for this student
                        List<StudentEnrollment> existingEnrollments = 
                                studentEnrollmentRepository.findByStudentAndIsActiveTrue(student);
                        for (StudentEnrollment enrollment : existingEnrollments) {
                            enrollment.setIsActive(false);
                            studentEnrollmentRepository.save(enrollment);
                        }
                        
                        // Create new enrollment
                        StudentEnrollment enrollment = new StudentEnrollment();
                        enrollment.setStudent(student);
                        enrollment.setGroup(group);
                        enrollment.setSemester(activeSemester);
                        enrollment.setIsActive(true);
                        studentEnrollmentRepository.save(enrollment);
                        System.out.println("Created enrollment for student " + student.getId() + " and group " + group.getName());
                    } else {
                        System.out.println("Enrollment already exists for student " + student.getId() + " and group " + group.getName());
                    }
                }
            }
        }
        
        // Handle professor groups if user is a professor
        if ("PROFESSOR".equalsIgnoreCase(userDto.getRole()) && userDto.getGroups() != null && !userDto.getGroups().isEmpty()) {
            System.out.println("Processing professor groups for user " + savedUser.getId() + ": " + userDto.getGroups());
            
            Professor professor = professorRepository.findById(savedUser.getId())
                    .orElseThrow(() -> new RuntimeException("Professor entity not found"));
            
            // Get active semester
            List<Semester> activeSemesters = semesterRepository.findByIsActiveTrue();
            Semester activeSemester = activeSemesters.isEmpty() ? null : activeSemesters.get(0);
            
            if (activeSemester == null) {
                System.out.println("WARNING: No active semester found. Cannot assign groups to professor.");
            } else {
                System.out.println("Active semester found: " + activeSemester.getCode());
                
                // Get all groups to see what's available
                List<Group> allGroups = groupRepository.findAll();
                System.out.println("Available groups in database: " + allGroups.stream().map(Group::getName).collect(Collectors.toList()));
                
                // Create professor assignments for each group
                for (String groupName : userDto.getGroups()) {
                    System.out.println("Looking for group: " + groupName);
                    Group group = groupRepository.findByName(groupName)
                            .orElseGet(() -> {
                                // Try case-insensitive search
                                Group found = allGroups.stream()
                                        .filter(g -> g.getName().equalsIgnoreCase(groupName))
                                        .findFirst()
                                        .orElse(null);
                                
                                // If group doesn't exist, create it
                                if (found == null) {
                                    System.out.println("Group '" + groupName + "' not found. Creating it...");
                                    Group newGroup = new Group();
                                    newGroup.setName(groupName);
                                    newGroup.setSemester(activeSemester);
                                    found = groupRepository.save(newGroup);
                                    System.out.println("Created new group: " + found.getName() + " (ID: " + found.getId() + ")");
                                }
                                
                                return found;
                            });
                    
                    if (group != null) {
                        System.out.println("Found/created group: " + group.getName() + " (ID: " + group.getId() + ")");
                        ProfessorAssignment assignment = new ProfessorAssignment();
                        assignment.setProfessor(professor);
                        assignment.setGroup(group);
                        assignment.setSemester(activeSemester);
                        professorAssignmentRepository.save(assignment);
                        System.out.println("Created assignment for professor " + professor.getId() + " and group " + group.getName());
                    } else {
                        System.out.println("ERROR: Could not find or create group '" + groupName + "'. Skipping assignment.");
                    }
                }
            }
        }
        
        UserDto responseDto = userMapper.entityToDto(savedUser);
        // Add professor groups to response
        if ("PROFESSOR".equalsIgnoreCase(userDto.getRole())) {
            Professor professor = professorRepository.findById(savedUser.getId()).orElse(null);
            if (professor != null) {
                List<ProfessorAssignment> assignments = professorAssignmentRepository.findByProfessorId(professor.getId());
                List<String> groupNames = assignments.stream()
                        .map(assignment -> assignment.getGroup().getName())
                        .collect(Collectors.toList());
                responseDto.setGroups(groupNames);
            }
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.domainUser.id or hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    @Operation(summary = "Actualizar usuario", description = "Actualiza la información de un usuario. Los usuarios pueden actualizar su propio perfil.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario actualizado exitosamente", content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "401", description = "No autorizado"),
            @ApiResponse(responseCode = "403", description = "Sin permisos suficientes"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<UserDto> updateUser(
            @Parameter(description = "ID del usuario", required = true) @PathVariable Long id, 
            @RequestBody UserDto userDto) {
        try {
        User existingUser = userService.getUser(id);
        if (existingUser == null) {
            return ResponseEntity.notFound().build();
        }

        userDto.setId(id);
        User user = userMapper.dtoToEntity(userDto);
        User updatedUser = userService.updateUser(id, user);
        
        // Determine if user is a professor or student (check existing roles or DTO role)
        boolean isProfessor = false;
        boolean isStudent = false;
        if (userDto.getRole() != null) {
            String roleUpper = userDto.getRole().toUpperCase();
            isProfessor = roleUpper.equals("PROFESSOR");
            isStudent = roleUpper.equals("STUDENT");
        } else {
            // Check existing user roles
            Set<Role> roles = existingUser.getRoles();
            if (roles != null) {
                isProfessor = roles.stream()
                        .anyMatch(role -> "PROFESSOR".equalsIgnoreCase(role.getName()));
                isStudent = roles.stream()
                        .anyMatch(role -> "STUDENT".equalsIgnoreCase(role.getName()));
            }
        }
        
        // Create Student entity if user is a student and doesn't have one
        if (isStudent) {
            if (!studentRepository.existsById(id)) {
                Student newStudent = new Student();
                newStudent.setUser(updatedUser);
                studentRepository.save(newStudent);
            }
        }
        
        // Create Professor entity if user is a professor and doesn't have one
        if (isProfessor) {
            if (!professorRepository.existsById(id)) {
                Professor newProfessor = new Professor();
                newProfessor.setUser(updatedUser);
                professorRepository.save(newProfessor);
            }
        }
        
        // Handle student group enrollment if user is a student
        if (isStudent && userDto.getGroup() != null && !userDto.getGroup().isEmpty()) {
            System.out.println("Processing student group enrollment update for user " + id + ": " + userDto.getGroup());
            
            Student student = studentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student entity not found"));
            
            // Get active semester
            List<Semester> activeSemesters = semesterRepository.findByIsActiveTrue();
            Semester activeSemester = activeSemesters.isEmpty() ? null : activeSemesters.get(0);
            
            if (activeSemester == null) {
                System.out.println("WARNING: No active semester found. Cannot enroll student in group.");
            } else {
                // Find or create group
                Group group = groupRepository.findByName(userDto.getGroup())
                        .orElseGet(() -> {
                            List<Group> allGroups = groupRepository.findAll();
                            Group found = allGroups.stream()
                                    .filter(g -> g.getName().equalsIgnoreCase(userDto.getGroup()))
                                    .findFirst()
                                    .orElse(null);
                            
                            if (found == null) {
                                System.out.println("Group '" + userDto.getGroup() + "' not found. Creating it...");
                                Group newGroup = new Group();
                                newGroup.setName(userDto.getGroup());
                                newGroup.setSemester(activeSemester);
                                found = groupRepository.save(newGroup);
                                System.out.println("Created new group: " + found.getName() + " (ID: " + found.getId() + ")");
                            }
                            
                            return found;
                        });
                
                if (group != null) {
                    // Update User's group field for backward compatibility
                    updatedUser.setGroup(group.getName());
                    userService.updateUser(updatedUser.getId(), updatedUser);
                    
                    // Check if enrollment already exists
                    java.util.Optional<StudentEnrollment> existingEnrollment = 
                            studentEnrollmentRepository.findByStudentAndGroupAndIsActiveTrue(student, group);
                    
                    if (existingEnrollment.isEmpty()) {
                        // Deactivate any existing enrollments for this student
                        List<StudentEnrollment> existingEnrollments = 
                                studentEnrollmentRepository.findByStudentAndIsActiveTrue(student);
                        for (StudentEnrollment enrollment : existingEnrollments) {
                            enrollment.setIsActive(false);
                            studentEnrollmentRepository.save(enrollment);
                        }
                        
                        // Create new enrollment
                        StudentEnrollment enrollment = new StudentEnrollment();
                        enrollment.setStudent(student);
                        enrollment.setGroup(group);
                        enrollment.setSemester(activeSemester);
                        enrollment.setIsActive(true);
                        studentEnrollmentRepository.save(enrollment);
                        System.out.println("Created enrollment for student " + student.getId() + " and group " + group.getName());
                    } else {
                        System.out.println("Enrollment already exists for student " + student.getId() + " and group " + group.getName());
                    }
                }
            }
        }
        
        // Handle professor groups if user is a professor
        // Process groups even if empty/null to clean up assignments
        if (isProfessor && userDto.getGroups() != null) {
            System.out.println("Processing professor groups update for user " + id + ": " + userDto.getGroups());
            
            Professor professor = professorRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Professor entity not found"));
            
            // Delete existing assignments first
            professorAssignmentRepository.deleteByProfessorId(id);
            System.out.println("Deleted existing assignments for professor " + id);
            
            // Only create new assignments if groups list is not empty
            if (!userDto.getGroups().isEmpty()) {
                // Get active semester
                List<Semester> activeSemesters = semesterRepository.findByIsActiveTrue();
                Semester activeSemester = activeSemesters.isEmpty() ? null : activeSemesters.get(0);
                
                if (activeSemester == null) {
                    System.out.println("WARNING: No active semester found. Cannot assign groups to professor.");
                } else {
                    System.out.println("Active semester found: " + activeSemester.getCode());
                    
                    // Get all groups to see what's available
                    List<Group> allGroups = groupRepository.findAll();
                    System.out.println("Available groups in database: " + allGroups.stream().map(Group::getName).collect(Collectors.toList()));
                    
                    // Create new professor assignments for each group
                    for (String groupName : userDto.getGroups()) {
                        System.out.println("Looking for group: " + groupName);
                        Group group = groupRepository.findByName(groupName)
                                .orElseGet(() -> {
                                    // Try case-insensitive search
                                    Group found = allGroups.stream()
                                            .filter(g -> g.getName().equalsIgnoreCase(groupName))
                                            .findFirst()
                                            .orElse(null);
                                    
                                    // If group doesn't exist, create it
                                    if (found == null) {
                                        System.out.println("Group '" + groupName + "' not found. Creating it...");
                                        Group newGroup = new Group();
                                        newGroup.setName(groupName);
                                        newGroup.setSemester(activeSemester);
                                        found = groupRepository.save(newGroup);
                                        System.out.println("Created new group: " + found.getName() + " (ID: " + found.getId() + ")");
                                    }
                                    
                                    return found;
                                });
                        
                        if (group != null) {
                            System.out.println("Found/created group: " + group.getName() + " (ID: " + group.getId() + ")");
                            ProfessorAssignment assignment = new ProfessorAssignment();
                            assignment.setProfessor(professor);
                            assignment.setGroup(group);
                            assignment.setSemester(activeSemester);
                            professorAssignmentRepository.save(assignment);
                            System.out.println("Created assignment for professor " + professor.getId() + " and group " + group.getName());
                        } else {
                            System.out.println("ERROR: Could not find or create group '" + groupName + "'. Skipping assignment.");
                        }
                    }
                }
            } else {
                System.out.println("Groups list is empty. All assignments have been removed for professor " + id);
            }
        }
        
        UserDto responseDto = userMapper.entityToDto(updatedUser);
        // Add professor groups or student group to response
        boolean isProfessorResponse = false;
        boolean isStudentResponse = false;
        if (userDto.getRole() != null) {
            String roleUpper = userDto.getRole().toUpperCase();
            isProfessorResponse = roleUpper.equals("PROFESSOR");
            isStudentResponse = roleUpper.equals("STUDENT");
        } else {
            Set<Role> roles = updatedUser.getRoles();
            if (roles != null) {
                isProfessorResponse = roles.stream()
                        .anyMatch(role -> "PROFESSOR".equalsIgnoreCase(role.getName()));
                isStudentResponse = roles.stream()
                        .anyMatch(role -> "STUDENT".equalsIgnoreCase(role.getName()));
            }
        }
        
        if (isProfessorResponse) {
            Professor professor = professorRepository.findById(id).orElse(null);
            if (professor != null) {
                List<ProfessorAssignment> assignments = professorAssignmentRepository.findByProfessorId(professor.getId());
                List<String> groupNames = assignments.stream()
                        .map(assignment -> assignment.getGroup().getName())
                        .collect(Collectors.toList());
                responseDto.setGroups(groupNames);
                System.out.println("Response groups for professor " + id + ": " + groupNames);
            } else {
                System.out.println("Professor entity not found for user " + id);
            }
        } else if (isStudentResponse) {
            // Get student's group from StudentEnrollment (preferred) or User.group (fallback)
            Student student = studentRepository.findById(id).orElse(null);
            if (student != null) {
                List<StudentEnrollment> enrollments = studentEnrollmentRepository.findByStudentAndIsActiveTrue(student);
                if (!enrollments.isEmpty()) {
                    // Use the first active enrollment's group
                    String groupName = enrollments.get(0).getGroup().getName();
                    responseDto.setGroup(groupName);
                    System.out.println("Response group for student " + id + " from enrollment: " + groupName);
                } else if (responseDto.getGroup() == null || responseDto.getGroup().isEmpty()) {
                    // Fallback to User.group if no enrollment found
                    String userGroup = updatedUser.getGroup();
                    if (userGroup != null && !userGroup.isEmpty()) {
                        responseDto.setGroup(userGroup);
                        System.out.println("Response group for student " + id + " from user.group: " + userGroup);
                    }
                }
            }
        }
        
        return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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
        try {
        User user = userService.getUser(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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
