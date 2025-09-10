package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.StudentEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentEnrollmentRepository extends JpaRepository<StudentEnrollment, Long> {
}
