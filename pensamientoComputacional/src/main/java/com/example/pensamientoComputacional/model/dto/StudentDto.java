package com.example.pensamientoComputacional.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    
    private Long id;
    private UserDto user;
    private String initialProfile;
    
    // For creation/update requests
    private Long userId;
}
