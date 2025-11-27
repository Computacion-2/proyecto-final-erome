package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.ProfessorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ProfessorAssignmentRepository extends JpaRepository<ProfessorAssignment, Long> {
    List<ProfessorAssignment> findByProfessorId(Long professorId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ProfessorAssignment pa WHERE pa.professor.id = :professorId")
    void deleteByProfessorId(@Param("professorId") Long professorId);
}
