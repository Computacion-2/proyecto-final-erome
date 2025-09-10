package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
    boolean existsByName(String name);
    List<Role> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.id = :permissionId")
    List<Role> findByPermissionId(Long permissionId);
    
    @Query("SELECT r FROM Role r WHERE r.permissions IS EMPTY")
    List<Role> findRolesWithoutPermissions();
}
