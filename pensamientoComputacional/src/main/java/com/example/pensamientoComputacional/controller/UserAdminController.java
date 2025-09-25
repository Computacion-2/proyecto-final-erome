package com.example.pensamientoComputacional.controller;

import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.repository.RoleRepository;
import com.example.pensamientoComputacional.repository.UserRepository;
import com.example.pensamientoComputacional.service.IUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Controller
@RequestMapping("/admin/users")
public class UserAdminController {

    private final IUserService userService;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAdminController(IUserService userService,
                               RoleRepository roleRepository,
                               UserRepository userRepository,
                               PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('READ_USER') or hasRole('ADMIN')")
    public String listUsers(Model model) {
        List<User> users = userService.getAllUsers();
        model.addAttribute("users", users);
        return "admin/users/list";
    }

    @GetMapping("/create")
    @PreAuthorize("hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    public String createUserForm(Model model) {
        model.addAttribute("roles", roleRepository.findAll());
        return "admin/users/create";
    }

    @PostMapping
    @PreAuthorize("hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    public String createUser(@RequestParam String name,
                             @RequestParam String email,
                             @RequestParam String password,
                             @RequestParam(required = false) List<Long> roleIds) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        if (roleIds != null) {
            Set<Role> roles = new HashSet<>(roleRepository.findAllById(roleIds));
            user.setRoles(roles);
        }
        userService.createUser(user);
        return "redirect:/admin/users";
    }

    @PostMapping("/{id}/delete")
    @PreAuthorize("hasAuthority('DELETE_USER') or hasRole('ADMIN')")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "redirect:/admin/users";
    }

    @PostMapping("/{userId}/add-role")
    @PreAuthorize("hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    public String addRoleToUser(@PathVariable Long userId, @RequestParam Long roleId) {
        User user = userRepository.findById(userId).orElseThrow();
        Role role = roleRepository.findById(roleId).orElseThrow();
        user.getRoles().add(role);
        userRepository.save(user);
        return "redirect:/admin/users";
    }

    @PostMapping("/{userId}/remove-role")
    @PreAuthorize("hasAuthority('WRITE_USER') or hasRole('ADMIN')")
    public String removeRoleFromUser(@PathVariable Long userId, @RequestParam Long roleId) {
        User user = userRepository.findById(userId).orElseThrow();
        Role role = roleRepository.findById(roleId).orElseThrow();
        user.getRoles().remove(role);
        userRepository.save(user);
        return "redirect:/admin/users";
    }
}


