package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByName(String name);
    boolean existsByName(String name);
    List<Permission> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT p FROM Role r JOIN r.permissions p WHERE r.id = :roleId")
    List<Permission> findByRoleId(Long roleId);
}
