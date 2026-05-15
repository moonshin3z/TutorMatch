package com.tutormatch.domain;

import lombok.Data;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("Curso")
@Data
public class Curso {
    @Id
    private String codigo;
    private String nombre;
    private String departamento;
}
