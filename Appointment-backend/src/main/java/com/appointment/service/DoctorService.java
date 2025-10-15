package com.appointment.service;

import com.appointment.model.Doctor;
import com.appointment.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DoctorService {
    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.saveAndFlush(doctor);
    }

    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }

    // DoctorService
    public List<Doctor> getAvailableDoctorsByDepartment(String department) {
        return doctorRepository.findByDepartmentIgnoreCaseAndStatus(department, "available");
    }

}
