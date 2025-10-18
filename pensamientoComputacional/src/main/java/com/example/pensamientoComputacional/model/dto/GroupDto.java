package com.example.pensamientoComputacional.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDto {
    
    private Long id;
    private String name;
    private Long courseId;
    private Long semesterId;
    private SemesterDto semester;
}
