package com.example.pensamientoComputacional.model.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profile_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileType {
    
    @Id
    @Column(name = "profile_code")
    private String profileCode;
    
    @Column(nullable = false)
    private String description;
}
