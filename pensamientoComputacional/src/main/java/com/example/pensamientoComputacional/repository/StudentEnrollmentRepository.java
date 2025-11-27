package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.Group;
import com.example.pensamientoComputacional.model.entities.Student;
import com.example.pensamientoComputacional.model.entities.StudentEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentEnrollmentRepository extends JpaRepository<StudentEnrollment, Long> {
    List<StudentEnrollment> findByGroupAndIsActiveTrue(Group group);
    List<StudentEnrollment> findByStudentAndIsActiveTrue(Student student);
    Optional<StudentEnrollment> findByStudentAndGroupAndIsActiveTrue(Student student, Group group);
}
