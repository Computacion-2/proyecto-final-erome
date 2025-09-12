package com.example.pensamientoComputacional.service;

import com.example.pensamientoComputacional.model.entities.User;
import java.util.List;

public interface IUserService {
    User createUser(User user);
    User updateUser(Long id, User user);
    void deleteUser(Long id);
    User getUser(Long id);
    List<User> getAllUsers();
    User findByEmail(String email);
    List<User> getUsersByRole(Long roleId);
    List<User> getActiveUsers();
    List<User> getUsersWithoutRoles();
}
