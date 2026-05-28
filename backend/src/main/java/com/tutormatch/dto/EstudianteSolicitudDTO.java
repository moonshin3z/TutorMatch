package com.tutormatch.dto;

import lombok.Data;
import java.util.List;

@Data
public class EstudianteSolicitudDTO {
    private Long   id;
    private String nombre;
    private String carrera;
    private int    semestre;
    private String email;
    private String modalidad;
    private String nivel;
    private List<String> cursos;    // materias que necesita
    private List<String> horarios;  // bloques disponibles
    private String estado;
    private String fecha;
}
