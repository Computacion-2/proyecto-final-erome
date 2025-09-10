package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
}
