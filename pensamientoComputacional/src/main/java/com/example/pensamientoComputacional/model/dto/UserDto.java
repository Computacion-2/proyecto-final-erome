package com.example.pensamientoComputacional.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    
    private Long id;
    private String name;
    private String email;
    
    @JsonIgnore
    private String passwordHash;
    
    private String photoUrl;
    private String group;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Set<RoleDto> roles;
    
    // For creation/update requests
    private String password;
    private Set<Long> roleIds;
    
    // Student-specific fields (for profile updates)
    private String studentRole;
    private String performanceCategory;
    private Integer totalPoints;
    
    // Role name for display purposes
    private String role;
    
    // Professor-specific fields
    private List<String> groups; // List of group names for professors
}
