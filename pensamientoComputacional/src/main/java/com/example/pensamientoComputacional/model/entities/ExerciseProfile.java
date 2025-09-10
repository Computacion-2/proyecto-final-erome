package com.example.pensamientoComputacional.model.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exercise_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;
    
    @ManyToOne
    @JoinColumn(name = "profile_code", nullable = false)
    private ProfileType profileType;
}
