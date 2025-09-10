package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.ExerciseProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExerciseProfileRepository extends JpaRepository<ExerciseProfile, Long> {
}
