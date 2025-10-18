package com.example.pensamientoComputacional.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseDto {
    
    private Long id;
    private Long activityId;
    private String title;
    private String statement;
    private Integer difficulty;
    private Integer maxPoints;
    
    // Related entities
    private ActivityDto activity;
}
