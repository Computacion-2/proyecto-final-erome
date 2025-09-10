package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.StudentPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentPerformanceRepository extends JpaRepository<StudentPerformance, Long> {
}
