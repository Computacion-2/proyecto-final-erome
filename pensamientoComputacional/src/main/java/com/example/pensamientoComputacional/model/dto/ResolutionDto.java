package com.example.pensamientoComputacional.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResolutionDto {
    
    private Long id;
    private Long studentId;
    private Long exerciseId;
    private Integer pointsAwarded;
    private Long awardedBy;
    private String status;
    private Integer attemptNo;
    private LocalDateTime submittedAt;
    private String code; // Student's code submission
    
    // Related entities
    private StudentDto student;
    private ExerciseDto exercise;
    private ProfessorDto awardedByProfessor;
}

