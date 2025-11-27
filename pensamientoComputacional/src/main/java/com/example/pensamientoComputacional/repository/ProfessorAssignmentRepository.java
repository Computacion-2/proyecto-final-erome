package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.ProfessorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfessorAssignmentRepository extends JpaRepository<ProfessorAssignment, Long> {
    List<ProfessorAssignment> findByProfessorId(Long professorId);
    void deleteByProfessorId(Long professorId);
}
