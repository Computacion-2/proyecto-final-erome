package com.example.pensamientoComputacional.repository;

import com.example.pensamientoComputacional.model.entities.ExportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExportLogRepository extends JpaRepository<ExportLog, Long> {
}
