package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.RoleMapper;
import com.example.pensamientoComputacional.model.dto.RoleDto;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.repository.RoleRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RoleRestController {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoleMapper roleMapper;

    @GetMapping
    @PreAuthorize("hasAuthority('READ_ROLE') or hasRole('ADMIN')")
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        List<RoleDto> roleDtos = roles.stream()
                .map(roleMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roleDtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_ROLE') or hasRole('ADMIN')")
    public ResponseEntity<RoleDto> getRoleById(@PathVariable Long id) {
        return roleRepository.findById(id)
                .map(role -> ResponseEntity.ok(roleMapper.entityToDto(role)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_ROLE') or hasRole('ADMIN')")
    public ResponseEntity<RoleDto> createRole(@Valid @RequestBody RoleDto roleDto) {
        Role role = roleMapper.dtoToEntity(roleDto);
        Role savedRole = roleRepository.save(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(roleMapper.entityToDto(savedRole));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_ROLE') or hasRole('ADMIN')")
    public ResponseEntity<RoleDto> updateRole(@PathVariable Long id, @Valid @RequestBody RoleDto roleDto) {
        return roleRepository.findById(id)
                .map(existingRole -> {
                    roleDto.setId(id);
                    Role role = roleMapper.dtoToEntity(roleDto);
                    Role updatedRole = roleRepository.save(role);
                    return ResponseEntity.ok(roleMapper.entityToDto(updatedRole));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_ROLE') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        if (!roleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        roleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
