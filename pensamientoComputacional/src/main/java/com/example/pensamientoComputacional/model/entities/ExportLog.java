package com.example.pensamientoComputacional.model.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "export_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExportLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "professor_id", nullable = false)
    private Professor professor;
    
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;
    
    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;
    
    @Column(name = "file_uri", nullable = false)
    private String fileUri;
    
    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
