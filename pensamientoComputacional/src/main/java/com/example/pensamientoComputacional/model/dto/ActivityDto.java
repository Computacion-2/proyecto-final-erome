package com.example.pensamientoComputacional.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDto {
    
    private Long id;
    private Long groupId;
    private Long professorId;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    
    // Related entities
    private GroupDto group;
    private ProfessorDto professor;
}
