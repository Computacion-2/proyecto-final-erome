package com.example.pensamientoComputacional.service.impl;

import com.example.pensamientoComputacional.model.entities.User;
import com.example.pensamientoComputacional.model.entities.Role;
import com.example.pensamientoComputacional.repository.UserRepository;
import com.example.pensamientoComputacional.repository.RoleRepository;
import com.example.pensamientoComputacional.service.IUserService;
import com.example.pensamientoComputacional.service.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UserServiceImpl implements IUserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    
    @Autowired
    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    
    @Override
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BusinessException("User with email " + user.getEmail() + " already exists");
        }
        
        validateRoles(user.getRoles());
        return userRepository.save(user);
    }
    
    @Override
    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new BusinessException("User not found with id: " + id));
            
        if (!existingUser.getEmail().equals(user.getEmail()) &&
            userRepository.existsByEmail(user.getEmail())) {
            throw new BusinessException("User with email " + user.getEmail() + " already exists");
        }
        
        validateRoles(user.getRoles());
        
        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPhotoUrl(user.getPhotoUrl());
        existingUser.setIsActive(user.getIsActive());
        existingUser.setRoles(user.getRoles());
        
        return userRepository.save(existingUser);
    }
    
    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new BusinessException("User not found with id: " + id));
        userRepository.delete(user);
    }
    
    @Override
    public User getUser(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new BusinessException("User not found with id: " + id));
    }
    
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException("User not found with email: " + email));
    }
    
    @Override
    public List<User> getUsersByRole(Long roleId) {
        return userRepository.findByRoleId(roleId);
    }
    
    @Override
    public List<User> getActiveUsers() {
        return userRepository.findAllActiveUsers();
    }
    
    @Override
    public List<User> getUsersWithoutRoles() {
        return userRepository.findUsersWithoutRoles();
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
