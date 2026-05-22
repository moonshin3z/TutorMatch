package com.tutormatch.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterTutorRequest {
    @NotBlank private String nombre;
    @Email @NotBlank private String email;
    @NotBlank private String password;
    @Min(0) private int experiencia;
    @NotBlank private String carrera;
    @Min(1) private int semestre;

    // Opcionales — se completan en el dashboard
    private String bio;
    private double precio;
    private String modalidad;
}
