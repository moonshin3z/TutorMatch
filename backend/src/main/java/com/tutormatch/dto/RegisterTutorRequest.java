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

    // Opcionales en registro — se completan después en el dashboard
    private String bio;
    private double precio;
    private String modalidad;
}
