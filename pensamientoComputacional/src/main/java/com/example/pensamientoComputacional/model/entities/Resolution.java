package com.example.pensamientoComputacional.model.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "resolutions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resolution {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;
    
    @Column(name = "points_awarded")
    private Integer pointsAwarded;
    
    @ManyToOne
    @JoinColumn(name = "awarded_by")
    private Professor awardedBy;
    
    @Column(nullable = false)
    private String status;
    
    @Column(name = "attempt_no", nullable = false)
    private Integer attemptNo;
    
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
    
    @Column(columnDefinition = "TEXT")
    private String code; // Student's code submission or QR/alphanumeric code
    
    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
