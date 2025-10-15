package com.appointment.repository;

import com.appointment.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    // DoctorRepository
    List<Doctor> findByDepartmentIgnoreCaseAndStatus(String department, String status);
}
