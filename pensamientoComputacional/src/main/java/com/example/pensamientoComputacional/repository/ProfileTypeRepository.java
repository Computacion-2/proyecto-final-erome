package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.ProfileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileTypeRepository extends JpaRepository<ProfileType, String> {
}
