package com.example.pensamientoComputacional.model.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentEnrollment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;
    
    @ManyToOne
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;
    
    @Column(name = "enrolled_at", nullable = false)
    private LocalDateTime enrolledAt;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @PrePersist
    protected void onCreate() {
        enrolledAt = LocalDateTime.now();
    }
}
