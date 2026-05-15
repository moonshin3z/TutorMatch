package com.tutormatch.domain;

import lombok.Data;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("Horario")
@Data
public class Horario {
    @Id @GeneratedValue
    private Long id;
    private String dia;
    private String horaInicio;
    private String horaFin;
}
