package com.tutormatch.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

@Node("Tutor")
@Data
public class Tutor {
    @Id @GeneratedValue
    private Long id;

    private String nombre;
    private String email;

    @JsonIgnore
    private String password;

    private double rating;
    private int experiencia;

    // Campos enriquecidos — Fase 2
    private String bio;
    private double precio;          // Quetzales por hora
    private String modalidad;       // PRESENCIAL | VIRTUAL | AMBAS
    private String fotoUrl;
    private int totalReviews;

    @Relationship(type = "ENSENA")
    private List<Curso> cursos = new ArrayList<>();

    @Relationship(type = "DISPONIBLE_EN")
    private List<Horario> horarios = new ArrayList<>();

    @Relationship(type = "TIENE_NIVEL")
    private Nivel nivel;
}
