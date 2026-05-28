package com.tutormatch.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

@Node("Estudiante")
@Data
public class Estudiante {
    @Id @GeneratedValue
    private Long id;

    private String nombre;
    private String email;

    @JsonIgnore
    private String password;

    private String carrera;
    private int semestre;

    private boolean onboardingCompleto;
    private String modalidadPreferida;  // PRESENCIAL | VIRTUAL | AMBAS
    private double presupuestoMaximo;   // Q/hr máximo que puede pagar

    @Relationship(type = "TOMA")
    private List<Curso> cursos = new ArrayList<>();

    @Relationship(type = "LIBRE_EN")
    private List<Horario> horarios = new ArrayList<>();

    @Relationship(type = "BUSCA_NIVEL")
    private Nivel nivelBuscado;

    @Relationship(type = "RECOMIENDA")
    private List<Tutor> tutoresRecomendados = new ArrayList<>();
}
