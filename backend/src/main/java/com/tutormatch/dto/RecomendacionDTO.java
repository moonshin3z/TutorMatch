package com.tutormatch.dto;

import lombok.Data;
import java.util.List;

@Data
public class RecomendacionDTO {
    private Long id;
    private String nombre;
    private double rating;
    private int experiencia;
    private String nivel;
    private List<String> cursos;
    private List<String> horarios;
    private int score;

    // Campos enriquecidos — Fase 2
    private List<String> matchReasons;
    private double precio;
    private String modalidad;
    private String bio;
    private String fotoUrl;
}
