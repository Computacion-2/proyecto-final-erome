package com.example.pensamientoComputacional.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemesterDto {
    
    private Long id;
    private String code;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
}
