package com.tutormatch.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterEstudianteRequest {
    @NotBlank private String nombre;
    @Email @NotBlank private String email;
    @NotBlank private String password;
    @NotBlank private String carrera;
    @Min(1) private int semestre;
}
