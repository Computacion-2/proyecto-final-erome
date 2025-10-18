package com.example.pensamientoComputacional.controller.rest;

import com.example.pensamientoComputacional.mapper.PermissionMapper;
import com.example.pensamientoComputacional.model.dto.PermissionDto;
import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.repository.PermissionRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/permissions")
@CrossOrigin(origins = "*")
public class PermissionRestController {

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private PermissionMapper permissionMapper;

    @GetMapping
    @PreAuthorize("hasAuthority('READ_ROLE') or hasRole('ADMIN')")
    public ResponseEntity<List<PermissionDto>> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();
        List<PermissionDto> permissionDtos = permissions.stream()
                .map(permissionMapper::entityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(permissionDtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('READ_ROLE') or hasRole('ADMIN')")
    public ResponseEntity<PermissionDto> getPermissionById(@PathVariable Long id) {
        return permissionRepository.findById(id)
                .map(permission -> ResponseEntity.ok(permissionMapper.entityToDto(permission)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_ROLE') or hasRole('ADMIN')")
    public ResponseEntity<PermissionDto> createPermission(@Valid @RequestBody PermissionDto permissionDto) {
        Permission permission = permissionMapper.dtoToEntity(permissionDto);
        Permission savedPermission = permissionRepository.save(permission);
        return ResponseEntity.status(HttpStatus.CREATED).body(permissionMapper.entityToDto(savedPermission));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('WRITE_ROLE') or hasRole('ADMIN')")
    public ResponseEntity<PermissionDto> updatePermission(@PathVariable Long id, @Valid @RequestBody PermissionDto permissionDto) {
        return permissionRepository.findById(id)
                .map(existingPermission -> {
                    permissionDto.setId(id);
                    Permission permission = permissionMapper.dtoToEntity(permissionDto);
                    Permission updatedPermission = permissionRepository.save(permission);
                    return ResponseEntity.ok(permissionMapper.entityToDto(updatedPermission));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_ROLE') or hasRole('ADMIN')")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        if (!permissionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        permissionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
