package com.example.pensamientoComputacional.service;

import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.repository.UserRepository;
import com.example.pensamientoComputacional.repository.RoleRepository;
import com.example.pensamientoComputacional.service.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    
    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BusinessException("User with email " + user.getEmail() + " already exists");
        }
        
        // Only validate roles if they are provided
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
        validateRoles(user.getRoles());
        }
        return userRepository.save(user);
    }
    
    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new BusinessException("User not found with id: " + id));
            
        // Validar email único solo si está cambiando
        if (user.getEmail() != null && !existingUser.getEmail().equals(user.getEmail()) &&
            userRepository.existsByEmail(user.getEmail())) {
            throw new BusinessException("User with email " + user.getEmail() + " already exists");
        }
        
        // Actualizar solo los campos que vienen en el request
        if (user.getName() != null) {
        existingUser.setName(user.getName());
        }
        if (user.getEmail() != null) {
        existingUser.setEmail(user.getEmail());
        }
        if (user.getPhotoUrl() != null) {
        existingUser.setPhotoUrl(user.getPhotoUrl());
        }
        if (user.getIsActive() != null) {
        existingUser.setIsActive(user.getIsActive());
        }
        if (user.getGroup() != null) {
            existingUser.setGroup(user.getGroup());
        }
        
        // Solo actualizar roles si vienen en el request (para admins)
        // Preservar roles existentes si no se envían
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            validateRoles(user.getRoles());
        existingUser.setRoles(user.getRoles());
        }
        // Si no se envían roles, se mantienen los existentes (no se hace nada)
        
        return userRepository.save(existingUser);
    }
    
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new BusinessException("User not found with id: " + id));
        userRepository.delete(user);
    }
    
    public User getUser(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new BusinessException("User not found with id: " + id));
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException("User not found with email: " + email));
    }
    
    private void validateRoles(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            throw new BusinessException("User must have at least one role");
        }
        
        for (Role role : roles) {
            Role existingRole = roleRepository.findById(role.getId())
                .orElseThrow(() -> new BusinessException("Role not found with id: " + role.getId()));
                
            if (existingRole.getPermissions().isEmpty()) {
                throw new BusinessException("Role " + existingRole.getName() + " must have at least one permission");
            }
        }
    }
}
