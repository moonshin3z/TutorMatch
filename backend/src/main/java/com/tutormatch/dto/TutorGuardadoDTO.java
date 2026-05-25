package com.tutormatch.dto;

import lombok.Data;
import java.util.List;

@Data
public class TutorGuardadoDTO {
    private Long id;
    private String nombre;
    private String carrera;
    private int semestre;
    private String email;
    private double rating;
    private double precio;
    private String modalidad;
    private List<String> cursos;
    private String estado;      // PENDIENTE | COMPLETADO
    private String fecha;       // fecha en que se guardó
}
