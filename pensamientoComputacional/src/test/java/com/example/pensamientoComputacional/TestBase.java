package com.example.pensamientoComputacional;

import com.example.pensamientoComputacional.model.entities.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class TestBase {

    protected User createTestUser() {
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword123");
        user.setPhotoUrl("https://example.com/photo.jpg");
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    protected User createTestUserWithEmail(String email) {
        User user = createTestUser();
        user.setEmail(email);
        return user;
    }

    protected Role createTestRole() {
        Role role = new Role();
        role.setName("TEST_ROLE");
        role.setDescription("Test Role Description");
        return role;
    }

    protected Role createTestRoleWithName(String name) {
        Role role = createTestRole();
        role.setName(name);
        return role;
    }

    protected Permission createTestPermission() {
        Permission permission = new Permission();
        permission.setName("TEST_PERMISSION");
        permission.setDescription("Test Permission Description");
        return permission;
    }

    protected Permission createTestPermissionWithName(String name) {
        Permission permission = createTestPermission();
        permission.setName(name);
        return permission;
    }

    protected User createTestUserWithRoles(Set<Role> roles) {
        User user = createTestUser();
        user.setRoles(roles);
        return user;
    }

    protected Role createTestRoleWithPermissions(Set<Permission> permissions) {
        Role role = createTestRole();
        role.setPermissions(permissions);
        return role;
    }

    protected Professor createTestProfessor(User user) {
        Professor professor = new Professor();
        professor.setId(user.getId());
        professor.setUser(user);
        return professor;
    }

    protected Student createTestStudent(User user) {
        Student student = new Student();
        student.setId(user.getId());
        student.setUser(user);
        student.setInitialProfile("BEGINNER");
        return student;
    }

    protected Semester createTestSemester() {
        Semester semester = new Semester();
        semester.setCode("2024-1");
        semester.setStartDate(LocalDateTime.now().toLocalDate());
        semester.setEndDate(LocalDateTime.now().plusMonths(4).toLocalDate());
        semester.setIsActive(true);
        return semester;
    }
}
