package com.example.pensamientoComputacional.controller;

import com.example.pensamientoComputacional.model.entities.Permission;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.repository.PermissionRepository;
import com.example.pensamientoComputacional.repository.RoleRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Controller
@RequestMapping("/admin/roles")
public class RoleController {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public RoleController(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_ROLE') or hasRole('ADMIN')")
    public String listRoles(Model model) {
        model.addAttribute("roles", roleRepository.findAll());
        return "admin/roles/list";
    }

    @GetMapping("/create")
    @PreAuthorize("hasAuthority('WRITE_ROLE') or hasRole('ADMIN')")
    public String createRoleForm(Model model) {
        model.addAttribute("permissions", permissionRepository.findAll());
        return "admin/roles/create";
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_ROLE') or hasRole('ADMIN')")
    public String createRole(@RequestParam String name,
                             @RequestParam(required = false) String description,
                             @RequestParam(required = false) List<Long> permissionIds) {
        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        if (permissionIds != null) {
            Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(permissionIds));
            role.setPermissions(permissions);
        }
        roleRepository.save(role);
        return "redirect:/admin/roles";
    }

    @PostMapping("/{id}/delete")
    @PreAuthorize("hasAuthority('DELETE_ROLE') or hasRole('ADMIN')")
    public String deleteRole(@PathVariable Long id) {
        roleRepository.deleteById(id);
        return "redirect:/admin/roles";
    }
}


