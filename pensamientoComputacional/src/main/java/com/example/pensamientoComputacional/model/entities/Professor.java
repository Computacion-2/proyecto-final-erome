package com.example.pensamientoComputacional.model.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "professors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Professor {
    
    @Id
    private Long id;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
}
