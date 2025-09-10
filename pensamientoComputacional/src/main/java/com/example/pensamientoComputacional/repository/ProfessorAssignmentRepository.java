package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.ProfessorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessorAssignmentRepository extends JpaRepository<ProfessorAssignment, Long> {
}
