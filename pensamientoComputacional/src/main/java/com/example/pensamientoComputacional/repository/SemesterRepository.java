package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    List<Semester> findByIsActiveTrue();
}
